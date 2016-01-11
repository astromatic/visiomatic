=====================================
|VisiOmatic| set-up and customization
=====================================

Let us now describe the HTML and JavaScript code that make up a typical |VisiOmatic|-based web client. We will assume that the |IIPImage-Astro| FCGI is already up and ready to serve pixel data on the server (see :ref:`server_installation`).

The |VisiOmatic|_ web client :cite:`Bertin2015` works essentially as a large |Leaflet|_ plug-in, providing subproperties to the original |Leaflet| "classes" with new or overloaded methods. The whole client fits in a single HTML file. The relevant part of the HTML file begins with the inclusion of the |Leaflet|, |jqPlot|_, |Spectrum|_ and |VisiOmatic|  Cascading Style Sheets in the HTML header:

.. code-block:: html

  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset='utf-8' name='viewport' content='width=device-width,
          initial-scale=1.0, maximum-scale=1.0, user-scalable=no'>
    <link rel='stylesheet' href='visiomatic/dist/jqplot.css' />
    <link rel='stylesheet' href='visiomatic/dist/spectrum.css' />
    <link rel='stylesheet' href='Leaflet/dist/leaflet.css' />
    <link rel='stylesheet' href='visiomatic/dist/visiomatic.css' />

The Leaflet map itself may be styled (background color, dimensions):

.. code-block:: html

    <style type='text/css'>
      body {padding: 0; margin: 0; }
      html,body,#map { width: 100%; height: 100%; }
    </style>

The following Javascript library files must be included: |JQuery|_ (V2.1.4+),
|jqPlot|_ (V1.0.8+), |Spectrum|_ (V1.7.1+), |Leaflet|_ (V1.0) and VisiOmatic
(V2.0+). Custom `Catalog objects <catalogs>`_ may be included too.

.. code-block:: html

    <script src='visiomatic/dist/jquery-min.js'></script>
    <script src='visiomatic/dist/jqplot-min.js'></script>
    <script src='visiomatic/dist/spectrum-min.js'></script>
    <script src='Leaflet/dist/leaflet.js'></script>
    <script src='visiomatic/dist/visiomatic.js'></script>
    <script src='catalogs.custom.js'></script>
  </head>

The whole |Leaflet|/|VisiOmatic| interface, including advanced menus, fits in a
``<div>`` HTML element. The element can be styled to occupy the whole HTML body
(as in this dedicated viewer example), or a smaller section of an existing
web page. There can be several independent viewing areas ("maps") per web page;
each of them must have a different ``id`` attribute. The map below is given a
black background.

.. code-block:: html

  <body>
    <div id='map' style='background:black'></div>

Next comes the JavaScript code. The first thing it does is to capture the URL of
the web page. The |L.IIPUtils.parseURL()| utility function (see
:ref:`description in next chapter <parseURL>`) parses it to generate a
dictionary of `query string <http://en.wikipedia.org/wiki/Query_string>`_
keyword/value pairs that we will use to modify specific viewer settings:

.. code-block:: javascript

    <script>
      var args =  L.IIPUtils.parseURL(window.location.search.substring(1));

For instance, if the current webpage URL is ``http://myviewer.org?foo=ok&bar=1``,
``args['foo']`` will contain ``'ok'`` and ``args['bar']`` will contain ``'1'``.

The |L.map()|_ command initializes the
map inside the HTML element that carries the given ``id`` (``'map'`` in this
example):

.. code-block:: javascript

      var map = L.map('map', {fullscreenControl: true, zoom: 5});

Note the ``fullscreenControl`` option (``false`` by default) that adds a
Full-Screen switch to the regular |Leaflet| interface.

The heart of the viewer code is the instantiation and initialization of the
image layer with |L.tileLayer.iip()| (see :ref:`next chapter <tilelayer_iip_instantiation>`). |L.tileLayer.iip()| accepts a query
string comprised of the FastCGI URL and the name of the data file, plus a set
of options:

.. code-block:: javascript

      var iip = '/fcgi-bin/iipsrv.fcgi?FIF=cfhtls_d1.ptif',
          layer = L.tileLayer.iip(iip, {
        center: args['center'] ? args['center'] : false,
        fov: args['fov'] ? parseFloat(args['fov']) : false,
        mixingMode: args['mode'] ? args['mode'] : 'color',
        defaultChannel: args['channel'] ?
          parseInt(args['channel'], 10) : 2,
        contrast: 0.7,
        gamma: 2.8,
        colorSat: 2.0,
        channelColors: [[0,0,1],[0,1,1],[0,1,0],[1,1,0],[1,0,0]],
        channelLabels: [
          'u band',
          'g band',
          'r band',
          'i band',
          'z band'
        ],
      }).addTo(map);

The example above illustrates some options including

* using query arguments in the URL of the present web page to set the initial center coordinates, zoom level, mixing mode and monochromatic channel index for the viewer,
* changing the default image contrast, gamma factor and color saturation,
* applying colors to the different channels (``channelColors``),
* labeling every image channel (``channelLabels``).

The rest of the code instantiates controls that will help the user interact with
the data. First of all, a map scale in angular units (pixel units are turned
off), a central reticle, and the coordinate input/output widget are set up:

.. code-block:: javascript

      L.control.scale.wcs({pixels: false}).addTo(map);
      L.control.reticle().addTo(map);

      var wcsControl = L.control.wcs({
        coordinates: [{label: 'RA,Dec', units: 'HMS'}],
        position: 'topright'
      }).addTo(map);

Next a "navigation map" is added, using |L.control.extraMap()|. The
navigation map is synchronized with the main map. The tile layer object in the
navigation map must be distinct from that of the main map, even if it deals with
the same data-cube, as here. For displaying the navigation layer we
select only channels #2,#3 and #4:

.. code-block:: javascript

      var navlayer = L.tileLayer.iip(iip, {
        channelColors: [,[0,0,1],[0,1,0],[1,0,0],],
      });

      var navmap = L.control.extraMap(navlayer, {
        position: 'topright',
        width: 128,
        height: 128,
        zoomLevelOffset: -6,
        nativeCelsys: true,
      }).addTo(map);

We now initialize a side-bar that will regroup all advanced controls, and set
up the channel mixing controls and the image settings controls:

.. code-block:: javascript

      var sidebar = L.control.sidebar().addTo(map);

      L.control.iip.channel().addTo(sidebar);
      L.control.iip.image().addTo(sidebar);

The |L.control.iip.catalog()| command adds a catalogue overlay selection menu to
the interface. The list of catalogues below is comprised of the 2MASS
:cite:`Cutri2003`, SDSS :cite:`2009ApJS..182..543A`,
and Hudelot et al. :cite:`2012yCat.2317....0H` catalogues (the latter is defined in
|catalogs.custom.js|):

.. code-block:: javascript

      L.control.iip.catalog([
        L.Catalog['2MASS'],
        L.Catalog['SDSS'],
        L.Catalog['Hudelot']
      ]).addTo(sidebar);

Regions/Points Of Interest are managed through a very similar interface;
using :ref:`region objects <regions>` in place of
:ref:`catalog objects <catalogs>`.
In our example the objects' content is assigned right in the call to
|L.control.iip.region()|:

.. code-block:: javascript

      L.control.iip.region(
        [
          {
            url: 'observation_footprint.json',
            name: 'observation footprint',
            description: 'Footprint of the optical observations',
            color: 'blue',
            load: false
          },
          {
            url: 'poi.json',
            name: 'Molinari+ 2011 POIs',
            description: 'Points of Interest discussed in Einstein et al. 2016',
            color: 'orange',
            load: false
          }
        ],
        { nativeCelsys: true }
      ).addTo(sidebar);

|L.control.iip.profile()| adds a measurement tab:

.. code-block:: javascript

      L.control.iip.profile().addTo(sidebar);

Finally, |L.control.iip.doc()| can be invoked to add an online documentation
tab. Any website may be displayed in the documentation panel; it is sand-boxed
inside an HTML |iframe|_ element. Additionally, a URL to a PDF file may be
provided, making a "Download PDF" button pop up in the interface.

.. code-block:: javascript

      sidebar.addTabList();
      L.control.iip.doc('doc/index.html', {
        pdflink: 'doc/doc.pdf'
      }).addTo(sidebar);
    </script>
  </body>

Note the call to ``sidebar.addTabList()`` which moves the next tab to the
bottom of the side bar.

.. include:: refs.rst

