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
        Name of the HTML with the service banner
    DATA_DIR: Path
        Data root directory
    TILES_URL: str
        Endpoint URL for tile queries.
    """
    BANNER: str = "banner.html"
    DATA_DIR : Path = "fits"
    DOC_DIR: str = "doc/build/html"
    DOC_PATH : str = "/manual"
    DOC_URL: str = DOC_PATH + "https://ebertin.github.io/visiomatic-server/manual/interface.html"
    TILES_PATH : str = "/tiles"

app_settings = AppSettings()

