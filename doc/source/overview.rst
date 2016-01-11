==================
Technical overview
==================

|VisiOmatic|_ and |IIPImage-Astro|_ form a complete remote visualization system for large multiband astronomical image data. The |VisiOmatic| client interface runs in standard web browsers, generating image requests to a server on behalf of the user. These `HTTP <http://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol>`_ requests are processed in real-time by the |IIPImage-Astro| server to compute and deliver `JPEG <http://en.wikipedia.org/wiki/JPEG>`_-compressed images which are then updated almost immediately in the interface.

Client Side: |VisiOmatic|
=========================

The |VisiOmatic|_ web client interface :cite:`Bertin2015` is built on top of the |Leaflet|_ Javascript mini-framework (e.g., `MapBox <http://www.mapbox.com/>`_, `OpenStreetMap <http://www.openstreetmap.org>`_, ...).
The |VisiOmatic| interface is fully asynchronous, and is particularly immune to connection glitches. It is embeddable in regular Web pages, blog posts, portals, or wiki entries. It is compatible with touchscreen interfaces such as those offered by iOS and Android mobile devices. The position and appearance of widgets is fully customizable through module options and `Cascading Style Sheets <http://en.wikipedia.org/wiki/Cascading_Style_Sheets>`_. The graphic engine relies purely on `Javascript <http://en.wikipedia.org/wiki/JavaScript>`_ and `HTML5 <http://en.wikipedia.org/wiki/HTML5>`_ and not on proprietary technology such as `Adobe Flash <http://www.adobe.com/products/flashplayer.html>`_ or `Microsoft Silverlight <http://www.microsoft.com/silverlight>`_. It is fully compatible with the current breed of popular web browsers, including `Mozilla Firefox <http://www.mozilla.org/en-US/firefox>`_ (v4.0 and above), `Google Chrome <http://www.google.com/chrome>`_ (v10.0 and above), `Apple Safari <http://www.apple.com/safari>`_ (v5.1 and above), `Microsoft Edge <http://www.microsoft.com/en-us/windows/microsoft-edge>`_ (v20.10240 an above) and `Opera <http://www.opera.com>`_ (v10.5 and above). 

Server-side: |iipsrv|
=====================

The |IIPImage-Astro|_ server software consists of a modified version of the open-source |IIPImage|_ package :cite:`Pitzalis2006,Bertin2015`, an `FCGI (Fast Common Gateway Interface) <http://www.fastcgi.com>`_ application written in C++. |IIPImage| operates as a `web-service <http://en.wikipedia.org/wiki/Web_service>`_ that encodes and streams in real-time large high resolution images which are delivered in the form of compressed "tiles". It is designed to be fast and bandwidth-efficient with low processor and memory requirements. It is licensed under `version 3 of the GNU General Public License <http://www.gnu.org/licenses/gpl-3.0.en.html>`_.

Compared to other existing solutions, |IIPImage| has the enormous advantage of  providing on-the-fly JPEG compression as well as access to uncompressed pixel  data. This means that it can operate directly on science-grade multispectral data stored in floating-point format, and perform operations such as rescaling or filtering before sending out the resulting image to the client. Also, contrary to other solutions dealing with `multispectral <http://en.wikipedia.org/wiki/Multispectral_image>`_ data, most of the image processing and compositing is done server-side. This dramatically decreases the quantity of information that has to be sent to the browser, and the amount of computing which must be performed client-side, making the exploration of large datacubes from a smartphone a comfortable experience, even through a 3G connection.

Data management
---------------

All the data for a given image data cube are stored in a single, huge `BigTIFF <http://bigtiff.org/>`_ file. The initial conversion from the `FITS astronomical image format <http://fits.gsfc.nasa.gov/>`_ to BigTIFF is handled by the |STIFF|_ software :cite:`Bertin2012`. On modern hardware, the current |STIFF| conversion rate for transcoding a FITS file to an |IIPImage|-ready tiled pyramidal BigTIFF ranges from about 5Mpixel/s to 25Mpixel/s (20-100MB/s) depending on the chosen TIFF compression scheme and system I/O performance. Hence in principle FITS frames with dimensions of up to 16k×16k can be converted in a matter of seconds, and just-in-time conversion could be a viable option for such images. 

Vector data are stored in `GeoJSON <http://geojson.org/>`_ format. GeoJSON offers a compact, yet human-friendly representation of features such as markers, lines, polygons, and can easily be generated from e.g., `CSV <http://en.wikipedia.org/wiki/Comma-separated_values>`_ or `ds9 <http://ds9.si.edu>`_ region files.  

Security
--------

Data security is a major issue for online services. In |IIPImage|, three mechanisms allow the webmaster to control the dissemination of data:

* Paths where the data files are located are not accessible from the web; they are only accessible by the FCGI application on the server, and absolute or relative access through upper levels of the directory tree is forbidden.
* The `same origin security policy <http://en.wikipedia.org/wiki/Same-origin_policy>`_ in web browsers restricts data access to servers located in the same domain as the server hosting the client code, and prevents Javascript applications on websites from other domains sending `AJAX <http://en.wikipedia.org/wiki/Ajax_%28programming%29>`_ requests directly to the |IIPImage| server. If however data sharing with other domains is a desired feature, |IIPImage| implements the `CORS <http://en.wikipedia.org/wiki/Cross-origin_resource_sharing>`_ mechanism to allow such requests from selected or all external websites.
* As other tile-based image servers, |IIPImage| itself would not prevent a user to download a complete high resolution JPEG image through small pieces, using a dedicated script. If this is an issue, |IIPImage| offers a configurable on-the-fly, randomized `digital watermarking <https://en.wikipedia.org/wiki/Digital_watermarking>`_ feature.

Performance
-----------

|IIPImage| is known for being particularly efficient. Since 2013 a significant amount of work has gone into optimizing further the C++ server code, by streamlining the processing of vectorized floating-point data and improving I/O performance with Terabyte-sized datasets :cite:`Bertin2015`.  Current server code is able to serve from about 50 to 500 256×256 JPEG tiles per second per CPU core (2.5GHz). The output image stream from a single 16-core server under heavy load (tens of thousands of tile requests per second) is thus capable of saturating a 1 Gbit/s connection.

Provided that the client interface restricts the number of operations possible with the data, caching image tiles is an efficient way of increasing the throughput of the system. In addition to the caching of image tiles done client-side in the browser, |IIPImage| offers two explicit levels of tile caches server-side:

* In memory, integrated within the application
* Distributed, thanks to the `MemCached <http://memcached.org>`_ caching system.
 
.. include:: refs.rst

