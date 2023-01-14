/**
 #	This file part of:	VisiOmatic
 * @file Support for the WCS (World Coordinate System).
 * @requires util/VUtil.js
 * @requires crs/Conical.js
 * @requires crs/Cylindrical.js
 * @requires crs/Pixel.js
 * @requires crs/Zenithal.js

 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
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

// Make a class out of the CRS object before extending it
CRSclass = Class.extend(CRS);

/**
 * Image metadata sent in JSON by the VisiOmatic server.
 * @typedef image
 * @property {number[]} size
   Shape of the image (FITS convention: NAXIS1 first).
 * @property {number[][]} dataslice
   Start index, end index, and direction (+1 only) of the used section of the
   image data for each axis. The range notation follows the FITS convention
   (start at index 1 and include the end index).
 * @property {number[][]} detslice
   Start index, end index, and direction (+1 or -1) of the used section of the
   detector in the merged image for each axis. The range notation follows the
   FITS convention (start at index 1 and include the end index).
 * @property {number[][]} min_max
   Minimum and maximum clipping limits of the pixel values on each image plane.
 * @property {object} header
   JSON representation of the merged image header.
 */


export const WCS = CRSclass.extend( /** @lends WCS */ {
	/**
	   Codename of the WCS coordinate reference system.
	   @default
	 */
	code: 'WCS',

	options: {
		nzoom: 9,
		// If true, world coordinates are returned
		// in the native celestial system
		nativeCelsys: false
	},

	/**
	 * Create a new coordinate reference system that emulates the WCS
	 * (World Coordinate System) used in astronomy.
     *
	 * @extends leaflet.CRS
	 * @memberof module:crs/WCS.js
	 * @constructs
	 * @param {object} header - JSON representation of the merged image header.
	 * @param {image[]} images - Array of image extension metadata.
	 * @param {object} [options] - Options.


	 * @returns {WCS} Instance of a World Coordinate System.
	 */
	initialize: function (header, images, options) {
		var	nimages = images.length;

		options = Util.setOptions(this, options);
		this.nzoom = options.nzoom;
		this.projection = this.getProjection(header, options);
		if (nimages > 1) {
			this.projections = new Array(nimages);
			for (const [i, image] of images.entries()) {
				imOptions = {
					naticeCelsys: options.nativeCelsys,
					dataslice: image.dataslice,
					detslice: image.detslice
				};
				projection = this.getProjection(image.header, imOptions);
				if (projection.name === '') {
					projection.name = '#' + str(i+1);
				}
				projection._getCenter(this.projection);
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
		dc = 1e+30;
		pc = -1;
		pnt = this.projection.project(latlng);
		for (const p in this.projections) {
			pntc = this.projections[p].centerPnt;
			if ((d = pnt.distanceTo(pntc)) < dc) {
				pc = p;
				dc = d;
			}
		}
		return this.projections[pc].project(latlng);
	},
	
	multiUnproject(pnt) {
		for (const p in this.projections) {
			pntc = this.projections[p].centerPnt;
			if ((d = pnt.distanceTo(pntc)) < dc) {
				pc = p;
				dc = d;
			}
		}
		return this.projections[pc].unproject(pnt);
	},

	multiLatLngToIndex(latlng) {
		dc = 1e+30;
		pc = -1;
		pnt = this.projection.project(latlng);
		for (const p in this.projections) {
			pntc = this.projections[p].centerPnt;
			if ((d = pnt.distanceTo(pntc)) < dc) {
				pc = p;
				dc = d;
			}
		}
		return pc;
	},
	
	getProjection: function (header, options) {
		ctype1 = header['CTYPE1'] || 'PIXEL';
		switch (ctype1.substr(5, 3)) {
		case 'ZEA':
			projection = new ZEA(header, options);
			break;
		case 'TAN':
			projection = new TAN(header, options);
			break;
		case 'CAR':
			projection = new CAR(header, options);
			break;
		case 'CEA':
			projection = new CEA(header, options);
			break;
		case 'COE':
			projection = new COE(header, options);
			break;
		default:
			projection = new Pixel(header, options);
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

/**
 * Instantiate a World Coordinate System.
 * @function
 * @param {object} header - JSON representation of the merged image header.
 * @param {Image[]} images - Array of image extensions.
 * @param {object} [options] - Options: see {@link Coords}.
 * @returns {VTileLayer} VisiOmatic TileLayer instance.
*/
export const wcs = function (header, images, options) {
	return new WCS(header, images, options);
};

