#VisiOmatic
a web client for visualizing science-grade astronomy images.

Instruction and demos available at [visiomatic.org](http://visiomatic.org)

Only interested in an [IIPImage] plugin for [Leaflet]? Try [Leaflet.TileLayer.IIP](https://github.com/astromatic/Leaflet.TileLayer.IIP)


##Short API description

VisiOmatic works essentially as a large [Leaflet] plug-in, providing subproperties to the original Leaflet "classes" with new or overloaded methods.

----------

#####`L.TileLayer.IIP`
`L.TileLayer.IIP` manages layers with image data from an IIPimage tile server.

######Creation

Factory | Description
--------|------------
`L.tileLayer.iip(<String> url, <`[tilelayer-options]`> options)` | Instantiate a tile layer object given a URL and optionally an options object

######Options
The constructor supports all options from the regular `L.TileLayer` plus

Option | Type | Default | Description
-------|------|---------|------------
`contrast` | Number | `1.0` | Contrast fractor
`gamma` | Number | `1.0` for 8 or 16 bit images or `2.2` for 32 bit (integer or floating-point) images | Display gamma
`cMap` | String | `'grey'` | Colormap for single-channel images. Valid colormaps are `'grey'`, `'jet'`, `'cold'` and `'hot'`
`invertCMap` | Boolean | `false` | Invert Colormap (like a negative)
`quality` | Number | `90` | JPEG encoding quality in percent

###### Public methods
`L.TileLayer.IIP` provides all the regular `L.TileLayer` methods plus

Method | Returns | Description
-------|---------|------------
`getIIPMetaData(<String> url)` | String | send an `OBJ` request to the server+data specified by `url` and return a string with the `max-size`,`tile-size`,`resolution-number`,`bits-per-channel`,`min-max-sample-values` and `subject` IIP meta-data

--------

#### `L.CRS.WCS`
`L.CRS.WCS` is a new class that extends the original `L.CRS` object to support celestial projections described by the [FITS WCS] standard.
 
######Creation

Factory | Description
--------|------------
`L.CRS.wcs(options)` | Instantiate a CRS WCS object given (optionally) an options object

###### Options

Option | Type | Default | Description
-------|------|---------|------------
`ctype`| `{x: `String`, y: `String`}` | `{x: 'PIXEL', y: 'PIXEL'}` | WCS projection type for both axes
`naxis`| [Point] | `[256, 256]` | Dimensions of the full resolution image in pixels
`nzoom`| Number | `9` | Number of zoom levels in the pyramid
`crpix`| [Point] | `[129, 129]` | Pixel coordinates of the projection center
`crval`| [LatLng] | `[0.0, 0.0]` | World coordinates of the projection center
`cd`| `[[`Number`,`Number`],[`Number`,`Number`]]` | `[[1.0,0.0],[0.0,1.0]]` | Jacobian matrix of the de-projection at the projection center
`natpole`| [LatLng] | `[90.0, 180.0]` | World coordinates of the native pole

###### Public methods
`L.CRS.WCS` provides all the regular `L.CRS` methods plus

Method | Returns | Description
-------|---------|------------
`pixelScale(<Number> zoom, <`[LatLng]`> latlng)` | Number | Return the angular pixel scale at current coordinates and zoom level in degrees

------------

TBC

[Leaflet]: http://leafletjs.com
[IIPImage]: http://iipimage.sourceforge.net
[FITS WCS]: http://fits.gsfc.nasa.gov/fits_wcs.html
[tilelayer-options]: http://leafletjs.com/reference.html#tilelayer-options
[LatLng]: http://leafletjs.com/reference.html#latlng
[Point]: http://leafletjs.com/reference.html#point
