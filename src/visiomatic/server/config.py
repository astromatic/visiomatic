"""
Configuration settings for the application.
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

from pydantic import (
    BaseSettings,
    Field
)

from .. import package

class HostSettings(BaseSettings):
    host: str = Field(
        short="H",
        default="localhost",
        description="Host name or IP address"
        )
    port: int = Field(
        short="p",
        default=8009,
        ge=1,
        le=65535,
        description="Port"
        )
    root_path: str = Field(
        short="R",
        default="",
        description="ASGI root_path"
        )
    access_log: bool = Field(
        short="a",
        default=False,
        description="Display access log"
        )
    reload: bool = Field(
        short="r",
        default=False,
        description="Enable auto-reload (turns off multiple workers)"
        )
    workers: int = Field(
        short="w",
        default=4,
        ge=1,
        description="Number of workers"
        )

    class Config:
        env_prefix = f"{package.name}_"
        extra = 'ignore'


class ServerSettings(BaseSettings):
    banner: str = Field(
        default="banner.html",
        description="Name of the HTML file with the service banner"
        )
    data_dir: str = Field(
        default="fits",
        description="Data root directory"
        )
    doc_dir: str = Field(
        default="doc/build/html",
        description="HTML documentation root directory (after build)"
        )
    doc_path: str = Field(
        default="/manual",
        description="Endpoint URL for the root of the HTML documentation"
        )
    tiles_path : str = Field(
        default="/tiles",
        description="Endpoint URL for tile queries"
        )
    userdoc_url: str = Field(
        default=doc_path.default + "/interface.html",
        description="Endpoint URL for the user's HTML documentation"
        )

    class Config:
        env_prefix = f"{package.name}_"
        extra = 'ignore'


class CacheSettings(BaseSettings):
    cache_dir: str = Field(
        default="tmp",
        description="Data cache directory"
        )
    max_disk_cache_image_count: int = Field(
        default=16,
        ge=1,
        description="Maximum number of images in disk cache"
        )
    max_mem_cache_image_count: int = Field(
        default=2,
        ge=1,
        description="Maximum number of images in memory cache"
        )
    max_mem_cache_tile_count: int = Field(
        default=1024,
        ge=1,
        description="Maximum number of image tiles in memory cache"
        )
    ultradict_cache_file : str = Field(
        default="/dev/shm/visiomatic_cache_dict.pkl",
        description="Name of the pickled cache dictionary shared across processes"
        )

    class Config:
        env_prefix = f"{package.name}_"
        extra = 'ignore'


class AppSettings(BaseSettings):
    host = HostSettings()
    server = ServerSettings()
    cache = CacheSettings()



