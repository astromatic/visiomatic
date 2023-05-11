"""
Server settings.
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

from pathlib import Path
from pydantic import BaseSettings

class AppSettings(BaseSettings):
    """
    Default application settings, can be overriden by ENV:
    
    BANNER: str
        Name of the HTML with the service banner.
    DATA_DIR: Path
        Data root directory.
    DOC_DIR: Path
        HTML documentation root directory (after build).
    DOC_PATH: str
        Endpoint URL for the root of the HTML documentation.
    USERDOC_URL: str
        Endpoint URL for the user's HTML documentation.
    TILES_PATH: str
        Endpoint URL for tile queries.
    """
    BANNER: str = "banner.html"
    CACHE_DIR : str = "tmp"
    DATA_DIR : Path = "fits"
    DOC_DIR: Path = "doc/build/html"
    DOC_PATH : str = "/manual"
    MAX_DISK_CACHE_IMAGE_COUNT: int = 64
    MAX_MEM_CACHE_IMAGE_COUNT: int = 16
    MAX_MEM_CACHE_TILE_COUNT: int = 1024
    TILES_PATH : str = "/tiles"
    ULTRADICT_FILE: str = "/dev/shm/visiomatic_dict.pkl"
    USERDOC_URL: str = DOC_PATH + "/interface.html"

app_settings = AppSettings()

