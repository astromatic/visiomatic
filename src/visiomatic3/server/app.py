"""
Application module
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

import io, os, re
import numpy as np
import cv2
from typing import List, Optional
from fastapi import FastAPI, Query
from fastapi import responses
from fastapi.middleware.cors import CORSMiddleware
from astropy.io import fits
from tiler import Tiler

banner_filename = "static/banner.html"
base_url = "/visio"
fits_path = "fits/"

class visioimage(object):
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
            ext=1,
            tilesize=[256,256],
            minmax = [0.0, 65535.0],
            gamma = 0.45):

        self._filename = filename
        self._ext = ext
        self._hdus = fits.open(fits_path + filename)
        self._hdu = self._hdus[self._ext]
        self._hdr = self._hdu.header
        self._tilesize = tilesize;
        self._shape = [self._hdr["NAXIS1"], self._hdr["NAXIS2"]]
        self._nlevels = max((self._size[0] // (self._tilesize[0] + 1) + 1).bit_length() + 1, \
                        (self._size[1] // (self._tilesize[1] + 1) + 1).bit_length() + 1)
        self._bitpix = self._hdr["BITPIX"]
        self._bitdepth = abs(self._bitpix)
        self._minmax = minmax
        self._gamma = gamma
        self._maxfac = 1.0e30
        self._data = self._hdu.data
        self.make_tiles()

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


app = FastAPI()

origins = [
    "http://halau.cfht.hawaii.edu",
    "https://halau.cfht.hawaii.edu",
    "http://halau",
    "https://halau"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.ima = None
app.parse_jtl = re.compile(r"^(\d+),(\d+)$")
app.parse_minmax = re.compile(r"^(\d+):([+-]?(?:\d+(?:[.]\d*)?(?:[eE][+-]?\d+)?|[.]\d+(?:[eE][+-]?\d+)?)),([+-]?(?:\d+([.]\d*)?(?:[eE][+-]?\d+)?|[.]\d+(?:[eE][+-]?\d+)?))$")

# Test endpoint
@app.get("/random")
async def read_item(w: Optional[int] = 128, h: Optional[int] = 128):
    """
    Test endpoint of the web API that simply returns an image with white noise.

    Parameters
    ----------
    w:  int, optional
        Image width.
    h:  int, optional
        Image height.
    Returns
    -------
    response: byte stream
        `Streaming response <https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse>`_
        containing the JPEG image.
    """
    a = np.random.random((h,w)) * 255.0
    res, im_jpg = cv2.imencode(".jpg", a)
    return responses.StreamingResponse(io.BytesIO(im_jpg.tobytes()), media_type="image/jpg")


# Tile endpoint
@app.get(base_url)
async def read_visio(
        FIF: str = None,
        obj: List[str] = Query(None, max_length=200),
        GAM: float = None,
        JTL: str = Query(None, min_length=3, max_length=11, regex="^\d+,\d+$"),
        MINMAX: str = Query(None, min_length=5, max_length=48, regex="^(\d+):([+-]?(?:\d+(?:[.]\d*)?(?:[eE][+-]?\d+)?|[.]\d+(?:[eE][+-]?\d+)?)),([+-]?(?:\d+([.]\d*)?(?:[eE][+-]?\d+)?|[.]\d+(?:[eE][+-]?\d+)?))$")):
    """
    Tile endpoint of the web API: returns a JPEG tile at the requested position.

    Parameters
    ----------
    FIF: str
        Image name.
    obj: str or None
        If present, return image information instead of a tile.
    GAM:  float, optional
        Tile display gamma.
    JTL: str
        Query parameters controlling the tile level and coordinates.
    MINMAX: str, optional
        Query parameters controlling the tile intensity cuts.
    Returns
    -------
    response: byte stream
        `Streaming response <https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse>`_
        containing the JPEG image.
    """
    if FIF == None:
        file = open(banner_filename)
        html = file.read()
        file.close()
        return responses.HTMLResponse(html)

    if app.ima == None:
        app.ima = visioimage(FIF)
    if obj != None:
        return responses.PlainTextResponse(app.ima.get_iipheaderstr())
    ima = app.ima
    if JTL == None:
        return
    if GAM != None:
        ima._gamma = GAM
    if MINMAX != None:
        #print(MINMAX)
        resp = app.parse_minmax.findall(MINMAX)[0]
        ima._minmax[0] = float(resp[1])
        ima._minmax[1] = float(resp[2])
        #print(f"Min: {ima._minmax[0]} / Max: {ima._minmax[1]}")
    resp = app.parse_jtl.findall(JTL)[0]
    r = ima._nlevels - 1 - int(resp[0])
    if r < 0:
          r = 0
    t = int(resp[1])
    #print(f"Tile #{t} at level {r}")
    res, pix = cv2.imencode(".jpg", app.ima.scale_tile(ima._tiles[r][t]))
    return responses.StreamingResponse(io.BytesIO(pix.tobytes()), media_type="image/jpg")


