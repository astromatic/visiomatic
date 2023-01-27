.. File overview.rst

.. include:: global.rst

==================
Technical overview
==================

The |VisiOmatic|_ package provides a complete remote visualization system for large multiband astronomical image data. The web client interface runs in standard web browsers, generating image requests to a server on behalf of the user. These `HTTP <http://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol>`_ requests are processed in real-time by the server, through a `web API <https://en.wikipedia.org/wiki/Web_API>`_, to compute and deliver compressed images which are then updated almost immediately in the browser.

Web client
==========

The |VisiOmatic| web client :cite:`2015A&C....10...43B,2019ASPC..521..651B` is built on top of the |Leaflet|_ Javascript mini-framework (e.g., `MapBox <http://www.mapbox.com/>`_, `OpenStreetMap <http://www.openstreetmap.org>`_, ...).
The |VisiOmatic| client interface is fully asynchronous, and is particularly immune to connection glitches. It is embeddable in regular Web pages, blog posts, portals, or wiki entries. It is compatible with touchscreen interfaces such as those offered by iOS and Android mobile devices. The position and appearance of widgets is fully customizable through module options and `Cascading Style Sheets <http://en.wikipedia.org/wiki/Cascading_Style_Sheets>`_. The graphic engine relies purely on `Javascript <http://en.wikipedia.org/wiki/JavaScript>`_ and `HTML5 <http://en.wikipedia.org/wiki/HTML5>`_ and not on proprietary technology. It is fully compatible with the current breed of popular web browsers, including `Mozilla Firefox <http://www.mozilla.org/en-US/firefox>`_ (v94 and above), `Google Chrome <http://www.google.com/chrome>`_ (v95 and above), `Apple Safari <http://www.apple.com/safari>`_ (v15 and above), `Microsoft Edge <http://www.microsoft.com/en-us/windows/microsoft-edge>`_ (v95 an above) and `Opera <http://www.opera.com>`_ (v80 and above). 

Web server
==========

The new |VisiOmatic| web server is written in the Python language. It replaces the |IIPImage-Astro|_ `FCGI (Fast Common Gateway Interface) <http://www.fastcgi.com>`_ C++ code of earlier |VisiOmatic| versions :cite:`Pitzalis2006,Bertin2015`.
It operates as a `web-service <http://en.wikipedia.org/wiki/Web_service>`_ that encodes and streams in real-time large high resolution images which are delivered in the form of compressed "tiles".
It is designed to be fast and bandwidth-efficient.

Compared to other existing solutions, |VisiOmatic| has the advantage of providing on-the-fly compression to image formats natively supported in web browsers, as well as access to uncompressed pixel data.
This means that it can operate directly on science-grade multispectral data stored in floating-point format, and perform operations such as rescaling or channel-mixing before sending out the resulting image to the client.
Contrary to other solutions dealing with `multispectral <http://en.wikipedia.org/wiki/Multispectral_image>`_ data, most of the image processing and compositing is done server-side.
This dramatically decreases the quantity of information that has to be sent to the browser, and the amount of computing which must be performed client-side, making the exploration of large datacubes from a smartphone a comfortable experience, even through a 4G connection.

Data management
---------------

Previous versions of |VisiOmatic| would require the original image data files to be converted to a tiled multi-resolution `TIFF <https://iipimage.sourceforge.io/documentation/images/#TIFF>`_ format.
The new version works directly on FITS images, and performs image tiling and rebinning on-the-fly.

Vector data are stored in `GeoJSON <http://geojson.org/>`_ format. GeoJSON offers a compact, yet human-friendly representation of features such as markers, lines, polygons, and can easily be generated from e.g., `CSV <http://en.wikipedia.org/wiki/Comma-separated_values>`_ or `ds9 <http://ds9.si.edu>`_ region files.  

Security
--------

Data security is a major issue for online services. In |VisiOmatic|, two mechanisms allow the webmaster to control the dissemination of data:

* Paths where the data files are located are not accessible from the web; they are only accessible by the server code, and absolute or relative access through upper levels of the directory tree is forbidden.
* The `same origin security policy <http://en.wikipedia.org/wiki/Same-origin_policy>`_ in web browsers restricts data access to servers located in the same domain as the server hosting the client code, and prevents Javascript applications on websites from other domains sending `AJAX <http://en.wikipedia.org/wiki/Ajax_%28programming%29>`_ requests directly to the |VisiOmatic| server.

If however data sharing with other domains is a desired feature, |VisiOmatic| implements the `CORS <http://en.wikipedia.org/wiki/Cross-origin_resource_sharing>`_ mechanism to allow such requests from selected or all external websites.

Performance
-----------

Although Python is not the fastest language for manipulating data, |VisiOmatic| is fairly efficient. Current server code is able to serve thousands of 256×256 JPEG tiles per second per CPU core.
The output image stream from a single 16-core server under heavy load (tens of thousands of tile requests per second) can thus easily saturate a 1 Gbit/s connection *without caching*.

