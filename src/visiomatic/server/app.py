"""
Application module
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

import io, os, re
import numpy as np
from typing import List, Literal, Optional
from fastapi import FastAPI, Query, Request
from fastapi import responses
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder

from .. import package
from .settings import app_settings 
from .image import colordict, Tiled

def create_app() -> FastAPI:
    """
    Create FASTAPI application
    """

    app = FastAPI(
        title=package.title,
        description=package.description,
        version=package.version,
        contact={
            "name":  f"{package.contact_name} ({package.contact_affiliation})",
            "url":   package.url,
            "email": package.contact_email
        },
        license_info={
            "name": package.license_name,
            "url":  package.license_url
        }
    )
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
    banner = app_settings.BANNER
    doc_path = app_settings.DOC_PATH
    doc_url = app_settings.DOC_URL
    tiles_path = app_settings.TILES_PATH

    # Prepare the dictionary of tiled image pyramids
    app.tiled = {}
    app.parse_jtl = re.compile(r"^(\d+),(\d+)$")
    app.parse_minmax = re.compile(r"^(\d+):([+-]?(?:\d+(?:[.]\d*)?(?:[eE][+-]?\d+)?|[.]\d+(?:[eE][+-]?\d+)?)),([+-]?(?:\d+([.]\d*)?(?:[eE][+-]?\d+)?|[.]\d+(?:[eE][+-]?\d+)?))$")

    # Provide an endpoint for static files (such as js and css)
    app.mount(
        "/client",
        StaticFiles(directory=os.path.join(package.root_dir, "client")),
        name="client"
    )

    # Provide an endpoint for the user's manual (if it exists)
    doc_dir = app_settings.DOC_DIR
    if os.path.exists(doc_dir):
        app.mount(
            doc_path,
            StaticFiles(directory=doc_dir),
            name="manual"
        )


    # Instantiate templates
    templates = Jinja2Templates(directory=os.path.join(package.root_dir, "templates"))
    async def toto():
        """
        test function
        """
        return


    # Test endpoint
    @app.get("/random", tags=["services"])
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
            [Streaming response](https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse>)
            containing the JPEG image.
        """
        a = np.random.random((h,w)) * 255.0
        res, im_jpg = cv2.imencode(".jpg", a)
        return responses.StreamingResponse(io.BytesIO(im_jpg.tobytes()), media_type="image/jpg")

    # Tile endpoint
    @app.get(tiles_path, tags=["services"])
    async def read_visio(
            request: Request,
            FIF: str = Query(None, title="Image filename"),
            obj: str = Query(None, title="Get image information instead of a tile"),
            CHAN: int =  Query(1, title="Channel index (mono-channel mode)", ge=0),
            CMP: Literal[tuple(colordict.keys())] = Query('grey', title="Name of the colormap"),
            CNT: float = Query(1.0, title="Relative contrast", ge=0.0, le=10.0),
            GAM: float = Query(0.4545, title="Inverse display gamma", ge=0.2, le=2.0),
            INFO: str = Query(None, title="Get advanced image information instead of a tile"),
            INV: str = Query(None, title="Invert the colormap"),
            QLT: int = Query(90, title="JPEG quality", ge=0, le=100),
            JTL: str = Query(None, title="Tile coordinates",
                min_length=3, max_length=11, regex="^\d+,\d+$"),
            MINMAX: str = Query(None, title="Modified minimum and Maximum intensity ranges",
            min_length=5, max_length=48, regex="^(\d+):([+-]?(?:\d+(?:[.]\d*)?(?:[eE][+-]?\d+)?|[.]\d+(?:[eE][+-]?\d+)?)),([+-]?(?:\d+([.]\d*)?(?:[eE][+-]?\d+)?|[.]\d+(?:[eE][+-]?\d+)?))$")):
        """
        Tile endpoint of the web API: returns a JPEG tile at the requested position.

        Returns
        -------
        response: byte stream
            [Streaming response](https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse>)
            containing the JPEG image.
        """
        if FIF == None:
            return templates.TemplateResponse(
                banner,
                {
                    "request": request,
                    "root_path": request.scope.get("root_path"),
                }
            )

        if FIF in app.tiled:
            tiled = app.tiled[FIF]
        else:
            app.tiled[FIF] = (tiled := Tiled(FIF))
        if obj != None:
            return responses.PlainTextResponse(tiled.get_iipheaderstr())
        elif INFO != None:
            return responses.JSONResponse(content=jsonable_encoder(tiled.get_model()))
        if JTL == None:
            return
        # Update intensity cuts only if they correspond to the current channel
        minmax = None
        if MINMAX != None:
            resp = app.parse_minmax.findall(MINMAX)[0]
            if int(resp[0]) == CHAN:
                minmax = float(resp[1]), float(resp[2])
        resp = app.parse_jtl.findall(JTL)[0]
        r = tiled.nlevels - 1 - int(resp[0])
        if r < 0:
            r = 0
        t = int(resp[1])
        pix = tiled.get_tile(
            r,
            t,
            channel=CHAN,
            minmax=minmax,
            contrast=CNT,
            gamma=GAM,
            colormap=CMP,
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
                "tiles_path": tiles_path,
                "doc_url": doc_url,
                "image": image,
                "package": package.title
            }
        )

    return app

