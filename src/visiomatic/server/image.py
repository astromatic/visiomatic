"""
Image reading and processing module
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

import re
from typing import List, Tuple, Union
from pydantic import BaseModel

import numpy as np
from astropy.io import fits #type: ignore

from .. import package


class ImageModel(BaseModel):
    """
    Pydantic image model class.

    Parameters
    ----------
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
            minmax : Union[Tuple[float], None] = None):

        # Small hack to translate compressed FITS headers
        self.header = fits.Header.fromstring(hdu.header.tostring())
        shape = hdu.data.shape
        self.data = hdu.data.astype(np.float32).reshape(-1,shape[-2], shape[-1])
        self.shape = self.data.shape
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
        model: ImageModel
            Pydantic model instance of the image
        """
        return ImageModel(
            size=self.shape[::-1],
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

    def parse_2dslice(self, str: str) -> Union[List[int], None]:
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
            start: Tuple[int, int],
            shape: Tuple[int, int, int]
        ) -> None:
        """
        Compute geometry parameters related to the image position in a mosaic.
        
        Parameters
        ----------
        start: Tuple[int, int]
            Position of starting point in mosaic (Python style).
        shape: Tuple[int, int, int]
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
                None if (endy := self.detsec[3] - start[0] - 1 + ysign) < 0 \
                    else endy,
                ysign
            ), \
            slice(
                self.detsec[0] - start[1] - 1,
                None if (endx := self.detsec[1] - start[1] - 1 + xsign) < 0 \
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
        std = np.nanstd(x, axis=1)
        ax = np.abs(x-med)
        mad = np.nanmedian(ax, axis=1, keepdims=True)
        x[ax > 3.0 * mad] = np.nan
        med = np.nanmedian(x, axis=1, keepdims=True)
        ax = np.abs(x-med)
        mad = np.nanmedian(ax, axis=1)
        # Handle cases where the MAD is tiny because of many identical values
        cond = 1e5 * mad < std
        mad[cond] = 0.1 * std[cond]
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




