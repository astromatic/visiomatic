/**
 #	This file part of:	VisiOmatic
 * @file Conic (de-)projections.
 * @requires util/VUtil.js
 * @requires crs/Projection.js

 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
 */
import {latLng, point} from 'leaflet';

import {Projection} from './Projection';


Conical = Projection.extend( /** @lends Conical */ {

	/**
	 * Base class for conic WCS (World Coordinate System) projections.
	 *
	 * @name Conical
	 * @see {@link https://www.atnf.csiro.au/people/mcalabre/WCS/ccs.pdf#page=19}
	 * @extends Projection
	 * @memberof module:crs/Conical.js
	 * @constructs
	 * @param {object} header
	   JSON representation of the image header.
	 * @param {projParam} [options]
	   Projection options: see {@link Projection}.

	 * @returns {Conical} Instance of a conic projection.
	 */
	// Initialize() is inherited from the parent class.

	/**
	 * Convert reduced coordinates to conic (phi,R) coordinates.
	 * @method
	 * @static
	 * @private
	 * @param {leaflet.Point} red
	   Reduced coordinates.
	 * @returns {leaflet.LatLng}
	   (phi,R) conic coordinates in degrees.
	 */
	_redToPhiR: function (red) {
		const	deg = Math.PI / 180.0,
		    projparam = this.projparam,
		    dy = projparam._y0 - red.y,
			rTheta = projparam._sthetaA * Math.sqrt(red.x * red.x + dy * dy);

		return latLng(
			rTheta,
			Math.atan2(red.x / rTheta, dy / rTheta) / projparam._c / deg
		);
	},

	/**
	 * Convert conic (phi,R) coordinates to reduced coordinates.
	 * @method
	 * @static
	 * @private
	 * @param {leaflet.LatLng} phiR
	   (phi,R) conic coordinates in degrees.
	 * @returns {leaflet.Point}
	   Reduced coordinates.
	 */
	_phiRToRed: function (phiR) {
		const	deg = Math.PI / 180.0,
		     p = this.projparam._c * phiR.lng * deg;
		return point(
			phiR.lat * Math.sin(p),
			this.projparam._y0 - phiR.lat * Math.cos(p)
		);
	}
});


export const COE = Conical.extend( /** @lends COE */ {

	/**
	 * Conic Equal-Area projection.
	 *
	 * @name COE
	 * @see {@link https://www.atnf.csiro.au/people/mcalabre/WCS/ccs.pdf#page=20}
	 * @extends Conical
	 * @memberof module:crs/Conical.js
	 * @constructs
	 * @param {object} header
	   JSON representation of the image header.
	 * @param {projParam} [options]
	   Projection options: see {@link Conical}.

	 * @returns {COE} Instance of a COE projection.
	 */
	// Initialize() is inherited from the parent class

	/**
	 * Initialize a COE projection.
	 * @method
	 * @static
	 * @private
	 */
	_projInit: function () {
		const	deg = Math.PI / 180.0,
			projparam = this.projparam;

		projparam._cdinv = this._invertCD(projparam.cd);
		projparam._thetaA = projparam.pv[1][1];
		projparam._eta = projparam.pv[1][2];
		projparam._sthetaA = projparam._thetaA >= 0.0 ? 1.0 : -1.0;
		const	theta1 = projparam._thetaA - projparam._eta,
			theta2 = projparam._thetaA + projparam._eta,
			s1 = Math.sin(theta1 * deg),
			s2 = Math.sin(theta2 * deg);
		projparam._gamma = s1 + s2;
		projparam._s1s2p1 = s1 * s2 + 1.0;
		projparam._c = projparam._gamma / 2.0;
		projparam._y0 = 2.0 / projparam._gamma * Math.sqrt(projparam._s1s2p1 -
		   projparam._gamma * Math.sin(projparam._thetaA * deg)) / deg;
		projparam._natrval = latLng(projparam._thetaA, 0.0);
		projparam._natpole = this._natpole();
		projparam._cpole = this._cpole();
		projparam._infinite = true;
		projparam._pixelFlag = false;
	},

	/**
	 * Convert conic equal-area R coordinate to native theta angle.
	 * @method
	 * @static
	 * @private
	 * @param {number} r
	   R conic equal-area coordinate in degrees.
	 * @returns {number}
	   Native theta angle in degrees.
	 */
	_rToTheta: function (r) {
		const	deg = Math.PI / 180.0,
		    gamma = this.projparam._gamma;
		let	sinarg = this.projparam._s1s2p1 / gamma - gamma *
			r * r * deg * deg / 4.0;
		if (sinarg < -1.0) {
			sinarg = -1.0;
		} else if (sinarg > 1.0) {
			sinarg = 1.0;
		}
		return Math.asin(sinarg) / deg;
	},

	/**
	 * Convert native theta angle to conic equal-area R.
	 * @method
	 * @static
	 * @private
	 * @param {number} theta
	   Native theta angle in degrees.
	 * @returns {number}
	   R conic equal-area coordinate in degrees.
	 */
	_thetaToR: function (theta) {
		const	deg = Math.PI / 180.0,
		    gamma = this.projparam._gamma;
		return 2.0 / gamma * Math.sqrt(this.projparam._s1s2p1 - gamma *
			Math.sin(theta * deg)) / deg;
	}

});

