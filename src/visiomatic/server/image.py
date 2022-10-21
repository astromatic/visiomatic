"""
Image module
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

import io, os
import numpy as np
import cv2
from typing import Union
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
            ext : int = 0,
            tilesize : tuple[int] = [256,256],
            minmax : Union[tuple[int], None] = None,
            gamma = 0.45):

        self._filename = filename
        self._ext = ext
        self._hdus = fits.open(fits_dir + filename)
        self._hdu = self._hdus[self._ext]
        self._data = self._hdu.data.astype(np.float32)
        self._hdr = self._hdu.header
        self._tilesize = tilesize;
        self._shape = [self._hdr["NAXIS1"], self._hdr["NAXIS2"]]
        self._nlevels = max((self._shape[0] // (self._tilesize[0] + 1) + 1).bit_length() + 1, \
                        (self._shape[1] // (self._tilesize[1] + 1) + 1).bit_length() + 1)
        self._bitpix = self._hdr["BITPIX"]
        self._bitdepth = abs(self._bitpix)
        self._minmax = self.compute_minmax() if minmax == None else np.array(minmax, dtype=np.float32)
        self._gamma = gamma
        self._maxfac = 1.0e30
        self.make_tiles()

    def compute_background(self) -> None:
        """
        Compute background level and median absolute deviation.
        """
        x = self._data.copy()
        med = np.nanmedian(x)
        ax = np.abs(x-med)
        mad = np.nanmedian(ax)
        x[ax > 3.0 * mad] = np.nan
        med = np.nanmedian(x)
        ax = np.abs(x-med)
        mad = np.nanmedian(ax)
        x = self._data.copy()
        ax = np.abs(x-med)
        x[ax > 3.0 * mad] = np.nan
        med = np.nanmedian(x)
        ax = np.abs(x-med)
        mad = np.nanmedian(ax)
        x = self._data.copy()
        ax = np.abs(x-med)
        x[ax > 3.0 * mad] = np.nan
        med = np.nanmedian(x)
        ax = np.abs(x-med)
        mad = np.nanmedian(ax)
        self._background_level = 3.5*med - 2.5*np.nanmean(x)
        self._background_mad = mad
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
        high = self._background_level + nmadmax * self._background_mad
        low = self._background_level + nmadmin * self._background_mad
        return np.array([low, high])

    def get_shape(self):
        """
        Get the image shape in pixels.
        
        Returns
        -------
        shape: Tuple of ints
            Image shape in pixels.
        """
        return self._shape

    def get_nlevels(self):
        """
        Get the number of resolution levels in the image.
        
        Returns
        -------
        nlevels: int
            Number of resolution levels in the image.
        """
        return self._nlevels

    def get_bitdepth(self):
        """
        Get the number of bits per pixels in the image.
        
        Returns
        -------
        bitdepth: int
            Number of bits per pixels in the image.
        """
        return self._bitdepth

    def get_minmax(self):
        """
        Get the intensity cuts for displaying the image.
        
        Returns
        -------
        minmax: 2-tuple of ints
            Intensity cuts for displaying the image.
        """
        return self._minmax

    def get_header(self):
        """
        Get the image header as a string.
        
        Returns
        -------
        header: str
            Image header.
        """
        return self._hdr.tostring()

    def get_iipheaderstr(self):
        """
        Generate an IIP image header.
        
        Returns
        -------
        header: str
            IIP image header.
        """
        str = "IIP:1.0\n"
        str += f"Max-size:{self._shape[0]} {self._shape[1]}\n"
        str += f"Tile-size:{self._tilesize[0]} {self._tilesize[1]}\n"
        str += f"Resolution-number:{self._nlevels}\n"
        str += f"Bits-per-channel:{self._bitdepth}\n"
        str += f"Min-Max-sample-values:{self._minmax[0]} {self._minmax[1]}\n"
        str2 = self._hdr.tostring()
        str += f"subject/{len(str2)}:{str2}"
        return str

    def scale_tile(self, tile):
        """
        Process the dynamic range of a tile.
        
        Parameters
        ----------
        tile:  2D :class:`numpy.ndarray`
            Input tile.
        Returns
        -------
        tile: 2D :class:`numpy.ndarray`
            processed tile.
        """
        fac = self._minmax[1] - self._minmax[0]
        fac = 1.0 / fac if fac > 0.0 else self._maxfac
        tile = (tile - self._minmax[0]) * fac
        tile[tile < 0.0] = 0.0
        return 255.0 * np.power(tile, self._gamma)

    def make_tiles(self):
        """
        Generate all tiles from the image.
        """
        self._levels = []
        self._tiles = []
        ima = np.flipud(self._data)
        for r in range(self._nlevels):
            tiles = []
            tiler = Tiler(
                data_shape = ima.shape,
                tile_shape = (self._tilesize[1], self._tilesize[0]),
                mode='irregular'
            )
            for tile_id, tile in tiler.iterate(ima):
                tiles.append(tile)
            self._tiles.append(tiles)
            ima = cv2.resize(
                ima,
                fx=0.5,
                fy=0.5,
                dsize=(ima.shape[1]//2, ima.shape[0]//2),
                interpolation=cv2.INTER_AREA
            )

    def get_tile(self, r: int, t: int):
        return cv2.imencode(".jpg", self.scale_tile(self._tiles[r][t]))

