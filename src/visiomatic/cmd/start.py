#! /usr/bin/python
"""
Start script (renamed as :program:`visiomatic`).
"""
# Copyright CFHT/CNRS/SorbonneU
# Licensed under the MIT licence
import glob, os, pickle, sys, time, webbrowser

import uvicorn

from visiomatic import package
from visiomatic.server import config


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
    uvicorn.run(
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

    cache_dir = config.settings["cache_dir"]

    # Create cache dir if it does not exist
    os.makedirs(cache_dir, exist_ok=True)

    # Clear cache if requested
    if config.settings["clear_cache"]:
        files = glob.glob(os.path.join(cache_dir, '*.pkl')) \
            + glob.glob(os.path.join(cache_dir, '*.np'))
        for file in files:
            os.remove(file)

    # Local use case
    if config.image_filename and not config.settings["no_browser"]:
        # Monkey-patch Uvicorn calls to start the browser AFTER the server
        def startup_with_browser(self) -> None:
             self.original_startup()
             self.should_exit.wait(1)
             webbrowser.open(
                f"{config.settings['host']}:{config.settings['port']}"
             )

        for Supervisor in [
            uvicorn.supervisors.Multiprocess,
            uvicorn.supervisors.BaseReload
        ]:
            Supervisor.original_startup = Supervisor.startup
            Supervisor.startup = startup_with_browser

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
    sys.exit(main())

