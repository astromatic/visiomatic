/*
#	Manage RGB triplets
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2015-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU.
*/
import {Util} from 'leaflet';

RGB = function (r, g, b) {
	this.r = r;
	this.g = g;
	this.b = b;
};


RGB.prototype = {

	clone: function () {
		return new RGB(this.r, this.g, this.b);
	},

	toStr: function () {
		var r = Math.round(this.r * 255.0),
		    g = Math.round(this.g * 255.0),
		    b = Math.round(this.b * 255.0);

		if (r < 0.0) { r = 0.0; } else if (r > 255.0) { r = 255.0; }
		if (g < 0.0) { g = 0.0; } else if (g > 255.0) { g = 255.0; }
		if (b < 0.0) { b = 0.0; } else if (b > 255.0) { b = 255.0; }

		return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	},

	isOn: function () {
		return (this.r > 0.0 || this.g > 0.0 || this.b > 0.0) ? true : false;
	}
};

export const rgb = function (r, g, b) {
	if (r instanceof RGB) {
		return r;
	}
	if (typeof r === 'string') {
		var bigint = parseInt('0x' + r.slice(1), 16);

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

