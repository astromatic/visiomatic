/**
 #	This file part of:	VisiOmatic
 * @file Zenithal (de-)projections.
 * @requires util/VUtil.js
 * @requires crs/Projection.js

 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
 */
import {Point, latLng} from 'leaflet';

import {Projection} from './Projection';


Zenithal = Projection.extend( /** @lends Zenithal */ {

	/**
	 * Base class for zenithal WCS (World Coordinate System) projections.
	 *
	 * @name Zenithal
	 * @see {@link https://www.atnf.csiro.au/people/mcalabre/WCS/ccs.pdf#page=9}
	 * @extends Projection
	 * @memberof module:crs/Conical.js
	 * @constructs
	 * @param {object} header
	   JSON representation of the image header.
	 * @param {projParam} [options]
	   Projection options: see {@link Projection}.

	 * @returns {Zenithal} Instance of a zenithal projection.
	 */
	// Initialize() is inherited from the parent class.

	/**
	 * Initialize a Zenithal projection.
	 * @method
	 * @static
	 * @private
	 */
	_projInit: function () {
		const	projparam = this.projparam;

		projparam._cdinv = this._invertCD(projparam.cd);
		projparam._natrval = latLng(90.0, 0.0);
		projparam._natpole = this._natpole();
		projparam._cpole = this._cpole();
		projparam._infinite = true;
		projparam._pixelFlag = false;
	},

	/**
	 * Convert reduced coordinates to zenithal (phi,R) coordinates.
	 * @method
	 * @static
	 * @private
	 * @param {leaflet.Point} red
	   Reduced coordinates.
	 * @returns {leaflet.LatLng}
	   (phi,R) zenithal coordinates in degrees.
	 */
	_redToPhiR: function (red) {
		return latLng(Math.sqrt(red.x * red.x + red.y * red.y),
		 Math.atan2(red.x, - red.y) * 180.0 / Math.PI);
	},

	/**
	 * Convert zenithal (phi,R) coordinates to reduced coordinates.
	 * @method
	 * @static
	 * @private
	 * @param {leaflet.LatLng} phiR
	   (phi,R) zenithal coordinates in degrees.
	 * @returns {leaflet.Point}
	   Reduced coordinates.
	 */
	_phiRToRed: function (phiR) {
		const	deg = Math.PI / 180.0,
			p = phiR.lng * deg;

		return new Point(phiR.lat * Math.sin(p), - phiR.lat * Math.cos(p));
	}
});


export const TAN = Zenithal.extend( /** @lends TAN */ {
	code: 'TAN',

	/**
	 * Gnomonic (tangential) projection.
	 *
	 * @name TAN
	 * @see {@link https://www.atnf.csiro.au/people/mcalabre/WCS/ccs.pdf#page=12}
	 * @extends Zenithal
	 * @memberof module:crs/Zenithal.js
	 * @constructs
	 * @param {object} header
	   JSON representation of the image header.
	 * @param {projParam} [options]
	   Projection options: see {@link Zenithal}.

	 * @returns {TAN} Instance of a TAN projection.
	 */
	// Initialize() is inherited from the parent class

	/**
	 * Convert tangential R coordinate to native theta angle.
	 * @method
	 * @static
	 * @private
	 * @param {number} r
	   R tangential coordinate in degrees.
	 * @returns {number}
	   Native theta angle in degrees.
	 */
	_rToTheta: function (r) {
		return Math.atan2(180.0, Math.PI * r) * 180.0 / Math.PI;
	},

	/**
	 * Convert native theta angle to tangential R.
	 * @method
	 * @static
	 * @private
	 * @param {number} theta
	   Native theta angle in degrees.
	 * @returns {number}
	   R tangential coordinate in degrees.
	 */
	_thetaToR: function (theta) {
		return Math.tan((90.0 - theta) * Math.PI / 180.0) * 180.0 / Math.PI;
	}
});


export const ZEA = Zenithal.extend( /** @lends ZEA */ {
	code: 'ZEA',

	/**
	 * Zenithal Equal-Area projection.
	 *
	 * @name ZEA
	 * @see {@link https://www.atnf.csiro.au/people/mcalabre/WCS/ccs.pdf#page=14}
	 * @extends Zenithal
	 * @memberof module:crs/Zenithal.js
	 * @constructs
	 * @param {object} header
	   JSON representation of the image header.
	 * @param {projParam} [options]
	   Projection options: see {@link Zenithal}.

	 * @returns {ZEA} Instance of a TAN projection.
	 */
	// Initialize() is inherited from the parent class

	/**
	 * Convert zenithal equal-area R coordinate to native theta angle.
	 * @method
	 * @static
	 * @private
	 * @param {number} r
	   R zenithal equal-area coordinate in degrees.
	 * @returns {number}
	   Native theta angle in degrees.
	 */
	_rToTheta: function (r) {
		const	rr = r * Math.PI / 360.0;

		if (Math.abs(rr) < 1.0) {
			return 90.0 - 2.0 * Math.asin(rr) * 180.0 / Math.PI;
		} else {
			return 90.0;
		}
	},

	/**
	 * Convert native theta angle to zenithal equal-area R.
	 * @method
	 * @static
	 * @private
	 * @param {number} theta
	   Native theta angle in degrees.
	 * @returns {number}
	   R zenithal equal-area coordinate in degrees.
	 */
	_thetaToR: function (theta) {
		return Math.sin((90.0 - theta) * Math.PI / 360.0) * 360.0 / Math.PI;
	}

});

