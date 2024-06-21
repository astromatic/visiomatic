"""
Application module
"""
# Copyright CFHT/CNRS/SorbonneU/CEA/UParisSaclay
# Licensed under the MIT licence

from __future__ import annotations

import io, logging, pickle, re
from glob import glob
from os import getpid, getppid, path
from sys import modules
from typing import Annotated, List, Literal, Pattern

import cv2
from fastapi import FastAPI, Query, Request
from fastapi import responses, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
import numpy as np
from pydantic import BeforeValidator

from .. import package

from . import config

from .tiled import (
    colordict,
    delTiled,
    get_image_filename,
    pickledTiled,
    ProfileModel,
    Tiled
)
from .cache import LRUCache, LRUSharedRWCache

# True with multiple workers (multiprocessing).
shared = config.settings["workers"] > 1 and not config.settings["reload"]

# Prepare the RegExps; note that those with non-capturing groups do not
# work with Rust
# FIF (image filenames): discard filenames with ..
# JTL (tile indices)
reg_fif = r"(?!\.\.)(^.*$)"
parse_fif = re.compile(reg_fif)
reg_jtl = r"^(\d+),(\d+)$"
parse_jtl = re.compile(reg_jtl)
# MINMAX (intensity range)
reg_minmax = r"^(\d+):([+-]?(?:\d+(?:[.]\d*)?(?:[eE][+-]?\d+)?" \
    r"|[.]\d+(?:[eE][+-]?\d+)?)),([+-]?(?:\d+([.]\d*)" \
    r"?(?:[eE][+-]?\d+)?|[.]\d+(?:[eE][+-]?\d+)?))$"
parse_minmax = re.compile(reg_minmax)
# MIX (mixing matrix)
reg_mix = r"^(\d+):([+-]?\d+\.?\d*),([+-]?\d+\.?\d*),([+-]?\d+\.?\d*)$"
parse_mix = re.compile(reg_mix) 
# PFL (image profile(s)
reg_pfl = r"^([+-]?\d+),([+-]?\d+):([+-]?\d+),([+-]?\d+)$"
parse_pfl = re.compile(reg_pfl)
# VAL (pixel value(s)
reg_val = r"^([+-]?\d+),([+-]?\d+)$"
parse_val = re.compile(reg_val)

def validate_pattern(s: str, pattern):
    if not pattern.match(s):
        raise ValueError(f"string does not match {pattern} pattern")
    return s


def create_app() -> FastAPI:
    """
    Create FASTAPI application
    """

    worker_id = getpid()

    banner_template = config.settings["banner_template"]
    base_template = config.settings["base_template"]
    template_dir = path.abspath(config.settings["template_dir"])
    cache_dir = path.abspath(config.settings["cache_dir"])
    client_dir = path.abspath(config.settings["client_dir"])
    data_dir = path.abspath(config.settings["data_dir"])
    extra_dir = path.abspath(config.settings["extra_dir"])
    doc_dir = config.settings["doc_dir"]
    doc_path = config.settings["doc_path"]
    userdoc_url = config.settings["userdoc_url"]
    api_path = config.settings["api_path"]
    brightness = config.settings["brightness"]
    contrast = config.settings["contrast"]
    color_saturation = config.settings["color_saturation"]
    gamma = config.settings["gamma"]
    quality = config.settings["quality"]
    tile_size = config.settings["tile_size"]
    image_argname = config.image_filename

    logger = logging.getLogger("uvicorn.error")

    # Provide an endpoint for the user's manual (if it exists)
    if config.config_filename:
        logger.info(f"Configuration read from {config.config_filename}.")
    else:
        logger.warning(
            f"Configuration file not found: {config.config_filename}!"
        )
    # Get shared lock dictionary if processing in parallel
    cache = LRUSharedRWCache(
        pickledTiled,
        name=f"{package.title}.{getppid()}",
        maxsize=config.settings["max_cache_image_count"],
        removecall=delTiled,
        shared=shared,
        logger=logger
    )
    # Scan and register images cached during previous sessions
    for filename in glob(path.join(cache_dir, "*" + ".pkl")):
        tiled, msg, lock = cache(
            get_image_filename(path.splitext(filename)[0])
        )
        if lock:
            lock.release_read()

    app = FastAPI(
        title=package.title,
        description=package.description,
        version=package.version,
        contact={
            "name":  f"{package.contact['name']} ({package.contact['affiliation']})",
            "url":   package.url,
            "email": package.contact['email']
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

    # Provide a direct endpoint for static files (such as js and css)
    app.mount(
        "/client",
        StaticFiles(directory=client_dir),
        name="client"
    )

    # Provide a direct endpoint for extra static data files (such as json files)
    app.mount(
        "/extra",
        StaticFiles(directory=extra_dir),
        name="extra"
    )

    # Provide an endpoint for the user's manual (if it exists)
    if path.exists(doc_dir):
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
    templates = Jinja2Templates(
        directory=path.join(package.src_dir, template_dir)
    )

    # Tile endpoint
    @app.get(api_path, tags=["services"])
    async def read_visio(
            request: Request,
            FIF: Annotated[
                str,
                # Trick to use a true Python regexp instead of Rust's
                BeforeValidator(lambda s: validate_pattern(s, parse_fif)),
                Query(
                    title="Image filename",
                    min_length=1,
                     max_length=1024
                )]= None,
            obj: str = Query(
                None,
                title="Get image information instead of a tile"
                ),
            CHAN: Annotated[List[int] | None, Query(
                title="Channel index (mono-channel mode) or indices (measurements)"
                )] = None,
            CMP: Literal[tuple(colordict.keys())] = Query( #type: ignore
                'grey',
                title="Name of the colormap"
                ),
            CNT: float = Query(
                contrast,
                title="Relative contrast",
                ge=0.,
                le=100.
                ),
            GAM: float = Query(
                1.0/gamma,
                title="Inverse display gamma",
                ge=0.2,
                le=2.
                ),
            INFO: str = Query(
                None,
                title="Get advanced image information instead of a tile"
                ),
            INV: str = Query(
                None,
                title="Invert the colormap"
                ),
            BRT: float = Query(
                brightness,
                title="Relative brightness",
                ge=-100.,
                le=100.
                ),
            QLT: int = Query(
                quality,
                title="JPEG quality",
                ge=0,
                le=100
                ),
            JTL: str = Query(
                None,
                title="Tile coordinates",
                min_length=3,
                max_length=14,
                ),
            MINMAX: Annotated[
            	list[str] | None,
                # Trick to use a true Python regexp instead of Rust's
                # on a list of strings
                BeforeValidator(
                    lambda l: [validate_pattern(s, parse_minmax) for s in l]),
                Query(
                    title="Modified minimum and Maximum intensity ranges",
                    min_length=1,
                    max_length=100
                )] = None,
            MIX: Annotated[
                list[str] | None,
                # Trick to use a true Python regexp instead of Rust's
                # on a list of strings
                BeforeValidator(
                    lambda l: [validate_pattern(s, parse_mix) for s in l]),
                Query(
                    title="Slice of the mixing matrix",
                    min_length=1,
                    max_length=100
                )] = None,
            PFL: str = Query(
                None,
                title="Get image profile(s)", 
                min_length=7,
                max_length=39,
                pattern=reg_pfl
                ),
            VAL: str = Query(
                None,
                title="Pixel value(s)",
                min_length=3,
                max_length=32,
                pattern=reg_val
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
        if FIF is None:
			# Just return the banner describing the service
            return templates.TemplateResponse(
                banner_template,
                {
                    "request": request,
                    "root_path": request.scope.get("root_path"),
                }
            )
        image_filename = path.abspath(
            image_argname if image_argname \
               else path.join(data_dir, FIF)
        )
        tiled, msg, lock = cache(
            image_filename,
            brightness=brightness,
            contrast=contrast,
            color_saturation=color_saturation,
            gamma=gamma,
            quality=quality,
            tilesize=tile_size
        )
        # Manage image file open error
        if tiled is None:
            if lock:
                lock.release_read()
            # Return 404 error with data_dir removed for security
            raise HTTPException(
                status_code=404,
                detail=[{
                    "loc": ["query", "FIF"],
                    "msg": msg.replace(path.join(data_dir,""), ""),
                    "type": "value_error.str"
                }]
            )
        if obj is not None:
            resp = tiled.get_iipheaderstr()
            if lock:
                lock.release_read()
            return responses.PlainTextResponse(resp)
        elif INFO is not None:
            resp = tiled.get_model()
            if lock:
                lock.release_read()
            return responses.JSONResponse(content=jsonable_encoder(resp))
        elif PFL is not None:
            val = parse_pfl.findall(PFL)[0]
            resp = tiled.get_profiles(
                CHAN,
                [int(val[0]), int(val[1])],
                [int(val[2]), int(val[3])]
            )
            if lock:
                lock.release_read()
            # We use the ORJSON response to properly manage NaNs
            return responses.ORJSONResponse(content=jsonable_encoder(resp))
        elif VAL is not None:
            val = parse_val.findall(VAL)[0]
            resp = tiled.get_pixel_values(
                CHAN,
                (int(val[0]), int(val[1]))
            )
            if lock:
                lock.release_read()
            return responses.JSONResponse(content=jsonable_encoder(resp))
        if JTL is None:
            if lock:
                lock.release_read()
            return
        # Update intensity cuts only if they correspond to the current channel
        minmax = None
        if MINMAX is not None:
            resp = [parse_minmax.findall(m)[0] for m in MINMAX]
            minmax = tuple(
                (
                    int(r[0]),
                    float(r[1]),
                    float(r[2])
                ) for r in resp
            )
        mix = None
        if MIX is not None:
            resp = [parse_mix.findall(m)[0] for m in MIX]
            mix = tuple(
                (
                    int(r[0]),
                    float(r[1]),
                    float(r[2]),
                    float(r[3])
                ) for r in resp
            )
        resp = parse_jtl.findall(JTL)[0]
        tl = tiled.nlevels - 1 - int(resp[0])
        if tl < 0:
            tl = 0
        ti = int(resp[1])
        pix = tiled.get_tile_cached(
            tl,
            ti,
            channel=CHAN[0] if CHAN else CHAN,
            minmax=minmax,
            mix=mix,
            brightness=BRT,
            contrast=CNT,
            gamma=GAM,
            colormap=CMP,
            invert=(INV is not None),
            quality=QLT
        )
        if lock:
            lock.release_read()
        return responses.StreamingResponse(
            io.BytesIO(pix),
            media_type="image/jpg"
        )


    # VisiOmatic client endpoint
    @app.get("/", tags=["UI"], response_class=responses.HTMLResponse)
    async def visiomatic(
            request: Request,
            image : str = "example.fits"):
        """
        Main web user interface.
        """
        return templates.TemplateResponse(
            base_template,
            {
                "request": request,
                "root_path": request.scope.get("root_path"),
                "api_path": api_path,
                "doc_url": userdoc_url,
                "image": image,
                "package": package.title
            }
        )

    return app

