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
		// If true, world coordinates are returned
		// in the native celestial system
		nativeCelsys: false
	},

	initialize: function (header, images, options) {
		var	nimages = images.length;

		options = Util.setOptions(this, options);
		this.tileSize = point(options.tileSize);
		this.nzoom = options.nzoom;
		this.projection = this.getProjection(header, options);
		if (nimages > 1) {
			this.projections = new Array(nimages);
			for (const [i, image] of images.entries()) {
				projection = this.getProjection(image.header, options);
				projection._getBounds(this.projection);
				this.projections[i] = projection;
			}

			this.latLngToPoint = this.multiLatLngToPoint
			this.pointToLatLng = this.multiPointToLatLng
			this.project = this.multiProject;
			this.unproject = this.multiUnproject;
		}

		this.naxis = this.projection.projparam.naxis;
		this.crval = this.projection.projparam.crval;
		this.wrapLng = [0.5, this.naxis.x - 0.5];
		this.wrapLat = [this.naxis.y - 0.5, 0.5];
		this.transformation = new Transformation(1.0, -0.5, -1.0, this.naxis.y + 0.5);
		this.code += ':' + this.projection.code;					
	},

	multiLatLngToPoint(latlng, zoom) {
		const projectedPoint = this.multiProject(latlng),
		    scale = this.scale(zoom);

		return this.transformation._transform(projectedPoint, scale);
	},

	multiPointToLatLng(pnt, zoom) {
		const scale = this.scale(zoom),
		    untransformedPoint = this.transformation.untransform(pnt, scale);

		return this.multiUnproject(untransformedPoint);
	},

	multiProject(latlng) {
		pnt1 = this.projection.project(latlng);
		for (projection of this.projections) {
			pnt = projection.project(latlng);
		}
		return this.projection.project(latlng);
	},
	
	multiUnproject(pnt) {
		return this.projection.unproject(pnt);
	},

    getProjection: function (header, options) {
    	ctype1 = header['CTYPE1'] || 'PIXEL';
    	switch (ctype1.substr(5, 3)) {
			case 'ZEA':
				projection = new ZEA(header);
				break;
			case 'TAN':
				projection = new TAN(header);
				break;
			case 'CAR':
				projection = new CAR(header);
				break;
			case 'CEA':
				projection = new CEA(header);
				break;
			case 'COE':
				projection = new COE(header);
				break;
			default:
				projection = new Pixel(header);
				// Center on image if WCS is in pixels
				break;
		}
		return projection;
    },


	scale: function (zoom) {
		return Math.pow(2, zoom - this.nzoom + 1);
	},

	zoom: function (scale) {
		return Math.log(scale) / Math.LN2 + this.nzoom - 1;
	},

	// return the raw pixel scale in degrees
	rawPixelScale: function (latlng) {
		var	p0 = this.projection.project(latlng),
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


	_deltaLng: function (latLng, latLng0) {
		var	dlng = latLng.lng - latLng0.lng;

		return dlng > 180.0 ? dlng - 360.0 : (dlng < -180.0 ? dlng + 360.0 : dlng);
	}
});

export const WCS = Class.extend(WCSObj);

