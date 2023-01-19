/**
 #	This file part of:	VisiOmatic
 * @file Cylindrical (de-)projections.
 * @requires util/VUtil.js
 * @requires crs/Projection.js

 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
 */
import {latLng, point} from 'leaflet';

import {Projection} from './Projection';


Cylindrical = Projection.extend( /** @lends Cylindrical */ {

	/**
	 * Base class for cylindrical WCS (World Coordinate System) projections.
	 *
	 * @name Cylindrical
	 * @see {@link https://www.atnf.csiro.au/people/mcalabre/WCS/ccs.pdf#page=15}
	 * @extends Projection
	 * @memberof module:crs/Cylindrical.js
	 * @constructs
	 * @param {object} header
	   JSON representation of the image header.
	 * @param {projParam} [options]
	   Projection options: see {@link Projection}.

	 * @returns {Cylindrical} Instance of a cylindrical projection.
	 */
	// Initialize() is inherited from the parent class.

	/**
	 * Initialize a cylindrical projection.
	 * @method
	 * @static
	 * @private
	 */
	_projInit: function () {
		const	deg = Math.PI / 180.0,
			projparam = this.projparam;

		projparam._cdinv = this._invertCD(projparam.cd);
		projparam._lambda = projparam.pv[1][1];
		if (projparam._lambda === 0.0) { projparam._lambda = 1.0; }
		// Override native projection center and pole coordinates
		projparam._natrval = latLng(0.0, 0.0);
		projparam._natpole = this._natpole();
		projparam._cpole = this._cpole();
		projparam._infinite = true;
		projparam._pixelFlag = false;
	},

	/**
	 * Convert cylindrical R coordinate to native theta angle.
	 * @method
	 * @static
	 * @private
	 * @param {number} r
	   R cylindrical coordinate in degrees.
	 * @returns {number}
	   Native theta angle in degrees.
	 */
	_rToTheta: function (r) {
		return r;
	},

	/**
	 * Convert native theta angle to cylindrical R.
	 * @method
	 * @static
	 * @private
	 * @param {number} theta
	   Native theta angle in degrees.
	 * @returns {number}
	   R cylindrical coordinate in degrees.
	 */
	_thetaToR: function (theta) {
		return theta;
	}

});


export const CAR = Cylindrical.extend( /** @lends CAR */ {

	/**
	 * Cylindrical Plate carrée projection.
	 *
	 * @name CAR
	 * @see {@link https://www.atnf.csiro.au/people/mcalabre/WCS/ccs.pdf#page=16}
	 * @extends Cylindrical
	 * @memberof module:crs/Cylindrical.js
	 * @constructs
	 * @param {object} header
	   JSON representation of the image header.
	 * @param {projParam} [options]
	   Projection options: see {@link Cylindrical}.

	 * @returns {CAR} Instance of a CAR projection.
	 */
	// Initialize() is inherited from the parent class

	/**
	 * Convert reduced coordinates to CAR (phi,R) coordinates.
	 * @method
	 * @static
	 * @private
	 * @param {leaflet.Point} red
	   Reduced coordinates.
	 * @returns {leaflet.LatLng}
	   (phi,R) CAR coordinates in degrees.
	 */
	_redToPhiR: function (red) {
		return latLng(red.y, red.x);
	},

	/**
	 * Convert CAR (phi,R) coordinates to reduced coordinates.
	 * @method
	 * @static
	 * @private
	 * @param {leaflet.LatLng} phiR
	   (phi,R) CAR coordinates in degrees.
	 * @returns {leaflet.Point}
	   Reduced coordinates.
	 */
	_phiRToRed: function (phiR) {
		return point(phiR.lng, phiR.lat);
	}
});


export const CEA = Cylindrical.extend( /** @lends CEA */ {

	/**
	 * Cylindrical Equal Area projection.
	 *
	 * @name CEA
	 * @see {@link https://www.atnf.csiro.au/people/mcalabre/WCS/ccs.pdf#page=16}
	 * @extends Cylindrical
	 * @memberof module:crs/Cylindrical.js
	 * @constructs
	 * @param {object} header
	   JSON representation of the image header.
	 * @param {projParam} [options]
	   Projection options: see {@link Cylindrical}.

	 * @returns {CEA} Instance of a CEA projection.
	 */
	// Initialize() is inherited from the parent class

	/**
	 * Convert reduced coordinates to CEA (phi,R) coordinates.
	 * @method
	 * @static
	 * @private
	 * @param {leaflet.Point} red
	   Reduced coordinates.
	 * @returns {leaflet.LatLng}
	   (phi,R) CEA coordinates in degrees.
	 */
	_redToPhiR: function (red) {
		const	deg = Math.PI / 180.0,
			slat = red.y * this.projparam._lambda * deg;

		return latLng(slat > -1.0 ?
		  (slat < 1.0 ? Math.asin(slat) / deg : 90.0) : -90.0, red.x);
	},

	/**
	 * Convert CEA (phi,R) coordinates to reduced coordinates.
	 * @method
	 * @static
	 * @private
	 * @param {leaflet.LatLng} phiR
	   (phi,R) CEA coordinates in degrees.
	 * @returns {leaflet.Point}
	   Reduced coordinates.
	 */
	_phiRToRed: function (phiR) {
		const	deg = Math.PI / 180.0;

		return point(
			phiR.lng,
			Math.sin(phiR.lat * deg) / (this.projparam._lambda * deg)
		);
	}
});


