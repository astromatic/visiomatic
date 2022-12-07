"""
Image module
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

import io, os, re
from typing import List, Optional, Tuple, Union
from joblib import Parallel, delayed
from pydantic import BaseModel

import numpy as np
import cv2
from simplejpeg import encode_jpeg
from astropy.io import fits
from tiler import Tiler

from .. import package
from .settings import app_settings 


colordict = {
    'grey': None,
    'jet': cv2.COLORMAP_JET,
    'cold': cv2.COLORMAP_COOL,  # cold actually corresponds to COOL
    'cool': cv2.COLORMAP_COOL,
    'hot': cv2.COLORMAP_HOT
}


class ImageModel(BaseModel):
    """
    Pydantic image model class

    size: List[int]
        Image shape, FITS style (x comes first)
    dataslice: List[List[int]]
        Active area slice parameters, FITS style
    detslice: List[List[int]]
        Mosaic area slice parameters, FITS style
    min_max: List[List[float]]
        Lower and upper intensity cuts for each channel
    header: dict
        FITS header dictionary
    """
    size: List[int]
    dataslice: List[List[int]]
    detslice: List[List[int]]
    min_max: List[List[float]]
    header: dict



class Image(object):
    """
    Class for the individual images that can be part of a mosaic.
 
    Parameters
    ----------
    header: ~astropy.io.fits.Header
        Image header.
    data: ~numpy.ndarray
        Image data 
    extnum: int
        Position in mosaic or Extension number (for Multi-Extension FITS files).
    minmax: tuple[float,float], optional
        Default intensity cuts.
    """
    def __init__(
            self,
            hdu : fits.ImageHDU,
            minmax : Union[Tuple[int], None] = None):

        self.header = hdu.header
        shape = hdu.data.shape
        self.data = hdu.data.astype(np.float32).reshape(-1,shape[-2], shape[-1])
        self.bitpix = self.header["BITPIX"]
        self.bitdepth = 32
        self.nchannels = self.data.shape[0]
        # Section of the image that contains data, FITS style
        # (x comes first, first pixel has coordinate 1)
        self.datasec = datasec \
            if (datasec := self.parse_2dslice(self.header.get("DATASEC", ""))) \
            else [1, self.data.shape[2], 1, self.data.shape[1]]
        # Section of the mosaic that contains the detector, FITS style
        self.detsec = detsec \
            if (detsec := self.parse_2dslice(self.header.get("DETSEC",""))) \
            else self.datasec
        self.minmax = self.compute_minmax() if minmax == None \
            else np.array(minmax, dtype=np.float32)


    def get_model(self) -> ImageModel:
        """
        Return a Pydantic model of the image
        
        Returns
        -------
        model: TiledModel
            Pydantic model instance of the image
        """
        return ImageModel(
            size=self.data.shape[::-1],
            dataslice=self.datasliceinfo,
            detslice=self.detsliceinfo,
            min_max=[list(minmax) for minmax in self.minmax],
            header=dict(self.header.items())
        )


    def get_header_string(self) -> str:
        """
        Get the image header as a string.
        
        Returns
        -------
        header: str
            Image header string.
        """
        return self.header.tostring()


    re_2dslice = re.compile(r"\[(\d+):(\d+),(\d+):(\d+)\]")

    def parse_2dslice(self, str: str) -> Tuple[Union[int], None]:
        """
        Parse a string representation of a 2D slice.

        Parameters
        ----------
        str:  str
            Input string.

        Returns
        -------
        tile: tuple[int,int,int,int]
            4-tuple representing the slice parameters or 4-tuple of Nones if not found.
        """
        coords = self.re_2dslice.findall(str)
        return [int(s) for s in coords[0]] if coords else None


    def compute_geometry(
            self,
            start: Tuple[Union[int]],
            shape: Tuple[Union[int]]
        ) -> None:
        """
        Compute geometry parameters related to the image position in a mosaic.
        
        Parameters
        ----------
        start: Tuple[int]
            Position of starting point in mosaic (Python style).
        shape: Tuple[int]
            Shape of the mosaic (Python style).
        """
        
        # Compute signs of the pixel steps in x and 1
        xsign = 1 if self.detsec[0] < self.detsec[1] else -1
        ysign = 1 if self.detsec[2] < self.detsec[3] else -1

        # Compute data and mosaic slices in Python format (y first, starts at 0)
        self.dataslice = \
            slice(0, self.data.shape[0]), \
            slice(self.datasec[2] - 1, self.datasec[3]), \
            slice(self.datasec[0] - 1, self.datasec[1])
        self.detslice = \
            slice(0, self.data.shape[0]), \
            slice(
                self.detsec[2] - start[0] - 1,
                None if (endy:=self.detsec[3] - start[0] - 1 + ysign) < 0 \
                    else endy,
                ysign
            ), \
              slice(
                self.detsec[0] - start[1] - 1,
                   None if (endx:=self.detsec[1] - start[1] - 1 + xsign) < 0 \
                    else endx,
                xsign
            )

        # Compute data slice info, FITS style (x first, starts at 1)
        dax = self.dataslice[2].indices(self.data.shape[2])
        day = self.dataslice[1].indices(self.data.shape[1])
        self.datasliceinfo = [
                [dax[0] + 1, dax[1], dax[2]],
                [day[0] + 1, day[1], day[2]]
        ]
        dex = self.detslice[2].indices(shape[2])
        dey = self.detslice[1].indices(shape[1])
        # Compute mosaic slice info, FITS style
        self.detsliceinfo=[
                [dex[0] + 1, dex[1] + (2 if dex[2] < 0 else 0), dex[2]],
                [dey[0] + 1, dey[1] + (2 if dey[2] < 0 else 0), dey[2]]
        ]


    def compute_background(self, skip : int = 15) -> None:
        """
        Compute background level and median absolute deviation.

        Parameters
        ----------
        skip:  int, optional
            Number of lines skipped after each line analyzed.
        """
        # NumPy version
        # Speed up ~x8 by using only a fraction of the lines
        x = self.data[:, ::(skip + 1), :].reshape(self.data.shape[0],-1).copy()
        med = np.nanmedian(x, axis=1, keepdims=True)
        ax = np.abs(x-med)
        mad = np.nanmedian(ax, axis=1, keepdims=True)
        x[ax > 3.0 * mad] = np.nan
        med = np.nanmedian(x, axis=1, keepdims=True)
        ax = np.abs(x-med)
        mad = np.nanmedian(ax, axis=1)
        self.background_level = np.nanmean(3.5*med - 2.5*x, axis=1)
        self.background_mad = mad


    def compute_minmax(self, nmadmin: float = -2.0, nmadmax: float = 400.0) -> np.ndarray:
        """
        Compute "appropriate" intensity cuts for displaying the image.
        
        Parameters
        ----------
        grey: float, optional
            Target grey level (0.0 = black, 1.0 = 50% grey).
        nmad: float, optional
            Upper intensity cut above background in units of Maximum Absolute Deviations.

        Returns
        -------
        minmax: ~numpy.ndarray
            Intensity cuts for displaying the image.
        """
        self.compute_background()
        low = self.background_level + nmadmin * self.background_mad
        high = self.background_level + nmadmax * self.background_mad
        return np.array([low, high]).T

        return self.minmax




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
        self.tilesize = tilesize;
        self.tilesize[0] = self.nchannels
        self.make_mosaic(self.images)
        self.nlevels = max((self.shape[1] // (self.tilesize[1] + 1) + 1).bit_length() + 1, \
                        (self.shape[2] // (self.tilesize[2] + 1) + 1).bit_length() + 1)
        self.gamma = gamma
        self.maxfac = 1.0e30
        self.make_tiles()


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
            minmax: Tuple[float, float] = [0.0, 65535.0],
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
        minmax: tuple[float, float], optional
            Tile intensity cuts.
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
        fac = minmax[0][1] - minmax[0][0]
        fac = contrast / fac if fac > 0.0 else self.maxfac
        tile = (tile - minmax[0][0]) * fac
        tile[tile < 0.0] = 0.0
        tile[tile > 1.0] = 1.0
        tile = (255.49 * np.power(tile, gamma)).astype(np.uint8)
        if invert:
            tile = 255 - tile
        if (colormap != 'grey'):
            tile = cv2.applyColorMap(tile, colordict[colormap])
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
                mode='irregular'
            )
            for tile_id, tile in tiler.iterate(ima):
                tiles.append(tile)
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
        del ima

    def get_tile(
            self,
            tileres: int,
            tileindex: int,
            channel: 1,
            minmax: Tuple[float, float] = [0.0, 65535.0],
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
        minmax: tuple[float, float], optional
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
        if channel > self.tiles[0][0].shape[0]:
            channel = 1
        return encode_jpeg(
            self.convert_tile(
                self.tiles[tileres][tileindex][channel - 1],
                minmax=minmax,
                contrast=contrast,
                gamma=gamma,
                invert=invert
            )[:,:, None],
            quality=quality,
            colorspace='Gray'
        ) if colormap=='grey' else encode_jpeg(
            self.convert_tile(
                self.tiles[tileres][tileindex][channel - 1],
                minmax=minmax,
                contrast=contrast,
                gamma=gamma,
                invert=invert,
                colormap=colormap
            ),
            quality=quality,
            colorspace='BGR'
        )

