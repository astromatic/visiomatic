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

	_rToTheta: function (r) {
		return r;
	},

	_thetaToR: function (theta) {
		return theta;
	}

});


export const CAR = Cylindrical.extend({

	// (x, y) ["deg"] -> \phi, r [deg] for CAR projections.
	_redToPhiR: function (red) {
		return latLng(red.y, red.x);
	},

	// \phi, r [deg] -> (x, y) ["deg"] for CAR projections.
	_phiRToRed: function (phiR) {
		return point(phiR.lng, phiR.lat);
	}
});


export const CEA = Cylindrical.extend({

	// (x, y) ["deg"] -> \phi, r [deg] for CEA projections.
	_redToPhiR: function (red) {
		const	deg = Math.PI / 180.0,
			slat = red.y * this.projparam._lambda * deg;

		return latLng(slat > -1.0 ?
		  (slat < 1.0 ? Math.asin(slat) / deg : 90.0) : -90.0, red.x);
	},

	// \phi, r [deg] -> (x, y) ["deg"] for CEA projections.
	_phiRToRed: function (phiR) {
		const	deg = Math.PI / 180.0;

		return point(
			phiR.lng,
			Math.sin(phiR.lat * deg) / (this.projparam._lambda * deg)
		);
	}
});


