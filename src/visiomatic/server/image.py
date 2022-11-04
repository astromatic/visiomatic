"""
Image module
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

import io, os, re
from typing import Union, Optional
from joblib import Parallel, delayed
import numpy as np
import torch
import cv2
from simplejpeg import encode_jpeg
from astropy.io import fits
from tiler import Tiler

from .. import defs

fits_dir = os.path.join(defs.root_dir, "fits/")

class Image(object):
    re_2dslice = re.compile(r"\[(\d+):(\d+),(\d+):(\d+)\]")
    """
    Class for the individual images that can be part of a mosaic.
 
    Parameters
    ----------
    header: astropy.header,
        Image header.
    data: 2D+ :class:`numpy.ndarray`
        Image data 
    extnum: int
        Position in mosaic or Extension number (for Multi-Extension FITS files).
    minmax: 2-tuple of floats, optional
        Default intensity cuts.
    """
    def __init__(
            self,
            hdu : fits.hdu,
            minmax : Union[tuple[int], None] = None):

        self.header = hdu.header
        self.data = hdu.data.astype(np.float32)
        self.bitpix = self.header["BITPIX"]
        self.bitdepth = 32
        self.shape = [self.header["NAXIS1"], self.header["NAXIS2"]]
        datasec = self.parse_2dslice(self.header.get("DATASEC", ""))
        self.datasec = tuple(datasec) \
            if (datasec := self.parse_2dslice(self.header.get("DATASEC", ""))) \
            else [1, self.shape[0], 1, self.shape[1]]
        self.detsec = self.parse_2dslice(self.header.get("DETSEC",""))
        self.minmax = self.compute_minmax() if minmax == None else np.array(minmax, dtype=np.float32)

    def get_header(self):
        """
        Get the image header as a string.
        
        Returns
        -------
        header: str
            Image header.
        """
        return self.header.tostring()

    def parse_2dslice(self, str: str) -> Union[tuple[int], None]:
        """
        Parse a string representation of a 2D slice.

        Parameters
        ----------
        str:  str
            Input string.
        Returns
        -------
        tile: tuple[int] or None
            4-tuple representing the slice parameters or None if not found
        """
        coords = self.re_2dslice.findall(str)
        return [int(s) for s in coords[0]] if coords else [None, None, None, None]

    @staticmethod
    @torch.jit.script
    def median_mad(x):
        x1 = x.flatten().clone()
        med = x1.nanmedian()
        ax1 = (x1-med).abs()
        mad = (ax1.nanmedian() + 1e-30)
        x1[ax1 > 3.0 * mad] = torch.nan
        med = x1.nanmedian()
        ax1 = (x1-med).abs()
        mad = (ax1.nanmedian() + 1e-30)
        x1 = x.flatten().clone()
        ax1 = (x1-med).abs()
        x1[ax1 > 3.0 * mad] = torch.nan
        med = x1.nanmedian()
        ax1 = (x1-med).abs()
        mad = (ax1.nanmedian() + 1e-30)
        x1 = x.flatten().clone()
        ax1 = (x1-med).abs()
        x1[ax1 > 3.0 * mad] = torch.nan
        med = x1.nanmedian()
        ax1 = (x1-med).abs()
        mad = (ax1.nanmedian() + 1e-30)
        return (3.5*med - 2.5*x1.nanmean()).item(), mad.item()

    def compute_background(self) -> None:
        """
        Compute background level and median absolute deviation.
        """
        # NumPy version
        x = self.data.flatten().copy()
        med = np.nanmedian(x)
        ax = np.abs(x-med)
        mad = np.nanmedian(ax)
        x[ax > 3.0 * mad] = np.nan
        med = np.nanmedian(x)
        ax = np.abs(x-med)
        mad = np.nanmedian(ax)
        '''
        x = self.data.flatten().copy()
        ax = np.abs(x-med)
        x[ax > 3.0 * mad] = np.nan
        med = np.nanmedian(x)
        ax = np.abs(x-med)
        mad = np.nanmedian(ax)
        x = self.data.flatten().copy()
        ax = np.abs(x-med)
        x[ax > 3.0 * mad] = np.nan
        med = np.nanmedian(x)
        ax = np.abs(x-med)
        mad = np.nanmedian(ax)
        '''
        self.background_level = 3.5*med - 2.5*np.nanmean(x)
        self.background_mad = mad
        """
        self.background_level, self.background_mad = self.median_mad(
            torch.tensor(self.data, device=self.device)
        )
        """
        return

    def compute_minmax(self, nmadmin: float = -3.0, nmadmax: float = 1000.0) -> np.ndarray:
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
        minmax: numpy.ndarray of 2 numpy.float32
            Intensity cuts for displaying the image.
        """
        self.compute_background()
        high = self.background_level + nmadmax * self.background_mad
        low = self.background_level + nmadmin * self.background_mad
        return np.array([low, high])

        return self.minmax


class Tiled(object):
    """
    Class for the tiled image pyramid to be visualized.
    
    Parameters
    ----------
    filename: str or `pathlib.Path`,
        Relative path to the image.
    extnum: int, optional
        Extension number (for Multi-Extension FITS files).
    tilesize: 2-tuple of ints, optional
        shape of the served tiles.
    minmax: 2-tuple of floats, optional
        Intensity cuts of the served tiles.
    gamma: float, optional
        Display gamma of the served tiles.
    """
    def __init__(
            self,
            filename,
            extnum : Union[int, None] = None,
            tilesize : tuple[int] = [256,256],
            minmax : Union[tuple[int], None] = None,
            gamma : float = 0.45,
            nthreads : int = 10,
            device : Union[str,None] = None):

        self.nthreads = nthreads
        self.device = device
        if self.device==None:
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        if self.device == 'cuda':
            torch.cuda.empty_cache()
        self.filename = filename
        hdus = fits.open(fits_dir + filename)
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
        self.tilesize = tilesize;
        if self.nimages > 1:
            self.make_mosaic(self.images)
        else:
            image = self.images[0]
            self.bitdepth = image.bitdepth
            self.header = image.header
            self.data = image.data
            self.shape = image.shape
            self.minmax = image.minmax
        self.nlevels = max((self.shape[0] // (self.tilesize[0] + 1) + 1).bit_length() + 1, \
                        (self.shape[1] // (self.tilesize[1] + 1) + 1).bit_length() + 1)
        self.gamma = gamma
        self.maxfac = 1.0e30
        self.make_tiles()

    def make_mosaic(self, images : list[Image]):
        x = [image.detsec[0] for image in images] + [image.detsec[1] for image in images]
        y = [image.detsec[2] for image in images] + [image.detsec[3] for image in images]
        if None in x or None in y:
            pass
        else:
            # Compute the min and max chip corner coordinates on the mosaic
            minx = min(x) 
            miny = min(y)
            sizex = max(x) - minx + 1
            sizey = max(y) - miny + 1
            self.data = np.zeros((sizey, sizex), dtype=images[0].data.dtype)
            for image in images:
                # Add +/-1 to end at pos +/- 1 (Python convention)
                xsign = 1 if image.detsec[0] < image.detsec[1] else -1
                ysign = 1 if image.detsec[2] < image.detsec[3] else -1
                image.detslice = \
                        slice(
                            image.detsec[2] - miny,
                            None if (endy:=image.detsec[3] - miny + ysign) < 0 \
                                else endy,
                            ysign
                        ), \
                        slice(
                            image.detsec[0] - minx,
                            None if (endx:=image.detsec[1] - minx + xsign) < 0 \
                                else endx,
                            xsign
                        )
                # Subtract 1 to start at 0 (Python convention)
                image.dataslice = \
                        slice(image.datasec[2] - 1, image.datasec[3]), \
                        slice(image.datasec[0] - 1, image.datasec[1])
                self.data[image.detslice] = image.data[image.dataslice]
            self.header = images[0].header
            self.shape = self.data.shape
            self.minmax =  np.median(
                np.array([image.minmax for image in images]),
                axis=0
            )
            self.bitdepth = images[0].bitdepth

    def get_iipheaderstr(self):
        """
        Generate an IIP image header.
        
        Returns
        -------
        header: str
            IIP image header.
        """
        str = "IIP:1.0\n"
        str += f"Max-size:{self.shape[1]} {self.shape[0]}\n"
        str += f"Tile-size:{self.tilesize[0]} {self.tilesize[1]}\n"
        str += f"Resolution-number:{self.nlevels}\n"
        str += f"Bits-per-channel:{self.bitdepth}\n"
        str += f"Min-Max-sample-values:{self.minmax[0]} {self.minmax[1]}\n"
        str2 = self.header.tostring()
        str += f"subject/{len(str2)}:{str2}"
        return str

    def scale_tile(
            self,
            tile,
            minmax: tuple[float, float] = [0.0, 65535.0],
            contrast: float = 1.0,
            gamma: float = 0.45,
            invert: bool = False):
        """
        Process the dynamic range of a tile.
        
        Parameters
        ----------
        tile:  2D :class:`numpy.ndarray`
            Input tile.
        minmax: tuple[float, float], optional
            Tile intensity cuts.
        contrast:  float, optional
            Relative tile contrast.
        gamma:  float, optional
            Inverse tile display gamma.
        invert: bool, optional
            Invert the colormap.
        Returns
        -------
        tile: 2D :class:`numpy.ndarray`
            Processed tile.
        """
        fac = minmax[1] - minmax[0]
        fac = contrast / fac if fac > 0.0 else self.maxfac
        tile = (tile - minmax[0]) * fac
        tile[tile < 0.0] = 0.0
        tile[tile > 1.0] = 1.0
        tile = (255.49 * np.power(tile, gamma)).astype(np.uint8)
        return 255 - tile if invert else tile

    def make_tiles(self):
        """
        Generate all tiles from the image.
        """
        self.levels = []
        self.tiles = []
        ima = np.flipud(self.data)
        for r in range(self.nlevels):
            tiles = []
            tiler = Tiler(
                data_shape = ima.shape,
                tile_shape = (self.tilesize[0], self.tilesize[1]),
                mode='irregular'
            )
            for tile_id, tile in tiler.iterate(ima):
                tiles.append(tile)
            self.tiles.append(tiles)
            ima = cv2.resize(
                ima,
                fx=0.5,
                fy=0.5,
                dsize=(ima.shape[1]//2, ima.shape[0]//2),
                interpolation=cv2.INTER_AREA
            )

    def get_tile(
            self,
            r: int,
            t: int,
            minmax: tuple[float, float] = [0.0, 65535.0],
            contrast: float = 1.0,
            gamma: float = 0.4545,
            invert: bool = False,
            quality: int = 90):
        """
        Generate a JPEG bytestream from a tile.
        
        Parameters
        ----------
        r:  int
            Tile resolution level.
        t:  int
            Tile number.
        minmax: tuple[float, float], optional
            Tile intensity cuts.
        contrast:  float, optional
            Relative tile contrast.
        gamma:  float, optional
            Inverse tile display gamma.
        invert: bool, optional
            Invert the colormap.
        quality: int, optional
            JPEG quality
        Returns
        -------
        tile: 2D :class:`numpy.ndarray`
            JPEG bytestream of the tile.
        """
        return encode_jpeg(
            self.scale_tile(
                self.tiles[r][t],
                minmax=minmax,
                contrast=contrast,
                gamma=gamma,
                invert=invert
            )[:,:, None],
            quality=quality,
            colorspace='Gray'
        )

