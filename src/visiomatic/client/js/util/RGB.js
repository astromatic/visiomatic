/**
 #	This file part of:	VisiOmatic
 * @file RGB triplets.

 * @copyright (c) 2015-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
 */
import {Util} from 'leaflet';


/**
 * Return an RGB triplet.
 *
 * @name RGB
 * @memberof module:util/RGB.js
 * @constructs
 * @param {number} r
   Red value.
 * @param {number} g
   Green value.
 * @param {number} b
   Blue value.
 * @returns {RGB} Instance of an RGB triplet.
 */
export const RGB = function (r, g, b) {
	this.r = r;
	this.g = g;
	this.b = b;
};

RGB.prototype = /** @lends RGB */ {

	/**
	 * Clone the RGB triplet.
	 * @returns {RGB}
	   Copy of the RGB triplet.
	 */
	clone: function () {
		return new RGB(this.r, this.g, this.b);
	},

	/**
	 * Convert to a string representation.
	 * @returns {string}
	   String (hexadecimal) representation of the RGB triplet.
	 */
	toStr: function () {
		let	r = Math.round(this.r * 255.0),
		    g = Math.round(this.g * 255.0),
		    b = Math.round(this.b * 255.0);

		if (r < 0.0) { r = 0.0; } else if (r > 255.0) { r = 255.0; }
		if (g < 0.0) { g = 0.0; } else if (g > 255.0) { g = 255.0; }
		if (b < 0.0) { b = 0.0; } else if (b > 255.0) { b = 255.0; }

		return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	},

	/**
	 * Detect non-zero RGB color.
	 * @returns {boolean}
	   True if the color is not a perfect black.
	 */
	isOn: function () {
		return (this.r > 0.0 || this.g > 0.0 || this.b > 0.0) ? true : false;
	}
};


/**
 * Instantiate an RGB triplet.
 *
 * @function
 * @param {number|number[]|string|RGB} r
   Red value, rgb array, hexadecimalstring representation, or RGB triplet.
 * @param {number} g
   Green value.
 * @param {number} b
   Blue value.
 * @returns {RGB} Instance of an RGB triplet.

 * @example
 * const color = rgb('#A0B8C4');
 */
export const rgb = function (r, g, b) {
	if (r instanceof RGB) {
		return r;
	}
	if (typeof r === 'string') {
		const	bigint = parseInt('0x' + r.slice(1), 16);

		return new RGB(((bigint >> 16) & 255) / 255.0,
			((bigint >> 8) & 255) / 255.0,
			(bigint & 255) / 255.0);
	}
	if (Util.isArray(r)) {
		return new RGB(r[0], r[1], r[2]);
	}
	if (r === undefined || r === null) {
		return r;
	}
	return new RGB(r, g, b);
};

