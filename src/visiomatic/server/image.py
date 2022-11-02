"""
Image module
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

import io, os
import numpy as np
import cv2
from simplejpeg import encode_jpeg
import torch
from typing import Union, Optional
from astropy.io import fits
from tiler import Tiler

from .. import defs

fits_dir = os.path.join(defs.root_dir, "fits/")


class Image(object):
    """
    Class for the image to be visualized.
    
    Parameters
    ----------
    filename: str or `pathlib.Path`,
        Relative path to the image.
    ext: int, optional
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
            ext : Optional[Union[int, None]] = None,
            tilesize : tuple[int] = [256,256],
            minmax : Union[tuple[int], None] = None,
            gamma = 0.45,
            device : Optional[Union[str,None]] = None):

        self.device = device
        if self.device==None:
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        if self.device == 'cuda':
            torch.cuda.empty_cache()
        self.filename = filename
        self.hdus = fits.open(fits_dir + filename)
        if ext is None:
            for e,hdu in enumerate(self.hdus):
                if isinstance(hdu.data, np.ndarray) and len(hdu.data.shape) >= 2:
                    ext = e
                    break
        if ext is None:
            raise(LookupError(f"No 2D+ data found in {filename}"))
            return
        self.ext = ext
        self.hdu = self.hdus[self.ext]
        self.data = self.hdu.data.astype(np.float32)
        self.hdr = self.hdu.header
        self.tilesize = tilesize;
        self.shape = [self.hdr["NAXIS1"], self.hdr["NAXIS2"]]
        self.nlevels = max((self.shape[0] // (self.tilesize[0] + 1) + 1).bit_length() + 1, \
                        (self.shape[1] // (self.tilesize[1] + 1) + 1).bit_length() + 1)
        self.bitpix = self.hdr["BITPIX"]
        self.bitdepth = abs(self.bitpix)
        self.minmax = self.compute_minmax() if minmax == None else np.array(minmax, dtype=np.float32)
        self.gamma = gamma
        self.maxfac = 1.0e30
        self.make_tiles()

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

    def get_header(self):
        """
        Get the image header as a string.
        
        Returns
        -------
        header: str
            Image header.
        """
        return self.hdr.tostring()

    def get_iipheaderstr(self):
        """
        Generate an IIP image header.
        
        Returns
        -------
        header: str
            IIP image header.
        """
        str = "IIP:1.0\n"
        str += f"Max-size:{self.shape[0]} {self.shape[1]}\n"
        str += f"Tile-size:{self.tilesize[0]} {self.tilesize[1]}\n"
        str += f"Resolution-number:{self.nlevels}\n"
        str += f"Bits-per-channel:{self.bitdepth}\n"
        str += f"Min-Max-sample-values:{self.minmax[0]} {self.minmax[1]}\n"
        str2 = self.hdr.tostring()
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
        tile = (tile - self.minmax[0]) * fac
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
                tile_shape = (self.tilesize[1], self.tilesize[0]),
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

