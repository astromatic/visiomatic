/*
#	Emulate the FITS WCS (World Coordinate System) popular among
#	the astronomical community (see http://www.atnf.csiro.au/people/mcalabre/WCS/)
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#	                         Chiara Marmo    - Paris-Saclay
*/
import {
	Class,
	CRS,
	Transformation,
	Util,
	extend,
	latLng,
	point,
} from 'leaflet';

import {VUtil} from '../util';
import {COE} from './Conical';
import {CAR, CEA} from './Cylindrical';
import {TAN, ZEA} from './Zenithal';
import {Pixel} from './Pixel';


WCSObj = extend({}, CRS, {
	code: 'WCS',

	options: {
		nzoom: 9,
		tileSize: [256, 256],
		nativeCelsys: false			// If true, world coordinates are returned
			                      // in the native celestial system
	},

	defaultparam: {
		ctype: {x: 'PIXEL', y: 'PIXEL'},
		naxis: [256, 256],
		crpix: [129, 129],
		crval: [0.0, 0.0],										// (\delta_0, \alpha_0)
//	cpole: (equal to crval by default)		// (\delta_p, \alpha_p)
		cd: [[1.0, 0.0], [0.0, 1.0]],
		natrval: [90.0, 0.0],										// (\theta_0. \phi_0)
		natpole: [90.0, 999.0],								// (\theta_p, \phi_p)
		pv: [[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
		     [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]]
	},

	initialize: function (hdr, options) {
		options = Util.setOptions(this, options);
		var	defaultparam = this.defaultparam;

		this.tileSize = point(options.tileSize);
		this.nzoom = options.nzoom;
		this.ctype = {x: defaultparam.ctype.x, y: defaultparam.ctype.y};
		this.naxis = point(defaultparam.naxis, true);
		this.projparam = new this._paramInit(defaultparam);
		if (hdr) {
			this._readWCS(hdr);
		}
		this._paramInit(options, this.projparam);

		// Identify the WCS projection type
		switch (this.ctype.x.substr(5, 3)) {
		case 'ZEA':
			this.projection = new ZEA();
			this.pixelFlag = false;
			this.infinite = true;
			break;
		case 'TAN':
			this.projection = new TAN();
			this.pixelFlag = false;
			this.infinite = true;
			break;
		case 'CAR':
			this.projection = new CAR();
			this.pixelFlag = false;
			this.infinite = true;
			break;
		case 'CEA':
			this.projection = new CEA();
			this.pixelFlag = false;
			this.infinite = true;
			break;
		case 'COE':
			this.projection = new COE();
			this.pixelFlag = false;
			this.infinite = true;
			break;
		default:
			this.projection = new Pixel();
			this.pixelFlag = true;
			this.infinite = false;
			// Center on image if WCS is in pixels
			if (!this.options.crval) {
				this.projparam.crval = latLng((this.naxis.y + 1.0) / 2.0,
				                                (this.naxis.x + 1.0) / 2.0);
			}
			this.wrapLng = [0.5, this.naxis.x - 0.5];
			this.wrapLat = [this.naxis.y - 0.5, 0.5];
			break;
		}

		if (!this.pixelFlag) {
			// Identify the native celestial coordinate system
			switch (this.ctype.x.substr(0, 1)) {
			case 'G':
				this.celsyscode = 'galactic';
				break;
			case 'E':
				this.celsyscode = 'ecliptic';
				break;
			case 'S':
				this.celsyscode = 'supergalactic';
				break;
			default:
				this.celsyscode = 'equatorial';
				break;
			}

			if (this.celsyscode !== 'equatorial') {
				this.projparam.celsysmat = this._celsysmatInit(this.celsyscode);
				this.projection.celsysToEq = this.celsysToEq;
				this.projection.eqToCelsys = this.eqToCelsys;
				this.forceNativeCelsys = (this.options.nativeCelsys === true);
				this.projection.celsysflag = !this.forceNativeCelsys;
			}
		}

		this.transformation = new Transformation(1.0, -0.5, -1.0, this.naxis.y + 0.5);
		this.projection._paramInit(this.projparam);
		this.code += ':' + this.projection.code;
	},

	// convert celestial (angular) coordinates to equatorial
	celsysToEq: function (latlng) {
		var	cmat = this.projparam.celsysmat,
		    deg = Math.PI / 180.0,
				invdeg = 180.0 / Math.PI,
			  a2 = latlng.lng * deg - cmat[1],
			  d2 = latlng.lat * deg,
				sd2 = Math.sin(d2),
				cd2cp = Math.cos(d2) * cmat[2],
				sd = sd2 * cmat[3] - cd2cp * Math.cos(a2);
		return latLng(Math.asin(sd) * invdeg,
		                ((Math.atan2(cd2cp * Math.sin(a2), sd2 - sd * cmat[3]) +
		                 cmat[0]) * invdeg + 360.0) % 360.0);
	},

	// convert equatorial (angular) coordinates to celestial
	eqToCelsys: function (latlng) {
		var	cmat = this.projparam.celsysmat,
		    deg = Math.PI / 180.0,
				invdeg = 180.0 / Math.PI,
			  a = latlng.lng * deg - cmat[0],
			  sd = Math.sin(latlng.lat * deg),
				cdcp = Math.cos(latlng.lat * deg) * cmat[2],
				sd2 = sd * cmat[3] + cdcp * Math.cos(a);
		return latLng(Math.asin(sd2) * invdeg,
		                ((Math.atan2(cdcp * Math.sin(a), sd2 * cmat[3] - sd) +
		                 cmat[1]) * invdeg + 360.0) % 360.0);
	},


	scale: function (zoom) {
		return Math.pow(2, zoom - this.nzoom + 1);
	},

	zoom: function (scale) {
		return Math.log(scale) / Math.LN2 + this.nzoom - 1;
	},

	// return the raw pixel scale in degrees
	rawPixelScale: function (latlng) {
		var p0 = this.projection.project(latlng),
		    latlngdx = this.projection.unproject(p0.add([10.0, 0.0])),
		    latlngdy = this.projection.unproject(p0.add([0.0, 10.0])),
				dlngdx = latlngdx.lng - latlng.lng,
				dlngdy = latlngdy.lng - latlng.lng;

		if (dlngdx > 180.0) { dlngdx -= 360.0; }
		else if (dlngdx < -180.0) { dlngdx += 360.0; }
		if (dlngdy > 180.0) { dlngdy -= 360.0; }
		else if (dlngdy < -180.0) { dlngdy += 360.0; }

		return 0.1 * Math.sqrt(Math.abs((dlngdx * (latlngdy.lat - latlng.lat) -
		  dlngdy * (latlngdx.lat - latlng.lat))) *
		  Math.cos(latlng.lat * Math.PI / 180.0));
	},

	// return the current pixel scale in degrees
	pixelScale: function (zoom, latlng) {
		return this.rawPixelScale(latlng) / this.scale(zoom);
	},

	// return the zoom level that corresponds to the given FoV in degrees
	fovToZoom: function (map, fov, latlng) {
		var scale = this.rawPixelScale(latlng),
			size = map.getSize();

		if (fov < scale) { fov = scale; }
		scale *= Math.sqrt(size.x * size.x + size.y * size.y);
		return fov > 0.0 ? this.zoom(scale / fov) : this.nzoom - 1;
	},

	// return the FoV in degrees that corresponds to the given zoom level
	zoomToFov: function (map, zoom, latlng) {
		var size = map.getSize(),
			scale = this.rawPixelScale(latlng) *
			  Math.sqrt(size.x * size.x + size.y * size.y),
			zscale = this.scale(zoom);
		return  zscale > 0.0 ? scale / zscale : scale;
	},

	distance: function (latlng1, latlng2) {
		var rad = Math.PI / 180.0,
		    lat1 = latlng1.lat * rad,
		    lat2 = latlng2.lat * rad,
		    a = Math.sin(lat1) * Math.sin(lat2) +
		        Math.cos(lat1) * Math.cos(lat2) * Math.cos((latlng2.lng - latlng1.lng) * rad);

		return 180.0 / Math.PI * Math.acos(Math.min(a, 1));
	},

	// Parse a string of coordinates. Return undefined if parsing failed
	parseCoords: function (str) {
		var result, latlng;

		// Try VisiOmatic sexagesimal first
		latlng = VUtil.hmsDMSToLatLng(str);
		if (typeof latlng === 'undefined') {
			// Parse regular deg, deg. The heading "J" is to support the Sesame@CDS output
			result = /(?:%J\s|^)([-+]?\d+\.?\d*)\s*[,\s]+\s*([-+]?\d+\.?\d*)/g.exec(str);
			if (result && result.length >= 3) {
				latlng = latLng(Number(result[2]), Number(result[1]));
			}
		}
		if (latlng) {
			if (this.forceNativeCelsys) {
				latlng = this.eqToCelsys(latlng);
			}
			return latlng;
		} else {
			return undefined;
		}
	},

	// Initialize WCS parameters
	_paramInit: function (newparam, param) {
		if (!param) {
			param = this;
		}
		if (newparam.naxis) {
			param.naxis = point(newparam.naxis);
		}
		if (newparam.crval) {
			param.crval = param.cpole = latLng(newparam.crval);
		}
		if (newparam.crpix) {
			param.crpix = point(newparam.crpix);
		}
		if (newparam.cd) {
			param.cd = [[newparam.cd[0][0], newparam.cd[0][1]],
		           [newparam.cd[1][0], newparam.cd[1][1]]];
		}
		if (newparam.natrval) {
			param.natrval = latLng(newparam.natrval);
		}
		if (newparam.natpole) {
			param.natpole = latLng(newparam.natpole);
		}
		if (newparam.pv) {
			param.pv = [];
			param.pv[0] = newparam.pv[0].slice();
			param.pv[1] = newparam.pv[1].slice();
		}
	},

	// Generate a celestial coordinate system transformation matrix
	_celsysmatInit: function (celcode) {
		var	deg = Math.PI / 180.0,
				corig, cpole,
				cmat = [];
		switch (celcode) {
		case 'galactic':
			corig = latLng(-28.93617242, 266.40499625);
			cpole = latLng(27.12825120, 192.85948123);
			break;
		case 'ecliptic':
			corig = latLng(0.0, 0.0);
			cpole = latLng(66.99111111, 273.85261111);
			break;
		case 'supergalactic':
			corig = latLng(59.52315, 42.29235);
			cpole = latLng(15.70480, 283.7514);
			break;
		default:
			corig = latLng(0.0, 0.0);
			cpole = latLng(0.0, 0.0);
			break;
		}
		cmat[0] = cpole.lng * deg;
		cmat[1] = Math.asin(Math.cos(corig.lat * deg) * Math.sin((cpole.lng - corig.lng) * deg));
		cmat[2] = Math.cos(cpole.lat * deg);
		cmat[3] = Math.sin(cpole.lat * deg);

		return cmat;
	},

	// Read WCS information from a FITS header
	_readWCS: function (hdr) {
		var key = VUtil.readFITSKey,
		    projparam = this.projparam,
		    v;
		if ((v = key('CTYPE1', hdr))) { this.ctype.x = v; }
		if ((v = key('CTYPE2', hdr))) { this.ctype.y = v; }
		if ((v = key('NAXIS1', hdr))) { projparam.naxis.x = this.naxis.x = parseInt(v, 10); }
		if ((v = key('NAXIS2', hdr))) { projparam.naxis.y = this.naxis.y = parseInt(v, 10); }
		if ((v = key('CRPIX1', hdr))) { projparam.crpix.x = parseFloat(v, 10); }
		if ((v = key('CRPIX2', hdr))) { projparam.crpix.y = parseFloat(v, 10); }
		if ((v = key('CRVAL1', hdr))) { projparam.crval.lng = parseFloat(v, 10); }
		if ((v = key('CRVAL2', hdr))) { projparam.crval.lat = parseFloat(v, 10); }
		if ((v = key('LONPOLE', hdr))) { projparam.natpole.lng = parseFloat(v, 10); }
		if ((v = key('LATPOLE', hdr))) { projparam.natpol.lat = parseFloat(v, 10); }
		if ((v = key('CD1_1', hdr))) { projparam.cd[0][0] = parseFloat(v, 10); }
		if ((v = key('CD1_2', hdr))) { projparam.cd[0][1] = parseFloat(v, 10); }
		if ((v = key('CD2_1', hdr))) { projparam.cd[1][0] = parseFloat(v, 10); }
		if ((v = key('CD2_2', hdr))) { projparam.cd[1][1] = parseFloat(v, 10); }
		for (var d = 0; d < 2; d++) {
			for (var j = 0; j < 20; j++) {
				if ((v = key('PV' + (d + 1) + '_' + j, hdr))) {
					projparam.pv[d][j] = parseFloat(v, 10);
				}
			}
		}
	},

	_deltaLng: function (latLng, latLng0) {
		var	dlng = latLng.lng - latLng0.lng;

		return dlng > 180.0 ? dlng - 360.0 : (dlng < -180.0 ? dlng + 360.0 : dlng);
	}
});

export const WCS = Class.extend(WCSObj);


