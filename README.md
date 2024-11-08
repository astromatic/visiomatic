# ![VisiOmatic logo](https://raw.githubusercontent.com/astromatic/visiomatic/refs/heads/main/src/visiomatic/client/images/visiomatic.png) VisiOmatic 3

[![Documentation](https://github.com/astromatic/visiomatic/actions/workflows/doc.yml/badge.svg)](https://github.com/astromatic/visiomatic/actions/workflows/doc.yml)[![Tests](https://github.com/astromatic/visiomatic/actions/workflows/tests.yml/badge.svg)](https://github.com/astromatic/visiomatic/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/astromatic/visiomatic/graph/badge.svg?token=DodRbYmlWZ)](https://codecov.io/gh/astromatic/visiomatic)
[![PyPI](https://img.shields.io/pypi/v/PACKAGE?label=pypi%20visiomatic)](https://pypi.org/project/VisiOmatic/)[![PyPI - Downloads](https://img.shields.io/pypi/dm/PACKAGE)](https://pypi.org/project/VisiOmatic/)

VisiOmatic is a web application for visualizing astronomical images. This is the version 3 of the package. Code from the older versions can still be accessed through the [``legacy``](https://github.com/astromatic/visiomatic/tree/legacy) branch.

## Installation

You can install Visiomatic via pip:

```bash
pip install visiomatic
```

## Usage

```bash
visiomatic image.fits
```

## Documentation

A detailed documentation, including API reference is available [here](https://astromatic.github.io/visiomatic). Note: this is still work in progress.

## Technical overview

The VisiOmatic package provides a complete remote visualization system for large multispectral/hyperspectral astronomical image data (or image sequences). The web client interface runs in standard web browsers, generating image requests to a server on behalf of the user. These HTTP requests are processed in real-time by the server, through a web API, to compute and deliver compressed images which are then updated almost immediately in the browser.

### Web client
The VisiOmatic web client is built on top of the Leaflet Javascript mini-framework (e.g., MapBox, OpenStreetMap, ...). The VisiOmatic web client interface is fully asynchronous, and is particularly immune to connection glitches. It is embeddable in regular Web pages, blog posts, portals, or wiki entries, and is fully templatable. It is compatible with touchscreen interfaces such as those offered by iOS and Android mobile devices. The position and appearance of widgets is fully customizable through module options and Cascading Style Sheets. The graphic engine relies purely on Javascript and HTML5 and not on proprietary technology. It is fully compatible with the current breed of popular web browsers, including Mozilla Firefox (v94 and above), Google Chrome (v95 and above), Apple Safari (v15 and above), Microsoft Edge (v95 an above) and Opera (v80 and above).

### Web server

The VisiOmatic web server version 3 is written in the Python language. It replaces the IIPImage-astro FCGI (Fast Common Gateway Interface) C++ code of earlier VisiOmatic versions. It operates as a web-service that encodes and streams in real-time large high resolution images which are delivered in the form of compressed "tiles". It is designed to be fast and bandwidth-efficient.

Compared to other existing solutions, VisiOmatic has the advantage of providing on-the-fly compression to image formats natively supported in web browsers, as well as access to uncompressed pixel data. This means that it can operate directly on science-grade multichannel data stored in floating-point format, and perform operations such as rescaling or channel-mixing before sending out the resulting image to the client. Contrary to other solutions dealing with multispectral data, all the image processing and compositing is done server-side. This dramatically decreases the quantity of information that has to be sent to the browser, and the amount of computing which must be performed client-side, making the exploration of large datacubes from a smartphone a comfortable experience, even through a 4G connection.

## Data management

Previous versions of VisiOmatic would require the original image data files to be converted to a tiled multi-resolution TIFF format. The new version works directly on FITS images, including data cubes and MEF files, and performs image tiling and rebinning on-the-fly.

Vector data are stored in GeoJSON format. GeoJSON offers a compact, yet human-friendly representation of features such as markers, lines, polygons, and can easily be generated from e.g., CSV or ds9 region files.

## Security

Data security is a major issue for online services. In VisiOmatic, two mechanisms allow the webmaster to control the dissemination of data:

* Paths where the data files are located are not accessible from the web; they are only accessible by the server code, and absolute or relative access through upper levels of the directory tree is forbidden.
* The same origin security policy in web browsers restricts data access to servers located in the same domain as the server hosting the client code, and prevents Javascript applications on websites from other domains sending AJAX requests directly to the VisiOmatic server.

If however data sharing with other domains is a desired feature, VisiOmatic implements the CORS mechanism to allow such requests from selected or all external websites.

## Performance

Although Python is not the fastest language for manipulating data, VisiOmatic is fairly efficient. Current server code is able to serve thousands of 256×256 JPEG tiles per second per CPU core. The output image stream from a single 16-core server under heavy load (tens of thousands of tile requests per second) can thus easily saturate a 1 Gbit/s connection without caching.

## Portability

The server has been tested on the Linux, MacOS and Windows platforms. Note that presently only the Linux version can take advantage of multiple CPU cores, due to limitations with Python wrappers to low-level system libraries.

## License

Visiomatic is licensed under the [MIT License](https://raw.githubusercontent.com/astromatic/visiomatic/develop/LICENSE).
