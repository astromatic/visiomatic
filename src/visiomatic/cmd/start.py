#! /usr/bin/python3
"""
Start script (renamed as :program:`visiomatic`).
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence
from glob import glob
from os import makedirs, path, remove
from sys import exit
from time import sleep
import webbrowser

from uvicorn import run, server, supervisors

from visiomatic import package
from visiomatic.server import config

if package.isonlinux:
    from resource import getrlimit, setrlimit, RLIMIT_NOFILE

def start_server(
        app: str="visiomatic.server.app:create_app",
        host: str="localhost",
        port: int=8009,
        root_path: str="",
        workers: int=4,
        access_log: bool=False,
        reload: bool=True
    ):
    """
    Start the Uvicorn server in application factory mode.
    
    Parameters
    ----------
    app: str, optional
        Name of the ASGI app callable.
    host: str, optional
        Host name or IP address.
    port: int, optional
        Port.
    root_path: str | ~pathlib.Path, optional
        ASGI root_path.
    workers: int, optional
        Number of workers.
    access_log: bool, optional
        Display access log.
    reload: bool, optional
        Enable auto-reload (turns off multiple workers).
    """
    run(
        app,
        host=host,
        port=port,
        root_path=root_path,
        access_log=access_log,
        workers=workers,
        reload=reload,
        factory=True
    )
    return

def main() -> int:
    """
    Set up configuration and start the VisiOmatic server.
    """
    # Set up settings by instantiating a configuration object
    conf = config.Config()
    config.settings = conf.flat_dict()
    config.image_filename = conf.image_filename

    # Set maximum number of descriptors (only possible on Linux and BSD)
    if package.isonlinux:
        max_open_files = config.settings["max_open_files"]
        setrlimit(RLIMIT_NOFILE, (max_open_files, max_open_files))

    # Cache management
    cache_dir = config.settings["cache_dir"]
    # Create cache dir if it does not exist
    makedirs(cache_dir, exist_ok=True)
    # Clear cache if requested
    if config.settings["clear_cache"]:
        files = glob(path.join(cache_dir, '*.pkl')) \
            + glob(path.join(cache_dir, '*.np'))
        for file in files:
            remove(file)

    # Local use case
    if config.image_filename and not config.settings["no_browser"]:
        # Monkey-patch Uvicorn calls to start the browser AFTER the server
        link =  f"http://{config.settings['host']}:{config.settings['port']}"
        def startup_with_browser(self, *args, **kwargs) -> None:
            self.original_startup(*args, **kwargs)
            self.should_exit.wait(1)
            webbrowser.open(link)

        async def async_startup_with_browser(self, *args, **kwargs) -> None:
            await self.original_startup(*args, **kwargs)
            webbrowser.open(link)

        for Supervisor in [
            supervisors.BaseReload,
            supervisors.Multiprocess
        ]:
            Supervisor.original_startup = Supervisor.startup
            Supervisor.startup = startup_with_browser

        server.Server.original_startup = server.Server.startup
        server.Server.startup = async_startup_with_browser
   
    # Force number of workers to be 1 if not on Linux (because of missing libs)
    if not package.isonlinux \
        and config.settings["workers"] > 1 and not config.settings["reload"]:
        config.settings["workers"] = 1

    # Start the server
    start_server(
        host=config.settings["host"],
        port=config.settings["port"],
        root_path=config.settings["root_path"],
        access_log=config.settings["access_log"],
        reload=config.settings["reload"],
        workers=config.settings["workers"]
    )
    return 0

if __name__ == "__main__":
    exit(main())

