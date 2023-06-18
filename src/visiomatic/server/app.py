"""
Application module
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

import io, logging, os, pickle, re
from typing import List, Literal, Optional, Union

from fastapi import FastAPI, Query, Request
from fastapi import responses
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
import numpy as np

from .. import package

from . import settings

# Set up settings
settings.dict = settings.Settings().flat_dict()

from .tiled import colordict, pickledTiled, Tiled
from .cache import LRUMemCache, LRUSharedRWLockCache


share = settings.dict["workers"] > 1 and not settings.dict["reload"]

def create_app() -> FastAPI:
    """
    Create FASTAPI application
    """

    worker_id = os.getpid()
    # Get shared lock dictionary if processing in parallel
    if share:
        sharedLock = LRUSharedRWLockCache(
            name=f"{package.title}.{os.getppid()}",
            maxsize=settings.dict["max_disk_cache_image_count"]
        )

    memCachedTiled = LRUMemCache(
        pickledTiled,
        maxsize=settings.dict["max_mem_cache_image_count"]
    )

    banner = settings.dict["banner"]
    doc_dir = settings.dict["doc_dir"]
    doc_path = settings.dict["doc_path"]
    userdoc_url = settings.dict["userdoc_url"]
    tiles_path = settings.dict["tiles_path"]

    logger = logging.getLogger("uvicorn.error")

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

    # Provide an endpoint for static files (such as js and css)
    app.mount(
        "/client",
        StaticFiles(directory=os.path.join(package.root_dir, "client")),
        name="client"
    )

    # Provide an endpoint for the user's manual (if it exists)
    if os.path.exists(doc_dir):
        logger.info(f"Default documentation found at {doc_dir}.")
        app.mount(
            doc_path,
            StaticFiles(directory=doc_dir),
            name="manual"
        )
    else:
        logger.warning(f"Default documentation not found in {doc_dir}!")
        logger.warning("Has the HTML documentation been compiled ?")
        logger.warning("De-activating documentation URL in built-in web client.")
        userdoc_url = ""


    # Instantiate templates
    templates = Jinja2Templates(directory=os.path.join(package.root_dir, "templates"))

    # Prepare the RegExps
    reg_jtl = r"^(\d+),(\d+)$"
    app.parse_jtl = re.compile(reg_jtl)
    reg_minmax = r"^(\d+):([+-]?(?:\d+(?:[.]\d*)?(?:[eE][+-]?\d+)?" \
        r"|[.]\d+(?:[eE][+-]?\d+)?)),([+-]?(?:\d+([.]\d*)" \
        r"?(?:[eE][+-]?\d+)?|[.]\d+(?:[eE][+-]?\d+)?))$"
    app.parse_minmax = re.compile(reg_minmax)
    reg_mix = r"^(\d+):([+-]?\d+\.?\d*),([+-]?\d+\.?\d*),([+-]?\d+\.?\d*)$"
    app.parse_mix = re.compile(reg_mix) 

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
            FIF: str = Query(
                None,
                title="Image filename"
                ),
            obj: str = Query(
                None,
                title="Get image information instead of a tile"
                ),
            CHAN: int =  Query(
                None,
                title="Channel index (mono-channel mode)",
                ge=0
                ),
            CMP: Literal[tuple(colordict.keys())] = Query(
                'grey',
                title="Name of the colormap"
                ),
            CNT: float = Query(
                1.0,
                title="Relative contrast",
                ge=0.0,
                le=10.0
                ),
            GAM: float = Query(
                0.4545,
                title="Inverse display gamma",
                ge=0.2,
                le=2.0
                ),
            INFO: str = Query(
                None,
                title="Get advanced image information instead of a tile"
                ),
            INV: str = Query(
                None,
                title="Invert the colormap"
                ),
            QLT: int = Query(
                90,
                title="JPEG quality",
                ge=0,
                le=100
                ),
            JTL: str = Query(
                None,
                title="Tile coordinates",
                min_length=3,
                max_length=11,
                regex=reg_jtl
                ),
            MINMAX: list[str] = Query(
                None,
                title="Modified minimum and Maximum intensity ranges",
                min_length=5,
                max_length=48,
                regex=reg_minmax
                ),
			MIX: list[str] = Query(
			    None,
			    title="Slice of the mixing matrix", 
                min_length=7,
                max_length=2000,
                regex=reg_mix
                )
            ):
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

        if share:
            lock = sharedLock(FIF)

        tiled = memCachedTiled(FIF)
        '''
        if FIF in app.tiled:
            tiled = pickle.load(open(f"{FIF}_{worker_id}.p", "rb"))
            tiled.tiles = app.tiles
        else:
            app.tiled[FIF] = (tiled := Tiled(FIF))
            app.tiles = tiled.tiles
            tiled.tiles = None
            tiled.data = None
            for image in tiled.images:
                image.data = None
            pickle.dump(tiled, open(f"{FIF}_{worker_id}.p", "wb"), protocol=5)
            tiled.tiles = app.tiles
        '''

        if obj != None:
            if share:
                lock.release()
            return responses.PlainTextResponse(tiled.get_iipheaderstr())
        elif INFO != None:
            if share:
                lock.release()
            return responses.JSONResponse(content=jsonable_encoder(tiled.get_model()))
        if JTL == None:
            if share:
                lock.release()
            return
        # Update intensity cuts only if they correspond to the current channel
        minmax = None
        if MINMAX != None:
            resp = [app.parse_minmax.findall(m)[0] for m in MINMAX]
            minmax = tuple(
                (
                    int(r[0]),
                    float(r[1]),
                    float(r[2])
                ) for r in resp
            )
        mix = None
        if MIX != None:
            resp = [app.parse_mix.findall(m)[0] for m in MIX]
            mix = tuple(
                (
                    int(r[0]),
                    float(r[1]),
                    float(r[2]),
                    float(r[3])
                ) for r in resp
            )
        resp = app.parse_jtl.findall(JTL)[0]
        tl = tiled.nlevels - 1 - int(resp[0])
        if tl < 0:
            tl = 0
        ti = int(resp[1])
        pix = tiled.get_tile_cached(
            tl,
            ti,
            channel=CHAN,
            minmax=minmax,
            mix=mix,
            contrast=CNT,
            gamma=GAM,
            colormap=CMP,
            invert=(INV!=None),
            quality=QLT
        )
        if share:
            lock.release()
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
                "doc_url": userdoc_url,
                "image": image,
                "package": package.title
            }
        )

    return app

