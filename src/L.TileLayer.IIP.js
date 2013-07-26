/*
# L.TileLayer.IIP adds support for IIP layers to Leaflet
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	Leaflet-IVV
#
#	Copyright:		(C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#                        Chiara Marmo - IDES/Paris-Sud,
#                        Ruven Pillay - C2RMF/CNRS
#
#	License:		GNU General Public License
#
#	This code is free software: you can redistribute it and/or modify
#	it under the terms of the GNU General Public License as published by
#	the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#	This code is distributed in the hope that it will be useful,
#	but WITHOUT ANY WARRANTY; without even the implied warranty of
#	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#	GNU General Public License for more details.
#	You should have received a copy of the GNU General Public License
#	along with this code. If not, see <http://www.gnu.org/licenses/>.
#
#	Last modified:		26/07/2013
*/

L.TileLayer.IIP = L.TileLayer.extend({
	options: {
		minZoom: 0,
		maxZoom: 18,
		continuousWorld: false,
		noWrap:	true,
		contrast: 1.0,
		gamma: 1.0,
		/*
		maxNativeZoom: null,
		zIndex: null,
		tms: false,
		continuousWorld: false,
		noWrap: false,
		zoomReverse: false,
		detectRetina: false,
		reuseTiles: false,
		bounds: false,
		*/
		unloadInvisibleTiles: L.Browser.mobile,
		updateWhenIdle: L.Browser.mobile
	},

	initialize: function (url, options) {
		options = L.setOptions(this, options);

		// detecting retina displays, adjusting tileSize and zoom levels

		if (options.detectRetina && L.Browser.retina && options.maxZoom > 0) {

			options.tileSize = Math.floor(options.tileSize / 2);
			options.zoomOffset++;

			if (options.minZoom > 0) {
				options.minZoom--;
			}
			this.options.maxZoom--;
		}

		this._url = url;

		var subdomains = this.options.subdomains;

		if (typeof subdomains === 'string') {
			this.options.subdomains = subdomains.split('');
		}
		this.iipTileSize = {x: 512, y: 512};
		this.iipImageSize = [];
		this.iipImageSize[0] = this.iipTileSize;
		this.iipGridSize = [];
		this.iipGridSize[0] = {x: 1, y: 1};
		this.iipMinZoom = this.iipMaxZoom = 0;
		this.iipContrast = this.options.contrast;
		this.iipGamma = this.options.gamma;
		this.iipMinValue = [];
		this.iipMaxValue = [];
		this.iipMinValue[0] = 0.0;
		this.iipMaxValue[0] = 255.0;
		this.getIIPMetaData(url);
	},

	getIIPMetaData: function (url) {

		var httpRequest;
		var _this = this;

		function _getRequest() {
			if (httpRequest.readyState === 4) {
				if (httpRequest.status === 200) {
					var response = httpRequest.responseText;
					var tmp = response.split('Max-size');
					if (!tmp[1]) {
						alert('Error: Unexpected response from IIP server ' + _this.server);
					}
					var size = tmp[1].split(' ');
					var maxsize = {
						x: parseInt(size[0].substring(1, size[0].length), 10),
						y: parseInt(size[1], 10)
					};
					tmp = response.split('Tile-size');
					size = tmp[1].split(' ');
					_this.iipTileSize = {
						x: parseInt(size[0].substring(1, size[0].length), 10),
						y: parseInt(size[1], 10)
					};
					tmp = response.split('Resolution-number');
					var maxzoom = parseInt(tmp[1].substring(1, tmp[1].length), 10) - 1;
					// Find the lowest and highest zoom levels
					var gridsize = {x: 2, y: 2};
					for (var z = 0; z <= maxzoom && gridsize.x > 1 && gridsize.y > 1; z++) {
						var imagesize = {
							x: Math.floor(maxsize.x / Math.pow(2, maxzoom + z)),
							y: Math.floor(maxsize.y / Math.pow(2, maxzoom + z))
						};
						gridsize = {
							x: Math.ceil(imagesize.x / _this.iipTileSize.x),
							y: Math.ceil(imagesize.y / _this.iipTileSize.y)
						};
					}
					_this.iipMinZoom = z - 1;
					if (_this.iipMinZoom > _this.options.minZoom) {
						_this.options.minZoom = _this.iipMinZoom;
					}
					_this.iipMaxZoom = _this.iipMinZoom + maxzoom;
					if (!_this.options.maxZoom) {
						_this.options.maxZoom = _this.iipMaxZoom + 2;
					}
					if (!_this.options.maxNativeZoom) {
						_this.options.maxNativeZoom = _this.iipMaxZoom;
					}
					// Set grid sizes
					for (z = 0; z <= _this.iipMaxZoom; z++) {
						_this.iipImageSize[z] = {
							x: Math.floor(maxsize.x / Math.pow(2, _this.iipMaxZoom - z)),
							y: Math.floor(maxsize.y / Math.pow(2, _this.iipMaxZoom - z))
						};
						_this.iipGridSize[z] = {
							x: Math.ceil(_this.iipImageSize[z].x / _this.iipTileSize.x),
							y: Math.ceil(_this.iipImageSize[z].y / _this.iipTileSize.y)
						};
					}
					for (z = _this.iipMaxZoom; z <= _this.options.maxZoom; z++) {
						_this.iipGridSize[z] = _this.iipGridSize[_this.iipMaxZoom];
					}
					tmp = response.split('Min-Max-sample-values:');
					if (!tmp[1]) {
						alert('Error: Unexpected response from server ' + this.server);
					}
					var minmax = tmp[1].split(' ');
					var arraylen = Math.floor(minmax.length / 2);
					var n = 0;
					for (var l = 0; l < minmax.length, n < arraylen; l++) {
						if (minmax[l] !== '') {
							_this.iipMinValue[n] = parseFloat(minmax[l]);
							n++;
						}
					}
					var nn = 0;
					for (var ll = l; ll < minmax.length; ll++) {
						if (minmax[l] !== '') {
							_this.iipMaxValue[nn] = parseFloat(minmax[l]);
							nn++;
						}
					}

					if (_this.options.bounds) {
						_this.options.bounds = L.latLngBounds(_this.options.bounds);
					}
					_this.iipMetaReady = true;
					_this.fire('metaload');
				} else {
					alert('There was a problem with the IIP metadata request.');
				}
			}
		}

		if (window.XMLHttpRequest) { // Mozilla, Safari, ...
			httpRequest = new XMLHttpRequest();
		} else if (window.ActiveXObject) { // IE
			try {
				httpRequest = new ActiveXObject('Msxml2.XMLHTTP');
			}
			catch (e) {
				try {
					httpRequest = new ActiveXObject('Microsoft.XMLHTTP');
				}
				catch (e) {}
			}
		}
		if (!httpRequest) {
			alert('Giving up: Cannot create an XMLHTTP instance for getting IIP metadata');
			return false;
		}
		httpRequest.onreadystatechange = _getRequest;
		httpRequest.open('GET', url.replace(/\&.*$/g, '') +
			'&obj=IIP,1.0&obj=Max-size&obj=Tile-size' +
			'&obj=Resolution-number&obj=Min-Max-sample-values');
		httpRequest.send();
	},

	addTo: function (map) {
		if (this.iipMetaReady) {
			// IIP data are ready so we can go
			map.addLayer(this);
		}
		else {
			// Store map as _premap and wait for metadata request to complete
			this._premap = map;
			this.once('metaload', this._addToMap, this);
		}
		return this;
	},

	_addToMap: function () {
		this._premap.addLayer(this);
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

		this._addTilesFromCenterOut(tileBounds);

		if (this.options.unloadInvisibleTiles || this.options.reuseTiles) {
			this._removeOtherTiles(tileBounds);
		}
	},

	_vecDiv: function (tilePoint, vec) {
		tilePoint.x /= vec.x;
		tilePoint.y /= vec.y;
		return tilePoint;
	},

	_vecMul: function (tilePoint, vec) {
		tilePoint.x *= vec.x;
		tilePoint.y *= vec.y;
		return tilePoint;
	},

	_tileShouldBeLoaded: function (tilePoint) {
		if ((tilePoint.x + ':' + tilePoint.y) in this._tiles) {
			return false; // already loaded
		}
		var z = this._getZoomForUrl();
		if (tilePoint.x >= this.iipGridSize[z].x ||
			tilePoint.y >= this.iipGridSize[z].y) {
			return false;
		}

		var options = this.options;

		if (!options.continuousWorld) {
			var limit = this._getWrapTileNum();

			// don't load if exceeds world bounds
			if ((options.noWrap && (tilePoint.x < 0 || tilePoint.x >= limit)) ||
				tilePoint.y < 0 || tilePoint.y >= limit) { return false; }
		}

		if (options.bounds) {
			var tileSize = this.iipTileSize,
			    nwPoint = this._vecMul(tilePoint.clone(), tileSize),
			    sePoint = nwPoint.add(tileSize),
			    nw = this._map.unproject(nwPoint),
			    se = this._map.unproject(sePoint);

			// TODO temporary hack, will be removed after refactoring projections
			// https://github.com/Leaflet/Leaflet/issues/1618
			if (!options.continuousWorld && !options.noWrap) {
				nw = nw.wrap();
				se = se.wrap();
			}

			if (!options.bounds.intersects([nw, se])) { return false; }
		}

		return true;
	},

	_getTilePos: function (tilePoint) {
		var origin = this._map.getPixelOrigin(),
		    tileSize = this._getTileSize();

		return this._vecMul(tilePoint.clone(), tileSize).subtract(origin);
	},

	getTileUrl: function (tilePoint) {
		return L.Util.template(this._url, L.extend({
			s: this._getSubdomain(tilePoint),
			z: tilePoint.z - this.iipMinZoom,
			c: this.iipContrast,
			g: this.iipGamma,
			m: this.iipMinValue,
			M: this.iipMaxValue,
			t: tilePoint.x + this.iipGridSize[tilePoint.z].x * tilePoint.y
		}, this.options));
	},

	_createTile: function () {
		var tile = L.DomUtil.create('img', 'leaflet-tile');
		if (this._getTileSizeFac() > 1) {
			var tileSize = this._getTileSize();
			if (L.Browser.ie) {
				tile.style.msInterpolationMode = 'nearest-neighbor';
			} else if (L.Browser.chrome) {
				tile.style.imageRendering = '-webkit-optimize-speed';
			} else {
				tile.style.imageRendering = '-moz-crisp-edges';
			}

			// TODO:needs to handle incomplete tiles beyond MaxNativeZoom
			tile.style.width = tileSize.x + 'px';
			tile.style.height = tileSize.y + 'px';
		}
		tile.galleryimg = 'no';

		tile.onselectstart = tile.onmousemove = L.Util.falseFn;

		if (L.Browser.ielt9 && this.options.opacity !== undefined) {
			L.DomUtil.setOpacity(tile, this.options.opacity);
		}
		return tile;
	}
});

L.tileLayer.iip = function (url, options) {
	return new L.TileLayer.IIP(url, options);
};
