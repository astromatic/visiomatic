"""
Image tiling module
"""
# Copyright CFHT/CNRS/SorbonneU/CEA/UParisSaclay
# Licensed under the MIT licence

import glob, math, pickle

from methodtools import lru_cache #type: ignore
from math import isnan
from os import path, unlink
from sys import modules
from typing import List, NamedTuple, Tuple, Union
from urllib.parse import quote, unquote

import numpy as np
import cv2

from astropy.io import fits #type: ignore
from joblib import Parallel, delayed  #type: ignore
from pydantic import BaseModel
from simplejpeg import encode_jpeg  #type: ignore
from skimage.draw import line
from tiler import Tiler #type: ignore

from .. import package
from .image import Image, ImageModel
from . import config


colordict = {
    'grey': cv2.COLORMAP_BONE, # equivalent to grayscale
    'jet': cv2.COLORMAP_JET,
    'cold': cv2.COLORMAP_COOL, # cold actually corresponds to COOL
    'cool': cv2.COLORMAP_COOL,
    'hot': cv2.COLORMAP_HOT
}



class PixelValueModel(BaseModel):
    """
    Pydantic model class for VisiOmatic pixel values.

    Parameters
    ----------
    values: list[Union[float, None]]
        Pixel values.
    """
    values: list[Union[float, None]]



class PixelModel(BaseModel):
    """
    Pydantic model class for pixels.

    Parameters
    ----------
    x: int
        x coordinate of the pixel.
    y: int
        y coordinate of the pixel.
    values: list[Union[float, None]]
        Pixel values.
    """
    x: int
    y: int
    values: list[Union[float, None]]



class ProfileModel(BaseModel):
    """
    Pydantic model class for VisiOmatic profiles.

    Parameters
    ----------
    profile: list[PixelModel]
        List of pixel models.
    """
    profile: list[PixelModel]



class TiledModel(BaseModel):
    """
    Pydantic tiled model class.

    Parameters
    ----------
    type: str
        Name of the web service.
    version: str
        Version of the web service.
    full_size: List[int]
        Full raster size, FITS style (x comes first).
    tile_size: List[int]
        Tile size, FITS style.
    tile_levels: int
        Number of levels in the image pyramid.
    channels: int
        Number of channels.
    bits_per_channel: int 
        Number of bits per pixel.
    brightness:  float
        Relative tile brightness (black level).
    contrast:  float
        Relative tile contrast.
    color_saturation:  float
        Tile color saturation.
    gamma: float
        Tile display gamma.
    quality: int
        JPEG quality (0-100).
    header: dict
        Image header keyword/value pairs.
    images: List[ImageModel]
        List of image model objects.
    """
    type: str
    version: str
    full_size: Tuple[int, ...]
    tile_size: Tuple[int, ...]
    tile_levels: int
    channels: int
    bits_per_channel: int
    brightness: float
    contrast: float
    color_saturation: float
    gamma: float
    quality: int
    header: dict
    images: List[ImageModel]



class Tiled(object):
    """
    Class for the tiled image pyramid to be visualized.
    
    Parameters
    ----------
    filename: str | ~pathlib.Path,
        Path to the image.
    extnum: int, optional
        Extension number (for Multi-Extension FITS files).
    tilesize: tuple[int, int], optional
        shape of the served tiles.
    minmax: tuple[float, float], optional
        Intensity cuts of the served tiles.
    brightness:  float, optional
        Relative tile black level of the served tiles.
    contrast:  float, optional
        Relative tile contrast of the served tiles.
    color_saturation:  float, optional
        Default color saturation of the served tiles.
    gamma: float, optional
        Display gamma of the served tiles.
    nthreads: int, optional
        Number of compute threads for parallelized operations.
    """
    def __init__(
            self,
            filename: str,
            extnum : Union[int, None] = None,
            tilesize : Tuple[int, int] = (256,256),
            minmax : Union[Tuple[int, int], None] = None,
            brightness : float = 0.,
            contrast : float = 1.,
            color_saturation: float = 1.5,
            gamma : float = 0.45,
            quality: int = 90,
            nthreads : int = config.settings["thread_count"] \
                if 'sphinx' not in modules else 4):

        self.filename = path.abspath(filename)
        # Otherwise, create it
        self.nthreads = nthreads
        try:
            hdus = fits.open(self.filename)
        except:
            raise(FileNotFoundError(f"Cannot open {filename}")) from None
            return
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
            raise(LookupError(f"No 2D+ data found in {filename}")) from None
            return
        # Number of image dimensions
        self.nchannels = self.images[0].data.shape[0]
        self.cmix= np.ones((3, self.nchannels), dtype=np.float32)
        self.tile_shape = (self.nchannels, tilesize[0], tilesize[1]);
        self.make_mosaic(self.images)
        hdus.close()
        self.brightness = brightness
        self.contrast = contrast
        self.color_saturation = color_saturation
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
        # Delete tiles reference (tiles buffer has been memory mapped)
        # after measuring size
        self.nbytes = self.tiles.nbytes
        del self.tiles
        # Delete mosaic reference (mosaic data have been memory mapped)
        # after measuring size
        self.nbytes += self.data.nbytes
        del self.data
        # Delete individual image data (no longer needed)
        for image in self.images:
            del image.data
        # Pickle-save current object
        with open(get_object_filename(self.filename), "wb") as f:
            pickle.dump(self, f, protocol=5)
            self.nbytes += f.tell()


    def compute_nlevels(self) -> int:
        """
        Return the number of image resolution levels.
        
        Returns
        -------
        nlevels: int
            Number of image resolution levels in the pyramid.
        """
        return max(
            ((self.shape[1] - 1) // self.tile_shape[1]).bit_length() + 1,
            ((self.shape[2] - 1) // self.tile_shape[2]).bit_length() + 1
        )


    def compute_grid_shape(self, level: int=0) -> Tuple[int, int, int]:
        """
        Return the number of tiles per axis at a given image resolution level.
        
        Returns
        -------
        shape: tuple[int, int, int]
            Number of tiles.
        """
        return (
            self.shape[0],
            ((self.shape[1] >> level) - 1) // self.tile_shape[1] + 1,
            ((self.shape[2] >> level) - 1) // self.tile_shape[2] + 1
        )


    def compute_tile_bordershape(self, level=0) -> Tuple[int, int, int]:
        """
        Return the border shape of tiles at a given image resolution level.
        
        Returns
        -------
        shape: tuple[int, int, int]
            Border shape.
        """
        return (
            self.tile_shape[0],
            ((self.shape[1] - 1) >> level) % self.tile_shape[1] + 1,
            ((self.shape[2] - 1) >> level) % self.tile_shape[2] + 1
        )


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
            brightness=self.brightness,
            contrast=self.contrast,
            color_saturation=self.color_saturation,
            gamma=self.gamma,
            quality=self.quality,
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
            start = (min(y) - 1, min(x) -1)
            # Compute the mosaic shape
            shape = (self.nchannels, max(y) - start[0],  max(x) - start[1])
            self.data_filename = get_data_filename(self.filename)
            self.data = np.memmap(
                self.data_filename,
                dtype=images[0].data.dtype,
                mode='w+',
                shape=shape
            )
            for image in images:
                image.compute_geometry(start, shape)
                self.data[image.detslice] = image.data[image.dataslice]
            self.shape = tuple(self.data.shape)
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
            + detinfo[0][2] * (crpix1 - datainfo[0][0]);
        header["CRPIX2"] = detinfo[1][0] \
            + detinfo[1][2] * (crpix2 - datainfo[1][0]);
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
            else:
                cd1_1 = cdelt1
                cd1_2 = 0.
                cd2_1 = 0.
                cd2_2 = cdelt2
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
        string2 = self.header.tostring()
        string += f"subject/{len(string2)}:{string2}"
        return string


    def convert_tile(
            self,
            tile: np.ndarray,
            channel: Union[int, None] = None,
            minmax: Union[Tuple[Tuple[int, float, float], ...], None] = None,
            mix: Union[Tuple[Tuple[int, float, float, float], ...], None] = None,
            brightness: float = 0.,
            contrast: float = 1.,
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
        brightness:  float, optional
            Relative tile brightness (black level).
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
        if channel is not None:
            chan = channel - 1
            cminmax = minmax[0][1:] \
                if minmax is not None and int(minmax[0][0]) == channel \
                else self.minmax[chan]
            fac = cminmax[1] - cminmax[0]
            fac = contrast / fac if fac > 0. else self.maxfac
            offset = 0.01 * contrast * brightness
            ctile = np.nan_to_num(
                tile[chan] - cminmax[0], nan=0., copy=False
            ) * fac + offset
            ctile[ctile < 0.] = 0.
            ctile[ctile > 1.] = 1.
            ctile = (255.49 * np.power(ctile, gamma)).astype(np.uint8)
       	    if invert:
                ctile = 255 - ctile
            if (colormap != 'grey'):
                ctile = cv2.cvtColor(
                	cv2.applyColorMap(ctile, colordict[colormap]),
                	cv2.COLOR_BGR2RGB
                )
        else:
            cminmax = self.minmax
            if minmax:
                iminmax = np.array(minmax, dtype=int)[:, 0] - 1
                cminmax[iminmax] = np.array(minmax, dtype=np.float32)[:, 1:]
            fac = cminmax[:,1] - cminmax[:,0]
       	    fac[fac <= 0] = self.maxfac
            fac = (contrast / fac).reshape(self.nchannels, 1, 1)
            offset = 0.01 * contrast * brightness
            ctile = np.nan_to_num(
                tile - cminmax[:,0].reshape(self.nchannels, 1, 1),
                nan=0.,
                copy=False
            ) * fac + offset
            cmix = self.cmix
            if mix is not None:
                indices = np.arange(self.nchannels, dtype=np.float32)
                imix = np.array(mix, dtype=int)[:, 0] - 1
                npmix = np.array(mix, dtype=np.float32)[:, 1:]
                cmix[0] = np.interp(indices, imix, npmix[:, 0]) * 3 / self.nchannels
                cmix[1] = np.interp(indices, imix, npmix[:, 1]) * 3 / self.nchannels
                cmix[2] = np.interp(indices, imix, npmix[:, 2]) * 3 / self.nchannels
            ctile = (
                cmix @ ctile.reshape(
                    ctile.shape[0],
                    ctile.shape[1] * ctile.shape[2]
                )
            ).T.reshape(tile.shape[1], ctile.shape[2], 3).copy()
            ctile[ctile < 0.0] = 0.0
            ctile[ctile > 1.0] = 1.0
            ctile = (255.49 * np.power(ctile, gamma)).astype(np.uint8)
       	    if invert:
                ctile = 255 - ctile
        return ctile


    def make_tiles(self) -> None:
        """
        Generate all tiles from the image.
        """
        self.tiles_start = np.zeros(self.nlevels, dtype=np.int32)
        self.tiles_end = np.cumsum(self.counts, dtype=np.int32)
        self.tiles_start[1:] = self.tiles_end[:-1]
        self.tiles_filename = get_tiles_filename(self.filename)
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
        # Make sure that memory has been completely mapped before exiting
        self.tiles.flush()


    def get_tile(
            self,
            tilelevel: int,
            tileindex: int,
            channel: Union[int, None] = None,
            minmax: Union[Tuple[Tuple[int, float, float], ...], None] = None,
            mix: Union[Tuple[Tuple[int, float, float, float], ...], None] = None,
            brightness: float = 0.,
            contrast: float = 1.,
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
        brightness:  float, optional
            Relative tile brightness.
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
        # Compute final tile shape depending on position in grid
        # Note that tileindex increases first with x (Numpy index #2)
        shape = [
            self.tile_shape[0],
            self.tile_shape[1] if tileindex // self.shapes[tilelevel][2] + 1\
                    < self.shapes[tilelevel][1] \
                else self.border_shapes[tilelevel][1],
            self.tile_shape[2] if (tileindex+1) % self.shapes[tilelevel][2] \
                else self.border_shapes[tilelevel][2],
        ]
        return encode_jpeg(
            self.convert_tile(
                self.get_tiles()[
                    self.tiles_start[tilelevel] + tileindex][:,0:shape[1],
                    0:shape[2]
                ],
				channel=channel,
                minmax=minmax,
                mix=mix,
                brightness=brightness,
                contrast=contrast,
                gamma=gamma,
                invert=invert
            )[:, :, None],
            quality=quality,
            colorspace='Gray'
        ) if colormap=='grey' and channel else encode_jpeg(
            self.convert_tile(
                self.get_tiles()[
                    self.tiles_start[tilelevel] + tileindex][:,0:shape[1],
                    0:shape[2]
                ],
				channel=channel,
                minmax=minmax,
                mix=mix,
                brightness=brightness,
                contrast=contrast,
                gamma=gamma,
                invert=invert,
                colormap=colormap
            ),
            quality=quality,
            colorspace='RGB'
        )


    @lru_cache(maxsize=config.settings["max_cache_tile_count"] if config.settings else 0)
    def get_tile_cached(self, *args, **kwargs):
        """
        Cached version of get_tile().
        """
        return self.get_tile(*args, **kwargs)


    def get_pixel_values(
            self,
            channels: Tuple[int],
            pos: Tuple[int, int]) -> PixelValueModel:
        """
        Get pixel values at the given pixel coordinates in merged frame.
        
        Parameters
        ----------
        channels: tuple[int]
            Tuple of data channels (first channel is 1).
        pos:  tuple[int, int]
            Pixel coordinates.

        Returns
        -------
        value: numpy.ndarray
            Pixel value at the given position, or NaN outside of the
            frame boundaries.
        """
        shape = self.shape
        chans = np.array(channels, dtype=np.int32) - 1
        nchans = chans.size
        chanexists = (chans >= 0) & (chans < self.nchannels)
        vals = np.full(nchans, np.nan, dtype=np.float32)
        xpos = pos[0] - 1
        ypos = pos[1] - 1
        if (0 < xpos < shape[2]) and (0 < ypos < shape[1]):
            vals[chanexists] = self.get_data()[
                chans[chanexists],
                ypos,
                xpos
            ]
        values = [None if np.isnan(v) else v.item() for v in vals]
        return PixelValueModel(values=values)


    def get_profiles(
            self,
            channels: Union[Tuple[int, ...], None],
            pos1: Tuple[int, int],
            pos2: Tuple[int, int]) -> ProfileModel:
        """
        Get image profile(s) between the given pixel coordinates in the merged
        frame.
        
        Parameters
        ----------
        channels: tuple[int, ...] or None
            Tuple of data channels (first channel is 1) or None for all channels.
        pos1:  tuple[int, int]
            Start pixel coordinates.
        pos2:  tuple[int, int]
            End pixel coordinates.

        Returns
        -------
        profile: ProfileModel
            Profile pydantic model of pixel value(s) along the line.
        """
        shape = self.shape
        npchannels = np.array(channels) - 1 if channels \
            else np.arange(self.nchannels)
        y, x = line(pos1[1] - 1, pos1[0] - 1, pos2[1] - 1, pos2[0] - 1)
        values = np.full((x.size, npchannels.size), np.nan, dtype=np.float32)
        valid = (x>=0) & (x<shape[2]) & (y>=0) & (y<shape[1])
        values[valid] = self.get_data()[
        	npchannels[:, np.newaxis],
        	y[valid],
        	x[valid]
        ].transpose()
        return ProfileModel(
            profile=list(
                PixelModel(x=pixel[0], y=pixel[1], values=pixel[2]) #type: ignore
                    for pixel in zip(x, y, tuple(map(list,values)))
                )
        )


    def get_data(self):
        """
        Get current memory-mapped image data.
        
        Returns
        -------
        data: numpy.ndarray
            Image data.
        """
        if not hasattr(self, 'data'):
            self.data = np.memmap(
                self.data_filename,
                dtype=np.float32,
                mode='r',
                shape=self.shape
            )
        return self.data


    def get_tiles(self):
        """
        Get current memory-mapped tile data.
        
        Returns
        -------
        data: numpy.ndarray
            Tile data.
        """
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
        return self.tiles



def pickledTiled(filename: str, **kwargs) -> Tiled:
    """
    Return pickled Tiled object if available, or initialized otherwise.
    
    Parameters
    ----------
    filename: str | ~pathlib.Path
        Path to the image.
    **kwargs: dict
        Additional keyword arguments.

    Returns
    -------
    tiled: object
        Tiled object pickled from file if available, or initialized otherwise.
    """
    afilename = path.abspath(filename)
    prefix = quote(afilename)
    # Check if a recent cached object is available
    if path.isfile(oname:=get_object_filename(prefix)) and \
            path.getmtime(oname) > path.getmtime(afilename):
        with open(oname, "rb") as f:
            return pickle.load(f)
    else:
        return Tiled(filename, **kwargs)



def delTiled(filename: str) -> None:
    tiled = pickledTiled(filename)
    unlink(get_object_filename(tiled.filename))
    unlink(get_data_filename(tiled.filename))
    unlink(get_tiles_filename(tiled.filename))
    del tiled



def get_object_filename(image_filename: str) -> str:
    """
    Return the name of the file containing the pickled Tiled object.
    
    Parameters
    ----------
    Image filename: str
        Full image filename.
    
    Returns
    -------
    filename: str
        Pickled object filename.
    """
    return path.join(
        config.settings["cache_dir"],
        quote(image_filename, safe='') + ".pkl"
    )



def get_data_filename(image_filename: str) -> str:
    """
    Return the name of the file containing the memory-mapped image data.
    
    Parameters
    ----------
    Image filename: str
        Full image filename.
    
    Returns
    -------
    filename: str
        Filename of the memory-mapped image data.
    """
    return path.join(
        config.settings["cache_dir"],
        quote(image_filename, safe='') + ".data.np"
    )



def get_tiles_filename(image_filename: str) -> str:
    """
    Return the name of the file containing the memory-mapped tile datacube.
    
    Parameters
    ----------
    Image filename: str
        Full image filename.
    
    Returns
    -------
    filename: str
        Filename of the memory mapped tile datacube.
    """
    return path.join(
        config.settings["cache_dir"],
        quote(image_filename, safe='') + ".tiles.np"
    )



def get_image_filename(prefix: str) -> str:
    """
    Return the name of the file containing the memory-mapped tile datacube.
    
    Parameters
    ----------
    prefix: str
        Image name prefix.

    Returns
    -------
    filename: str
        Filename of the memory mapped tile datacube.
    """
    return unquote(path.basename(prefix))

