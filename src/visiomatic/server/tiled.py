"""
Image tiling module
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

import glob, os, math, pickle
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
from . import settings

colordict = {
    'grey': None,
    'jet': cv2.COLORMAP_JET,
    'cold': cv2.COLORMAP_COOL,  # cold actually corresponds to COOL
    'cool': cv2.COLORMAP_COOL,
    'hot': cv2.COLORMAP_HOT
}

class TiledModel(BaseModel):
    """
    Pydantic tiled model class.

    Parameters
    ----------
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
    gamma: float
    quality: int
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
            tilesize : Tuple[int, int] = [256,256],
            minmax : Union[Tuple[int, int], None] = None,
            gamma : float = 0.45,
            quality: int = 90,
            nthreads : int = settings.dict["thread_count"]):

        self.prefix = os.path.splitext(os.path.basename(filename))[0]
        self.filename = os.path.join(settings.dict["data_dir"], filename)
        # Otherwise, create it
        self.nthreads = nthreads
        hdus = fits.open(self.filename)
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
        self.tile_shape = [self.nchannels, tilesize[0], tilesize[1]];
        self.make_mosaic(self.images)
        hdus.close()
        self.gamma = gamma
        self.quality = quality
        self.maxfac = 1.0e30
        self.nlevels = self.compute_nlevels()
        self.shapes = np.array(
            [self.compute_grid_shape(l) for l in range(self.nlevels)],
            dtype=np.int32
        )
        self.counts = np.prod(self.shapes, axis=1) // self.nchannels
        self.ntiles = np.sum(self.counts)
        self.border_shapes = np.array(
            [self.compute_tile_bordershape(l) for l in range(self.nlevels)],
            dtype=np.int32
        )
        self.make_tiles()
        # Delete mosaic data (will be remapped on-demand)
        del self.data
        # Delete individual image data (no longer needed)
        for image in self.images:
            del image.data
        # Pickle-save current object
        with open(self.get_object_filename(self.prefix), "wb") as f:
            pickle.dump(self, f, protocol=5)


    def compute_nlevels(self) -> int:
        """
        Return the number of image resolution levels.
        
        Returns
        -------
        nlevels: int
            Number of image resolution levels in the pyramid.
        """
        return max(
            (self.shape[1] // (self.tile_shape[1] + 1) + 1).bit_length() + 1,
            (self.shape[2] // (self.tile_shape[2] + 1) + 1).bit_length() + 1
        )


    def compute_grid_shape(self, level=0) -> int:
        """
        Return the number of tiles per axis at a given image resolution level.
        
        Returns
        -------
        shape: tuple[int, int]
            Number of tiles.
        """
        return [
            self.shape[0],
            ((self.shape[1] >> level) - 1) // self.tile_shape[1] + 1,
            ((self.shape[2] >> level) - 1) // self.tile_shape[2] + 1
        ]


    def compute_tile_bordershape(self, level=0) -> int:
        """
        Return the border shape of tiles at a given image resolution level.
        
        Returns
        -------
        shape: tuple[int, int, int]
            Border shape.
        """
        return [
            self.tile_shape[0],
            (self.shape[1] >> level) % self.tile_shape[1],
            (self.shape[2] >> level) % self.tile_shape[2]
        ]


    def get_model(self) -> TiledModel:
        """
        Return a Pydantic model of the tiled object.
        
        Returns
        -------
        model: TiledModel
            Pydantic model instance of the tiled object
        """
        return TiledModel(
            type=package.name,
            version="3.0",
            full_size=self.shape[2:0:-1],
            tile_size=self.tile_shape[2:0:-1],
            tile_levels=self.nlevels,
            channels=self.shape[0],
            bits_per_channel=32,
            gamma=self.gamma,
            quality=self.quality,
            header=dict(self.header.items()),
            images=[image.get_model() for image in self.images]
        )


    def get_object_filename(self, prefix: str):
        """
        Return the name of the file containing the pickled Tiled object.
        
        Returns
        -------
        filename: str
            Pickled object filename.
        """
        return os.path.join(settings.dict["cache_dir"], prefix + ".pkl")


    def get_data_filename(self):
        """
        Return the name of the file containing the memory-mapped image data.
        
        Returns
        -------
        filename: str
            Filename of the memory-mapped image data.
        """
        return os.path.join(
            settings.dict["cache_dir"],
            self.prefix + ".data.np"
        )


    def get_tiles_filename(self):
        """
        Return the name of the file containing the memory-mapped tile datacube.
        
        Returns
        -------
        filename: str
            Filename of the memory mapped tile datacube.
        """
        return os.path.join(
            settings.dict["cache_dir"],
            self.prefix + ".tiles.np"
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
            shape = (self.nchannels, max(y) - start[0],  max(x) - start[1])
            self.data_filename = self.get_data_filename()
            self.data = np.memmap(
                self.data_filename,
                dtype=images[0].data.dtype,
                mode='w+',
                shape=shape
            )
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
            self.data.flush()


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
        # Recover CD matrix, possibly from obsolete WCS parameters
        if "CD1_1" in header:
            cd1_1 = header.get("CD1_1", 1.0)
            cd1_2 = header.get("CD1_2", 0.0)
            cd2_1 = header.get("CD2_1", 0.0)
            cd2_2 = header.get("CD2_2", 1.0)
        else:
            cdelt1 = header.get("CDELT1", 1.0)
            cdelt2 = header.get("CDELT2", 1.0)
            if "PC1_1" in header:
                cd1_1 = header.get("PC1_1", 1.0) * cdelt1
                cd1_2 = header.get("PC1_2", 0.0) * cdelt1
                cd2_1 = header.get("PC2_1", 0.0) * cdelt2
                cd2_2 = header.get("PC2_2", 1.0) * cdelt2
            elif "PC001001" in header:
                cd1_1 = header.get("PC001001", 1.0) * cdelt1
                cd1_2 = header.get("PC001002", 0.0) * cdelt1
                cd2_1 = header.get("PC002001", 0.0) * cdelt2
                cd2_2 = header.get("PC002002", 1.0) * cdelt2
            elif "CROTA2" in header:
                crota2 = math.radians(header.get("CROTA2", 0.0))
                ccrota2 = math.cos(crota2)
                scrota2 = math.sin(crota2)
                cd1_1 = cdelt1 * ccrota2
                cd1_2 = -cdelt1 * scrota2
                cd2_1 = cdelt2 * scrota2
                cd2_2 = cdelt2 * ccrota2
        header["CD1_1"] = detinfo[0][2] * cd1_1;
        header["CD1_2"] = detinfo[1][2] * cd1_2;
        header["CD2_1"] = detinfo[0][2] * cd2_1;
        header["CD2_2"] = detinfo[1][2] * cd2_2;
        # Remove obsolete headers to avoid confusion
        del header["CDELT?"], header["CROTA?"], \
            header["PC?_?"], header["PC0??0??"]
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
        string += f"Tile-size:{self.tile_shape[1]} {self.tile_shape[2]}\n"
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
        self.tiles_start = np.zeros(self.nlevels, dtype=np.int32)
        self.tiles_end = np.cumsum(self.counts, dtype=np.int32)
        self.tiles_start[1:] = self.tiles_end[:-1]
        self.tiles_filename = self.get_tiles_filename()
        self.tiles = np.memmap(
            self.tiles_filename,
            dtype=np.float32,
            mode='w+',
            shape=(
                self.ntiles,
                self.tile_shape[0],
                self.tile_shape[1],
                self.tile_shape[2]
            )
        )
        ima = np.flip(self.data, axis=1)
        for r in range(self.nlevels):
            tiler = Tiler(
                data_shape = ima.shape,
                tile_shape = self.tile_shape,
                mode='constant',
                channel_dimension=0
            )
            self.tiles[self.tiles_start[r]:self.tiles_end[r]] = \
                tiler.get_all_tiles(ima, copy_data=False)
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
        self.tiles.flush()
        # No longer needed (tiles buffer will be remapped on demand)
        del self.tiles

    def get_tile(
            self,
            tilelevel: int,
            tileindex: int,
            channel: Union[int, None] = None,
            minmax: Union[tuple[float, float], None] = None,
            mix: Union[tuple[int, float, float, float]| None] = None,
            contrast: float = 1.0,
            gamma: float = 0.4545,
            colormap: str = 'grey',
            invert: bool = False,
            quality: int = 90) -> bytes:
        """
        Generate a JPEG bytestream from a tile.
        
        Parameters
        ----------
        tilelevel:  int
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
        if not hasattr(self, 'tiles'):
            self.tiles = np.memmap(
                self.tiles_filename,
                dtype=np.float32,
                mode='r',
                shape=(
                    self.ntiles,
                    self.tile_shape[0],
                    self.tile_shape[1],
                    self.tile_shape[2]
                )
            )
        shape = [
            self.tile_shape[0],
            self.tile_shape[1] if tileindex // self.shapes[tilelevel][2] + 1 \
                    < self.shapes[tilelevel][1] \
                else self.border_shapes[tilelevel][1],
            self.tile_shape[2] if (tileindex+1) % self.shapes[tilelevel][2] \
                else self.border_shapes[tilelevel][2],
        ]
        return encode_jpeg(
            self.convert_tile(
                self.tiles[self.tiles_start[tilelevel] + tileindex][:,0:shape[1], 0:shape[2]],
				channel=channel,
                minmax=minmax,
                mix=mix,
                contrast=contrast,
                gamma=gamma,
                invert=invert
            )[:, :, None],
            quality=quality,
            colorspace='Gray'
        ) if colormap=='grey' and channel else encode_jpeg(
            self.convert_tile(
                self.tiles[self.tiles_start[tilelevel] + tileindex][:,0:shape[1], 0:shape[2]],
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


    @lru_cache(maxsize=settings.dict["max_mem_cache_tile_count"] if settings.dict else 0)
    def get_tile_cached(self, *args, **kwargs):
        """
        Cached version of get_tile().
        """
        return self.get_tile(*args, **kwargs)



def pickledTiled(filename, **kwargs):
    """
    Return pickled version of object if available.
    
    Parameters
    ----------
    filename: str or `pathlib.Path`,
        Path to the image.
    **kwargs: dict
        Keyword arguments.

    Returns
    -------
    tiled: object
        Tiled object pickled from file if available, or initialized otherwise).
    """
    prefix = os.path.splitext(os.path.basename(filename))[0]
    fname = os.path.join(settings.dict["data_dir"], filename)
    # Check if a recent cached object is available
    if os.path.isfile(oname:=Tiled.get_object_filename(None, prefix)) and \
            os.path.getmtime(oname) > os.path.getmtime(fname):
        with open(oname, "rb") as f:
            return pickle.load(f)
    else:
        return Tiled(filename, **kwargs)



