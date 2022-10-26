"""
Application module
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

import io, os, re
import numpy as np
from typing import List, Optional
from fastapi import FastAPI, Query, Request
from fastapi import responses
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware

from .. import defs
from visiomatic.server.image import Image

banner_filename = "banner.html"
tiles_url = "/tiles/"


app = FastAPI()
"""
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
"""
# Prepare the dictionary of images
app.images = {}
app.parse_jtl = re.compile(r"^(\d+),(\d+)$")
app.parse_minmax = re.compile(r"^(\d+):([+-]?(?:\d+(?:[.]\d*)?(?:[eE][+-]?\d+)?|[.]\d+(?:[eE][+-]?\d+)?)),([+-]?(?:\d+([.]\d*)?(?:[eE][+-]?\d+)?|[.]\d+(?:[eE][+-]?\d+)?))$")

# Provide an endpoint for static files (such as js and css)
app.mount("/static", StaticFiles(directory=os.path.join(defs.root_dir, "static")), name="static")

# Instantiate templates
templates = Jinja2Templates(directory=os.path.join(defs.root_dir, "templates"))

# Test endpoint
a = np.random.random(1)[0]
@app.get("/test", response_class=responses.HTMLResponse)
async def read_test():
    return f"a={a}"

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
@app.get(tiles_url, tags=["UI"])
async def read_visio(
        request: Request,
        FIF: str = None,
        obj: str = Query(None, title="Get image information instead of a tile",
            max_length=200),
        CNT: float = Query(1.0, title="Relative contrast", ge=0.0, le=10.0),
        GAM: float = Query(0.4545, title="Inverse display gamma", ge=0.2, le=2.0),
        INV: str = Query(None, title="Invert the colormap"),
        QLT: int = Query(90, title="JPEG quality", ge=0, le=100),
        JTL: str = Query(None, title="Tile coordinates",
            min_length=3, max_length=11, regex="^\d+,\d+$"),
        MINMAX: str = Query(None, title="Minimum and Maximum intensity range",
            min_length=5, max_length=48, regex="^(\d+):([+-]?(?:\d+(?:[.]\d*)?(?:[eE][+-]?\d+)?|[.]\d+(?:[eE][+-]?\d+)?)),([+-]?(?:\d+([.]\d*)?(?:[eE][+-]?\d+)?|[.]\d+(?:[eE][+-]?\d+)?))$")):
    """
    Tile endpoint of the web API: returns a JPEG tile at the requested position.

    Parameters
    ----------
    FIF: str
        Image name.
    obj: str or None
        Query parameter to return image information instead of a tile.
    CNT:  float, optional
        Query parameter controlling the relative tile contrast.
    GAM:  float, optional
        Query parameter controlling the inverse display gamma.
    INV: bool, optional
        Query parameter to invert the colormap.
    JTL: str
        Query parameters controlling the tile level and coordinates.
    MINMAX: str, optional
        Query parameters controlling the tile intensity cuts.
    QLT: int, optional
        Query parameter controlling the JPEG quality
    Returns
    -------
    response: byte stream
        `Streaming response <https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse>`_
        containing the JPEG image.
    """
    if FIF == None:
        return templates.TemplateResponse(
            "banner.html", {
                "request": request,
                "root_path": request.scope.get("root_path"),
        })

    if FIF in app.images:
        image = app.images[FIF]
    else:
        app.images[FIF] = (image := Image(FIF))
    if obj != None:
        return responses.PlainTextResponse(image.get_iipheaderstr())
    if JTL == None:
        return
    if MINMAX != None:
        #print(MINMAX)
        resp = app.parse_minmax.findall(MINMAX)[0]
        minmax = float(resp[1]), float(resp[2])
    else:
        minmax = image._minmax
    resp = app.parse_jtl.findall(JTL)[0]
    r = image._nlevels - 1 - int(resp[0])
    if r < 0:
          r = 0
    t = int(resp[1])
    pix = image.get_tile(
        r,
        t,
        minmax=minmax,
        contrast=CNT,
        gamma=GAM,
        invert=(INV!=None),
        quality=QLT
    )
    return responses.StreamingResponse(io.BytesIO(pix), media_type="image/jpg")


# VisiOmatic client endpoint
@app.get("/", tags=["UI"], response_class=responses.HTMLResponse)
async def visiomatic(
        request: Request,
        image : str = "example.fits"):
    """
    Main web user interface.
    """
    return templates.TemplateResponse(
        "base.html",
        {
            "request": request,
            "root_path": request.scope.get("root_path"),
            "tiles_url": tiles_url,
            "image": image,
            "package": defs.package_str
        }
    )


