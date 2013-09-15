/*
#	Copyright:    (C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC
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

/*
# L.Projection.WCS computes a list of FITS WCS (World Coordinate System)
# (de-)projections (see http://www.atnf.csiro.au/people/mcalabre/WCS/)
#
#	This file part of:	Leaflet-IVV
#
#	Copyright: (C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
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
#	Copyright: (C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
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
	},

// Distance between p1 and p2 in degrees
	distance: function (p1, p2) {

		var d2r = L.LatLng.DEG_TO_RAD,
		 lat1 = p1.lat * d2r,
		 lat2 = p2.lat * d2r,
		 dLat = lat2 - lat1,
		 dLon = (p2.lng - p1.lng) * d2r,
		 sin1 = Math.sin(dLat / 2),
		 sin2 = Math.sin(dLon / 2);

		var a = sin1 * sin1 + sin2 * sin2 * Math.cos(lat1) * Math.cos(lat2);

		return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * L.LatLng.RAD_TO_DEG;
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


/*
# L.Control.IIP adjusts the rendering of an IIP layer
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	Leaflet-IVV
#
#	Copyright: (C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		01/09/2013
*/
L.Control.IIP = L.Control.extend({
	options: {
		title: 'a control related to IIPImage',
		collapsed: true,
		position: 'topleft'
	},

	initialize: function (baseLayers,  options) {
		L.setOptions(this, options);
		this._className = 'leaflet-control-iipimage';
		this._layers = baseLayers;
	},

	onAdd: function (map) {
		var className = this._className,
			container = this._container = L.DomUtil.create('div', className + ' leaflet-bar');
		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		if (!L.Browser.touch) {
			L.DomEvent.disableClickPropagation(container);
			L.DomEvent.on(container, 'mousewheel', L.DomEvent.stopPropagation);
		} else {
			L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
		}

		this._dialog = L.DomUtil.create('div', className + '-dialog', container);
		if (this.options.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent
				    .on(container, 'mouseover', this._expand, this)
				    .on(container, 'mouseout', this._collapse, this);
			}

			var link = this._link = L.DomUtil.create('a', className + '-button leaflet-bar', container);
			link.href = '#';
			link.title = this.options.title;

			if (L.Browser.touch) {
				L.DomEvent
				    .on(link, 'click', L.DomEvent.stop)
				    .on(link, 'click', this._expand, this);
			}
			else {
				L.DomEvent.on(link, 'focus', this._expand, this);
			}

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility
		} else {
			this._expand();
		}

		this._checkLayer();

		return	this._container;
	},

	_checkLayer: function () {
		var layer = this._layer = this._findActiveBaseLayer();
		if (layer) {
			this._initDialog();
		} else if (this._prelayer) {
			// Layer metadata are not ready yet: listen for 'metaload' event
			this._prelayer.once('metaload', this._checkLayer, this);
		}
	},

	_initDialog: function () {
		var className = this._className,
			container = this._container,
			dialog = this._dialog,
			link = this._link,
			layer = this._layer;
    // Setup the rest of the dialog window here
	},

	_expand: function () {
		L.DomUtil.addClass(this._container, this._className + '-expanded');
	},

	_collapse: function () {
		this._container.className = this._container.className.replace(' ' + this._className + '-expanded', '');
	},

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

	_findActiveBaseLayer: function () {
		var layers = this._layers;
		this._prelayer = undefined;
		for (var layername in layers) {
			var layer = layers[layername];
			if (!layer.overlay) {
				if (layer._premap) {
					this._prelayer = layer;
				} else if (this._map.hasLayer(layer) && layer.iip) {
					return layer;
				}
			}
		}
		return undefined;
	},

	_onInputChange:	function (input, pname, value) {
		var pnamearr = pname.split(/\[|\]/);
		if (pnamearr[1]) {
			input.layer.iip[pnamearr[0]][parseInt(pnamearr[1], 10)] = value;
		}	else {
			input.layer.iip[pnamearr[0]] = value;
		}
		input.layer.redraw();
	}

});

L.control.iip = function (baseLayers, options) {
	return new L.Control.IIP(baseLayers, options);
};



/*
# L.Control.IIP.image adjusts the rendering of an IIP layer
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	Leaflet-IVV
#
#	Copyright:		(C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#				         Chiara Marmo - IDES/Paris-Sud
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
#	Last modified:		14/09/2013
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery-browser');
}

L.Control.IIP.Image = L.Control.IIP.extend({
	options: {
		title: 'Image adjustment',
		collapsed: true,
		cmap: 'grey',
		position: 'topleft',
	},

	initialize: function (baseLayers,  options) {
		L.setOptions(this, options);
		this._className = 'leaflet-control-iipimage';
		this._layers = baseLayers;
	},

	_initDialog: function () {

		var _this = this,
			className = this._className,
			dialog = this._dialog,
			layer = this._layer,
			cmaps = ['grey', 'jet', 'cold', 'hot'],
			elem;

		// Colour lookup table (Colour maps)
		elem = this._addDialogLine('LUT:');
		var cmapinput = L.DomUtil.create('span', className + '-cmaps', elem);
		for (var i in cmaps) {
			var	button = document.createElement('input');
			button.className = 'leaflet-cmap-' + cmaps[i];
			button.type = 'button';
			button.name = 'button';
			button.cmap = cmaps[i];
			button.layer = layer;
			cmapinput.appendChild(button);
			if (cmaps[i] === this.options.cmap) {
				button.checked = 'checked';
			}
		}

		$('.' + className + '-cmaps').buttonset();
		$('.' + className + '-cmaps :button').click(function (e) {
			_this._onInputChange(this, 'CMap', this.cmap);
		});

		this._separator = L.DomUtil.create('div', className + '-separator', dialog);

		// Min and max pixel values
		var step = ((layer.iip.MaxValue[0] - layer.iip.MinValue[0]) / 100.0).toPrecision(1);

		// Min
		elem = this._addDialogLine('Min:');
		var	mininput = L.DomUtil.create('input', '', elem);
		mininput.id = 'leaflet-minvalue';
		mininput.type = 'text';
		mininput.value = String(layer.iip.MinValue[0]);
		mininput.layer = layer;
		$('#leaflet-minvalue').spinner({
			stop: function (event, ui) {
				_this._onInputChange(mininput, 'MinValue[0]', mininput.value);
			},
			icons: { down: 'icon-minus', up: 'icon-plus' },
			step: step
		});
		L.DomEvent.on(mininput, 'change', function () {
			_this._onInputChange(mininput, 'MinValue[0]', mininput.value);
		}, this);

		// Max
		elem = this._addDialogLine('Max:');
		var	maxinput = L.DomUtil.create('input', '', elem);
		maxinput.id = 'leaflet-maxvalue';
		maxinput.type = 'text';
		maxinput.value = String(layer.iip.MaxValue[0]);
		maxinput.layer = layer;
		$('#leaflet-maxvalue').spinner({
			stop: function (event, ui) {
				_this._onInputChange(maxinput, 'MaxValue[0]', maxinput.value);
			},
			icons: { down: 'icon-minus', up: 'icon-plus' },
			step: step
		});
		L.DomEvent.on(maxinput, 'change', function () {
			_this._onInputChange(maxinput, 'MaxValue[0]', maxinput.value);
		}, this);

		// Gamma
		elem = this._addDialogLine('Gamma:');
		var	gaminput = L.DomUtil.create('input', 'leaflet-slider-input', elem);
		gaminput.type = 'text';
		gaminput.value = String(layer.iip.Gamma);
		gaminput.layer = layer;
		var	gamslider = L.DomUtil.create('span', '', elem);
		gamslider.id = 'leaflet-gamma-slider';
		$('#leaflet-gamma-slider').slider({
			stop: function (event, ui) {
				_this._onInputChange(gaminput, 'Gamma', ui.value);
			},
			slide: function (event, ui) {
				gaminput.value = ui.value;
			},
			value: String(layer.iip.Gamma),
			step: 0.05,
			min: 0.05,
			max: 2.0
		});
		L.DomEvent.on(gaminput, 'change', function () {
			_this._onInputChange(gaminput, 'Gamma', gaminput.value);
			$('#leaflet-gamma-slider').slider('value', gaminput.value);
		}, this);

		// Contrast
		elem = this._addDialogLine('Contrast:');
		var	continput = L.DomUtil.create('input', 'leaflet-slider-input', elem);
		continput.type = 'text';
		continput.value = String(layer.iip.Contrast);
		continput.layer = layer;
		var	contslider = L.DomUtil.create('span', '', elem);
		contslider.id = 'leaflet-contrast-slider';
		$('#leaflet-contrast-slider').slider({
			stop: function (event, ui) {
				_this._onInputChange(continput, 'Contrast', ui.value);
			},
			slide: function (event, ui) {
				continput.value = ui.value;
			},
			value: String(layer.iip.Contrast),
			step: 0.05,
			min: 0.05,
			max: 4.0
		});
		L.DomEvent.on(continput, 'change', function () {
			_this._onInputChange(continput, 'Contrast', continput.value);
			$('#leaflet-contrast-slider').slider('value', continput.value);
		}, this);
	},

	_addDialogLine: function (label) {
		var elem = L.DomUtil.create('div', this._className + '-element', this._dialog),
		 text = L.DomUtil.create('span', this._className + '-label', elem);
		text.innerHTML = label;
		return elem;
	}
});

L.control.iip.image = function (baseLayers, options) {
	return new L.Control.IIP.Image(baseLayers, options);
};



/*
# L.Control.IIP.Plot manages plots related to IIP layers
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	Leaflet-IVV
#
#	Copyright: (C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#	                    Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		05/09/2013
*/

L.Draw.Line = L.Draw.Polyline.extend({
	_updateFinishHandler: function () {
		var markerCount = this._markers.length;
		// The last marker should have a click handler to close the polyline
		if (markerCount > 1) {
			this._markers[markerCount - 1].on('click', this._finishShape, this);
		}

		// Remove the old marker click handler (as only the last point should close the polyline)
		if (markerCount > 2) {
			this._markers[markerCount - 2].off('click', this._finishShape, this);
		}

		if (markerCount >= 2) {
			this._finishShape();
		}
	},

	_getMeasurementString: function () {
		var currentLatLng = this._currentLatLng,
		 previousLatLng = this._markers[this._markers.length - 1].getLatLng(),
		 distance, distanceStr, unit;

		// calculate the distance from the last fixed point to the mouse position
		distance = this._measurementRunningTotal + L.CRS.WCS.distance(currentLatLng, previousLatLng);

		if (distance >= 1.0) {
			unit = '&#176;';
		} else {
			distance *= 60.0;
			if (distance >= 1.0) {
				unit = '&#39;';
			} else {
				distance *= 60.0;
				unit = '&#34;';
			}
		}
		distanceStr = distance.toFixed(2) + unit;

		return distanceStr;
	}

});

L.Control.IIP.Plot = L.Control.IIP.extend({
	options: {
		title: 'Image adjustment',
		collapsed: true,
		position: 'topleft',
	},

	initialize: function (baseLayers,  options) {
		L.setOptions(this, options);
		this._className = 'leaflet-control-iipplot';
		this._layers = baseLayers;
	},

	_initDialog: function () {
		var className = this._className,
			dialog = this._dialog,
			layer = this._layer;
		this._profile = L.DomUtil.create('div', className + '-profile', dialog);
		var	profinput = document.createElement('input');
		profinput.className = 'leaflet-profile';
		profinput.type = 'button';
		profinput.layer = layer;
		this._profile.appendChild(profinput);
		L.DomEvent.on(profinput, 'click', this.getProfile, this);
	},

	getProfile: function (e) {
		L.drawLocal.draw.handlers.polyline.tooltip.cont = 'Click to end drawing line.';
		var drawline = new L.Draw.Line(this._map),
		 _this = this;

		this._map.on('draw:created', function (e) {
			var layer = e.layer;
			_this._map.addLayer(layer);
			drawline.removeHooks();
			console.log(layer._latlngs);
		}

		);
		drawline.addHooks();

		this._layer.requestURI(this._layer._url.replace(/\&.*$/g, '') +
			'&PFL=9:20,100-9000,2000',
			'getting IIP layer profile',
			this._parseProfile, this);
	},

	_parseProfile: function (plot, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var response = httpRequest.responseText;
			}
		}
	}
});

L.control.iip.plot = function (baseLayers, options) {
	return new L.Control.IIP.Plot(baseLayers, options);
};




