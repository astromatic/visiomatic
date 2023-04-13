"""
Image tiling module
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

import os
from methodtools import lru_cache
from typing import List, Tuple, Union
from joblib import Parallel, delayed
from pydantic import BaseModel

import numpy as np
import cv2
from simplejpeg import encode_jpeg
from astropy.io import fits
from tiler import Tiler

from .. import package
from .image import Image , ImageModel
from .settings import app_settings 


colordict = {
    'grey': None,
    'jet': cv2.COLORMAP_JET,
    'cold': cv2.COLORMAP_COOL,  # cold actually corresponds to COOL
    'cool': cv2.COLORMAP_COOL,
    'hot': cv2.COLORMAP_HOT
}


class TiledModel(BaseModel):
    """
    Pydantic tiled model class

    type: str
        Name of the web service
    version: str
        Version of the web service
    full_size: List[int]
        Full raster size, FITS style (x comes first)
    tile_size: List[int]
        Tile size, FITS style
    tile_levels: int
        Number of levels in the image pyramid
    channels: int
        Number of channels
    bits_per_channel: int 
        Number of bits per pixel
    images: List[ImageModel]
        List of image model objects
    """
    type: str
    version: str
    full_size: List[int]
    tile_size: List[int]
    tile_levels: int
    channels: int
    bits_per_channel: int 
    header: dict
    images: List[ImageModel]


class Tiled(object):
    """
    Class for the tiled image pyramid to be visualized.
    
    Parameters
    ----------
    filename: str or `pathlib.Path`,
        Path to the image.
    extnum: int, optional
        Extension number (for Multi-Extension FITS files).
    tilesize: tuple[int, int], optional
        shape of the served tiles.
    minmax: tuple[float, float], optional
        Intensity cuts of the served tiles.
    gamma: float, optional
        Display gamma of the served tiles.
    nthreads: int, optional
        Number of compute threads for parallelized operations.
    """
    def __init__(
            self,
            filename,
            extnum : Union[int, None] = None,
            tilesize : Tuple[int, int] = [1, 256,256],
            minmax : Union[Tuple[int, int], None] = None,
            gamma : float = 0.45,
            nthreads : int = os.cpu_count() // 2):

        self.nthreads = nthreads
        self.filename = filename
        hdus = fits.open(os.path.join(app_settings.DATA_DIR, filename))
        # Collect Header Data Units that contain 2D+ image data ("HDIs")
        if extnum is not None:
            hdus = [hdus[extnum]]
        hdis = []
        for hdu in hdus:
            if isinstance(hdu.data, np.ndarray) and len(hdu.data.shape) >= 2:
                hdis.append(hdu)
        self.images = Parallel(n_jobs=self.nthreads, prefer="threads")(
            delayed(Image)(hdi) for hdi in hdis
        )
        self.nimages = len(self.images)
        if self.nimages == 0:
            raise(LookupError(f"No 2D+ data found in {filename}"))
            return
        # Number of image dimensions
        self.nchannels = self.images[0].data.shape[0]
        self.cmix= np.ones((3, self.nchannels), dtype=np.float32)
        self.tilesize = tilesize;
        self.tilesize[0] = self.nchannels
        self.make_mosaic(self.images)
        self.gamma = gamma
        self.maxfac = 1.0e30
        self.nlevels = self.compute_nlevels()
        self.ntiles = np.array(
            [self.compute_ntiles(l) for l in range(self.nlevels)],
            dtype=np.int32
        )
        self.make_tiles()


    def compute_nlevels(self) -> int:
        """
        Return the number of image resolution levels.
        
        Returns
        -------
        nlevels: int
            Number of image resolution levels in the pyramid.
        """
        return max(
            (self.shape[1] // (self.tilesize[1] + 1) + 1).bit_length() + 1,
            (self.shape[2] // (self.tilesize[2] + 1) + 1).bit_length() + 1
        )

    def compute_ntiles(self, level=0) -> int:
        """
        Return the number of tiles at a given image resolution level.
        
        Returns
        -------
        ntiles: int
            Number of tiles.
        """
        return ((self.shape[1] >> level) // (self.tilesize[1] + 1) + 1) * \
            ((self.shape[2] >> level) // (self.tilesize[2] + 1) + 1)

    def get_model(self) -> TiledModel:
        """
        Return a Pydantic model of the tiled object
        
        Returns
        -------
        model: TiledModel
            Pydantic model instance of the tiled object
        """
        return TiledModel(
            type=package.name,
            version="3.0",
            full_size=self.shape[2:0:-1],
            tile_size=self.tilesize[2:0:-1],
            tile_levels=self.nlevels,
            channels=self.shape[0],
            bits_per_channel=32,
            header=dict(self.header.items()),
            images=[image.get_model() for image in self.images]
        )


    def make_mosaic(self, images : List[Image]) -> None:
        """
        Stitch together several images to make a mosaic
        
        Parameters
        ----------
        images: list[Image]
            list of input images.
        """
        x = [image.detsec[0] for image in images] \
            + [image.detsec[1] for image in images]
        y = [image.detsec[2] for image in images] \
            + [image.detsec[3] for image in images]
        if None in x or None in y:
            pass
        else:
            # Compute the chip corner position in the mosaic, Python style
            start = [min(y) - 1, min(x) -1]
            # Compute the mosaic shape
            shape = [self.nchannels, max(y) - start[0],  max(x) - start[1]]
            self.data = np.zeros(shape, dtype=images[0].data.dtype)
            for image in images:
                image.compute_geometry(start, shape)
                self.data[image.detslice] = image.data[image.dataslice]
            self.shape = self.data.shape
            self.minmax =  np.median(
                np.array([image.minmax for image in images]),
                axis=0
            )
            self.bitdepth = images[0].bitdepth
            self.header = self.make_header()


    def make_header(self) -> fits.header:
        """
        Generate a FITS header with a global WCS for the mosaic.

        Returns
        -------
        header: ~astropy.io.fits.Header
            FITS header for the mosaic.
        """
        images = self.images
        image = images[0]
        header = image.header.copy()
        # Update parameters so that they apply to the mosaic
        header["NAXIS1"] = self.shape[2]
        header["NAXIS2"] = self.shape[1]
        header["NAXIS3"] = self.shape[0]
        datainfo = image.datasliceinfo
        detinfo = image.detsliceinfo
        crpix1 = header.get("CRPIX1", 1)
        crpix2 = header.get("CRPIX2", 1)
        header["CRPIX1"] = detinfo[0][0] \
            + detinfo[0][2] * (header["CRPIX1"] - datainfo[0][0]);
        header["CRPIX2"] = detinfo[1][0] \
            + detinfo[1][2] * (header["CRPIX2"] - datainfo[1][0]);
        cd1_1 = header.get("CD1_1", 1.0)
        cd1_2 = header.get("CD1_2", 0.0)
        cd2_1 = header.get("CD2_1", 0.0)
        cd2_2 = header.get("CD2_2", 1.0)
        header["CD1_1"] = detinfo[0][2] * cd1_1;
        header["CD1_2"] = detinfo[1][2] * cd1_2;
        header["CD2_1"] = detinfo[0][2] * cd2_1;
        header["CD2_2"] = detinfo[1][2] * cd2_2;
        return header


    def get_iipheaderstr(self) -> str:
        """
        Generate an IIP image header.
        
        Returns
        -------
        header: str
            IIP image header.
        """
        string = "IIP:1.0\n"
        string += f"Max-size:{self.shape[2]} {self.shape[1]}\n"
        string += f"Tile-size:{self.tilesize[0]} {self.tilesize[1]}\n"
        string += f"Resolution-number:{self.nlevels}\n"
        string += f"Bits-per-channel:{self.bitdepth}\n"
        string += f"Min-Max-sample-values:{self.minmax[0]} {self.minmax[1]}\n"
        string2 = "".join([header.tostring() for header in self.headers])
        string += f"subject/{len(string2)}:{string2}"
        return string


    def convert_tile(
            self,
            tile: np.ndarray,
            channel: Union[int, None] = None,
            minmax: Union[list[float, float], None] = None,
            mix: Union[list[int, float, float, float]| None] = None,
            contrast: float = 1.0,
            gamma: float = 0.45,
            colormap: str = 'grey',
            invert: bool = False) -> np.ndarray:
        """
        Process the dynamic range of a tile.
        
        Parameters
        ----------
        tile:  ~numpy.ndarray
            Input tile.
        channel: int, optional
            Image channel
        minmax: list[float, float], optional
            Tile intensity cuts.
        mix: list[int, float, float, float], optional
            Tile slice RGB colors.
        contrast:  float, optional
            Relative tile contrast.
        gamma:  float, optional
            Inverse tile display gamma.
        colormap: str, optional
            Colormap: 'grey' (default), 'jet', 'cold', or 'hot'.
        invert: bool, optional
            Invert the colormap.

        Returns
        -------
        tile: ~numpy.ndarray
            Processed tile.
        """
        if channel:
            chan = channel - 1
            if minmax and int(minmax[0][0]) == channel:
                minmax = minmax[0][1:]
            else:
                minmax = self.minmax[chan]
            fac = minmax[1] - minmax[0]
            fac = contrast / fac if fac > 0.0 else self.maxfac
            tile = (tile[chan] - minmax[0]) * fac
            tile[tile < 0.0] = 0.0
            tile[tile > 1.0] = 1.0
            tile = (255.49 * np.power(tile, gamma)).astype(np.uint8)
       	    if invert:
                tile = 255 - tile
            if (colormap != 'grey'):
                tile = cv2.applyColorMap(tile, colordict[colormap])
        else:
            cminmax = self.minmax
            if minmax:
                iminmax = np.array(minmax, dtype=int)[:, 0] - 1
                minmax = np.array(minmax, dtype=np.float32)[:, 1:]
                cminmax[iminmax]= minmax
            fac = cminmax[:,1] - cminmax[:,0]
       	    fac[fac <= 0] = self.maxfac
            fac = (contrast / fac).reshape(self.nchannels, 1, 1)
            tile = (tile - cminmax[:,0].reshape(self.nchannels, 1, 1)) * fac
            cmix = self.cmix
            if mix:
                imix = np.array(mix, dtype=int)[:, 0] - 1
                mix = np.array(mix, dtype=np.float32)[:, 1:]
                indices = np.arange(self.nchannels, dtype=np.float32)
                cmix[0] = np.interp(indices, imix, mix[:, 0]) * 3 / self.nchannels
                cmix[1] = np.interp(indices, imix, mix[:, 1]) * 3 / self.nchannels
                cmix[2] = np.interp(indices, imix, mix[:, 2]) * 3 / self.nchannels
            tile = (
                cmix @ tile.reshape(
                    tile.shape[0],
                    tile.shape[1]*tile.shape[2]
                )
            ).T.reshape(tile.shape[1], tile.shape[2], 3).copy()
            tile[tile < 0.0] = 0.0
            tile[tile > 1.0] = 1.0
            tile = (255.49 * np.power(tile, gamma)).astype(np.uint8)
       	    if invert:
                tile = 255 - tile
        return tile


    def make_tiles(self) -> None:
        """
        Generate all tiles from the image.
        """
        self.levels = []
        self.tiles = []
        ima = np.flip(self.data, axis=1)
        for r in range(self.nlevels):
            tiles = []
            tiler = Tiler(
                data_shape = ima.shape,
                tile_shape = self.tilesize,
                mode='constant',
                channel_dimension=0
            )
            tiles = tiler.get_all_tiles(ima, copy_data=False)
            self.tiles.append(tiles)
            # Pure NumPy approach if in multichannel mode
            # else use OpenCV (faster but does not work with multiplanar data)
            ima = ima[
                :,
                :(-1 if ima.shape[1]%2 else None),
                :(-1 if ima.shape[2]%2 else None)
            ].reshape(
                ima.shape[0], ima.shape[1]//2, 2, -1, 2
            ).mean(axis=2).mean(axis=3) if self.nchannels > 1 else \
            cv2.resize(
                ima[0].squeeze(),
                fx=0.5,
                fy=0.5,
                dsize=(ima.shape[1]//2, ima.shape[0]//2),
                interpolation=cv2.INTER_AREA
            )[None,:,:]
        del ima, tiler

    @lru_cache(maxsize=app_settings.MAX_MEM_CACHE_TILE_COUNT)
    def get_tile(
            self,
            tileres: int,
            tileindex: int,
            channel: Union[int, None] = None,
            minmax: Union[list[float, float], None] = None,
            mix: Union[list[int, float, float, float]| None] = None,
            contrast: float = 1.0,
            gamma: float = 0.4545,
            colormap: str = 'grey',
            invert: bool = False,
            quality: int = 90) -> bytes:
        """
        Generate a JPEG bytestream from a tile.
        
        Parameters
        ----------
        tileres:  int
            Tile resolution level.
        tileindex:  int
            Tile index.
        channel: int
            Data channel (first channel is 1)
        minmax: list[float, float], optional
            Tile intensity cuts.
        contrast:  float, optional
            Relative tile contrast.
        gamma:  float, optional
            Inverse tile display gamma.
        colormap: str, optional
            Colormap: 'grey' (default), 'jet', 'cold', or 'hot'.
        invert: bool, optional
            Invert the colormap.
        quality: int, optional
            JPEG quality (0-100)

        Returns
        -------
        tile: bytes
            JPEG bytestream of the tile.
        """
        if channel and channel > self.nchannels:
            channel = 1
        return encode_jpeg(
            self.convert_tile(
                self.tiles[tileres][tileindex],
				channel=channel,
                minmax=minmax,
                mix=mix,
                contrast=contrast,
                gamma=gamma,
                invert=invert
            )[:,:, None],
            quality=quality,
            colorspace='Gray'
        ) if colormap=='grey' and channel else encode_jpeg(
            self.convert_tile(
                self.tiles[tileres][tileindex],
				channel=channel,
                minmax=minmax,
                mix=mix,
                contrast=contrast,
                gamma=gamma,
                invert=invert,
                colormap=colormap
            ),
            quality=quality,
            colorspace='RGB'
        )

