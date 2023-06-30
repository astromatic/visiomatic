/**
 #	This file part of:	VisiOmatic
 * @file Zenithal (de-)projections.
 * @requires util/VUtil.js
 * @requires crs/Projection.js

 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
 */
import {point, latLng} from 'leaflet';

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
	 * @private
	 * @param {leaflet.LatLng} phiR
	   (phi,R) zenithal coordinates in degrees.
	 * @returns {leaflet.Point}
	   Reduced coordinates.
	 */
	_phiRToRed: function (phiR) {
		const	deg = Math.PI / 180.0,
			p = phiR.lng * deg;

		return point(phiR.lat * Math.sin(p), - phiR.lat * Math.cos(p));
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


export const TPV = TAN.extend( /** @lends TPV */ {
	code: 'TPV',

	/**
	 * Distorted gnomonic (tangential) projection.
	 *
	 * @name TPV
	 * @see {@link https://fits.gsfc.nasa.gov/registry/tpvwcs/tpv.html}
	 * @extends Zenithal
	 * @memberof module:crs/Zenithal.js
	 * @constructs
	 * @param {object} header
	   JSON representation of the image header.
	 * @param {projParam} [options]
	   Projection options: see {@link Zenithal}.

	 * @returns {TPV} Instance of a TPV projection.
	 */
	// Initialize() is inherited from the parent class

	/**
	 * Convert pixel coordinates to reduced coordinates,
	 * taking into account distortions.
	 *
	 * @private
	 * @param {leaflet.Point} pix
	   Pixel coordinates.
	 * @returns {leaflet.Point}
	   Reduced coordinates.
	 */
	_pixToRed: function (pix) {
		const	projparam = this.projparam,
			cd = projparam.cd,
			dred = pix.subtract(projparam.crpix);

		return this._dRedToRed(point(
			dred.x * cd[0][0] + dred.y * cd[0][1],
			dred.x * cd[1][0] + dred.y * cd[1][1]));
	},

	/**
	 * Convert reduced coordinates to pixel coordinates,
	 * taking into account geometric distortions.
	 * @private
	 * @param {leaflet.Point} red
	   Reduced coordinates.
	 * @returns {leaflet.Point}
	   Pixel coordinates.
	 */
	_redToPix: function (red) {
		const projparam = this.projparam,
		    cdinv = projparam._cdinv;
		dred = this._redToDRed(red);
		return point(dred.x * cdinv[0][0] + dred.y * cdinv[0][1],
		 dred.x * cdinv[1][0] + dred.y * cdinv[1][1]).add(projparam.crpix);
	},

	/**
	 * Convert distorted reduced coordinates to reduced coordinates
	 * using a TPV polynomial.
	 * @private
	 * @param {leaflet.Point} dred
	   Distorted reduced coordinates.
	 * @returns {leaflet.Point}
	   Reduced coordinates.
	 */
	_dRedToRed: function (dred) {
		const	projparam = this.projparam,
			pvx = projparam.pv[0],
			pvy = projparam.pv[1],
			dx = dred.x,
			dy = dred.y;
			
		let	x = pvx[0],
			y = pvy[0],
			npv = projparam.npv;

		do {
			if (!--npv) {break};
			x += pvx[1] * dx;
			y += pvy[1] * dy;
			if (!--npv) {break};
			x += pvx[2] * dy;
			y += pvy[2] * dx;
			if (!--npv) {break};
			const	dr = Math.sqrt(dx * dx + dy * dy);
			x += pvx[3] * dr;
			y += pvy[3] * dr;
			if (!--npv) {break};
			const dx2 = dx * dx,
				dy2 = dy * dy;
			x += pvx[4] * dx2;
			y += pvy[4] * dy2;
			if (!--npv) {break};
			const dxy = dx * dy;
			x += pvx[5] * dxy;
			y += pvy[5] * dxy;
			if (!--npv) {break};
			x += pvx[6] * dy2;
			y += pvy[6] * dx2;
			if (!--npv) {break};
			const dx3 = dx2 * dx,
				dy3 = dy2 * dy;
			x += pvx[7] * dx3;
			y += pvy[7] * dy3;
			if (!--npv) {break};
			x += pvx[8] * dx2 * dy;
			y += pvy[8] * dy2 * dx;
			if (!--npv) {break};
			x += pvx[9] * dx * dy2;
			y += pvy[9] * dy * dx2;
			if (!--npv) {break};
			x += pvx[10] * dy3;
			y += pvy[10] * dx3;
			if (!--npv) {break};
			const	dr3 = dr * dr * dr;
			x += pvx[11] * dr3;
			y += pvy[11] * dr3;
			if (!--npv) {break};
			const dx4 = dx2 * dx2,
				dy4 = dy2 * dy2;
			x += pvx[12] * dx4;
			y += pvy[12] * dy4;
			if (!--npv) {break};
			x += pvx[13] * dx3 * dy;
			y += pvy[13] * dy3 * dx;
			if (!--npv) {break};
			x += pvx[14] * dx2 * dy2;
			y += pvy[14] * dy2 * dx2;
			if (!--npv) {break};
			x += pvx[15] * dx * dy3;
			y += pvy[15] * dy * dx3;
			if (!--npv) {break};
			x += pvx[16] * dy4;
			y += pvy[16] * dx4;
			if (!--npv) {break};
			const dx5 = dx4 * dx,
				dy5 = dy4 * dy;
			x += pvx[17] * dx5;
			y += pvy[17] * dy5;
			if (!--npv) {break};
			x += pvx[18] * dx4 * dy;
			y += pvy[18] * dy4 * dx;
			if (!--npv) {break};
			x += pvx[19] * dx3 * dy2;
			y += pvy[19] * dy3 * dx2;
			if (!--npv) {break};
			x += pvx[20] * dx2 * dy3;
			y += pvy[20] * dy2 * dx3;
			if (!--npv) {break};
			x += pvx[21] * dx * dy4;
			y += pvy[21] * dy * dx4;
			if (!--npv) {break};
			x += pvx[22] * dy5;
			y += pvy[22] * dx5;
			if (!--npv) {break};
			const	dr5 = dr3 * dr * dr;
			x += pvx[23] * dr5;
			y += pvy[23] * dr5;
			if (!--npv) {break};
			const dx6 = dx5 * dx,
				dy6 = dy5 * dy;
			x += pvx[24] * dx6;
			y += pvy[24] * dy6;
			if (!--npv) {break};
			x += pvx[25] * dx5 * dy;
			y += pvy[25] * dy5 * dx;
			if (!--npv) {break};
			x += pvx[26] * dx4 * dy2;
			y += pvy[26] * dy4 * dx2;
			if (!--npv) {break};
			x += pvx[27] * dx3 * dy3;
			y += pvy[27] * dy3 * dx3;
			if (!--npv) {break};
			x += pvx[28] * dx2 * dy4;
			y += pvy[28] * dy2 * dx4;
			if (!--npv) {break};
			x += pvx[29] * dx * dy5;
			y += pvy[29] * dy * dx5;
			if (!--npv) {break};
			x += pvx[30] * dy6;
			y += pvy[30] * dx6;
			if (!--npv) {break};
			const dx7 = dx6 * dx,
				dy7 = dy6 * dy;
			x += pvx[31] * dx7;
			y += pvy[31] * dy7;
			if (!--npv) {break};
			x += pvx[32] * dx6 * dy;
			y += pvy[32] * dy6 * dx;
			if (!--npv) {break};
			x += pvx[33] * dx5 * dy2;
			y += pvy[33] * dy5 * dx2;
			if (!--npv) {break};
			x += pvx[34] * dx4 * dy3;
			y += pvy[34] * dy4 * dx3;
			if (!--npv) {break};
			x += pvx[35] * dx3 * dy4;
			y += pvy[35] * dy3 * dx4;
			if (!--npv) {break};
			x += pvx[36] * dx2 * dy5;
			y += pvy[36] * dy2 * dx5;
			if (!--npv) {break};
			x += pvx[37] * dx * dy6;
			y += pvy[37] * dy * dx6;
			if (!--npv) {break};
			x += pvx[38] * dy7;
			y += pvy[38] * dx7;
			if (!--npv) {break};
			const	dr7 = dr5 * dr * dr;
			x += pvx[39] * dr7;
			y += pvy[39] * dr7;
		} while (false)
		return point(x, y);
	},

	/**
	 * Convert reduced coordinates to distorted reduced coordinates
	 * using second order approximation to the inverted TPV polynomial.
	 * @private
	 * @param {leaflet.Point} red
	   Reduced coordinates.
	 * @returns {leaflet.Point}
	   Distorted reduced coordinates.
	 */
	_redToDRed: function (red) {
		const	projparam = this.projparam,
			dx = red.x,
			dy = red.y,
			red1 = red.multiplyBy(2.0).subtract(this._dRedToRed(red));

		return red1.add(red.subtract(this._dRedToRed(red1)));
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

