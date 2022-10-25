#! /usr/bin/python
import uvicorn

def start_server(
        app="src.visiomatic.server.app:app",
        host="localhost",
        port=8009,
        root_path="",
        workers=4,
        access_log=False,
        reload=True
    ):
    uvicorn.run(
        app,
        host=host,
        port=port,
        root_path=root_path,
        access_log=access_log,
        workers=workers,
        reload=reload
    )
    return

if __name__ == "__main__":
    import argparse

    from visiomatic import defs

    print(f"{defs.package_str} v{defs.package_version}")

    parser = argparse.ArgumentParser(description=defs.package_description)

    parser.add_argument(
        "-H", "--host",
        type=str, default="localhost",
        help="Host name or IP address (default=localhost)"
    )
    parser.add_argument(
        "-p", "--port",
        type=int, default=8009,
        help="Port (default=8009)"
    )
    parser.add_argument(
        "-R", "--root_path",
        type=str, default="",
        help="ASGI root_path"
    )
    parser.add_argument(
        "-a", "--access_log",
        action='store_true', default=False,
        help="Display access log"
    )
    parser.add_argument(
        "-r", "--reload",
        action='store_true', default=False,
        help="Enable auto-reload (turns off multiple workers)"
    )
    parser.add_argument(
        "-w", "--workers",
        type=int, default=4,
        help="Number of workers"
    )

    args = vars(parser.parse_args())
    print(args["access_log"])
    start_server(
        host=args["host"],
        port=args["port"],
        root_path=args["root_path"],
        access_log=args["access_log"],
        reload=args["reload"],
        workers=args["workers"]
    )

