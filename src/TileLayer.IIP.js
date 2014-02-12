/*
# L.TileLayer.IIP adds support for IIP layers to Leaflet
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	VisiOmatic
#
#	Copyright:		(C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                        Chiara Marmo - IDES/Paris-Sud,
#                        Ruven Pillay - C2RMF/CNRS
#
#	Last modified:		10/02/2014
*/

L.TileLayer.IIP = L.TileLayer.extend({
	options: {
		title: '',
		minZoom: 0,
		maxZoom: null,
		maxNativeZoom: 18,
		contrast: 1.0,
		gamma: 1.0,
		cMap: 'grey',
		invertCMap: false,
		quality: 90
		/*
		pane: 'tilePane',
		opacity: 1,
		attribution: <String>,
		maxNativeZoom: <Number>,
		zIndex: <Number>,
		bounds: <LatLngBounds>
		unloadInvisibleTiles: L.Browser.mobile,
		updateWhenIdle: L.Browser.mobile,
		updateInterval: 150,
		tms: <Boolean>,
		zoomReverse: <Number>,
		detectRetina: <Number>,
		*/
	},

	iipdefault: {
		contrast: 1,
		gamma: 1,
		cMap: 'grey',
		invertCMap: false,
		minValue: [],
		maxValue: [],
		quality: 90
	},

	initialize: function (url, options) {
		options = L.setOptions(this, options);

		// detecting retina displays, adjusting tileSize and zoom levels
		if (options.detectRetina && L.Browser.retina && options.maxZoom > 0) {

			options.tileSize = Math.floor(options.tileSize / 2);
			options.zoomOffset++;

			options.minZoom = Math.max(0, options.minZoom);
			options.maxZoom--;
		}

		this._url = url.replace(/\&.*$/g, '');

		if (typeof options.subdomains === 'string') {
			options.subdomains = options.subdomains.split('');
		}

		this.iipTileSize = {x: 256, y: 256};
		this.iipImageSize = [];
		this.iipImageSize[0] = this.iipTileSize;
		this.iipGridSize = [];
		this.iipGridSize[0] = {x: 1, y: 1};
		this.iipBPP = 8;
		this.iipMinZoom = this.options.minZoom;
		this.iipMaxZoom = this.options.maxZoom;
		this.iipContrast = this.options.contrast;
		this.iipGamma = this.options.gamma;
		this.iipCMap = this.options.cMap;
		this.iipInvertCMap = this.options.invertCMap;
		this.iipMinValue = [];
		this.iipMinValue[0] = 0.0;
		this.iipMaxValue = [];
		this.iipMaxValue[0] = 255.0;
		this.iipQuality = this.options.quality;

		this._title = options.title.length > 0 ? options.title :
		                this._url.match(/^.*\/(.*)\..*$/)[1];
		this.getIIPMetaData(this._url);
		return this;
	},

	getIIPMetaData: function (url) {
		L.IIPUtils.requestURI(url +
			'&obj=IIP,1.0&obj=max-size&obj=tile-size' +
			'&obj=resolution-number&obj=bits-per-channel' +
			'&obj=min-max-sample-values&obj=subject',
			'getting IIP metadata',
			this._parseMetadata, this);
	},

	_parseMetadata: function (layer, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var response = httpRequest.responseText,
				 matches = layer._readIIPKey(response, 'IIP', L.IIPUtils.REG_PDEC);
				if (!matches) {
					alert('Error: Unexpected response from IIP server ' +
					 layer._url.replace(/\?.*$/g, ''));
				}

				matches = layer._readIIPKey(response, 'Max-size', '(\\d+)\\s+(\\d+)');
				var maxsize = {
					x: parseInt(matches[1], 10),
					y: parseInt(matches[2], 10)
				};
				matches = layer._readIIPKey(response, 'Tile-size', '(\\d+)\\s+(\\d+)');
				layer.iipTileSize = {
					x: parseInt(matches[1], 10),
					y: parseInt(matches[2], 10)
				};

				// Find the lowest and highest zoom levels
				matches = layer._readIIPKey(response, 'Resolution-number', '(\\d+)');
				layer.iipMaxZoom = parseInt(matches[1], 10) - 1;
				layer.iipMinZoom = 0;
				if (layer.iipMinZoom > layer.options.minZoom) {
					layer.options.minZoom = layer.iipMinZoom;
				}
				if (!layer.options.maxZoom) {
					layer.options.maxZoom = layer.iipMaxZoom + 6;
				}
				layer.options.maxNativeZoom = layer.iipMaxZoom;

				// Set grid sizes
				for (var z = 0; z <= layer.iipMaxZoom; z++) {
					layer.iipImageSize[z] = {
						x: Math.floor(maxsize.x / Math.pow(2, layer.iipMaxZoom - z)),
						y: Math.floor(maxsize.y / Math.pow(2, layer.iipMaxZoom - z))
					};
					layer.iipGridSize[z] = {
						x: Math.ceil(layer.iipImageSize[z].x / layer.iipTileSize.x),
						y: Math.ceil(layer.iipImageSize[z].y / layer.iipTileSize.y)
					};
				}
				// (Virtual) grid sizes for extra zooming
				for (z = layer.iipMaxZoom; z <= layer.options.maxZoom; z++) {
					layer.iipGridSize[z] = layer.iipGridSize[layer.iipMaxZoom];
				}

				// Set pixel bpp
				matches = layer._readIIPKey(response, 'Bits-per-channel', '(\\d+)');
				layer.iipBPP = parseInt(matches[1], 10);
				// Only 32bit data are likely to be linearly quantized
				layer.iipGamma = layer.iipBPP >= 32 ? 2.2 : 1.0;

				// Pre-computed Min and max pixel values
				matches = layer._readIIPKey(response, 'Min-Max-sample-values',
				 '\\s*(.*)');
				var str = matches[1].split(/ \s* /),
				    nfloat = (str.length / 2),
				    mmn = 0;
				for (var n = 0; n < nfloat; n++) {
					layer.iipdefault.minValue[n] = layer.iipMinValue[n] =
					 parseFloat(str[mmn++]);
				}
				for (n = 0; n < nfloat; n++) {
					layer.iipdefault.maxValue[n] = layer.iipMaxValue[n] =
					 parseFloat(str[mmn++]);
				}

				if (layer.options.bounds) {
					layer.options.bounds = L.latLngBounds(layer.options.bounds);
				}
				layer.wcs = new L.CRS.WCS(response, {
					nzoom: layer.iipMaxZoom + 1,
					tileSize: layer.iipTileSize,
					// Center on image if WCS is in pixels
					crval: L.latLng((maxsize.y + 1.0) / 2.0, (maxsize.x + 1.0) / 2.0)
				});
				layer.iipMetaReady = true;
				layer.fire('metaload');
			} else {
				alert('There was a problem with the IIP metadata request.');
			}
		}
	},

	_readIIPKey: function (str, keyword, regexp) {
		var reg = new RegExp(keyword + ':' + regexp);
		return reg.exec(str);
	},

	addTo: function (map) {
		if (this.iipMetaReady) {
			// IIP data are ready so we can go
			this._addToMap(map);
		}
		else {
			// Wait for metadata request to complete
			this.once('metaload', function () {
				this._addToMap(map);
			}, this);
		}
		return this;
	},

	_addToMap: function (map) {
		var center, zoom;
		if (map._prevcrs && this.wcs !== map.options.crs && map._loaded) {
			center = map.getCenter();
			zoom = map.getZoom();
		} else {
			center = map.options.center ? map.options.center : this.wcs.projparam.crval;
			zoom = 1;
		}
		map._prevcrs = map.options.crs = this.wcs;
		map.setView(center, zoom, {reset: true, animate: false});
		L.TileLayer.prototype.addTo.call(this, map);
	},

	_resetWrap: function () {
		var map = this._map,
		    crs = map.options.crs;

		if (crs.infinite) { return; }

		var tileSize = this._getTileSize();

		if (crs.wrapLng) {
			this._wrapLng = [
				Math.floor(map.project([0, crs.wrapLng[0]]).x / tileSize.x),
				Math.ceil(map.project([0, crs.wrapLng[1]]).x / tileSize.x)
			];
		}

		if (crs.wrapLat) {
			this._wrapLat = [
				Math.floor(map.project([crs.wrapLat[0], 0]).y / tileSize.y),
				Math.ceil(map.project([crs.wrapLat[1], 0]).y / tileSize.y)
			];
		}
	},

	_getTileSizeFac: function () {
		var	map = this._map,
			zoom = map.getZoom(),
			zoomN = this.options.maxNativeZoom;
		return (zoomN && zoom > zoomN) ?
				Math.round(map.getZoomScale(zoom) / map.getZoomScale(zoomN)) : 1;
	},

	_getTileSize: function () {
		var zoomfac = this._getTileSizeFac();
		return {x: this.iipTileSize.x * zoomfac, y: this.iipTileSize.y * zoomfac};
	},

	_isValidTile: function (coords) {
		var z = this._getZoomForUrl();
		if (coords.x < 0 || coords.x >= this.iipGridSize[z].x ||
			coords.y < 0 || coords.y >= this.iipGridSize[z].y) {
			return false;
		}
		var crs = this._map.options.crs;

		if (!crs.infinite) {
			// don't load tile if it's out of bounds and not wrapped
			var bounds = this._tileNumBounds;
			if ((!crs.wrapLng && (coords.x < bounds.min.x || coords.x > bounds.max.x)) ||
			    (!crs.wrapLat && (coords.y < bounds.min.y || coords.y > bounds.max.y))) { return false; }
		}

		if (!this.options.bounds) { return true; }

		// don't load tile if it doesn't intersect the bounds in options
		var tileBounds = this._tileCoordsToBounds(coords);
		return L.latLngBounds(this.options.bounds).intersects(tileBounds);
	},

	_update: function () {

		if (!this._map) { return; }

		var map = this._map,
			bounds = map.getPixelBounds(),
			zoom = map.getZoom(),
		  tileSize = this._getTileSize();

		if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
			return;
		}

		var tileBounds = L.bounds(
			this._vecDiv(bounds.min.clone(), tileSize)._floor(),
			this._vecDiv(bounds.max.clone(), tileSize)._floor()
		);

		this._addTiles(tileBounds);

		if (this.options.unloadInvisibleTiles) {
			this._removeOtherTiles(tileBounds);
		}
	},

	_vecDiv: function (coords, vec) {
		coords.x /= vec.x;
		coords.y /= vec.y;
		return coords;
	},

	_vecMul: function (coords, vec) {
		coords.x *= vec.x;
		coords.y *= vec.y;
		return coords;
	},

	_getTilePos: function (coords) {
		return this._vecMul(coords.clone(),
		 this._getTileSize()).subtract(this._map.getPixelOrigin());
	},

	getTileUrl: function (coords) {
		var str = this._url,
				z = this._getZoomForUrl();
		if (this.iipCMap !== this.iipdefault.cMap) {
			str += '&CMP=' + this.iipCMap;
		}
		if (this.iipInvertCMap !== this.iipdefault.invertCMap) {
			str += '&INV';
		}
		if (this.iipContrast !== this.iipdefault.contrast) {
			str += '&CNT=' + this.iipContrast.toString();
		}
		if (this.iipGamma !== this.iipdefault.gamma) {
			str += '&GAM=' + (1.0 / this.iipGamma).toFixed(4);
		}
		if (this.iipMinValue[0] !== this.iipdefault.minValue[0] ||
		 this.iipMaxValue[0] !== this.iipdefault.maxValue[0]) {
			str += '&MINMAX=1,' + this.iipMinValue[0].toString() + ',' +
				this.iipMaxValue[0].toString();
		}
		if (this.iipQuality !== this.iipdefault.quality) {
			str += '&QLT=' + this.iipQuality.toString();
		}
		return str + '&JTL=' + (z - this.iipMinZoom).toString() + ',' +
		 (coords.x + this.iipGridSize[z].x * coords.y).toString();
	},

	_initTile: function (tile) {
		L.DomUtil.addClass(tile, 'leaflet-tile');

		// Force pixels to be visible at high zoom factos whenever possible
		if (this._getTileSizeFac() > 1) {
			var tileSize = this._getTileSize();
			if (L.Browser.ie) {
				tile.style.msInterpolationMode = 'nearest-neighbor';
			} else if (L.Browser.chrome) {
				tile.style.imageRendering = '-webkit-optimize-speed';
			} else {
				tile.style.imageRendering = '-moz-crisp-edges';
			}
			tile.style.width = tileSize.x + 'px';
			tile.style.height = tileSize.y + 'px';
		}
		tile.onselectstart = L.Util.falseFn;
		tile.onmousemove = L.Util.falseFn;

		// update opacity on tiles in IE7-8 because of filter inheritance problems
		if (L.Browser.ielt9 && this.options.opacity < 1) {
			L.DomUtil.setOpacity(tile, this.options.opacity);
		}

		// without this hack, tiles disappear after zoom on Chrome for Android
		// https://github.com/Leaflet/Leaflet/issues/2078
		if (L.Browser.mobileWebkit3d) {
			tile.style.WebkitBackfaceVisibility = 'hidden';
		}
	}

});

L.tileLayer.iip = function (url, options) {
	return new L.TileLayer.IIP(url, options);
};
