==================================
|VisiOmatic| programming interface
==================================

The |VisiOmatic| client provides the following sub-properties to the original Leaflet "classes" with new or overloaded methods:

.. tabularcolumns:: |p{0.314\linewidth}|p{0.630\linewidth}|

.. list-table::
  :header-rows: 1

  * - Class
    - Purpose
  * - |L.TileLayer.IIP|_
    - Manage IIP tile layers
  * - |L.CRS.WCS|_
    - Handle celestial coordinates
  * - ``L.Control.IIP``
    - Common class for managing interface menus and widgets (not used directly)
  * - |L.Control.IIP.Channel|_
    - Channel mixing interface
  * - |L.Control.IIP.Image|_
    - Image settings interface
  * - |L.Control.IIP.Catalog|_
    - Catalog overlay interface
  * - |L.Control.IIP.Profile|_
    - Image profile overlay interface
  * - |L.Control.IIP.Region|_
    - Region- and Point-of-interest interface
  * - |L.Control.IIP.Doc|_
    - Documentation interface
  * - |L.Control.Sidebar|_
    - Side menu bar and panels
  * - |L.Control.WCS|_
    - Coordinate input/output interface
  * - |L.Control.Scale.WCS|_
    - Celestial or pixel scale line
  * - |L.Control.Reticle|_
    - Reticle at the center of the map
  * - |L.Control.ExtraMap|_
    - Secondary map synchronized to the main map
  * - |L.RGB|_
    - Class for managing R,G,B color triplets that describe color pixels
  * - |L.Ellipse|_/|L.EllipseMarker|_
    - Class for drawing ellipse overlays in world/pixel coordinates on a map

.. raw:: latex

    \ \\ \ \\

|VisiOmatic| also provides set of utility functions, grouped in the ``L.IIPUtils`` object:

.. tabularcolumns:: |p{0.314\linewidth}|p{0.630\linewidth}|

.. list-table::
  :header-rows: 1

  * - Function
    - Purpose
  * - |L.IIPUtils.requestURL()|_
    - Make an Ajax call to the specified server
  * - |L.IIPUtils.parseURL()|_
    - Parse the given URL and generate a dictionary of query keyword/value pairs
  * - |L.IIPUtils.checkDomain()|_
    - Return the domain of the given URL
  * - |L.IIPUtils.isExternal()|_
    - Check if the given URL is from an external domain

.. raw:: latex

    \newpage

Classes
=======

``L.TileLayer.IIP``
-------------------
|L.TileLayer.IIP|_ manages tile layers with image data queried from an
IIPimage tile server.

Usage example
^^^^^^^^^^^^^

.. code-block:: javascript

     var map = L.map('map', {fullscreenControl: true});
     var iip = '/fcgi-bin/iipsrv.fcgi?FIF=image.ptif';
     var ima = L.tileLayer.iip(iip, {cmap: 'jet'}).addTo(map); 

.. _tilelayer_iip_instantiation:

Creation
^^^^^^^^

``L.tileLayer.iip`` ( <String> ``url`` , <|tilelayer-options|_> ``options?`` )

  instantiates an IIP tile layer object given a URL ``url``.

Options   
^^^^^^^

The constructor supports
`all options <http://leafletjs.com/reference.html#tilelayer-options>`_ from the
regular ``TileLayer`` plus

.. tabularcolumns:: |p{0.174\linewidth}|p{0.124\linewidth}|p{0.244\linewidth}|p{0.354\linewidth}|

.. list-table::
  :header-rows: 1

  * - Option
    - Type
    - Default
    - Description
  * - ``crs``
    - |L.CRS.WCS|_ object
    - Extracted from the data header if available; raw pixel coordinates otherwise
    - Coordinate Reference or World Coordinate System
  * - ``nativeCelSys``
    - Boolean
    - ``false``
    - True if native coordinates (e.g., galactic coordinates) are to be used instead of equatorial coordinates
  * - ``center``
    - String
    - ``false``
    - World coordinates (either in RA,Dec decimal form or in ``hh:mm:ss.s±dd:mm:ss.s`` sexagesimal format), or any |Sesame|_-compliant identifier defining the initial centering of the map upon layer initialization. Sexagesimal coordinates and identifier strings are sent to the |Sesame| resolver service for conversion to decimal coordinates. Assume x,y pixel coordinates if WCS information is missing. Use ``false`` for default map centering.
  * - ``fov``
    - Float
    - ``false``
    - Field of view covered by the map upon later initialization, in world coordinates (degrees, or pixel coordinates if WCS information is missing). Use ``false`` for default map zooming.
  * - ``contrast``
    - Float
    - ``1.0``
    - Contrast factor
  * - ``colorSat``
    - Float
    - ``1.0``
    - Color saturation for multi-channel data (0.0: B&W, >1.0: enhance)
  * - ``gamma``
    - Float
    - ``1.0`` for 8 or 16 bit images or ``2.2`` for 32 bit (integer or floating-point) images
    - Display gamma
  * - ``cMap``
    - String
    - ``'grey'``
    - Colormap for single channels or channel combinations. Valid colormaps are ``'grey'``, ``'jet'``, ``'cold'`` and ``'hot'``
  * - ``invertCMap``
    - Boolean
    - ``false``
    - Invert Colormap or color mix (like a negative)
  * - ``quality``
    - Integer
    - ``90``
    - JPEG encoding quality in percent
  * - ``mixingMode``
    - Strings
    - ``'color'``
    - Channel mixing mode. Valid modes are ``'mono'`` (single-channel) and ``'color'`` 
  * - ``channelColors``
    - Array of |L.RGB|_ color triplets
    - ``[rgb(0.0,0.0,1.0), rgb(0.0,1.0,0.0), rgb(1.0,0.0,0.0), rgb(0.0,0.0,0.0), ...]``
    - RGB contribution of each channel to the mixing matrix
  * - ``channelLabels``
    - Array of strings
    - ``['Channel #1', 'Channel #2', ...]``
    - Channel labels
  * - ``channelLabelMatch``
    - String
    - ``'.*'``
    - Regular expression matching the labels of channels that are given a color by default
  * - ``channelUnits``
    - Array of strings
    - ``['ADUs','ADUs',...]``
    - Channel units
  * - ``minMaxValues``
    - Array of [Float,Float]
    - Extracted from the data header if available; ``[[0.0,255.0], [0.0,255.0], ...]`` otherwise
    - Pairs of lower,higher clipping limits for every channel
  * - ``defaultChannel``
    - Integer
    - ``0``
    - Default active channel index (used, e.g., in mono-channel mode)
  * - ``commandString``
    - String
    - ``null``
    - Query string for overriding settings during layer initialization.

Public methods
^^^^^^^^^^^^^^

|L.TileLayer.IIP|_ provides all the regular ``L.TileLayer`` methods
plus

.. tabularcolumns:: |p{0.474\linewidth}|p{0.074\linewidth}|p{0.374\linewidth}|

.. list-table::
  :header-rows: 1

  * - Method
    - Returns
    - Description
  * - ``getIIPMetaData`` ( <String> ``url`` )
    - String
    - Send an ``OBJ`` request to the server specified by ``url`` and return a string with the ``max-size``, ``tile-size``, ``resolution-number``, ``bits-per-channel``, ``min-max-sample-values`` and ``subject`` IIP meta-data
  * - ``rgbToMix`` ( <Integer> ``chan``, <|L.RGB|_> ``rgb`` )
    - ---
    - Update the channel mixing matrix according to the ``rgb`` contribution of channel ``chan``
  * - ``updateMono`` ()
    - ---
    - Set the layer in monochromatic mode using the current active channel 
  * - ``updateMix`` ()
    - ---
    - Update the mixing matrix in color mode using the current ``ChannelColor`` and ``colSat`` settings

``L.CRS.WCS``
-------------

|L.CRS.WCS|_ is a new class that extends the original |L.CRS|_ object
to support celestial projections described by the `FITS
WCS <http://fits.gsfc.nasa.gov/fits_wcs.html>`_ standard. Currently only
the ``PIXEL`` (Cartesian), ``CAR``, ``COE``, ``TAN`` and ``ZEA`` projections are supported, in equatorial, ecliptic, galactic, and supergalactic coordinates.

Usage example
^^^^^^^^^^^^^

.. code-block:: javascript

     var wcs = L.CRS.wcs(header);

Creation
^^^^^^^^

``L.CRS.wcs`` ( <String> ``hdr``, ``options?`` )

  instantiates a CRS WCS object given a FITS header stored in the ``hdr`` string.

Options
^^^^^^^

.. tabularcolumns:: |p{0.174\linewidth}|p{0.124\linewidth}|p{0.224\linewidth}|p{0.374\linewidth}|

.. list-table::
  :header-rows: 1

  * - Option
    - Type
    - Default
    - Description
  * - ``ctype``
    - {x: String, y: String}
    - ``{x: 'PIXEL', y: 'PIXEL'}``
    - WCS projection type for both axes
  * - ``nativeCelSys``
    - Boolean
    - ``false``
    - If ``true`` native coordinates (e.g., galactic coordinates) are to be used instead of equatorial coordinates
  * - ``naxis``
    - |L.Point|_
    - ``[256, 256]``
    - Dimensions of the full resolution image in pixels
  * - ``nzoom``
    - Integer
    - ``9``
    - Number of zoom levels in the pyramid
  * - ``crpix``
    - |L.Point|_
    - ``[129, 129]``
    - Pixel coordinates of the projection center
  * - ``crval``
    - |L.LatLng|_
    - ``[0.0, 0.0]``
    - World coordinates of the projection center
  * - ``cd``
    - [[Float,Float], [Float,Float]]
    - ``[[1.0,0.0], [0.0,1.0]]``
    - Jacobian matrix of the de-projection at the projection center
  * - ``natpole``
    - |L.LatLng|_
    - ``[90.0, 180.0]``
    - World coordinates of the native pole

Public methods
^^^^^^^^^^^^^^

|L.CRS.WCS|_ provides all the regular |L.CRS|_ methods plus

.. tabularcolumns:: |p{0.474\linewidth}|p{0.074\linewidth}|p{0.374\linewidth}|

.. list-table::
  :header-rows: 1

  * - Method
    - Returns
    - Description
  * - ``pixelScale`` ( <Float> ``zoom``, <|L.LatLng|_> ``latLng`` )
    - Float
    - Return the angular pixel scale in degrees at current coordinates and zoom level
  * - ``rawPixelScale`` ( <|L.LatLng|_> ``latLng`` )
    - Float
    - Return the angular pixel scale in degrees at current coordinates and at full resolution
  * - ``fovToZoom`` ( <|L.Map|_> ``map``, <Float> ``fov``, <|L.LatLng|_> ``latLng`` )
    - Float
    - Return the zoom level that corresponds to the specified Field-of-View in degrees
  * - ``zoomToFov`` ( <|L.Map|_> ``map``, <Float> ``zoom``, <|L.LatLng|_> ``latLng`` )
    - Float
    - Return the Field-of-View in degrees that corresponds to the specified zoom level
  * - ``celsysToEq`` ( <|L.LatLng|_> ``latLng`` )
    - |L.LatLng|_
    - Convert native celestial coordinates to equatorial coordinates
  * - ``eqToCelsys`` ( <|L.LatLng|_> ``latLng`` )
    - |L.LatLng|_
    - Convert equatorial coordinates to native celestial coordinates

``L.Control.IIP.Channel``
-------------------------

|L.Control.IIP.Channel|_ is a new control class for managing the channel mixing
interface.

Usage example
^^^^^^^^^^^^^

.. code-block:: javascript

     var control = L.control.iip.channel({cMap: 'jet'}).addTo(map);

Creation
^^^^^^^^

``L.control.iip.channel`` ( <|control-options|_> ``options?`` )

  instantiates a channel mixing control object in the given mode (``'mono'`` or ``'color'``).

Options
^^^^^^^

The constructor supports
`all options <http://leafletjs.com/reference.html#control-options>`_ from other
|L.Control|_ classes plus
    
.. tabularcolumns:: |p{0.174\linewidth}|p{0.124\linewidth}|p{0.224\linewidth}|p{0.374\linewidth}|

.. list-table::
  :header-rows: 1

  * - Option
    - Type
    - Default
    - Description
  * - ``title``
    - String
    - ``'Channel mixing'``
    - Title of the dialog window or panel
  * - ``mixingMode``
    - Strings
    - ``null``
    - Channel mixing mode at start. Valid modes are ``'mono'`` (single-channel), ``'color'``, or ``null`` for layer settings
  * - ``cMap``
    - String
    - ``'grey'``
    - Colormap applied to the layer when the interface is attached to the map. Valid colormaps include ``'grey'``, ``'jet'``, ``'cold'`` or ``'hot'``

Public methods
^^^^^^^^^^^^^^

|L.Control.IIP.Channel|_ provides all the existing |L.Control|_ methods plus

.. tabularcolumns:: |p{0.474\linewidth}|p{0.074\linewidth}|p{0.374\linewidth}|

.. list-table::
  :header-rows: 1

  * - Method
    - Returns
    - Description
  * - ``saveSettings`` ( <|L.TileLayer.IIP|_> ``layer``, <String> ``mode`` )
    - ---
    - Save current interface settings for the given layer and mode
  * - ``loadSettings`` ( <|L.TileLayer.IIP|_> ``layer``, <String> ``mode`` )
    - ---
    - Load current interface settings for the given IIP layer and mode

``L.Control.IIP.Image``
-----------------------

|L.Control.IIP.Image|_ is a new control class for managing the image settings
interface.

Usage example
^^^^^^^^^^^^^

.. code-block:: javascript

     var control = L.control.iip.image().addTo(map);

Creation
^^^^^^^^

``L.control.iip.image`` ( <|control-options|_> ``options?`` )

  instantiates an image control object.

Options
^^^^^^^

The constructor supports
`all options <http://leafletjs.com/reference.html#control-options>`_ from other
|L.Control|_ classes plus
    
.. tabularcolumns:: |p{0.174\linewidth}|p{0.124\linewidth}|p{0.224\linewidth}|p{0.374\linewidth}|

.. list-table::
  :header-rows: 1

  * - Option
    - Type
    - Default
    - Description
  * - ``title``
    - String
    - ``'Image preferences'``
    - Title of the dialog window or panel

``L.Control.IIP.Catalog``
-------------------------

|L.Control.IIP.Catalog|_ is a new control class for managing the interface that
controls catalog queries and catalog overlays.

Usage example
^^^^^^^^^^^^^

.. code-block:: javascript

     var control = L.control.iip.catalog([L.Catalog['2MASS'], L.Catalog['SDSS'],
                   L.Catalog['Hudelot']]).addTo(map);

Creation
^^^^^^^^

``L.control.iip.catalog`` ( <Array of catalogs_>, <|control-options|_> ``options?`` )

  instantiates a catalog control object with the given list of catalogs.

.. _catalogs:

Catalogs
^^^^^^^^

Catalog objects describe the catalogs that can be queried through a
pull-down menu in the interface. They have the following properties (there are
no default values):

.. tabularcolumns:: |p{0.15\linewidth}|p{0.08\linewidth}|p{0.465\linewidth}|p{0.2\linewidth}|

.. list-table::
  :header-rows: 1

  * - Option
    - Type
    - Example
    - Description
  * - ``name``
    - String
    - ``'My catalog'``
    - Catalog label as it will appear in the pull-down menu
  * - ``attribution``
    - String
    - ``'Catalog of my preferred sources by Me and al. (2015)'``
    - Attribution or credit line
  * - ``url``
    - String
    - ``L.Catalog.vizierURL + '/asu-tsv?&`` ``-mime=csv&-source=II/246&`` ``-out=2MASS,RAJ2000,DEJ2000,`` ``Jmag,Hmag,Kmag&-out.meta=&`` ``-c.eq={sys}&-c={lng},{lat}&`` ``-c.bd={dlng},{dlat}&-out.max={nmax}'``
    - URL template for the catalog query
  * - ``color``
    - String
    - ``'#FC04A0'``
    - Default overlay color for this catalog
  * - ``maglim``
    - Float
    - ``20.0``
    - Expected limiting magnitude of the catalog (used to scale symbols).
  * - ``service``
    - String
    - ``'Vizier@CDS'``
    - Label describing the web service that provides the catalog
  * - ``regionType``
    - String
    - ``'box'``
    - Angular query type: ``'box'`` or ``'cone'``
  * - ``properties``
    - Array of strings
    - ``['J', 'H', 'K']``
    - labels for the source properties returned by the catalog service (except coordinates).
  * - ``units``
    - Array of strings
    - ``['mag', 'mag', 'mag']``
    - units of the source properties returned by the catalog service.
  * - ``objurl``
    - String
    - ``L.Catalog.vizierURL + '/VizieR-5?-source=II/246&`` ``-c={ra},{dec},eq=J2000&-c.rs=0.01'``
    - URL template for querying individual sources (e.g., when clicking the source ID in the popup source dialog)

Pre-defined catalogs include |2MASS|_, |SDSS|_, |PPMXL|_, |Abell|_, |NVSS|_, |FIRST|_, |AllWISE|_, |GALEX_AIS|_ and |GAIA_DR1|_, all accessible through |Vizier|_ queries.

Options
^^^^^^^

The constructor supports
`all options <http://leafletjs.com/reference.html#control-options>`_ from other
|L.Control|_ classes plus
    
.. tabularcolumns:: |p{0.174\linewidth}|p{0.104\linewidth}|p{0.154\linewidth}|p{0.464\linewidth}|

.. list-table::
  :header-rows: 1

  * - Option
    - Type
    - Default
    - Description
  * - ``title``
    - String
    - ``'Catalog overlay'``
    - Title of the dialog window or panel
  * - ``nativeCelSys``
    - Boolean
    - ``false``
    - True if native coordinates (e.g., galactic coordinates) are to be used instead of equatorial coordinates
  * - ``color``
    - String
    - ``'#FFFF00'``
    - Default catalog overlay color
  * - ``timeOut``
    - Float
    - ``30``
    - Time out delay for catalog queries (in seconds)

``L.Control.IIP.Profile``
-------------------------

|L.Control.IIP.Profile|_ is a new control class for managing the interface that
controls profile extraction and profile overlays.

Usage example
^^^^^^^^^^^^^

.. code-block:: javascript

     var control = L.control.iip.profile().addTo(map);

Creation
^^^^^^^^

``L.control.iip.profile`` ( <|control-options|_> ``options?`` )

  instantiates a profile control object.

Options
^^^^^^^

The constructor supports
`all options <http://leafletjs.com/reference.html#control-options>`_ from other
|L.Control|_ classes plus
    
.. tabularcolumns:: |p{0.174\linewidth}|p{0.124\linewidth}|p{0.224\linewidth}|p{0.374\linewidth}|

.. list-table::
  :header-rows: 1

  * - Option
    - Type
    - Default
    - Description
  * - ``title``
    - String
    - ``'Catalog overlay'``
    - Title of the dialog window or panel
  * - ``color``
    - String
    - ``'#FFFF00'``
    - Default profile overlay color

``L.Control.IIP.Region``
------------------------

|L.Control.IIP.Region|_ is a new control class for managing the region
interface.

Usage example
^^^^^^^^^^^^^

.. code-block:: javascript

  var control = L.control.iip.region([
    {
      name: 'Region 1',
      description: 'A first region',
      url: 'region1.json',
      color: 'blue',
      load: false
    },{
      name: 'Region 2',
      description: 'A second region',
      url: 'region2.json',
      color: 'orange',
      load: false
      }
    ],
    { nativeCelsys: true }
  ).addTo(map);


Regions are defined in `GeoJSON <http://geojson.org/>`_ files.
Here is an example of the content of a GeoJSON file:

.. code-block:: javascript

  {"type":"FeatureCollection",
    "features": [
      {
        "type":"Feature",
        "geometry": {
          "type":"Polygon",
          "coordinates": [[
            [266.46398,-27.94870],[267.43523,-28.46585],
            [266.47605,-29.85244],[265.49663,-29.32837],[266.46398,-27.94870]
          ]]
        },
        "properties": {
          "description":"Limits of region 1."
        }
      },{
        "type":"Feature",
        "geometry": {
          "type":"Point",
          "coordinates": [266.46042,-28.82444]
        },
        "properties": {
          "description":"<h2>A Point of Interest</h2><p>This object should be worth monitoring.</p>"
        }
      }
    ]
  }

The ``description`` string inside the GeoJSON ``properties`` object can be
used to provide the HTML content of a window that pops up when the user clicks
on the accompanying region. Note that links in the description should preferably
be targeted to appear in a new browser window/tab using the ``target='blank'``
attribute setting.

Creation
^^^^^^^^

``L.control.iip.region`` ( <Array of regions_> regions, <|control-options|_> ``options?`` )

  instantiates a region control object given an array of region objects.

.. _regions:

Regions
^^^^^^^

Region objects describe the regions that can be accessed through a
pull-down menu in the interface. They have the following properties (there are
no default values):

.. tabularcolumns:: |p{0.174\linewidth}|p{0.124\linewidth}|p{0.224\linewidth}|p{0.374\linewidth}|

.. list-table::
  :header-rows: 1

  * - Option
    - Type
    - Example
    - Description
  * - ``name``
    - String
    - ``'My region'``
    - Region label as it will appear in the pull-down menu
  * - ``description``
    - String
    - ``'This is region A'``
    - HTML string to appear in a popup window when clicking over the region (overridden by the ``description`` property in the GeoJSON data).
  * - ``url``
    - String
    - ``'myregions.json'``
    - URL of the GeoJSON data
  * - ``color``
    - String
    - ``'#C0AC23'``
    - Default overlay color for this region
  * - ``load``
    - Boolean
    - ``false``
    - If true, region data are automatically loaded as the control is attached to the map.

Options
^^^^^^^

The constructor supports
`all options <http://leafletjs.com/reference.html#control-options>`_ from other
|L.Control|_ classes plus
    
.. tabularcolumns:: |p{0.174\linewidth}|p{0.124\linewidth}|p{0.224\linewidth}|p{0.374\linewidth}|

.. list-table::
  :header-rows: 1

  * - Option
    - Type
    - Default
    - Description
  * - ``title``
    - String
    - ``'Channel mixing'``
    - Title of the dialog window or panel
  * - ``nativeCelSys``
    - Boolean
    - ``false``
    - True if native coordinates (e.g., galactic coordinates) are to be used instead of equatorial coordinates
  * - ``color``
    - String
    - ``'#00FFFF'``
    - Default region overlay color
  * - ``timeOut``
    - Float
    - ``30``
    - Time out delay for region downloads (in seconds)

``L.Control.IIP.Doc``
---------------------

|L.Control.IIP.Doc|_ is a new control class for displaying online documentation.

Usage example
^^^^^^^^^^^^^

.. code-block:: javascript

     var control = L.control.iip.doc('mydoc/index.html', {pdflink: 'mydoc/mydoc.pdf'}).addTo(map);

Creation
^^^^^^^^

``L.control.iip.doc`` ( <String> ``url``, <|control-options|_> ``options?`` )

  instantiates a doc control object, given a link to the documentation homepage.

Options
^^^^^^^

The constructor supports
`all options <http://leafletjs.com/reference.html#control-options>`_ from other
|L.Control|_ classes plus
    
.. tabularcolumns:: |p{0.174\linewidth}|p{0.124\linewidth}|p{0.224\linewidth}|p{0.374\linewidth}|

.. list-table::
  :header-rows: 1

  * - Option
    - Type
    - Default
    - Description
  * - ``title``
    - String
    - ``'Documentation'``
    - Title of the dialog window or panel
  * - ``pdflink``
    - String
    - ``'mydoc.pdf'``
    - Link a PDF version of the documentation

``L.Control.Sidebar``
---------------------

|L.Control.Sidebar|_ is a control class for adding sliding panes to the left or the right of the map. It is derived from the ``leaflet-sidebar`` plugin by Tobias
Bieniek.

Usage example
^^^^^^^^^^^^^

.. code-block:: javascript

     var sidebar = L.control.sidebar().addTo(map);

Creation
^^^^^^^^

``L.control.sidebar`` ( <|control-options|_> ``options?`` )

  instantiates a sidebar control object.

Options
^^^^^^^

The constructor supports
`all options <http://leafletjs.com/reference.html#control-options>`_ from other
|L.Control|_ classes plus
    
.. tabularcolumns:: |p{0.244\linewidth}|p{0.084\linewidth}|p{0.194\linewidth}|p{0.374\linewidth}|

.. list-table::
  :header-rows: 1

  * - Option
    - Type
    - Default
    - Description
  * - ``title``
    - String
    - ``'Toggle advanced menu'``
    - String which will appear in the tooltip while hovering over the sidebar toggle button.
  * - ``forceSeparateButton``
    - Boolean
    - ``false``
    - If true, the sidebar toggle button will be separated from the zooming control panel

Public methods
^^^^^^^^^^^^^^

|L.Control.Sidebar|_ provides all the existing |L.Control|_ methods plus

.. tabularcolumns:: |p{0.464\linewidth}|p{0.084\linewidth}|p{0.374\linewidth}|

.. list-table::
  :header-rows: 1

  * - Method
    - Returns
    - Description
  * - ``addTabList`` ()
    - ``tabList``
    - Create and return a new tabList (collection of tabs)
  * - ``addTab`` ( <String> ``id``, <string> ``className``, <String> ``title``, <|Element|_> ``content``, <String> ``sideClass`` )
    - |Element|_
    - Add a new tab to the current ``tabList``, inserting content into the associated pane, and return the pane |Element|_
  * - ``open`` ( <String> ``id`` )
    - ---
    - Open sidebar (if necessary) and show the tab with the specified ID
  * - ``close`` ()
    - ---
    - Close sidebar (if necessary)
  * - ``toggle`` ()
    - ---
    - Collapse or expand the sidebar

``L.Control.WCS``
-----------------

|L.Control.WCS|_ is a new control class for managing an input/output
coordinate widget.

Usage example
^^^^^^^^^^^^^

.. code-block:: javascript

     var control =  L.control.wcs(
       {coordinates: [
         {label: 'RA,Dec', units: 'HMS'},
         {label: 'Gal l,b', units: 'deg', nativeCelsys: true}
       ]}
     ).addTo(map);

Creation
^^^^^^^^

``L.control.wcs`` ( <|control-options|_> ``options?`` )

  instantiates a WCS control object.

Options
^^^^^^^

The constructor supports
`all options <http://leafletjs.com/reference.html#control-options>`_ from other
|L.Control|_ classes plus
    
.. tabularcolumns:: |p{0.154\linewidth}|p{0.104\linewidth}|p{0.324\linewidth}|p{0.314\linewidth}|

.. list-table::
  :header-rows: 1

  * - Option
    - Type
    - Default
    - Description
  * - ``title``
    - String
    - ``'Scale'``
    - Name of the control (to be used for tooltips)
  * - ``coordinates``
    - Array of coordinates_
    - ``[{ label: 'RA, Dec', units: 'HMS', nativeCelsys: false }]``
    - Set of coordinates_ settings (see below)
  * - ``centerQueryKey``
    - String
    - ``'center'``
    - Name of the URL `query string <http://en.wikipedia.org/wiki/Query_string>`_ field that should contain the current center of the map when pressing the ''Copy to Clipboard'' button
  * - ``fovQueryKey``
    - String
    - ``'fov'``
    - Name of the URL query string field that should contain the current Field-of-View of the map when pressing the ''Copy to Clipboard'' button

.. _coordinates:

Coordinates
^^^^^^^^^^^

Coordinates objects describe the coordinates that can be selected through a
pull-down menu to the left of the coordinate entry widget. They have the
following properties (there are no default values):

.. tabularcolumns:: |p{0.174\linewidth}|p{0.094\linewidth}|p{0.124\linewidth}|p{0.504\linewidth}|

.. list-table::
  :header-rows: 1

  * - Option
    - Type
    - Example
    - Description
  * - ``label``
    - String
    - ``'RA, Dec'``
    - Coordinate label as it will appear in the pull-down menu
  * - ``units``
    - String
    - ``'HMS'``
    - Coordinate units/types as they will appear in the interface: ``'HMS'`` for ``hh:mm:ss.s±dd:mm:ss.s`` sexagesimal format, ``'deg'`` for decimal degrees, ``'other'`` for raw decimal output.
  * - ``nativeCelSys``
    - Boolean
    - ``false``
    - True if native coordinates (e.g., galactic coordinates) are to be used instead of equatorial coordinates

``L.Control.Scale.WCS``
-----------------------

|L.Control.Scale.WCS|_ is a new control class derived from |L.Control.Scale|_ that adds a scale
to the map. It supports both angular and pixel units.

Usage example
^^^^^^^^^^^^^

.. code-block:: javascript

     var control = L.control.scale.wcs({pixels: false}).addTo(map);

Creation
^^^^^^^^

``L.control.scale.wcs`` ( <|control-scale-options|_> ``options?`` )

  instantiates a WCS scale control object.

Options
^^^^^^^

The constructor supports all the |L.Control.Scale|_ options plus
    
.. tabularcolumns:: |p{0.174\linewidth}|p{0.114\linewidth}|p{0.144\linewidth}|p{0.464\linewidth}|

.. list-table::
  :header-rows: 1

  * - Option
    - Type
    - Default
    - Description
  * - ``title``
    - String
    - ``'Scale'``
    - Name of the control (to be used for tooltips)
  * - ``degrees``
    - Boolean
    - ``true``
    - Whether to show the degree scale line (deg/arcmin/arcsec/mas)
  * - ``pixels``
    - Boolean
    - ``true``
    - Whether to show the pixel scale line
  * - ``custom``
    - Boolean
    - ``false``
    - Whether to show the custom scale line
  * - ``customScale``
    - float
    - 1.0
    - Custom scale factor in pixels
  * - ``customUnits``
    - String
    - ``"``
    - Name of the custom scale unit
  * - ``planetRadius``
    - float
    - 6378137.0
    - Planet radius in meters (for metric and imperial units)

``L.Control.Reticle``
---------------------

|L.Control.Reticle|_ is a new control class that adds a crosshair at the center of the map window.

Usage example
^^^^^^^^^^^^^

.. code-block:: javascript

     var control = L.control.reticle().addTo(map);

Creation
^^^^^^^^

``L.control.reticle`` ()

  instantiates a reticle control object.

Options
^^^^^^^

The constructor has no option.

``L.Control.ExtraMap``
----------------------

|L.Control.ExtraMap|_ is a new control class for displaying an additional map
synchronized with the main map,
`picture-in-picture <http://en.wikipedia.org/wiki/Picture-in-picture>`_ style.
It is an adaptation of
`Leaflet-MiniMap <https://github.com/Norkart/Leaflet-MiniMap>`_ by Norkart.

Usage example
^^^^^^^^^^^^^

.. code-block:: javascript

    var control = L.control.extraMap(
      L.tileLayer.iip('/fcgi-bin/iipsrv.fcgi?FIF=image.ptif'),
        {
          position: 'topright',
          width: 192,
          height: 128,
          zoomLevelOffset: -6,
        }
    ).addTo(map);

Creation
^^^^^^^^

``L.control.extraMap`` ( <|L.TileLayer|_> ``layer``, <|control-options|_> ``options?`` )

  instantiates an extraMap control object with the given layer. Note that the
  layer must not be shared with the main map or another extraMap.

Options
^^^^^^^

The constructor supports
`all options <http://leafletjs.com/reference.html#control-options>`_ from other
|L.Control|_ classes plus
    
.. tabularcolumns:: |p{0.224\linewidth}|p{0.154\linewidth}|p{0.164\linewidth}|p{0.354\linewidth}|

.. list-table::
  :header-rows: 1

  * - Option
    - Type
    - Default
    - Description
  * - ``title``
    - String
    - ``'Navigation mini-map. Grab to navigate'``
    - Name of the control (to be used for tooltips)
  * - ``toggleDisplay``
    - Boolean
    - ``true``
    - Whether the extraMap should display a minimization button
  * - ``strings``
    - Array of strings
    - ``{hideText: 'Hide map', showText: 'Show map'}``
    - Labels for the toggle button (appear in tooltips)
  * - ``autoToggleDisplay``
    - Boolean
    - ``false``
    - Whether the extraMap should hide automatically if the main map bounds do not fit within the extraMap bounds (useful when ``zoomLevelFixed`` is set)
  * - ``zoomLevelFixed``
    - Boolean or Integer
    - ``false``
    - Valid, fixed zoom level for the extraMap, or ``false`` if a dynamic ``zoomLevelOffset`` is to be applied instead
  * - ``zoomLevelOffset``
    - Integer
    - ``-5``
    - Offset applied to the zoom in the extraMap with respect to that of the main map
  * - ``zoomAnimation``
    - Boolean
    - ``false``
    - Whether the extraMap should have an animated zoom (if true, will cause the extraMap to lag a bit after the main map)
  * - ``width``
    - Integer
    - ``150``
    - Width of the ExtraMap in pixels
  * - ``height``
    - Integer
    - ``150``
    - Height of the ExtraMap in pixels
  * - ``collapsedWidth``
    - Integer
    - ``24``
    - Width of the toggleMarker and the ExtraMap when collapsed, in pixels
  * - ``collapsedHeight``
    - Integer
    - ``24``
    - Height of the toggleMarker and the ExtraMap when collapsed, in pixels
  * - ``aimingRectOptions``
    - |path-options|_
    - ``{color: '#FF7800', weight: 1, clickable: false}``
    - Style of the aiming rectangle (``clickable`` is always forced to ``false``)
  * - ``shadowRectOptions``
    - |path-options|_
    - ``{color: '#803C00', weight: 1, opacity: 0, fillOpacity: 0, clickable: false}``
    - Style of the shadow aiming rectangle (``clickable`` is always forced to ``false``)

Public methods
^^^^^^^^^^^^^^

|L.Control.ExtraMap|_ provides all the existing |L.Control|_ methods plus

.. tabularcolumns:: |p{0.474\linewidth}|p{0.074\linewidth}|p{0.374\linewidth}|

.. list-table::
  :header-rows: 1

  * - Method
    - Returns
    - Description
  * - ``changeLayer`` ( <|L.TileLayer|_> ``layer``)
    - ---
    - Replace the current extraMap layer with the one provided

``L.RGB``
---------

|L.RGB|_ is a new class for managing R,G,B color triplets that describe color pixels.

Usage example
^^^^^^^^^^^^^

.. code-block:: javascript

     var rgb = L.rgb(0.2,0.4,0.0);
     var rgb = L.rgb([0.2,0.4,0.0]);
     var rgb = L.rgb('#336600');

Creation
^^^^^^^^

``L.rgb`` ( <Float> ``r``, <Float> ``g``, <Float> ``b`` )
instantiates an RGB object with the given red, green and blue components.

``L.Ellipse``
-------------
``L.EllipseMarker``
-------------------

|L.Ellipse|_ and |L.EllipseMarker|_ are new classes for drawing ellipse overlays on a map, with parameters defined in world and pixel coordinates, respectively.

Usage example

.. code-block:: javascript

    var path = L.ellipse(latLng, {
      majAxis: 0.0210, minAxis: 0.0045, posAngle: -30.0
    }).addTo(map);

.. code-block:: javascript

    var path = L.ellipseMarker(latLng, {
      majAxis: 10.0, minAxis: 3.0, posAngle: 24.0
    }).addTo(map);

Creation
^^^^^^^^

``L.ellipse`` ( <|L.LatLng|_> ``latLng``, <|path-options|_> ``options?`` )
instantiates an ellipse object centered on position ``latLng``.

``L.ellipseMarker`` ( <|L.LatLng|_> ``latLng``, <|path-options|_> ``options?`` )
instantiates an ellipse marker object centered on position ``latLng``.

Both constructors support
`all options <http://leafletjs.com/reference.html#path-options>`_ from other
|L.Path|_ classes plus
    
.. tabularcolumns:: |p{0.124\linewidth}|p{0.074\linewidth}|p{0.074\linewidth}|p{0.624\linewidth}|

.. list-table::
  :header-rows: 1

  * - Option
    - Type
    - Default
    - Description
  * - ``majAxis``
    - Float
    - ``'10'``
    - Ellipse major axis in degrees (``L.Ellipse``) or in pixels (``L.EllipseMarker``)
  * - ``minAxis``
    - Float
    - ``'10'``
    - Ellipse minor axis in degrees (``L.Ellipse``) or in pixels (``L.EllipseMarker``)
  * - ``posAngle``
    - Float
    - ``'0'``
    - Ellipse position angle in degrees East-of-North (``L.Ellipse``) or CCW from x-axis (``L.EllipseMarker``)


Utility functions
=================

``L.IIPUtils.requestURL()``
---------------------------

|L.IIPUtils.requestURL()| is used throughout |VisiOmatic| to send
`Ajax <http://en.wikipedia.org/wiki/Ajax_%28programming%29>`_ requests
to a given URL.

Usage
^^^^^

``L.IIPUtils.requestURL`` ( <String> ``url``, <String> ``purpose``, <Function> ``action``, <Object> ``context``, <Float> ``timeOut``)

Usage example
^^^^^^^^^^^^^

.. code-block:: javascript

  L.IIPUtils.requestURL(
    'http://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame/-oI/A?M31',
    'getting coordinates for M31',
    function (context, httpRequest) { console.log(context, httpRequest); },
    this,
    10
  );

Arguments
^^^^^^^^^

.. tabularcolumns:: |p{0.104\linewidth}|p{0.364\linewidth}|p{0.454\linewidth}|

.. list-table::
  :header-rows: 1

  * - Name
    - Type
    - Description
  * - ``url``
    - String
    - URL to which the request must be sent
  * - ``purpose``
    - String
    - Short description of the request purpose
  * - ``action``
    - Function (``context``, ``httpRequest``)
    - Reference to a function to which the ``context`` and the ``httpRequest`` objects will be passed upon completion of the request
  * - ``context``
    - Object
    - The ``context`` object (e.g., ``this``), will be passed as a first argument to the ``action`` function
  * - ``timeOut``
    - Float
    - Time out delay in seconds. No time out if argument is missing.

.. _parseURL:

``L.IIPUtils.parseURL()``
-------------------------

|L.IIPUtils.parseURL()| parses a URL and returns a dictionary of 
`query string <http://en.wikipedia.org/wiki/Query_string>`_
keyword/value pairs.

Usage
^^^^^

``L.IIPUtils.parseURL`` ( <String> ``url``)

Usage example
^^^^^^^^^^^^^

.. code-block:: javascript

  args = L.IIPUtils.parseURL(
    'http://myviewer.org/?channel=2&mode=mono'
  );
  console.log(args['channel'], args['mode']);

Arguments
^^^^^^^^^

.. tabularcolumns:: |p{0.104\linewidth}|p{0.364\linewidth}|p{0.454\linewidth}|

.. list-table::
  :header-rows: 1

  * - Name
    - Type
    - Description
  * - ``url``
    - String
    - URL to be parsed

``L.IIPUtils.checkDomain()``
----------------------------

|L.IIPUtils.checkDomain()| parses a URL and returns the `domain name <http://en.wikipedia.org/wiki/Domain_name>`_ associated with it.

Usage
^^^^^

``L.IIPUtils.checkDomain`` ( <String> ``url``)

Usage example
^^^^^^^^^^^^^

.. code-block:: javascript

  domain = L.IIPUtils.checkDomain('http://myviewer.org/test');

Arguments
^^^^^^^^^

.. tabularcolumns:: |p{0.104\linewidth}|p{0.364\linewidth}|p{0.454\linewidth}|

.. list-table::
  :header-rows: 1

  * - Name
    - Type
    - Description
  * - ``url``
    - String
    - URL to be parsed

``L.IIPUtils.isExternal()``
---------------------------

|L.IIPUtils.isExternal()| parses a URL and returns ``true`` if it belongs to the
current domain or ``false`` otherwise.

Usage
^^^^^

``L.IIPUtils.isExternal`` ( <String> ``url``)

Usage example
^^^^^^^^^^^^^

.. code-block:: javascript

  flag = L.IIPUtils.isExternal('http://myviewer.org/doc/');

Arguments
^^^^^^^^^

.. tabularcolumns:: |p{0.104\linewidth}|p{0.364\linewidth}|p{0.454\linewidth}|

.. list-table::
  :header-rows: 1

  * - Name
    - Type
    - Description
  * - ``url``
    - String
    - URL to be parsed

``L.IIPUtils.copyToClipboard()``
--------------------------------

|L.IIPUtils.copyToClipboard()| copies the given string to clipboard.

Usage
^^^^^

``L.IIPUtils.copyToClipboard`` ( <String> ``text``)

Usage example
^^^^^^^^^^^^^

.. code-block:: javascript

  flag = L.IIPUtils.copyToClipboard('http://myurl');

Arguments
^^^^^^^^^

.. tabularcolumns:: |p{0.104\linewidth}|p{0.364\linewidth}|p{0.454\linewidth}|

.. list-table::
  :header-rows: 1

  * - Name
    - Type
    - Description
  * - ``text``
    - String
    - String to be copied to clipboard

``L.IIPUtils.flashElement()``
--------------------------------

|L.IIPUtils.flashElement()| temporily highlights a DOM element using a short (<400ms) "flashing" animation.

Usage
^^^^^

``L.IIPUtils.flashElement`` ( <|Element|_> ``elem``)

Usage example
^^^^^^^^^^^^^

.. code-block:: javascript

  flag = L.IIPUtils.flashElement(myInput);

Arguments
^^^^^^^^^

.. tabularcolumns:: |p{0.104\linewidth}|p{0.364\linewidth}|p{0.454\linewidth}|

.. list-table::
  :header-rows: 1

  * - Name
    - Type
    - Description
  * - ``elem``
    - |Element|_
    - Element to highlight

.. include:: refs.rst

