#! /usr/bin/python
import uvicorn

def start_server(app="src.visiomatic.server.app:app", host="localhost", port=8009, root_path="", workers=4, access_log=False):
    uvicorn.run(app, host=host, port=port, root_path=root_path, access_log=access_log, workers=workers, reload=True)

if __name__ == "__main__":
    import argparse

    from visiomatic import defs

    print(f"{defs.package_str} v{defs.package_version}")

    parser = argparse.ArgumentParser(description=defs.package_description)

    parser.add_argument("-H", "--host", type=str, default="localhost", help="host name or IP address (default=localhost)")
    parser.add_argument("-a", "--access_log", action='store_true', default=False, help="display access log")
    parser.add_argument("-p", "--port", type=int, default=8009, help="port (default=8009)")
    parser.add_argument("-r", "--root_path", type=str, default="", help="ASGI root_path")
    parser.add_argument("-w", "--workers", type=int, default=4, help="number of workers")

    args = vars(parser.parse_args())
    print(args["access_log"])
    start_server(
        host=args["host"],
        port=args["port"],
        root_path=args["root_path"],
        access_log=args["access_log"],
        workers=args["workers"]
    )
