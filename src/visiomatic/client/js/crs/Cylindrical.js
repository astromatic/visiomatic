/**
 #	This file part of:	VisiOmatic
 * @file Cylindrical and pseudo-cylindrical (de-)projections.
 * @requires util/VUtil.js
 * @requires crs/Projection.js

 * @copyright (c) 2014-2024 CFHT/CNRS/CEA/AIM/UParisSaclay
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
	 * Cylindrical Equal-Area projection.
	 *
	 * @name CEA
	 * @see {@link https://www.atnf.csiro.au/people/mcalabre/WCS/ccs.pdf#page=15}
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


export const MER = Cylindrical.extend( /** @lends MER */ {

	/**
	 * Mercator projection.
	 *
	 * @name MER
	 * @see {@link https://www.atnf.csiro.au/people/mcalabre/WCS/ccs.pdf#page=16}
	 * @extends Cylindrical
	 * @memberof module:crs/Cylindrical.js
	 * @constructs
	 * @param {object} header
	   JSON representation of the image header.
	 * @param {projParam} [options]
	   Projection options: see {@link Cylindrical}.

	 * @returns {MER} Instance of a MER projection.
	 */
	// Initialize() is inherited from the parent class

	/**
	 * Convert reduced coordinates to MER (phi,R) coordinates.
	 * @private
	 * @param {leaflet.Point} red
	   Reduced coordinates.
	 * @returns {leaflet.LatLng}
	   (phi,R) MER coordinates in degrees.
	 */
	_redToPhiR: function (red) {
		const	deg = Math.PI / 180.0;

		// We adopt a limit for |y| < 1000, equivalent to ~ 90 - |lat| > 1e-6
		return latLng(
			2. * Math.atan(Math.exp(
				Math.max(-1000., Math.min(red.y, 1000.)) * deg
			)) / deg - 90.,
			red.x
		);
	},

	/**
	 * Convert MER (phi,R) coordinates to reduced coordinates.
	 * @private
	 * @param {leaflet.LatLng} phiR
	   (phi,R) MER coordinates in degrees.
	 * @returns {leaflet.Point}
	   Reduced coordinates.
	 */
	_phiRToRed: function (phiR) {
		const	deg = Math.PI / 180.0;

		// We adopt a limit for |y| < 1000, equivalent to ~ 90 - |lat| > 1e-6
		return point(
			phiR.lng,
			Math.log(Math.tan(0.5 * (
				(
					Math.max(-89.999999, Math.min(phiR.lat, 89.999999))
				) + 90.) * deg)) / deg
		);
	}
});


export const MOL = Cylindrical.extend( /** @lends MOL */ {

	/**
	 * Mollweide's (pseudo-cylindrical, equal-area) projection.
	 *
	 * @name MOL
	 * @see {@link https://www.atnf.csiro.au/people/mcalabre/WCS/ccs.pdf#page=17}
	 * @extends Cylindrical
	 * @memberof module:crs/Cylindrical.js
	 * @constructs
	 * @param {object} header
	   JSON representation of the image header.
	 * @param {projParam} [options]
	   Projection options: see {@link Cylindrical}.

	 * @returns {MOL} Instance of a MOL projection.
	 */
	// Initialize() is inherited from the parent class

	/**
	 * Convert reduced coordinates to MOL (phi,R) coordinates.
	 * @private
	 * @param {leaflet.Point} red
	   Reduced coordinates.
	 * @returns {leaflet.LatLng}
	   (phi,R) MOL coordinates in degrees.
	 */
	_redToPhiR: function (red) {
		const	deg = Math.PI / 180.0,
			eps = 1e-12,
		    a = 2. - (red.y * deg) ** 2,
			sqr = Math.sqrt(a > eps ? a : eps);
		return latLng(
			Math.asin(
				Math.max(
					-1.,
					Math.min(
						Math.asin(
							Math.max(
								-1.,
								Math.min(
									red.y * Math.sqrt(0.5) * deg,
									1.
								)
							)
						) / (90. * deg) + red.y * sqr / 180.,
						1.
					)
				)
			) / deg,
			Math.PI * red.x / (2. * sqr)
		);
	},

	/**
	 * Convert MOL (phi,R) coordinates to reduced coordinates.
	 * @private
	 * @param {leaflet.LatLng} phiR
	   (phi,R) MOL coordinates in degrees.
	 * @returns {leaflet.Point}
	   Reduced coordinates.
	 */
	_phiRToRed: function (phiR) {
		const	deg = Math.PI / 180.0,
			pstheta = Math.PI * Math.sin(phiR.lat * deg),
			eps = 1.e-15,
			tsqr2opi = 2. * Math.sqrt(2.) / Math.PI;

		// Iteratively solve g + sin g = pi * sin(lat) to find gamma = g / 2
		// (only if lat != +/- pi/2). 
		if (90. - Math.abs(phiR.lat) >= eps) {
			// Initial guess for g
			let	g = 2. * Math.asin(phiR.lat / 90.),
				go = Math.PI;
			for (
				let niter = 50;
				niter-- && Math.abs(g - go) > eps;
				g -= (g + Math.sin(g) - pstheta) / (1. + Math.cos(g))
			) {
				go = g;
			}
			gamma = g / 2.;
		} else {
			gamma = phiR.lat;
		}
		return point(
			tsqr2opi * phiR.lng * Math.cos(gamma),
			tsqr2opi * 90. * Math.sin(gamma)
		);
	}
});


export const AIT = Cylindrical.extend( /** @lends AIT */ {

	/**
	 * Hammer-Aitoff equal-area projection (not formally pseudo-cylindrical).
	 *
	 * @name AIT
	 * @see {@link https://www.atnf.csiro.au/people/mcalabre/WCS/ccs.pdf#page=18}
	 * @extends Cylindrical
	 * @memberof module:crs/Cylindrical.js
	 * @constructs
	 * @param {object} header
	   JSON representation of the image header.
	 * @param {projParam} [options]
	   Projection options: see {@link Cylindrical}.

	 * @returns {AIT} Instance of an AIT projection.
	 */
	// Initialize() is inherited from the parent class

	/**
	 * Convert reduced coordinates to AIT (phi,R) coordinates.
	 * @private
	 * @param {leaflet.Point} red
	   Reduced coordinates.
	 * @returns {leaflet.LatLng}
	   (phi,R) AIT coordinates in degrees.
	 */
	_redToPhiR: function (red) {
		const	deg = Math.PI / 180.0,
			z = Math.sqrt(1. - (0.25 * red.x * deg)**2 - (0.5 * red.y * deg)**2);

		return latLng(
			Math.asin(z * red.y * deg),
			2. * Math.atan2(2. * z**2 - 1., 0.5 * z * red.x * deg)
		);
	},

	/**
	 * Convert AIT (phi,R) coordinates to reduced coordinates.
	 * @private
	 * @param {leaflet.LatLng} phiR
	   (phi,R) AIT coordinates in degrees.
	 * @returns {leaflet.Point}
	   Reduced coordinates.
	 */
	_phiRToRed: function (phiR) {
		const	deg = Math.PI / 180.0,
			clat = Math.cos(phiR.lat * deg),
			g = Math.sqrt(2. / (1. + clat * Math.cos(0.5 * phiR.lng))) / deg;

		return point(
			2. * g * clat * Math.sin(0.5 * phiR.lng * deg),
			g * Math.sin(phiR.lat * deg)
		);
	}
});


