#! /usr/bin/python
import uvicorn

def start_server(app="src.visiomatic3.server.app:app", host="localhost", port=8009, root_path=""):
    uvicorn.run(app, host=host, port=port, root_path=root_path, reload=True)

if __name__ == "__main__":
    import argparse

    from visiomatic3 import defs

    print(f"{defs.package_str} v{defs.package_version}")

    parser = argparse.ArgumentParser(description=defs.package_description)

    parser.add_argument("-H", "--host", type=str, default="localhost", help="host name or IP address (default=localhost)")
    parser.add_argument("-p", "--port", type=int, default=8008, help="port (default=8008)")
    parser.add_argument("-r", "--root_path", type=str, default="", help="ASGI root_path")

    args = vars(parser.parse_args())

    start_server(host=args["host"], port=args["port"], root_path=args["root_path"])
