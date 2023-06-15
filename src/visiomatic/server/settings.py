"""
Server settings.
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

from pathlib import Path
from argparse import ArgumentParser
from pydantic import BaseSettings, Field

class ConfigSettings(BaseSettings):
    config: str = Field(
        alias="c",
        default="config/visiomatic.conf",
        title="Name of the VisiOmatic configuration file"
        )

class HostSettings(BaseSettings):
    host: str = Field(
        alias="H",
        default="localhost",
        title="Host name or IP address"
        )
    port: int = Field(
        alias="p",
        default=8009,
        title="Port"
        )
    root_path: str = Field(
        alias="R",
        default="",
        title="ASGI root_path"
        )
    access_log: bool = Field(
        alias="a",
        default=False,
        title="Display access log"
        )
    reload: bool = Field(
        alias="r",
        default=False,
        title="Enable auto-reload (turns off multiple workers)"
        )
    workers: int = Field(
        alias="r",
        default=4,
        ge=1,
        title="Number of workers"
        )


class ServerSettings(BaseSettings):
    banner: str = Field(
        default="banner.html",
        title="Name of the HTML file with the service banner"
        )
    data_dir: str = Field(
        default="fits",
        title="Data root directory"
        )
    doc_dir: str = Field(
        default="doc/build/html",
        title="HTML documentation root directory (after build)"
        )
    doc_path: str = Field(
        default="/manual",
        title="Endpoint URL for the root of the HTML documentation"
        )
    tiles_path : str = Field(
        default="/tiles",
        title="Endpoint URL for tile queries"
        )
    userdoc_url: str = Field(
        default=doc_path.default + "/interface.html",
        title="Endpoint URL for the user's HTML documentation"
        )


class CacheSettings(BaseSettings):
    cache_dir: str = Field(
        default="tmp",
        title="Data cache directory"
        )
    max_disk_cache_image_count: int = Field(
        default=3,
        ge=1,
        title="Maximum number of images in disk cache"
        )
    max_mem_cache_image_count: int = Field(
        default=16,
        ge=1,
        title="Maximum number of images in memory cache"
        )
    max_mem_cache_tile_count: int = Field(
        default=1024,
        ge=1,
        title="Maximum number of image tiles in memory cache"
        )
    ultradict_cache_file : str = Field(
        default="/dev/shm/visiomatic_cache_dict.pkl",
        title="Name of the pickled cache dictionary shared across processes"
        )


class AppSettings(BaseSettings):
    host = HostSettings()
    server = ServerSettings()
    cache = CacheSettings()

def settings2parser(settings: AppSettings, parser: ArgumentParser):
        print(settings.dict())


# Instantiate models
config_settings = ConfigSettings()
default_settings = AppSettings()

