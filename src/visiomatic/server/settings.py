"""
Configuration settings for the application.
"""
# Copyright UParisSaclay/CEA/CFHT/CNRS
# Licensed under the MIT licence

from __future__ import annotations

from os import cpu_count, path
from typing import Any, Tuple

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


from .. import package

def SField(short: str | None = None, **kwargs) -> Any:
     return Field(**kwargs, json_schema_extra={'short': short})

class HostSettings(BaseSettings):
    host: str = SField(
        short='H',
        default="localhost",
        description="Host name or IP address"
        )
    port: int = SField(
        short='p',
        default=8009,
        ge=1,
        le=65535,
        description="Port"
        )
    root_path: str = SField(
        short='R',
        default="",
        description="ASGI root_path"
        )
    access_log: bool = SField(
        short='a',
        default=False,
        description="Display access log"
        )
    reload: bool = SField(
        short='r',
        default=False,
        description="Enable auto-reload (turns off multiple workers)"
        )
    workers: int = SField(
        short='w',
        default=4 if package.isonlinux else 1,
        ge=1,
        description="Number of workers"
        )

    class Config:
        env_prefix = f"{package.name}_"
        extra = 'ignore'


class ImageSettings(BaseSettings):
    brightness: float = SField(
        default=0.,
        ge=-100.,
        le=100.,
        description="Default image brightness"
        )
    contrast: float = SField(
        default=1.,
        ge=0.,
        le=100.,
        description="Default image contrast"
        )
    color_saturation: float = SField(
        default=1.5,
        ge=0.,
        le=5.,
        description="Default color saturation"
        )
    gamma: float = SField(
        default=2.2,
        ge=0.2,
        le=5.,
        description="Default image gamma"
        )
    quality: int = SField(
        default=95,
        ge=1,
        le=100,
        description="Default image compression quality in %%"
        )
    tile_size: Tuple[int, int] = SField(
        default=(256, 256),
        ge=(1, 1),
        le=(4096, 4096),
        description="Tile size"
        )

    class Config:
        env_prefix = f"{package.name}_"
        extra = 'ignore'


class ServerSettings(BaseSettings):
    api_path : str = SField(
        default="/api",
        description="Endpoint URL for the webservice API"
        )
    banner_template: str = SField(
        default="banner.html",
        description="Name of the HTML template file for the service banner"
        )
    base_template: str = SField(
        default="base.html",
        description="Name of the HTML template file for the web client"
        )
    client_dir: str = SField(
        default=path.join(package.src_dir, "client"),
        description="Directory containing the web client code, style and media"
        )
    data_dir: str = SField(
        default=".",
        description="Data root directory"
        )
    doc_dir: str = SField(
        default=path.join(package.root_dir, "doc/html"),
        description="HTML documentation root directory (after build)"
        )
    doc_path: str = SField(
        default="/manual",
        description="Endpoint URL for the root of the HTML documentation"
        )
    extra_dir: str = SField(
        default=".",
        description="Extra data root directory"
        )
    no_browser: bool = SField(
        short='n',
        default=False,
        description="Do not start browser when providing image file"
        )
    template_dir: str = SField(
        default=path.join(package.src_dir, "templates"),
        description="Directory containing templates"
        )
    userdoc_url: str = SField(
        default = doc_path.default + "/interface.html", #type: ignore
        description="Endpoint URL for the user's HTML documentation"
        )

    class Config:
        env_prefix = f"{package.name}_"
        extra = 'ignore'


ncpu = cpu_count()


class EngineSettings(BaseSettings):
    thread_count: int = SField(
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
    cache_dir: str = SField(
        default=package.cache_dir,
        description="Image cache directory"
        )
    clear_cache: bool = SField(
        short='C',
        default=False,
        description="Clear image cache on startup"
        )
    max_cache_image_count: int = SField(
        default=100,
        ge=1,
        description="Maximum number of images in disk cache"
        )
    max_cache_tile_count: int = SField(
        default=1000,
        ge=1,
        description="Maximum number of image tiles in memory cache"
        )
    max_open_files: int = SField(
        default=10000,
        ge=100,
        le=1000000,
        description="Maximum number of open files"
        )
    ultradict_cache_file : str = SField(
        default="/dev/shm/visiomatic_cache_dict.pkl",
        description="Name of the pickled cache dictionary shared across processes"
        )

    class Config:
        env_prefix = f"{package.name}_"
        extra = 'ignore'


class AppSettings(BaseSettings):
    host: BaseSettings = HostSettings()
    image: BaseSettings = ImageSettings()
    server: BaseSettings = ServerSettings()
    engine: BaseSettings = EngineSettings()
    cache: BaseSettings = CacheSettings()


