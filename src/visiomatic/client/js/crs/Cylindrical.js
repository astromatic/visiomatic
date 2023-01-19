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


