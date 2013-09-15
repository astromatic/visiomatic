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
		cMap: 'grey',
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

	iip: {
		TileSize: {x: 512, y: 512},
		ImageSize: [],
		GridSize: [],
		BPP: 8,
		MinZoom: 0,
		MaxZoom: 0,
		Contrast: 1,
		Gamma: 1,
		CMap: 'grey',
		MinValue: [],
		MaxValue: []
	},

	iipdefault: {
		Contrast: 1,
		Gamma: 1,
		CMap: 'grey',
		MinValue: [],
		MaxValue: []
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

		this._url = url.replace(/\&.*$/g, '');

		var subdomains = this.options.subdomains;

		if (typeof subdomains === 'string') {
			this.options.subdomains = subdomains.split('');
		}
		this.iip.ImageSize[0] = this.iip.TileSize;
		this.iip.GridSize[0] = {x: 1, y: 1};
		this.iip.Contrast = this.options.contrast;
		this.iip.Gamma = this.options.gamma;
		this.iip.MinValue[0] = 0.0;
		this.iip.MaxValue[0] = 255.0;
		this.getIIPMetaData(this._url);
	},

	getIIPMetaData: function (url) {
		this.requestURI(url +
			'&obj=IIP,1.0&obj=max-size&obj=tile-size' +
			'&obj=resolution-number&obj=bits-per-channel' +
			'&obj=min-max-sample-values',
			'getting IIP metadata',
			this._parseMetadata, this);
	},

	requestURI: function (uri, purpose, action) {
		var	context = this,
			httpRequest;

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
			alert('Giving up: Cannot create an XMLHTTP instance for ' + purpose);
			return false;
		}
		httpRequest.onreadystatechange = function () {
			action(context, httpRequest);
		};
		httpRequest.open('GET', uri);
		httpRequest.send();
	},

	_parseMetadata: function (layer, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var response = httpRequest.responseText;
				var tmp = response.split('Max-size');
				if (!tmp[1]) {
					alert('Error: Unexpected response from IIP server ' +
					 layer._url.replace(/\?.*$/g, ''));
				}
				var size = tmp[1].split(' ');
				var maxsize = {
					x: parseInt(size[0].substring(1, size[0].length), 10),
					y: parseInt(size[1], 10)
				};
				tmp = response.split('Tile-size');
				size = tmp[1].split(' ');
				layer.iip.TileSize = {
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
						x: Math.ceil(imagesize.x / layer.iip.TileSize.x),
						y: Math.ceil(imagesize.y / layer.iip.TileSize.y)
					};
				}
				layer.iip.MinZoom = z - 1;
				if (layer.iip.MinZoom > layer.options.minZoom) {
					layer.options.minZoom = layer.iip.MinZoom;
				}
				layer.iip.MaxZoom = layer.iip.MinZoom + maxzoom;
				if (!layer.options.maxZoom) {
					layer.options.maxZoom = layer.iip.MaxZoom + 2;
				}
				if (!layer.options.maxNativeZoom) {
					layer.options.maxNativeZoom = layer.iip.MaxZoom;
				}
				// Set grid sizes
				for (z = 0; z <= layer.iip.MaxZoom; z++) {
					layer.iip.ImageSize[z] = {
						x: Math.floor(maxsize.x / Math.pow(2, layer.iip.MaxZoom - z)),
						y: Math.floor(maxsize.y / Math.pow(2, layer.iip.MaxZoom - z))
					};
					layer.iip.GridSize[z] = {
						x: Math.ceil(layer.iip.ImageSize[z].x / layer.iip.TileSize.x),
						y: Math.ceil(layer.iip.ImageSize[z].y / layer.iip.TileSize.y)
					};
				}
				for (z = layer.iip.MaxZoom; z <= layer.options.maxZoom; z++) {
					layer.iip.GridSize[z] = layer.iip.GridSize[layer.iip.MaxZoom];
				}
				tmp = response.split('Bits-per-channel');
				layer.iip.BPP = parseInt(tmp[1].substring(1, tmp[1].length), 10);
				// Only 32bit data are likely to be linearly quantized
				layer.iip.Gamma = layer.iip.BPP >= 32 ? 0.45 : 1.0;
				tmp = response.split('Min-Max-sample-values:');
				if (!tmp[1]) {
					alert('Error: Unexpected response from server ' + this.server);
				}
				var minmax = tmp[1].split(' ');
				var arraylen = Math.floor(minmax.length / 2);
				var n = 0;
				for (var l = 0; l < minmax.length, n < arraylen; l++) {
					if (minmax[l] !== '') {
						layer.iipdefault.MinValue[n] = layer.iip.MinValue[n] = parseFloat(minmax[l]);
						n++;
					}
				}
				var nn = 0;
				for (var ll = l; ll < minmax.length; ll++) {
					if (minmax[l] !== '') {
						layer.iipdefault.MaxValue[nn] = layer.iip.MaxValue[nn] = parseFloat(minmax[l]);
						nn++;
					}
				}

				if (layer.options.bounds) {
					layer.options.bounds = L.latLngBounds(layer.options.bounds);
				}
				layer.iip.MetaReady = true;
				layer.fire('metaload');
			} else {
				alert('There was a problem with the IIP metadata request.');
			}
		}
	},

	addTo: function (map) {
		if (this.iip.MetaReady) {
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
		this._premap = undefined;
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
		return {x: this.iip.TileSize.x * zoomfac, y: this.iip.TileSize.y * zoomfac};
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
		if (tilePoint.x >= this.iip.GridSize[z].x ||
			tilePoint.y >= this.iip.GridSize[z].y) {
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
			var tileSize = this.iip.TileSize,
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
		var str = this._url;
		if (this.iip.CMap !== this.iipdefault.CMap) {
			str += '&CMP=' + this.iip.CMap;
		}
		if (this.iip.Contrast !== this.iipdefault.Contrast) {
			str += '&CNT=' + this.iip.Contrast.toString();
		}
		if (this.iip.Gamma !== this.iipdefault.Gamma) {
			str += '&GAM=' + this.iip.Gamma.toString();
		}
		if (this.iip.MinValue[0] !== this.iipdefault.MinValue[0] ||
		 this.iip.MaxValue[0] !== this.iipdefault.MaxValue[0]) {
			str += '&MINMAX=1,' + this.iip.MinValue[0].toString() + ',' +
				this.iip.MaxValue[0].toString();
		}
		return str + '&JTL=' + (tilePoint.z - this.iip.MinZoom).toString() + ',' +
		 (tilePoint.x + this.iip.GridSize[tilePoint.z].x * tilePoint.y).toString();
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
