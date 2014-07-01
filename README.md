#VisiOmatic
a web client for visualizing science-grade astronomy images.

Instruction and demos available at [visiomatic.org](http://visiomatic.org)

Only interested in an [IIPImage] plugin for [Leaflet]? Try [Leaflet.TileLayer.IIP](https://github.com/astromatic/Leaflet.TileLayer.IIP)


##Short API description
VisiOmatic works essentially as a large [Leaflet] plug-in, providing subproperties to the original Leaflet "classes" with new or overloaded methods:

* [L.TileLayer.IIP](README.md#ltilelayeriip)
* [L.CRS.WCS](README.md#lcrswcs)
* [L.Control.IIP](README.md#lcontroliip)
* [L.Control.WCS](README.md#lcontrolwcs)
* [L.Control.Reticle](README.md#lcontrolreticle)


----------

#####`L.TileLayer.IIP`
`L.TileLayer.IIP` manages tile layers with image data queried from an IIPimage tile server.

######Creation
Factory | Description
--------|------------
`L.tileLayer.iip( <String> url, <`[`tilelayer-options`]`> options? )` | Instantiate a tile layer object given a URL

######Options
The constructor supports all options from the regular `L.TileLayer` plus

Option | Type | Default | Description
-------|------|---------|------------
`contrast` | `Number` | `1.0` | Contrast fractor
`gamma` | `Number` | `1.0` for 8 or 16 bit images or `2.2` for 32 bit (integer or floating-point) images | Display gamma
`cMap` | `String` | `'grey'` | Colormap for single-channel images. Valid colormaps are `'grey'`, `'jet'`, `'cold'` and `'hot'`
`invertCMap` | `Boolean` | `false` | Invert Colormap (like a negative)
`quality` | `Number` | `90` | JPEG encoding quality in percent

###### Public methods
`L.TileLayer.IIP` provides all the regular `L.TileLayer` methods plus

Method | Returns | Description
-------|---------|------------
`getIIPMetaData( <String> url )` | `String` | Send an `OBJ` request to the server+data specified by `url` and return a string with the `max-size`,`tile-size`,`resolution-number`,`bits-per-channel`,`min-max-sample-values` and `subject` IIP meta-data

--------

#### `L.CRS.WCS`
`L.CRS.WCS` is a new class that extends the original `L.CRS` object to support celestial projections described by the [FITS WCS] standard. Currently only the `PIXEL` (Cartesian), `TAN` and `ZEA` projections are supported.
 
######Creation
Factory | Description
--------|------------
`L.CRS.wcs( <String> hdr, options? )` | Instantiate a CRS WCS object given a FITS header

######Options
Option | Type | Default | Description
-------|------|---------|------------
`ctype`| `{x: String, y: String}` | `{x: 'PIXEL', y: 'PIXEL'}` | WCS projection type for both axes
`naxis`| [`Point`] | `[256, 256]` | Dimensions of the full resolution image in pixels
`nzoom`| `Number` | `9` | Number of zoom levels in the pyramid
`crpix`| [`Point`] | `[129, 129]` | Pixel coordinates of the projection center
`crval`| [`LatLng`] | `[0.0, 0.0]` | World coordinates of the projection center
`cd`| `[[Number, Number], [Number, Number]]` | `[[1.0,0.0],[0.0,1.0]]` | Jacobian matrix of the de-projection at the projection center
`natpole`| [`LatLng`] | `[90.0, 180.0]` | World coordinates of the native pole

######Public methods
`L.CRS.WCS` provides all the regular `L.CRS` methods plus

Method | Returns | Description
-------|---------|------------
`pixelScale( <Number> zoom, <`[`LatLng`]`> latlng )` | Number | Return the angular pixel scale at current coordinates and zoom level in degrees

------------

#### `L.Control.IIP`
`L.Control.IIP`  extends the `L.Control` class to manage controls more specifically related to IIP layers, including synchronization of control parameters with to the currently active IIP layer. It is not meant to be used directly, but rather through the `L.Control.IIP.Image` and `L.Control.IIP.Overlay` subproperties.
 
######Creation
Factory | Description
--------|------------
`L.control.iip.image( <`[`Layer Config`]`> baseLayers, <`[`Control options`]`> <`[`Control options`]`> options? )` | Instantiate an image control object given a configuration of base layers
`L.control.iip.overlay( <`[`Layer Config`]`> baseLayers, <`[`Control options`]`> options? )` | Instantiate an overlay control object given a configuration of base layers

######Options
The constructor supports all options from the regular `L.Control` plus

Option | Type | Default | Description
-------|------|---------|------------
`title`| `String` | `'Image adjustment'` | Title for the image control "window"
`collapsed`| `Boolean` | `true` | If true, the image control window is collapsed unless getting focus
`cmap`| `String` | `'grey'` | Default colormap for active layers (only for `L.control.iip.image()`)

#### `L.Control.Layers.IIP`
`L.Control.Layers.IIP` extends the `L.Control.Layers` class by adding synchronization with [`L.Control.IIP`](README.md#lcontroliip) controls.

######Creation
Factory | Description
--------|------------
`L.control.layers.iip( <`[`Layer Config`]`> baseLayers, <`[`Layer Config`]`> overlays, <`[`Layer Control Options`]`> options? )` | Instantiate a wcs input widget object

######Options
The constructor supports all options from the regular `L.Control.Layers` plus

Option | Type | Default | Description
-------|------|---------|------------
`fileMenu` | `Boolean` | `false` | If true, include an `Add...` button to open the file selector
`fileURL` | `String` | `'/fcgi-bin/iipsrv.fcgi?FIF='` | Prefix to be added to the file selector output for accessing the image data
`fileRoot`| `String` | `''` | Initial path for the file selector
`fileTreeScript`| `String` | `'visiomatic/dist/filetree.php'` | Relative path to the file selector script
`fileProcessScript`| `String` | `'visiomatic/dist/fileprocess.php'` | Relative path to the script that processes the image selected with the file selector

#### `L.Control.WCS`
`L.Control.WCS` extends the `L.Control` class by adding a celestial coordinate input/output widget to the map. The widget handles
* celestial coordinates in decimal degrees, which are then processed locally
* celestial coordinates in sexagesimal hours/degrees, which are translated to decimal by the [Sesame] service at [CDS]
* celestial object names, which are translated to angular coordinates by the [Sesame] service at [CDS]
 
######Creation
Factory | Description
--------|------------
`L.control.wcs( <`[`Control options`]`> options? )` | Instantiate a wcs input widget object

######Options
The constructor supports all options from the regular `L.Control` plus

Option | Type | Default | Description
-------|------|---------|------------
`units`| `String` | `'HMS'` | Display format for celestial coordinates: `'HMS'` for sexagesimal hours/degrees, `'deg'` for decimal degrees, or other for raw coordinates (pixels).

#### `L.Control.Scale.WCS`
`L.Control.Scale.WCS` extends the `L.Control.Scale` class by adding support for WCS (and in particular, celestial) coordinates.

######Creation
Factory | Description
--------|------------
`L.control.scale.wcs( <`[`Control Scale options`]`> options? )` | Instantiate a WCS scale control object

######Options
The constructor supports all options from the regular `L.Control.Scale` plus

Option | Type | Default | Description
-------|------|---------|------------
`degrees`| `Boolean` | `true` | Whether to show the arcsec/arcmin/degree scale line
`pixels`| `Boolean` | `true` | Whether to show the pixel/kpixel/Mpixel scale line
`custom`| `Boolean` | `false` | Whether to show the custom scale line
`customScale`| `Number` | `1.0` | Scaling factor for the custom scale
`customUnits`| `String` | `''` | Unit for the custom scale

#### `L.Control.Reticle`
`L.Control.IIP` extends the `L.Control` class by adding a reticle at the center of the map.
 
######Creation
Factory | Description
--------|------------
`L.control.reticle( <`[`Control options`]`> options? )` | Instantiate a reticle object


[Leaflet]: http://leafletjs.com
[IIPImage]: http://iipimage.sourceforge.net
[FITS WCS]: http://fits.gsfc.nasa.gov/fits_wcs.html
[`tilelayer-options`]: http://leafletjs.com/reference.html#tilelayer-options
[`LatLng`]: http://leafletjs.com/reference.html#latlng
[`Point`]: http://leafletjs.com/reference.html#point
[`Layer Config`]: http://leafletjs.com/reference.html#control-layers-config
[`Control options`]: http://leafletjs.com/reference.html#control-options
[`Layer Control Options`]: http://leafletjs.com/reference.html#control-layers-options
[`Control Scale options`]: http://leafletjs.com/reference.html#control-scale-options
[Sesame]: http://cdsweb.u-strasbg.fr/doc/sesame.htx
[CDS]: http://cds.u-strasbg.fr/
