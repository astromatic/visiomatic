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
# L.IIPUtils contains general utility methods
#
#	This file part of:	Leaflet-IVV
#
#	Copyright: (C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#	                    Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		28/11/2013
*/
L.IIPUtils = {
// Definitions for RegExp
	REG_PDEC: '(\\d+\\.\\d*)',
	REG_FLOAT: '([-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?)',

// Ajax call to server
	requestURI: function (uri, purpose, action, context) {
		var	httpRequest;

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
		httpRequest.open('GET', uri);
		httpRequest.onreadystatechange = function () {
			action(context, httpRequest);
		};
		httpRequest.send();
	},

// Return the distance between two world coords latLng1 and latLng2 in degrees
	distance: function (latlng1, latlng2) {
		var d2r = L.LatLng.DEG_TO_RAD,
		 lat1 = latlng1.lat * d2r,
		 lat2 = latlng2.lat * d2r,
		 dLat = lat2 - lat1,
		 dLon = (latlng2.lng - latlng1.lng) * d2r,
		 sin1 = Math.sin(dLat / 2),
		 sin2 = Math.sin(dLon / 2);

		var a = sin1 * sin1 + sin2 * sin2 * Math.cos(lat1) * Math.cos(lat2);

		return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * L.LatLng.RAD_TO_DEG;
	}

};



/*
# L.Projection.WCS computes a list of FITS WCS (World Coordinate System)
# (de-)projections (see http://www.atnf.csiro.au/people/mcalabre/WCS/)
#
#	This file part of:	Leaflet-IVV
#
#	Copyright: (C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		26/11/2013
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
			cdphi = Math.cos(dphi),
			asinarg = st * sdp + ct * cdp * cdphi;
		if (asinarg > 1.0) {
			asinarg = 1.0;
		} else if (asinarg < -1.0) {
			asinarg = -1.0;
		}
		return new L.LatLng(Math.asin(asinarg) * rad,
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
			sdp = Math.sin(dp),
			asinarg = sd * sdp + cd * cdp * cda;
		if (asinarg > 1.0) {
			asinarg = 1.0;
		} else if (asinarg < -1.0) {
			asinarg = -1.0;
		}
		return new L.LatLng(Math.asin(asinarg) * rad,
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
		var rr = Math.PI * r / 360.0;
		if (Math.abs(rr) < 1.0) {
			return 90.0 - 2.0 * Math.asin(rr) * L.LatLng.RAD_TO_DEG;
		} else {
			return 90.0;
		}
	},

	thetaToR: function (theta) {
		return 360.0 / Math.PI * Math.sin((90.0 - theta) * 0.5 * L.LatLng.DEG_TO_RAD);
	}

});


/*
# L.WCS emulates the FITS WCS (World Coordinate System) popular among
# the astronomical community (see http://www.atnf.csiro.au/people/mcalabre/WCS/)
#
#	This file part of:	Leaflet-IVV
#
#	Copyright: (C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		28/11/2013
*/

L.WCS = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		projection: L.Projection.WCS.TAN,
		ctype: {x: 'RA--TAN', y: 'DEC--TAN'},
		naxis: L.point(256, 256, true),
		nzoom: 9,
		crpix: L.point(129, 129),
		crval: L.latLng(0.0, 0.0),		// (\delta_0, \phi_0)
		cd: [[1.0, 0.0], [0.0, 1.0]],
		natpole: L.latLng(90.0, 180.0),	// (\theta_p, \phi_p)
		tileSize: L.point(256, 256),
		celpole: L.latLng(0.0, 0.0),	// (\delta_p, \alpha_p)
		natfid: L.latLng(0.0, 90.0),	// (\theta_0, \phi_0)
		cdinv: [[1.0, 0.0], [0.0, 1.0]]
	},

	initialize: function (hdr, options) {
		options = L.setOptions(this, options);
		if (hdr) {
			this._readWCS(hdr);
		}
		switch (options.ctype.x.substr(5, 3)) {
		case 'ZEA':
			options.projection = L.Projection.WCS.ZEA;
			break;
		case 'TAN':
			options.projection = L.Projection.WCS.TAN;
			break;
		default:
			options.projection = L.Projection.WCS.TAN;
			break;
		}
		this.transformation = new L.Transformation(1, -0.5, -1, options.naxis.y + 0.5);
		options.projection.paraminit(options);
		this.code += ':' + options.projection.code;
	},

	code: 'WCS',

	projection: L.Projection.WCS,

	latLngToPoint: function (latlng, zoom) { // (LatLng, Number) -> Point
		var projectedPoint = this.options.projection.project(latlng, this.options),
		    scale = this.scale(zoom);
		return this.transformation._transform(projectedPoint, scale);
	},

	pointToLatLng: function (point, zoom) { // (Point, Number[, Boolean]) -> LatLng
		var scale = this.scale(zoom),
				untransformedPoint = this.transformation.untransform(point, scale);
		return this.options.projection.unproject(untransformedPoint, this.options);
	},

	project: function (latlng) {
		return this.options.projection.project(latlng, this.options);
	},

	scale: function (zoom) {
		return Math.pow(2, zoom - this.options.nzoom + 1);
	},

	getSize: function (zoom) {
		var s = this.scale(zoom);
		return L.point(s, s);
	},

// Return base zoom level at a given resolution for a given tile size
	zoom1: function (point, tileSize) {
		return Math.ceil(Math.log(Math.max(point.x / tileSize.x, point.y / tileSize.y)) / Math.LN2);
	},

	_readWCS: function (hdr) {
		var opt = this.options,
		 key = this._readFITSKey,
		 v;
		if ((v = key('CTYPE1', hdr))) { opt.ctype.x = v; }
		if ((v = key('CTYPE2', hdr))) { opt.ctype.y = v; }
		if ((v = key('NAXIS1', hdr))) { opt.naxis.x = parseInt(v, 10); }
		if ((v = key('NAXIS2', hdr))) { opt.naxis.y = parseInt(v, 10); }
		if ((v = key('CRPIX1', hdr))) { opt.crpix.x = parseFloat(v, 10); }
		if ((v = key('CRPIX2', hdr))) { opt.crpix.y = parseFloat(v, 10); }
		if ((v = key('CRVAL1', hdr))) { opt.crval.lng = parseFloat(v, 10); }
		if ((v = key('CRVAL2', hdr))) { opt.crval.lat = parseFloat(v, 10); }
		if ((v = key('CD1_1', hdr))) { opt.cd[0][0] = parseFloat(v, 10); }
		if ((v = key('CD1_2', hdr))) { opt.cd[0][1] = parseFloat(v, 10); }
		if ((v = key('CD2_1', hdr))) { opt.cd[1][0] = parseFloat(v, 10); }
		if ((v = key('CD2_2', hdr))) { opt.cd[1][1] = parseFloat(v, 10); }
	},

	_readFITSKey: function (keyword, str) {
		var key = keyword.trim().toUpperCase().substr(0, 8),
			nspace = 8 - key.length,
			keyreg = new RegExp(key + '\\ {' + nspace.toString() +
			 '}=\\ *(?:\'(\\S*)\\ *\'|([-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?))'),
			match = keyreg.exec(str);
		if (!match) {
			return null;
		} else if (match[1]) {
			return match[1];
		} else {
			return match[2];
		}
	}

});

L.wcs = function (options) {
	return new L.WCS(options);
};


/*
# L.Control.WCS Manage coordinate display and input
#
#	This file part of:	Leaflet-IVV
#
#	Copyright: (C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		26/11/2013
*/
L.Control.WCS = L.Control.extend({
	options: {
		position: 'bottomleft',
		units: 'HMS'
	},

	onAdd: function (map) {
		// Create coordinate input/display box
		var input = this._wcsinput = L.DomUtil.create('input', 'leaflet-control-wcs');
		L.DomEvent.disableClickPropagation(input);
		input.type = 'text';
		// Speech recognition on WebKit engine
		if ('webkitSpeechRecognition' in window) {
			input.setAttribute('x-webkit-speech', 'x-webkit-speech');
		}

		map.on('drag', this._onDrag, this);
		L.DomEvent.on(input, 'change', this._onInputChange, this);

		return this._wcsinput;
	},

	onRemove: function (map) {
		map.off('drag', this._onDrag);
	},

	_onDrag: function (e) {
		var latlng = this._map.getCenter();
		if (this.options.units === 'HMS') {
			this._wcsinput.value = this._latLngToHMSDMS(latlng);
		} else {
			this._wcsinput.value = latlng.lng.toFixed(5) + ' , ' + latlng.lat.toFixed(5);
		}
	},

	// Convert degrees to HMSDMS (DMS code from the Leaflet-Coordinates plug-in)
	_latLngToHMSDMS : function (latlng) {
		var lng = (latlng.lng + 360.0) / 360.0;
		lng = (lng - Math.floor(lng)) * 24.0;
		var h = Math.floor(lng),
		 mf = (lng - h) * 60.0,
		 m = Math.floor(mf),
		 sf = (mf - m) * 60.0;
		if (sf >= 60.0) {
			m++;
			sf = 0.0;
		}
		if (m === 60) {
			h++;
			m = 0;
		}
		var str = h.toString() + ':' + (m < 10 ? '0' : '') + m.toString() +
		 ':' + (sf < 10.0 ? '0' : '') + sf.toFixed(3),
		 lat = Math.abs(latlng.lat),
		 sgn = latlng.lat < 0.0 ? '-' : '+',
		 d = Math.floor(lat);
		mf = (lat - d) * 60.0;
		m = Math.floor(mf);
		sf = (mf - m) * 60.0;
		if (sf >= 60.0) {
			m++;
			sf = 0.0;
		}
		if (m === 60) {
			h++;
			m = 0;
		}
		return str + ' ' + sgn + (d < 10 ? '0' : '') + d.toString() + ':' +
		 (m < 10 ? '0' : '') + m.toString() + ':' +
		 (sf < 10.0 ? '0' : '') + sf.toFixed(2);
	},

	_onInputChange: function (e) {
		var re = /^(\d+\.?\d*)\s*,?\s*\+?(-?\d+\.?\d*)/g,
		 str = this._wcsinput.value,
		 result = re.exec(str);
		if (result && result.length >= 3) {
		// If in degrees, pan directly
			this._map.panTo({lat: Number(result[2]), lng: Number(result[1])});
		} else {
		// If not, ask Sesame@CDS!
			L.IIPUtils.requestURI('/cgi-bin/nph-sesame/-oI?' + str,
			 'getting coordinates for ' + str, this._getCoordinates, this, true);
		}
	},

	_getCoordinates: function (_this, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var re = /J\s(\d+\.?\d*)\s*,?\s*\+?(-?\d+\.?\d*)/g,
				 str = httpRequest.responseText,
				 result = re.exec(str);
				if (result && result.length >= 3) {
					_this._map.panTo({lat: Number(result[2]), lng: Number(result[1])});
					_this._wcsinput.value = result[0];
				} else {
					alert(str + ': Unknown location');
				}
			} else {
				alert('There was a problem with the request to the Sesame service at CDS');
			}
		}
	}


});

L.Map.mergeOptions({
    positionControl: false
});

L.Map.addInitHook(function () {
    if (this.options.positionControl) {
        this.positionControl = new L.Control.MousePosition();
        this.addControl(this.positionControl);
    }
});

L.control.wcs = function (options) {
    return new L.Control.WCS(options);
};


/*
# L.Control.Scale.WCS adds degree and pixel units to the standard L.Control.Scale
#
#	This file part of:	Leaflet-IVV
#
#	Copyright: (C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		28/11/2013
*/

L.Control.Scale.WCS = L.Control.Scale.extend({
	options: {
		position: 'bottomleft',
		maxWidth: 128,
		metric: false,
		imperial: false,
		degrees: true,
		pixels: true,
		planetRadius: 6378137.0,
		updateWhenIdle: false
	},

	_addScales: function (options, className, container) {
		if (options.metric) {
			this._mScale = L.DomUtil.create('div', className + '-line', container);
		}
		if (options.imperial) {
			this._iScale = L.DomUtil.create('div', className + '-line', container);
		}
		if (options.degrees) {
			this._dScale = L.DomUtil.create('div', className + '-line', container);
		}
		if (options.pixels) {
			this._pScale = L.DomUtil.create('div', className + '-line', container);
		}

		this.angular = options.metric || options.imperial || options.degrees;
	},

	_update: function () {
		var options = this.options,
		    map = this._map;

		if (options.pixels) {
			var crs = map.options.crs;
			if (crs.options && crs.options.nzoom) {
				var pixelScale = Math.pow(2.0, crs.options.nzoom - 1 - map.getZoom());
				this._updatePixels(pixelScale * options.maxWidth);
			}
		}

		if (this.angular) {
			var center = map.getCenter(),
			    cosLat = Math.cos(center.lat * Math.PI / 180),
			    dist = Math.sqrt(this._jacobian(center)) * cosLat,
			    maxDegrees = dist * options.maxWidth;

			if (options.metric) {
				this._updateMetric(maxDegrees * Math.PI / 180.0 * options.planetRadius);
			}
			if (options.imperial) {
				this._updateImperial(maxDegrees * Math.PI / 180.0 * options.planetRadius);
			}
			if (options.degrees) {
				this._updateDegrees(maxDegrees);
			}
		}
	},

// Return the Jacobian determinant of the astrometric transformation at latLng
	_jacobian: function (latlng) {
		var map = this._map,
		    p0 = map.project(latlng),
		    latlngdx = map.unproject(p0.add([10.0, 0.0])),
		    latlngdy = map.unproject(p0.add([0.0, 10.0]));
		return 0.01 * Math.abs((latlngdx.lng - latlng.lng) *
		                        (latlngdy.lat - latlng.lat) -
		                       (latlngdy.lng - latlng.lng) *
		                        (latlngdx.lat - latlng.lat));
	},

	_updatePixels: function (maxPix) {
		var scale = this._pScale;

		if (maxPix > 1.0e6) {
			var maxMPix = maxPix * 1.0e-6,
			mPix = this._getRoundNum(maxMPix);
			scale.style.width = this._getScaleWidth(mPix / maxMPix) + 'px';
			scale.innerHTML = mPix + ' Mpx';
		} else if (maxPix > 1.0e3) {
			var maxKPix = maxPix * 1.0e-3,
			kPix = this._getRoundNum(maxKPix);
			scale.style.width = this._getScaleWidth(kPix / maxKPix) + 'px';
			scale.innerHTML = kPix + ' kpx';
		} else {
			var pix = this._getRoundNum(maxPix);
			scale.style.width = this._getScaleWidth(pix / maxPix) + 'px';
			scale.innerHTML = pix + ' px';
		}
	},

	_updateDegrees: function (maxDegrees) {
		var maxSeconds = maxDegrees * 3600.0,
		    scale = this._dScale;

		if (maxSeconds < 1.0) {
			var maxMas = maxSeconds * 1000.0,
			mas = this._getRoundNum(maxMas);
			scale.style.width = this._getScaleWidth(mas / maxMas) + 'px';
			scale.innerHTML = mas + ' mas';
		} else if (maxSeconds < 60.0) {
			var seconds = this._getRoundNum(maxSeconds);
			scale.style.width = this._getScaleWidth(seconds / maxSeconds) + 'px';
			scale.innerHTML = seconds + ' &#34;';
		} else if (maxSeconds < 3600.0) {
			var maxMinutes = maxDegrees * 60.0,
			    minutes = this._getRoundNum(maxMinutes);
			scale.style.width = this._getScaleWidth(minutes / maxMinutes) + 'px';
			scale.innerHTML = minutes + ' &#39;';
		} else {
			var degrees = this._getRoundNum(maxDegrees);
			scale.style.width = this._getScaleWidth(degrees / maxDegrees) + 'px';
			scale.innerHTML = degrees + ' &#176;';
		}
	}

});

L.control.scale.wcs = function (options) {
	return new L.Control.Scale.WCS(options);
};



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
#	Last modified:		25/11/2013
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
		invertCMap: false,
		quality: 90,
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

			if (options.minZoom > 0) {
				options.minZoom--;
			}
			this.options.maxZoom--;
		}

		if (options.bounds) {
			options.bounds = L.latLngBounds(options.bounds);
		}

		this._url = url.replace(/\&.*$/g, '');

		var subdomains = this.options.subdomains;

		if (typeof subdomains === 'string') {
			this.options.subdomains = subdomains.split('');
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
		this.getIIPMetaData(this._url);
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
				var maxzoom = parseInt(matches[1], 10) - 1,
				 gridsize = {x: 2, y: 2};
				for (var z = 0; z <= maxzoom && gridsize.x > 1 && gridsize.y > 1; z++) {
					var imagesize = {
						x: Math.floor(maxsize.x / Math.pow(2, maxzoom + z)),
						y: Math.floor(maxsize.y / Math.pow(2, maxzoom + z))
					};
					gridsize = {
						x: Math.ceil(imagesize.x / layer.iipTileSize.x),
						y: Math.ceil(imagesize.y / layer.iipTileSize.y)
					};
				}
				layer.iipMinZoom = z - 1;
				if (layer.iipMinZoom > layer.options.minZoom) {
					layer.options.minZoom = layer.iipMinZoom;
				}
				layer.iipMaxZoom = layer.iipMinZoom + maxzoom;
				if (!layer.options.maxZoom) {
					layer.options.maxZoom = layer.iipMaxZoom + 2;
				}
				if (!layer.options.maxNativeZoom) {
					layer.options.maxNativeZoom = layer.iipMaxZoom;
				}

				// Set grid sizes
				for (z = 0; z <= layer.iipMaxZoom; z++) {
					layer.iipImageSize[z] = {
						x: Math.floor(maxsize.x / Math.pow(2, layer.iipMaxZoom - z)),
						y: Math.floor(maxsize.y / Math.pow(2, layer.iipMaxZoom - z))
					};
					layer.iipGridSize[z] = {
						x: Math.ceil(layer.iipImageSize[z].x / layer.iipTileSize.x),
						y: Math.ceil(layer.iipImageSize[z].y / layer.iipTileSize.y)
					};
				}
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
				var minmax = [],
				 str = matches[1].split(' '),
				 nfloat = str.length / 2,
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

				layer.wcs = new L.WCS(response, {
					nzoom: maxzoom + 1,
					tileSize: layer.iipTileSize
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
		map.addLayer(this);
		map.options.crs = this.wcs;
		map.invalidateSize();
		map.setView(this.wcs.options.crval, 1);
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
		var str = this._url;
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
		return str + '&JTL=' + (tilePoint.z - this.iipMinZoom).toString() + ',' +
		 (tilePoint.x + this.iipGridSize[tilePoint.z].x * tilePoint.y).toString();
	},

	_createTile: function () {
		var tile = L.DomUtil.create('img', 'leaflet-tile');

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

		tile.galleryimg = 'no';

		tile.onselectstart = tile.onmousemove = L.Util.falseFn;

		if (L.Browser.ielt9 && this.options.opacity !== undefined) {
			L.DomUtil.setOpacity(tile, this.options.opacity);
		}

		// without this hack, tiles disappear after zoom on Chrome for Android
		// https://github.com/Leaflet/Leaflet/issues/2078
		if (L.Browser.mobileWebkit3d) {
			tile.style.WebkitBackfaceVisibility = 'hidden';
		}

		return tile;
	}
});

L.tileLayer.iip = function (url, options) {
	return new L.TileLayer.IIP(url, options);
};


/*
# L.Catalogs contains specific catalog settings and conversion tools.
#
#	This file part of:	Leaflet-IVV
#
#	Copyright: (C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		25/11/2013
*/

L.Catalog = {
	nmax: 5000,	// Sets the maximum number of sources per query
	_csvToGeoJSON: function (str) {
		// Check to see if the delimiter is defined. If not, then default to comma.
		var badreg = new RegExp('#|--|^$'),
		 lines = str.split('\n'),
		 array = [],
		 geo = {type: 'FeatureCollection', features: []};

		for (var i in lines) {
			var line = lines[i];
			if (badreg.test(line) === false) {
				var feature = {
					type: 'Feature',
					id: '',
					properties: {
						mags: []
					},
					geometry: {
						type: 'Point',
						coordinates: [0.0, 0.0]
					},
				},
				geometry = feature.geometry,
				properties = feature.properties;

				var cell = line.split(';');
				feature.id = cell[0];
				geometry.coordinates[0] = parseFloat(cell[1]);
				geometry.coordinates[1] = parseFloat(cell[2]);
				var mags = cell.slice(3);
				for (var j in mags) {
					properties.mags.push(parseFloat(mags[j]));
				}
				geo.features.push(feature);
			}
		}
		return geo;
	},

	_popup: function (feature) {
		var str = '<div>';
		if (this.objuri) {
			str += 'ID: <a href=\"' +  L.Util.template(this.objuri, L.extend({
				ra: feature.geometry.coordinates[0].toFixed(6),
				dec: feature.geometry.coordinates[1].toFixed(6)
			})) + '\" target=\"_blank\">' + feature.id + '</a></div>';
		} else {
			str += 'ID: ' + feature.id + '</div>';
		}
		for	(var i in this.properties) {
			str += '<div>' + this.properties[i] + ': ' +
				feature.properties.mags[i].toString() + '</div>';
		}
		return str;
	}

};

L.Catalog.TwoMASS = L.extend({}, L.Catalog, {
	name: '2MASS point sources',
	attribution: '2MASS All-Sky Catalog of Point Sources (Cutri et al., 2003)',
	color: 'yellow',
	maglim: 17.0,
	service: 'CDS',
	uri: '/viz-bin/asu-tsv?&-mime=csv&-source=II/246&' +
	 '-out=2MASS,RAJ2000,DEJ2000,Jmag,Hmag,Kmag&-out.meta=&' +
	 '-c={ra},{dec},eq=J2000&-c.bd={dra},{ddec}&-sort=_Kmagr&-out.max={nmax}',
	toGeoJSON: L.Catalog._csvToGeoJSON,
	properties: ['Jmag', 'Hmag', 'Kmag'],
	objuri: 'http://vizier.u-strasbg.fr/viz-bin/VizieR-5?-source=II/246&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

L.Catalog.SDSS = L.extend({}, L.Catalog, {
	name: 'SDSS release 9',
	attribution: 'SDSS Photometric Catalog, Release 9 (Adelman-McCarthy et al., 2012)',
	color: 'yellow',
	maglim: 25.0,
	service: 'CDS',
	uri: '/viz-bin/asu-tsv?&-mime=csv&-source=V/139&' +
	 '-out=SDSS9,RAJ2000,DEJ2000,umag,gmag,rmag,imag,zmag&-out.meta=&' +
	 '-c={ra},{dec}&-c.bd={dra},{ddec}&-sort=imag&-out.max={nmax}',
	toGeoJSON: L.Catalog._csvToGeoJSON,
	properties: ['umag', 'gmag', 'rmag', 'imag', 'zmag'],
	objuri: 'http://vizier.u-strasbg.fr/viz-bin/VizieR-5?-source=V/139/sdss9&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

L.Catalog.PPMXL = L.extend({}, L.Catalog, {
	name: 'PPMXL',
	attribution: 'PPM-Extended, positions and proper motions by Roeser et al. 2008',
	color: 'yellow',
	maglim: 20.0,
	service: 'CDS',
	uri: '/viz-bin/asu-tsv?&-mime=csv&-source=V/139&' +
	 '-out=SDSS9,RAJ2000,DEJ2000,Bmag,Vmag,Rmag,Jmag,HMag,KMag&-out.meta=&' +
	 '-c={ra},{dec}&-c.bd={dra},{ddec}&-sort=_r&-out.max={nmax}',
	toGeoJSON: L.Catalog._csvToGeoJSON,
	properties: ['Jmag', 'Hmag', 'Kmag', 'b1mag', 'b2mag', 'r1mag', 'r2mag', 'imag'],
	objuri: 'http://vizier.u-strasbg.fr/viz-bin/VizieR-5?-source=I/317&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});



/*
# L.Control.IIP adjusts the rendering of an IIP layer
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	Leaflet-IVV
#
#	Copyright: (C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		26/11/2013
*/
L.Control.IIP = L.Control.extend({
	options: {
		title: 'a control related to IIPImage',
		collapsed: true,
		position: 'topleft'
	},

	initialize: function (baseLayers,  options) {
		L.setOptions(this, options);
		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipimage';
		this._layers = baseLayers;
	},

	onAdd: function (map) {
		var className = this._className,
		 id = this._id,
		 container = this._container = L.DomUtil.create('div', className + ' leaflet-bar');
		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		L.DomEvent
				.disableClickPropagation(container)
				.disableScrollPropagation(container);

		this._dialog = L.DomUtil.create('div', className + '-dialog', container);
		if (this.options.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent
					.on(container, 'mouseover', this._expand, this)
					.on(container, 'mouseout', this._collapse, this);
			}

			var toggle = this._toggle = L.DomUtil.create('a', className + '-toggle leaflet-bar', container);
			toggle.href = '#';
			toggle.id = id + '-toggle';
			toggle.title = this.options.title;

			if (L.Browser.touch) {
				L.DomEvent
				    .on(toggle, 'click', L.DomEvent.stop)
				    .on(toggle, 'click', this._expand, this);
			}
			else {
				L.DomEvent.on(toggle, 'focus', this._expand, this);
			}

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility
		} else {
			this._expand();
		}

		this._checkIIP();

		return	this._container;
	},

	_checkIIP: function () {
		var layer = this._layer = this._findActiveBaseLayer();
		if (layer) {
			this._initDialog();
		} else if (this._prelayer) {
			// Layer metadata are not ready yet: listen for 'metaload' event
			this._prelayer.once('metaload', this._checkIIP, this);
		}
	},

	_initDialog: function () {
		var className = this._className,
			container = this._container,
			dialog = this._dialog,
			toggle = this._toggle,
			layer = this._layer;
    // Setup the rest of the dialog window here
	},

	_addDialogLine: function (label) {
		var elem = L.DomUtil.create('div', this._className + '-element', this._dialog),
		 text = L.DomUtil.create('span', this._className + '-label', elem);
		text.innerHTML = label;
		return elem;
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
				if (!layer._map) {
					this._prelayer = layer;
				} else if (this._map.hasLayer(layer) && layer.iipdefault) {
					return layer;
				}
			}
		}
		return undefined;
	},

	_onInputChange:	function (layer, pname, value) {
		var pnamearr = pname.split(/\[|\]/);
		if (pnamearr[1]) {
			layer[pnamearr[0]][parseInt(pnamearr[1], 10)] = value;
		}	else {
			layer[pnamearr[0]] = value;
		}
		layer.redraw();
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
#	Last modified:		28/11/2013
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

	initialize: function (baseLayers, options) {
		L.setOptions(this, options);
		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipimage';
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
		var	invbutton =  L.DomUtil.create('input', 'leaflet-cmap-inv', elem);
		invbutton.id = 'leaflet-invertcmap';
		invbutton.type = 'button';

		var cmapinput = L.DomUtil.create('span', className + '-cmaps', elem);
		var cbutton = [];
		for (var i in cmaps) {
			cbutton[i] = document.createElement('input');
			cbutton[i].className = 'leaflet-cmap-' + cmaps[i];
			cbutton[i].type = 'button';
			cbutton[i].name = 'button';
			cbutton[i].cmap = cmaps[i];
			cmapinput.appendChild(cbutton[i]);
			if (cmaps[i] === this.options.cmap) {
				cbutton[i].checked = 'checked';
			}
		}

		$('.' + className + '-cmaps').buttonset();
		$('.' + className + '-cmaps :button').click(function (e) {
			_this._onInputChange(layer, 'iipCMap', this.cmap);
		});
		$('#leaflet-invertcmap').button();
		L.DomEvent.on(invbutton, 'click', function () {
			_this._onInputChange(layer, 'iipInvertCMap', !layer.iipInvertCMap);
			var style = layer.iipInvertCMap ? 'scaleY(-1.0)' : 'none';
			for (var i in cmaps) {
				if (L.Browser.ie) {
					cbutton[i].style.msTransform = style;
				} else if (L.Browser.webkit) {
					cbutton[i].style.webkitTransform = style;
				} else {
					cbutton[i].style.transform = style;
				}
			}
		}, this);

		// Min and max pixel values
		var step = ((layer.iipMaxValue[0] - layer.iipMinValue[0]) / 100.0).toPrecision(1);

		// Min
		elem = this._addDialogLine('Min:');
		var	mininput = L.DomUtil.create('input', '', elem);
		mininput.id = 'leaflet-minvalue';
		mininput.type = 'text';
		mininput.value = String(layer.iipMinValue[0]);
		$('#' + mininput.id).spinner({
			stop: function (event, ui) {
				_this._onInputChange(layer, 'iipMinValue[0]', mininput.value);
			},
			icons: { down: 'icon-minus', up: 'icon-plus' },
			step: step
		});
		L.DomEvent.on(mininput, 'change', function () {
			_this._onInputChange(layer, 'iipMinValue[0]', mininput.value);
		}, this);

		// Max
		elem = this._addDialogLine('Max:');
		var	maxinput = L.DomUtil.create('input', '', elem);
		maxinput.id = 'leaflet-maxvalue';
		maxinput.type = 'text';
		maxinput.value = String(layer.iipMaxValue[0]);
		$('#' + maxinput.id).spinner({
			stop: function (event, ui) {
				_this._onInputChange(layer, 'iipMaxValue[0]', maxinput.value);
			},
			icons: { down: 'icon-minus', up: 'icon-plus' },
			step: step
		});
		L.DomEvent.on(maxinput, 'change', function () {
			_this._onInputChange(layer, 'iipMaxValue[0]', maxinput.value);
		}, this);

		// Gamma
		elem = this._addDialogLine('Gamma:');
		var	gaminput = L.DomUtil.create('input', '', elem);
		gaminput.id = 'leaflet-gammavalue';
		gaminput.type = 'text';
		gaminput.value = String(layer.iipGamma);
		$('#' + gaminput.id).spinner({
			stop: function (event, ui) {
				_this._onInputChange(layer, 'iipGamma', gaminput.value);
			},
			icons: { down: 'icon-minus', up: 'icon-plus' },
			step: 0.05,
			min: 0.5,
			max: 5.0,
		});
		L.DomEvent.on(gaminput, 'change', function () {
			_this._onInputChange(layer, 'iipGamma', gaminput.value);
		}, this);

		// Contrast
		elem = this._addDialogLine('Contrast:');
		var	continput = L.DomUtil.create('input', '', elem);
		continput.id = 'leaflet-contrastvalue';
		continput.type = 'text';
		continput.value = String(layer.iipContrast);
		$('#' + continput.id).spinner({
			stop: function (event, ui) {
				_this._onInputChange(layer, 'iipContrast', continput.value);
			},
			icons: { down: 'icon-minus', up: 'icon-plus' },
			step: 0.05,
			min: 0.0,
			max: 10.0,
		});
		L.DomEvent.on(continput, 'change', function () {
			_this._onInputChange(layer, 'iipContrast', continput.value);
		}, this);

		// JPEG quality
		elem = this._addDialogLine('JPEG quality:');
		var	qualinput = L.DomUtil.create('input', '', elem);
		qualinput.id = 'leaflet-qualvalue';
		qualinput.type = 'text';
		qualinput.value = String(layer.iipQuality);
		$('#' + qualinput.id).spinner({
			stop: function (event, ui) {
				_this._onInputChange(layer, 'iipQuality', qualinput.value);
			},
			icons: { down: 'icon-minus', up: 'icon-plus' },
			step: 1,
			min: 0,
			max: 100,
		});
		L.DomEvent.on(qualinput, 'change', function () {
			_this._onInputChange(layer, 'iipQuality', qualinput.value);
		}, this);

	}

});

L.control.iip.image = function (baseLayers, options) {
	return new L.Control.IIP.Image(baseLayers, options);
};



/*
# L.Control.Layers.Overlay manages new overlays such as catalogs and plots
#
#	This file part of:	Leaflet-IVV
#
#	Copyright: (C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		28/11/2013
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery-browser');
	var d3 = require('d3');
}

L.Control.IIP.Overlay = L.Control.IIP.extend({
	options: {
		title: 'overlay menu',
		collapsed: true,
		position: 'topleft',
	},

	initialize: function (baseLayers, options) {
		L.setOptions(this, options);
		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipoverlay';
		this._layers = baseLayers;
	},

	_initDialog: function () {
		var _this = this,
			className = this._className,
			dialog = this._dialog,
			catalogs = [L.Catalog.TwoMASS, L.Catalog.SDSS, L.Catalog.PPMXL],
			elem;

		// CDS catalog overlay
		elem = this._addDialogLine('CDS Catalog:');
		var catcolpick = L.DomUtil.create('input', className + '-catalogs', elem);
		catcolpick.id = 'leaflet-catalog-colorpicker';
		catcolpick.type = 'text';
		catcolpick.value = 'yellow';
		$(document).ready(function () {
			$('#' + catcolpick.id).spectrum({
				showInput: true,
				clickoutFiresChange: true,
				move: function (color) {
					catcolpick.value = color.toHexString();
				}
			});
		});

		var catselect = L.DomUtil.create('select', className + '-catalogs', elem);
		var opt = document.createElement('option');
		opt.value = null;
		opt.text = 'Choose catalog:';
		opt.disabled = true;
		opt.selected = true;
		catselect.add(opt, null);
		for (var c in catalogs) {
			opt = document.createElement('option');
			opt.value = catalogs[c];
			opt.text = catalogs[c].name;
			catselect.add(opt, null);
		}

		// Fix issue with collapsing dialog after selecting a catalog
		if (!L.Browser.android && this.options.collapsed) {
			L.DomEvent.on(catselect, 'mousedown', function () {
				L.DomEvent.off(this._container, 'mouseout', this._collapse, this);
				this.collapsedOff = true;
			}, this);

			L.DomEvent.on(this._container, 'mouseover', function () {
				if (this.collapsedOff) {
					L.DomEvent.on(this._container, 'mouseout', this._collapse, this);
					this.collapsedOff = false;
				}
			}, this);
		}

		var catbutton = L.DomUtil.create('input', className + '-catalogs', elem);
		catbutton.type = 'button';
		catbutton.value = 'Go';
		L.DomEvent.on(catbutton, 'click', function () {
			var	index = catselect.selectedIndex - 1;	// Ignore dummy 'Choose catalog' entry
			if (index >= 0) {
				var catalog = catalogs[index];
				catalog.color = catcolpick.value;
				catselect.selectedIndex = 0;
				this._getCatalog(catalog);
			}
		}, this);

		// Profile overlay
		elem = this._addDialogLine('Profile:');
		var profcolpick = L.DomUtil.create('input', className + '-profile', elem);
		profcolpick.id = 'leaflet-profile-colorpicker';
		profcolpick.type = 'text';
		profcolpick.value = 'magenta';
		$(document).ready(function () {
			$('#' + profcolpick.id).spectrum({
				showInput: true,
				clickoutFiresChange: true,
				move: function (color) {
					profcolpick.value = color.toHexString();
				}
			});
		});

		var profbutton = L.DomUtil.create('input', className + '-profile', elem);
		profbutton.type = 'button';
		profbutton.value = 'Go';
		L.DomEvent.on(profbutton, 'click', this.getProfile, this);
	},

	_checkIIP: function () {
		var layer = this._layer = this._findActiveBaseLayer();
		if (layer) {
			this._layerControl = this._map._layerControl;
			this._initDialog();
		} else if (this._prelayer) {
			// Layer metadata are not ready yet: listen for 'metaload' event
			this._prelayer.once('metaload', this._checkIIP, this);
		}
	},

	_getCatalog: function (catalog) {
		var _this = this,
		center = this._map.getCenter(),
		 bounds = this._map.getBounds(),
		 lngfac = Math.abs(Math.cos(center.lat)) * L.LatLng.DEG_TO_RAD,
		 dlng = Math.abs(bounds.getWest() - bounds.getEast()),
		 dlat = Math.abs(bounds.getNorth() - bounds.getSouth());

		if (dlat < 0.0001) {
			dlat = 0.0001;
		}
		if (lngfac > 0.0 && dlng * lngfac < 0.0001) {
			dlng = 0.0001 / lngfac;
		}

		var templayer = new L.LayerGroup(null),
		 layercontrol = this._layerControl;
		templayer.notReady = true;
		if (layercontrol) {
			layercontrol.addOverlay(templayer, catalog.name);
			if (layercontrol.options.collapsed) {
				layercontrol._expand();
			}
		}
		L.IIPUtils.requestURI(
			L.Util.template(catalog.uri, L.extend({
				ra: center.lng.toFixed(6),
				dec: center.lat.toFixed(6),
				dra: dlng.toFixed(4),
				ddec: dlat.toFixed(4),
				nmax: catalog.nmax
			})), 'getting ' + catalog.service + ' data', function (context, httpRequest) {
				_this._loadCatalog(catalog, templayer, context, httpRequest);
			}, this, true);
	},

	_loadCatalog: function (catalog, templayer, _this, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var response = httpRequest.responseText,
				 geo = catalog.toGeoJSON(response),
				 geocatalog = L.geoJson(geo, {
					onEachFeature: function (feature, layer) {
						if (feature.properties && feature.properties.mags) {
							layer.bindPopup(catalog._popup(feature));
						}
					},
					pointToLayer: function (feature, latlng) {
						return L.circleMarker(latlng, {
							radius: feature.properties.mags[0] ?
							 8 + catalog.maglim - feature.properties.mags[0] : 8
						});
					},
					style: function (feature) {
						return {color: catalog.color};
					}
				});
				geocatalog.addTo(_this._map);
				var layercontrol = _this._layerControl;
				if (layercontrol) {
					layercontrol.removeLayer(templayer);
					layercontrol.addOverlay(geocatalog, catalog.name +
						' (' + geo.features.length.toString() + ' entries)');
					if (layercontrol.options.collapsed) {
						layercontrol._collapse();
					}
				}
			} else {
				alert('There was a problem with the request to ' + catalog.service + '.');
			}
		}
	},

	getProfile: function (e) {
		L.drawLocal.draw.handlers.polyline.tooltip.cont = 'Click to end drawing line.';
		var drawline = new L.Draw.Line(this._map),
		 _this = this;
		this._map.on('draw:created', function (e) {
			var layer = e.layer,
			 popdiv = document.createElement('div');
			layer.addTo(_this._map);
			drawline.removeHooks();
			popdiv.id = 'leaflet-profile-plot';
			var activity = document.createElement('div');
			activity.className = 'leaflet-control-activity';
			popdiv.appendChild(activity);
			layer.bindPopup(popdiv,
			 {minWidth: 16, maxWidth: 1024}).openPopup();
			var zoom = _this._map.options.crs.options.nzoom - 1,
			 point1 = _this._map.project(layer._latlngs[0], zoom),
			 point2 = _this._map.project(layer._latlngs[1], zoom);
			L.IIPUtils.requestURI(_this._layer._url.replace(/\&.*$/g, '') +
			'&PFL=' + zoom.toString() + ':' + point1.x.toFixed(0) + ',' +
			 point1.y.toFixed(0) + '-' + point2.x.toFixed(0) + ',' +
			 point2.y.toFixed(0),
			'getting IIP layer profile',
			_this._plotProfile, layer);
		});
		drawline.addHooks();
	},

	_plotProfile: function (layer, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var json = JSON.parse(httpRequest.responseText),
				 yprof = json.profile,
				 xprof = d3.range(yprof.length),
				 prof = d3.zip(xprof, yprof);

				var popdiv = document.getElementById('leaflet-profile-plot'),
				 style = popdiv.style;
				popdiv.removeChild(popdiv.childNodes[0]);
				var layercontrol = layer._map._layerControl;
				if (layercontrol) {
					layercontrol.addOverlay(layer, 'Image profile');
				}
				style.left = '20%';
				style.bottom = '20%';
				style.width = 640;
				style.height = 480;
				style.backgroundColor = 'white';

				var margin = {top: 20, right: 10, bottom: 30, left: 50},
				 width = 640 - margin.left - margin.right,
				 height = 480 - margin.top - margin.bottom,
				 sx = d3.scale.linear().range([0, width]),
				 sy = d3.scale.linear().range([height, 0]),
				 xAxis = d3.svg.axis().scale(sx).orient('bottom'),
				 yAxis = d3.svg.axis().scale(sy).orient('left'),
				 line = d3.svg.line()
					.x(function (d, i) { return sx(xprof[i]); })
					.y(function (d) { return sy(d); }),
				 svg = d3.select('#leaflet-profile-plot').append('svg')
					.attr('width', width + margin.left + margin.right)
					.attr('height', height + margin.top + margin.bottom)
					.append('g')
					.attr('transform',
						'translate(' + margin.left + ',' + margin.top + ')');
				sx.domain(d3.extent(xprof));
				sy.domain(d3.extent(yprof));
				svg.append('g')
					.attr('class', 'x axis')
					.attr('transform', 'translate(0,' + height + ')')
					.call(xAxis)
					.append('text')
					.text('Pixels');

				svg.append('g')
					.attr('class', 'y axis')
					.call(yAxis)
					.append('text')
					.attr('transform', 'rotate(-90)')
					.attr('y', 6)
					.attr('dy', '.71em')
					.style('text-anchor', 'end')
					.text('Pixel value (ADU)');

				svg.append('path')
					.datum(yprof)
					.attr('class', 'line')
					.attr('d', line);
				layer._popup.update();	// TODO: avoid private method
			}
		}
	}

});

L.control.iip.overlay = function (options) {
	return new L.Control.IIP.Overlay(options);
};



/*
# L.Control.Layers.IIP adds new features to the standard L.Control.Layers
#
#	This file part of:	Leaflet-IVV
#
#	Copyright: (C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		28/11/2013
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery-browser');
}

L.Control.Layers.IIP = L.Control.Layers.extend({
	options: {
		title: 'overlay menu',
		collapsed: true,
		position: 'topright',
	},

	onAdd: function (map) {
		map._layerControl = this;
		this._initLayout();
		this._update();

		map
		    .on('layeradd', this._onLayerChange, this)
		    .on('layerremove', this._onLayerChange, this);

		return this._container;
	},

	_addItem: function (obj) {
		var _this = this,
		 item = L.DomUtil.create('div', 'leaflet-control-layers-item'),
		 inputdiv = L.DomUtil.create('div', 'leaflet-control-layers-select', item);

		if (obj.layer.notReady) {
			var activity = L.DomUtil.create('div', 'leaflet-control-activity', inputdiv);
		} else {
			var input,
				checked = this._map.hasLayer(obj.layer);
			if (obj.overlay) {
				input = document.createElement('input');
				input.type = 'checkbox';
				input.className = 'leaflet-control-layers-selector';
				input.defaultChecked = checked;
			}
			else {
				input = this._createRadioElement('leaflet-base-layers', checked);
			}
			input.layerId = L.stamp(obj.layer);
			L.DomEvent.on(input, 'click', this._onInputClick, this);
			inputdiv.appendChild(input);
		}
		
		var name = L.DomUtil.create('div', 'leaflet-control-layers-name', item);
		name.innerHTML = ' ' + obj.name;

		var trashbutton = L.DomUtil.create('input', 'leaflet-control-layers-trash', item);
		trashbutton.type = 'button';
		L.DomEvent.on(trashbutton, 'click', function () {
			_this.removeLayer(obj.layer);
			if (!obj.notReady) {
				_this._map.removeLayer(obj.layer);
			}
		}, this);

		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
		container.appendChild(item);

		return item;
	},

	_onInputClick: function () {
		var i, input, obj,
		    inputs = this._form.getElementsByTagName('input'),
		    inputsLen = inputs.length;

		this._handlingClick = true;

		for (i = 0; i < inputsLen; i++) {
			input = inputs[i];
			if (!('layerId' in input)) {
				continue;
			}
			obj = this._layers[input.layerId];
			if (input.checked && !this._map.hasLayer(obj.layer)) {
				this._map.addLayer(obj.layer);

			} else if (!input.checked && this._map.hasLayer(obj.layer)) {
				this._map.removeLayer(obj.layer);
			}
		}

		this._handlingClick = false;
	},


	_addDialogLine: function (label, dialog) {
		var elem = L.DomUtil.create('div', this._className + '-element', dialog),
		 text = L.DomUtil.create('span', this._className + '-label', elem);
		text.innerHTML = label;
		return elem;
	},

});

L.control.layers.iip = function (layers, options) {
	return new L.Control.Layers.IIP(layers, options);
};



/*
# L.Control.ExtraMap adds support for extra synchronized maps 
# (Picture-in-Picture style). Adapted from L.Control.MiniMap by Norkart
# (original copyright notice reproduced below).
#
#	This file part of:	Leaflet-IVV
#
#	Copyright:		(C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#                        Chiara Marmo - IDES/Paris-Sud,
#                        Ruven Pillay - C2RMF/CNRS
#
#	Last modified:		19/11/2013

Original code Copyright (c) 2012, Norkart AS
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are
permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice, this list of
      conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice, this list
      of conditions and the following disclaimer in the documentation and/or other materials
      provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
L.Control.ExtraMap = L.Control.extend({
	options: {
		position: 'bottomright',
		toggleDisplay: true,
		zoomLevelOffset: -5,
		zoomLevelFixed: false,
		zoomAnimation: false,
		autoToggleDisplay: false,
		width: 150,
		height: 150
	},
	
	hideText: 'Hide map',
	showText: 'Show map',
	
	//layer is the map layer to be shown in the extramap
	initialize: function (layer, options) {
		L.Util.setOptions(this, options);
		this._layer = layer;
	},
	
	onAdd: function (map) {

		this._mainMap = map;

		//Creating the container and stopping events from spilling through to the main map.
		this._container = L.DomUtil.create('div', 'leaflet-control-extramap');
		this._container.style.width = this.options.width + 'px';
		this._container.style.height = this.options.height + 'px';
		L.DomEvent.disableClickPropagation(this._container);
		L.DomEvent.on(this._container, 'mousewheel', L.DomEvent.stopPropagation);


		this._extraMap = new L.Map(this._container,
		{
			attributionControl: false,
			zoomControl: false,
			zoomAnimation: this.options.zoomAnimation,
			autoToggleDisplay: this.options.autoToggleDisplay,
			touchZoom: !this.options.zoomLevelFixed,
			scrollWheelZoom: !this.options.zoomLevelFixed,
			doubleClickZoom: !this.options.zoomLevelFixed,
			boxZoom: !this.options.zoomLevelFixed,
		});

		this._layer.addTo(this._extraMap);

		//These bools are used to prevent infinite loops of the two maps notifying each other that they've moved.
		this._mainMapMoving = false;
		this._extraMapMoving = false;

		//Keep a record of this to prevent auto toggling when the user explicitly doesn't want it.
		this._userToggledDisplay = false;
		this._minimized = false;

		if (this.options.toggleDisplay) {
			this._addToggleButton();
		}

		this._layer.once('metaload', function () {
			var bounds = this._mainMap.getPixelBounds(),
			 latlngs = this._getMapLatLngBounds(this._mainMap);
			this._aimingRect = L.polygon(latlngs,
			 {color: '#ff7800', weight: 1, clickable: false}).addTo(this._extraMap);
			this._shadowRect = L.polygon(latlngs,
			 {color: '#B15300', weight: 1, clickable: false, opacity: 0,
			 fillOpacity: 0})
				.addTo(this._extraMap);
			this._mainMap.on('moveend', this._onMainMapMoved, this);
			this._mainMap.on('move', this._onMainMapMoving, this);
			this._extraMap.on('movestart', this._onExtraMapMoveStarted, this);
			this._extraMap.on('move', this._onExtraMapMoving, this);
			this._extraMap.on('moveend', this._onExtraMapMoved, this);
			this._extraMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
			this._setDisplay(this._decideMinimized());
		}, this);

		return this._container;
	},

	addTo: function (map) {
		L.Control.prototype.addTo.call(this, map);
		return this;
	},

	onRemove: function (map) {
		this._mainMap.off('moveend', this._onMainMapMoved, this);
		this._mainMap.off('move', this._onMainMapMoving, this);
		this._extraMap.off('moveend', this._onExtraMapMoved, this);

		this._extraMap.removeLayer(this._layer);
	},

	_getMapLatLngBounds: function (map) {
		var bounds = map.getPixelBounds(),
		 bmin = bounds.min,
		 bmax = bounds.max;
		return [map.unproject([bmin.x, bmin.y]), map.unproject([bmax.x, bmin.y]),
		 map.unproject([bmax.x, bmax.y]), map.unproject([bmin.x, bmax.y])];
	},


	_addToggleButton: function () {
		this._toggleDisplayButton = this.options.toggleDisplay ?
			this._createButton('', this.hideText,
			 'leaflet-control-extramap-toggle-display', this._container,
			 this._toggleDisplayButtonClicked, this)
		: undefined;
	},

	_createButton: function (html, title, className, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.innerHTML = html;
		link.href = '#';
		link.title = title;

		var stop = L.DomEvent.stopPropagation;

		L.DomEvent
			.on(link, 'click', stop)
			.on(link, 'mousedown', stop)
			.on(link, 'dblclick', stop)
			.on(link, 'click', L.DomEvent.preventDefault)
			.on(link, 'click', fn, context);

		return link;
	},

	_toggleDisplayButtonClicked: function () {
		this._userToggledDisplay = true;
		if (!this._minimized) {
			this._minimize();
			this._toggleDisplayButton.title = this.showText;
		}
		else {
			this._restore();
			this._toggleDisplayButton.title = this.hideText;
		}
	},

	_setDisplay: function (minimize) {
		if (minimize !== this._minimized) {
			if (!this._minimized) {
				this._minimize();
			}
			else {
				this._restore();
			}
		}
	},

	_minimize: function () {
		// hide the extramap
		if (this.options.toggleDisplay) {
			this._container.style.width = '19px';
			this._container.style.height = '19px';
			this._toggleDisplayButton.className += ' minimized';
		}
		else {
			this._container.style.display = 'none';
		}
		this._minimized = true;
	},

	_restore: function () {
		if (this.options.toggleDisplay) {
			this._container.style.width = this.options.width + 'px';
			this._container.style.height = this.options.height + 'px';
			this._toggleDisplayButton.className = this._toggleDisplayButton.className
					.replace(/(?:^|\s)minimized(?!\S)/g, '');
		}
		else {
			this._container.style.display = 'block';
		}
		this._minimized = false;
	},

	_onMainMapMoved: function (e) {
		if (!this._extraMapMoving) {
			this._mainMapMoving = true;
			this._extraMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
			this._setDisplay(this._decideMinimized());
		} else {
			this._extraMapMoving = false;
		}
		this._aimingRect.setLatLngs(this._getMapLatLngBounds(this._mainMap));
	},

	_onMainMapMoving: function (e) {
		this._aimingRect.setLatLngs(this._getMapLatLngBounds(this._mainMap));
	},

	_onExtraMapMoveStarted: function (e) {
		this._lastAimingRectPosition = this._aimingRect.getLatLngs();
	},

	_onExtraMapMoving: function (e) {
		if (!this._mainMapMoving && this._lastAimingRectPosition) {
			this._shadowRect.setLatLngs(this._lastAimingRectPosition);
			this._shadowRect.setStyle({opacity: 1, fillOpacity: 0.3});
		}
	},

	_onExtraMapMoved: function (e) {
		if (!this._mainMapMoving) {
			this._extraMapMoving = true;
			this._mainMap.setView(this._extraMap.getCenter(), this._decideZoom(false));
			this._shadowRect.setStyle({opacity: 0, fillOpacity: 0});
		} else {
			this._mainMapMoving = false;
		}
	},

	_decideZoom: function (fromMaintoExtra) {
		if (!this.options.zoomLevelFixed) {
			if (fromMaintoExtra) {
				return this._mainMap.getZoom() + this.options.zoomLevelOffset;
			} else {
				return this._extraMap.getZoom() - this.options.zoomLevelOffset;
			}
		} else {
			if (fromMaintoExtra) {
				return this.options.zoomLevelFixed;
			} else {
				return this._mainMap.getZoom();
			}
		}
	},

	_decideMinimized: function () {
		if (this._userToggledDisplay) {
			return this._minimized;
		}

		if (this.options.autoToggleDisplay) {
			if (this._mainMap.getBounds().contains(this._extraMap.getBounds())) {
				return true;
			}
			return false;
		}

		return this._minimized;
	}
});

L.Map.mergeOptions({
	extraMapControl: false
});

L.Map.addInitHook(function () {
	if (this.options.extraMapControl) {
		this.extraMapControl = (new L.Control.ExtraMap()).addTo(this);
	}
});

L.control.extramap = function (options) {
	return new L.Control.ExtraMap(options);
};


