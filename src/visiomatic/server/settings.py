"""
Configuration settings for the application.
"""
# Copyright CFHT/CNRS/SorbonneU/CEA/UParisSaclay
# Licensed under the MIT licence

from os import cpu_count, path
from typing import Tuple

from pydantic import (
    BaseSettings,
    Field
)

from .. import package

class HostSettings(BaseSettings):
    host: str = Field(
        short='H',
        default="localhost",
        description="Host name or IP address"
        )
    port: int = Field(
        short='p',
        default=8009,
        ge=1,
        le=65535,
        description="Port"
        )
    root_path: str = Field(
        short='R',
        default="",
        description="ASGI root_path"
        )
    access_log: bool = Field(
        short='a',
        default=False,
        description="Display access log"
        )
    reload: bool = Field(
        short='r',
        default=False,
        description="Enable auto-reload (turns off multiple workers)"
        )
    workers: int = Field(
        short='w',
        default=4 if package.isonlinux else 1,
        ge=1,
        description="Number of workers"
        )

    class Config:
        env_prefix = f"{package.name}_"
        extra = 'ignore'


class ImageSettings(BaseSettings):
    brightness: float = Field(
        default=0.,
        ge=-100.,
        le=100.,
        description="Default image brightness"
        )
    contrast: float = Field(
        default=1.,
        ge=0.01,
        le=10.,
        description="Default image contrast"
        )
    color_saturation: float = Field(
        default=1.5,
        ge=0.,
        le=5.,
        description="Default color saturation"
        )
    gamma: float = Field(
        default=2.2,
        ge=0.1,
        le=5.,
        description="Default image gamma"
        )
    quality: int = Field(
        default=95,
        ge=1,
        le=100,
        description="Default image compression quality in %%"
        )
    tile_size: Tuple[int, int] = Field(
        default=(256, 256),
        ge=1,
        le=4096,
        description="Tile size"
        )

    class Config:
        env_prefix = f"{package.name}_"
        extra = 'ignore'


class ServerSettings(BaseSettings):
    api_path : str = Field(
        default="/api",
        description="Endpoint URL for the webservice API"
        )
    banner_template: str = Field(
        default="banner.html",
        description="Name of the HTML template file for the service banner"
        )
    base_template: str = Field(
        default="base.html",
        description="Name of the HTML template file for the web client"
        )
    client_dir: str = Field(
        default=path.join(package.src_dir, "client"),
        description="Directory containing the web client code, style and media"
        )
    data_dir: str = Field(
        default=".",
        description="Data root directory"
        )
    doc_dir: str = Field(
        default=path.join(package.root_dir, "doc/build/html"),
        description="HTML documentation root directory (after build)"
        )
    doc_path: str = Field(
        default="/manual",
        description="Endpoint URL for the root of the HTML documentation"
        )
    extra_dir: str = Field(
        default=".",
        description="Extra data root directory"
        )
    no_browser: bool = Field(
        short='n',
        default=False,
        description="Do not start browser when providing image file"
        )
    template_dir: str = Field(
        default=path.join(package.src_dir, "templates"),
        description="Directory containing templates"
        )
    userdoc_url: str = Field(
        default = doc_path.default + "/interface.html", #type: ignore
        description="Endpoint URL for the user's HTML documentation"
        )

    class Config:
        env_prefix = f"{package.name}_"
        extra = 'ignore'


ncpu = cpu_count()


class EngineSettings(BaseSettings):
    thread_count: int = Field(
        short='t',
        default = ncpu // 2 if ncpu is not None else 4,
        ge=1,
        le=1024,
        description="Number of engine threads"
        )

    class Config:
        env_prefix = f"{package.name}_"
        extra = 'ignore'


class CacheSettings(BaseSettings):
    cache_dir: str = Field(
        default=package.cache_dir,
        description="Image cache directory"
        )
    clear_cache: bool = Field(
        short='C',
        default=False,
        description="Clear image cache on startup"
        )
    max_cache_image_count: int = Field(
        default=100,
        ge=1,
        description="Maximum number of images in disk cache"
        )
    max_cache_tile_count: int = Field(
        default=1000,
        ge=1,
        description="Maximum number of image tiles in memory cache"
        )
    max_open_files: int = Field(
        default=10000,
        ge=100,
        le=1000000,
        description="Maximum number of open files"
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
    image = ImageSettings()
    server = ServerSettings()
    engine = EngineSettings()
    cache = CacheSettings()


