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
    
    BANNER: Name of the HTML with the service banner
    DATA_DIR: Data root directory
    TILES_URL: Endpoint URL for tile queries.
    """
    BANNER: str = "banner.html"
    DATA_DIR : Path = "fits"
    TILES_URL : str = "/tiles"

app_settings = AppSettings()

