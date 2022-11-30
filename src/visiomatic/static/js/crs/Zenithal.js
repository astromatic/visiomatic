/*
# 	Zenithal (de-)projections
#	(see http://www.atnf.csiro.au/people/mcalabre/WCS/).
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#                            Chiara Marmo    - Paris-Saclay
*/
import {Point, latLng} from 'leaflet';

import {Projection} from './Projection';


Zenithal = Projection.extend({

	_paramInit: function (projparam) {
		this.projparam = projparam;
		projparam.cdinv = this._invertCD(projparam.cd);
		projparam.natrval = latLng(90.0, 0.0);
		projparam.natpole = this._natpole();
		projparam.cpole = this._cpole();
	},

	// (x, y) ["deg"] -> \phi, r [deg] for zenithal projections.
	_redToPhiR: function (red) {
		return latLng(Math.sqrt(red.x * red.x + red.y * red.y),
		 Math.atan2(red.x, - red.y) * 180.0 / Math.PI);
	},

	// \phi, r [deg] -> (x, y) ["deg"] for zenithal projections.
	_phiRToRed: function (phiR) {
		var	deg = Math.PI / 180.0,
			p = phiR.lng * deg;
		return new Point(phiR.lat * Math.sin(p), - phiR.lat * Math.cos(p));
	}
});


export const TAN = Zenithal.extend({
	code: 'TAN',

	_rToTheta: function (r) {
		return Math.atan2(180.0, Math.PI * r) * 180.0 / Math.PI;
	},

	_thetaToR: function (theta) {
		return Math.tan((90.0 - theta) * Math.PI / 180.0) * 180.0 / Math.PI;
	}
});


export const ZEA = Zenithal.extend({
	code: 'ZEA',

	_rToTheta: function (r) {
		var rr = r * Math.PI / 360.0;
		if (Math.abs(rr) < 1.0) {
			return 90.0 - 2.0 * Math.asin(rr) * 180.0 / Math.PI;
		} else {
			return 90.0;
		}
	},

	_thetaToR: function (theta) {
		return Math.sin((90.0 - theta) * Math.PI / 360.0) * 360.0 / Math.PI;
	}

});

