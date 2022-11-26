/*
# 	Cylindrical (de-)projections
#	(see http://www.atnf.csiro.au/people/mcalabre/WCS/).
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#                            Chiara Marmo    - Paris-Saclay
*/
import {latLng, point} from 'leaflet';

import {Projection} from './Projection';


Cylindrical = Projection.extend({

	_paramInit: function (projparam) {
		var	deg = Math.PI / 180.0;
		this.projparam = projparam;
		projparam.cdinv = this._invertCD(projparam.cd);
		projparam.lambda = projparam.pv[1][1];
		if (projparam.lambda === 0.0) { projparam.lambda = 1.0; }
		projparam.natrval = latLng(0.0, 0.0);
		projparam.natpole = this._natpole();
		projparam.cpole = this._cpole();
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
		var deg = Math.PI / 180.0,
				slat = red.y * this.projparam.lambda * deg;
		return latLng(slat > -1.0 ?
		  (slat < 1.0 ? Math.asin(slat) / deg : 90.0) : -90.0, red.x);
	},

	// \phi, r [deg] -> (x, y) ["deg"] for CEA projections.
	_phiRToRed: function (phiR) {
		var deg = Math.PI / 180.0;
		return point(phiR.lng,
		               Math.sin(phiR.lat * deg) / (this.projparam.lambda * deg));
	}
});


