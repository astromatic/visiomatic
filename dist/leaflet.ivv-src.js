/*
#	Copyright:		(C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC
#                        Chiara Marmo - IDES/Paris-Sud,
#                        Ruven Pillay - C2RMF/CNRS
#
#	License:		GNU General Public License
#
#	This Leaflet plug-in is free software: you can redistribute it and/or modify
#	it under the terms of the GNU General Public License as published by
#	the Free Software Foundation, either version 3 of the License, or
# 	(at your option) any later version.
#	This plug-in is distributed in the hope that it will be useful,
#	but WITHOUT ANY WARRANTY; without even the implied warranty of
#	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#	GNU General Public License for more details.
#	You should have received a copy of the GNU General Public License
#	along with this plug-in. If not, see <http://www.gnu.org/licenses/>.
*/

(function (window, document, undefined) {/*
# L.Projection.WCS computes a list of FITS WCS (World Coordinate System)
# (de-)projections (see http://www.atnf.csiro.au/people/mcalabre/WCS/)
#
#	This file part of:	Leaflet-IVV
#
#	Copyright:		(C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#                        Chiara Marmo - IDES/Paris-Sud
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

L.Projection.WCS = {

	// (phi,theta) [rad] -> RA, Dec [deg] for zenithal projections.
	_phiThetaToRADec: function (phiTheta, projparam) {
		var	deg = L.LatLng.DEG_TO_RAD,
			rad = L.LatLng.RAD_TO_DEG,
			t = phiTheta.lat * deg,
			ct = Math.cos(t),
			st = Math.sin(t),
			dp = projparam.celpole.lat * deg,
			cdp = Math.cos(dp),
			sdp = Math.sin(dp),
			dphi = (phiTheta.lng - projparam.natpole.lng) * deg,
			cdphi = Math.cos(dphi);
		return new L.LatLng(Math.asin(st * sdp + ct * cdp * cdphi) * rad,
		 projparam.celpole.lng + Math.atan2(- ct * Math.sin(dphi),
		  st * cdp  - ct * sdp * cdphi) * rad);
	},

	// (RA, Dec) [deg] -> (phi,theta) [rad] for zenithal projections.
	_raDecToPhiTheta: function (raDec, projparam) {
		var	deg = L.LatLng.DEG_TO_RAD,
			rad = L.LatLng.RAD_TO_DEG,
			da = (raDec.lng - projparam.celpole.lng) * deg,
			cda = Math.cos(da),
			sda = Math.sin(da),
			d = raDec.lat * deg,
			cd = Math.cos(d),
			sd = Math.sin(d),
			dp = projparam.celpole.lat * deg,
			cdp = Math.cos(dp),
			sdp = Math.sin(dp);
		return new L.LatLng(Math.asin(sd * sdp + cd * cdp * cda) * rad,
		 projparam.natpole.lng + Math.atan2(- cd * sda,
		    sd * cdp  - cd * sdp * cda) * rad);
	},

	// Convert from pixel to reduced coordinates.
	_pixToRed: function (pix, projparam) {
		var cd = projparam.cd,
		    red = pix.subtract(projparam.crpix);
		return new L.Point(red.x * cd[0][0] + red.y * cd[0][1],
			red.x * cd[1][0] + red.y * cd[1][1]);
	},

	// Convert from reduced to pixel coordinates.
	_redToPix: function (red, projparam) {
		var cdinv = projparam.cdinv;
		return new L.point(red.x * cdinv[0][0] + red.y * cdinv[0][1],
		 red.x * cdinv[1][0] + red.y * cdinv[1][1]).add(projparam.crpix);
	},

	// Compute the CD matrix invert.
	_invertCD: function (cd) {
		var detinv = 1.0 / (cd[0][0] * cd[1][1] - cd[0][1] * cd[1][0]);
		return [[cd[1][1] * detinv, -cd[0][1] * detinv],
		 [-cd[1][0] * detinv, cd[0][0] * detinv]];
	}
};

L.Projection.WCS.zenithal = L.extend({}, L.Projection.WCS, {
	paraminit: function (projparam) {
		projparam.cdinv = this._invertCD(projparam.cd);
		projparam.natfid = new L.LatLng(0.0, 90.0);
		projparam.celpole = projparam.crval;
	},

	project: function (latlng, projparam) { // LatLng [deg] -> Point
		var phiTheta = this._raDecToPhiTheta(latlng, projparam);
		phiTheta.lat = projparam.projection.thetaToR(phiTheta.lat);
		return this._redToPix(this._phiRToRed(phiTheta), projparam);
	},

	unproject: function (point, projparam) { // Point -> LatLng [deg]		
		var  phiTheta = this._redToPhiR(this._pixToRed(point, projparam));
		phiTheta.lat = projparam.projection.rToTheta(phiTheta.lat);
		return this._phiThetaToRADec(phiTheta, projparam);
	},

	// (x, y) ["deg"] -> \phi, r [deg] for zenithal projections.
	_redToPhiR: function (red) {
		return new L.LatLng(Math.sqrt(red.x * red.x + red.y * red.y),
		 Math.atan2(red.x, - red.y) * L.LatLng.RAD_TO_DEG);
	},

	// \phi, r [deg] -> (x, y) ["deg"] for zenithal projections.
	_phiRToRed: function (phiR) {
		var	deg = L.LatLng.DEG_TO_RAD,
			p = phiR.lng * deg;
		return new L.Point(phiR.lat * Math.sin(p), - phiR.lat * Math.cos(p));
	}
});

L.Projection.WCS.TAN = L.extend({}, L.Projection.WCS.zenithal, {
	code: 'TAN',

	rToTheta: function (r) {
		return Math.atan2(180.0, Math.PI * r) * L.LatLng.RAD_TO_DEG;
	},

	thetaToR: function (theta) {
		return 180.0 / Math.PI * Math.tan((90.0 - theta) * L.LatLng.DEG_TO_RAD);
	}
});

L.Projection.WCS.ZEA = L.extend({}, L.Projection.WCS.zenithal, {
	code: 'ZEA',

	rToTheta: function (r) {
		return 90.0 - 2.0 * Math.asin(Math.PI * r / 360.0) * L.LatLng.RAD_TO_DEG;
	},

	thetaToR: function (theta) {
		return 360.0 / Math.PI * Math.sin((90.0 - theta) * 0.5 * L.LatLng.DEG_TO_RAD);
	}

});


/*
# L.CRS.WCS emulates the FITS WCS (World Coordinate System) popular among
# the astronomical community (see http://www.atnf.csiro.au/people/mcalabre/WCS/)
#
#	This file part of:	Leaflet-IVV
#
#	Copyright:		(C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#                        Chiara Marmo - IDES/Paris-Sud
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

L.CRS.WCS = L.extend({}, L.CRS, {
	projparam: {
		projection: L.Projection.WCS.TAN,
		ctype: {x: 'RA--TAN', y: 'DEC--TAN'},
		naxis: new L.point(256, 256, true),
		nzoom: 1,
		crpix: L.point(129, 129),
		crval: L.latLng(0.0, 0.0),		// (\delta_0, \phi_0)
		cd: [[1.0, 0.0], [0.0, 1.0]],
		natpole: L.latLng(90.0, 180.0),	// (\theta_p, \phi_p)
		tileSize: L.point(256, 256),
		celpole: L.latLng(0.0, 0.0),	// (\delta_p, \alpha_p)
		natfid: L.latLng(0.0, 90.0),	// (\theta_0, \phi_0)
		cdinv: [[1.0, 0.0], [0.0, 1.0]],
	},

	initialize: function () {
		var projparam = this.projparam;
		this.transformation = new L.Transformation(1, -1, -1, projparam.naxis.y);
		projparam.projection.paraminit(projparam);
		this.code += ':' + projparam.projection.code;
		this.ready = true;
	},

	code: 'WCS',

	projection: L.Projection.WCS,

	latLngToPoint: function (latlng, zoom) { // (LatLng, Number) -> Point
		if (!this.ready) {
			this.initialize();
		}
		var projectedPoint = this.projparam.projection.project(latlng, this.projparam),
		    scale = this.scale(zoom);
		return this.transformation._transform(projectedPoint, scale);
	},

	pointToLatLng: function (point, zoom) { // (Point, Number[, Boolean]) -> LatLng
		if (!this.ready) {
			this.initialize();
		}
		var scale = this.scale(zoom),
				untransformedPoint = this.transformation.untransform(point, scale);
		return this.projparam.projection.unproject(untransformedPoint, this.projparam);
	},

	project: function (latlng) {
		if (!this.ready) {
			this.initialize();
		}
		return this.projparam.projection.project(latlng, this.projparam);
	},

	scale: function (zoom) {
		return Math.pow(2, zoom - this.projparam.nzoom + 1);
	},

// Return base zoom level at a given resolution for a given tile size
	zoom1: function (point, tileSize) {
		return Math.ceil(Math.log(Math.max(point.x / tileSize.x, point.y / tileSize.y)) / Math.LN2);

	}

});




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


/*
# L.Control.AdjustLayers adjusts the rendering of an IIP layer
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
# derived from the L.Control.ActiveLayers plugin
# (see https://github.com/vogdb/Leaflet.ActiveLayers)
#
#	This file part of:	Leaflet-IVV
#
#	Copyright:		(C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#                        Chiara Marmo - IDES/Paris-Sud
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
L.Control.AdjustLayers = L.Control.Layers.extend({

  /**
* Get currently active base layer on the map
* @return {Object} l where l.name - layer name on the control,
* l.layer is L.TileLayer, l.overlay is overlay layer.
*/
	getActiveBaseLayer: function () {
		return this._activeBaseLayer;
	},

  /**
* Get currently active overlay layers on the map
* @return {{layerId: l}} where layerId is <code>L.stamp(l.layer)</code>
* and l @see #getActiveBaseLayer jsdoc.
*/
	getActiveOverlayLayers: function () {
		return this._activeOverlayLayers;
	},

	onAdd: function (map) {
		var container = L.Control.Layers.prototype.onAdd.call(this, map);

//    this._activeBaseLayer = this._findActiveBaseLayer();
//    this._activeOverlayLayers = this._findActiveOverlayLayers();
		return container;
	},

	_findActiveBaseLayer: function () {
		var layers = this._layers;
		for (var layerId in layers) {
			if (this._layers.hasOwnProperty(layerId)) {
				var layer = layers[layerId];
				if (!layer.overlay && this._map.hasLayer(layer.layer)) {
					return layer;
				}
			}
		}
		throw new Error('Control doesn\'t have any active base layer!');
	},

	_findActiveOverlayLayers: function () {
		var result = {};
		var layers = this._layers;
		for (var layerId in layers) {
			if (this._layers.hasOwnProperty(layerId)) {
				var layer = layers[layerId];
				if (layer.overlay && this._map.hasLayer(layer.layer)) {
					result[layerId] = layer;
				}
			}
		}
		return result;
	},

	_onInputClick: function () {
		var i, input, obj,
			inputs = this._form.getElementsByClassName('leaflet-control-layers-selector'),
			inputsLen = inputs.length,
			baseLayer;

		this._handlingClick = true;

		for (i = 0; i < inputsLen; i++) {
			input = inputs[i];
			obj = this._layers[input.layerId];

			if (input.checked && !this._map.hasLayer(obj.layer)) {
				this._map.addLayer(obj.layer);
				if (!obj.overlay) {
					baseLayer = obj.layer;
					this._activeBaseLayer = obj;
				} else {
					this._activeOverlayLayers[input.layerId] = obj;
				}
			} else if (!input.checked && this._map.hasLayer(obj.layer)) {
				this._map.removeLayer(obj.layer);
				if (obj.overlay) {
					delete this._activeOverlayLayers[input.layerId];
				}
			}
		}

		if (baseLayer) {
			this._map.setZoom(this._map.getZoom());
			this._map.fire('baselayerchange', {layer: baseLayer});
		}

		this._handlingClick = false;
	},

	_addItem: function (obj) {
		var	_this = this;

		var label = document.createElement('div'),
				input,
				checked = this._map.hasLayer(obj.layer);

		if (obj.overlay) {
			input = document.createElement('input');
			input.type = 'checkbox';
			input.className = 'leaflet-control-layers-selector';
			input.defaultChecked = checked;
		} else {
			input = this._createRadioElement('leaflet-base-layers', checked);
		}

		input.layerId = L.stamp(obj.layer);

		L.DomEvent.on(input, 'click', this._onInputClick, this);

		var name = document.createElement('span');
		name.innerHTML = ' ' + obj.name + ' ';
		label.appendChild(input);
		label.appendChild(name);

		if (!obj.overlay) {
			var	mininput = document.createElement('input');
			mininput.className = 'leaflet-minValue';
			mininput.type = 'text';
			mininput.value = String(obj.layer.iipMinValue[0]);
			mininput.layer = obj.layer;
			label.appendChild(mininput);
			L.DomEvent.on(mininput, 'change', function () {
				_this._onInputChange(mininput, 'iipMinValue[0]');
			}, this);

			var	maxinput = document.createElement('input');
			maxinput.className = 'leaflet-minValue';
			maxinput.type = 'text';
			maxinput.value = String(obj.layer.iipMaxValue[0]);
			maxinput.layer = obj.layer;
			label.appendChild(maxinput);
			L.DomEvent.on(maxinput, 'change', function () {
				_this._onInputChange(maxinput, 'iipMaxValue[0]');
			}, this);
		}

		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
		container.appendChild(label);
		return label;
	},

	_onInputChange:	function (input, pname) {
		var pnamearr = pname.split(/\[|\]/);
		if (pnamearr[1]) {
			input.layer[pnamearr[0]][parseInt(pnamearr[1], 10)] = input.value;
		}	else {
			input.layer[pnamearr[0]] = input.value;
		}
		input.layer.redraw();
	}

});

L.control.adjustLayers = function (baseLayers, overlays, options) {
	return new L.Control.AdjustLayers(baseLayers, overlays, options);
};



}(window, document));