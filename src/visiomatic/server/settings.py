"""
Server settings.
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence

from pathlib import Path
from argparse import ArgumentParser
import configparser

from pydantic import (
    BaseSettings,
    Field,
    IPvAnyAddress
)

from .. import package



class HostSettings(BaseSettings):
    host: IPvAnyAddress = Field(
        short="H",
        default="localhost",
        title="Host name or IP address"
        )
    port: int = Field(
        short="p",
        default=8009,
        ge=1,
        le=65535,
        title="Port"
        )
    root_path: str = Field(
        short="R",
        default="",
        title="ASGI root_path"
        )
    access_log: bool = Field(
        short="a",
        default=False,
        title="Display access log"
        )
    reload: bool = Field(
        short="r",
        default=False,
        title="Enable auto-reload (turns off multiple workers)"
        )
    workers: int = Field(
        short="w",
        default=4,
        ge=1,
        title="Number of workers"
        )

    class Config:
        env_prefix = f"{package.name}_"
        extra = 'ignore'


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

    class Config:
        env_prefix = f"{package.name}_"
        extra = 'ignore'


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

    class Config:
        env_prefix = f"{package.name}_"
        extra = 'ignore'


class AppSettings(BaseSettings):
    host = HostSettings()
    server = ServerSettings()
    cache = CacheSettings()

    class Config:
        env_prefix = f"{package.name}_"
        extra = 'ignore'


class Settings(object):
    def __init__(self):

        self.settings = AppSettings()
        self.groups = tuple(self.settings.dict().keys())

        # Parse command line
        parser = ArgumentParser(description=package.description)
        parser.add_argument(
            "-c", "--config",
            type=str, default="config/visiomatic.conf",
            help="Name of the VisiOmatic configuration file", 
            metavar="FILE"
        )
        args_settings_dict = self.parse_args(parser)
        self.update_from_dict(args_settings_dict) 
        # Parse config file
        config_settings = self.parse_config(args_settings_dict['config'])


    def parse_args(self, parser) -> dict:
        for group in self.groups:
            arg_group = parser.add_argument_group(group.title())
            settings = getattr(self.settings, group).schema()['properties']
            for setting in settings:
                props = settings.get(setting)
                arg = ["-" + props['short'], "--" + setting] \
                    if props.get('short') else ["--" + setting]
                if props['type']=='boolean':
                    arg_group.add_argument(
                        *arg,
                        default=props['default'],
                        help=props['title'], 
                        action='store_true'
                    )
                else:
                    arg_group.add_argument(
                        *arg,
                        type=str,
                        default=props['default'],
                        help=f"{props['title']} (default={props['default']})"
                    )  
        return vars(parser.parse_args())


    def parse_config(self, filename) -> dict:
        pass


    def update_from_dict(self, settings_dict) -> None:
        for group in self.groups:
            settings = getattr(self.settings, group)
            settings = settings.parse_obj(settings_dict)

