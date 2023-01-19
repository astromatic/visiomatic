/*
# 	Conical (de-)projections
#	(see http://www.atnf.csiro.au/people/mcalabre/WCS/).
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#                            Chiara Marmo    - Paris-Saclay
*/
import {latLng, point} from 'leaflet';

import {Projection} from './Projection';


Conical = Projection.extend({

	// (x, y) ["deg"] -> \phi, r [deg] for conical projections.
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

	// \phi, r [deg] -> (x, y) ["deg"] for conical projections.
	_phiRToRed: function (phiR) {
		const	deg = Math.PI / 180.0,
		     p = this.projparam._c * phiR.lng * deg;
		return point(
			phiR.lat * Math.sin(p),
			this.projparam._y0 - phiR.lat * Math.cos(p)
		);
	}
});


export const COE = Conical.extend({

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

	_thetaToR: function (theta) {
		var	deg = Math.PI / 180.0,
		    gamma = this.projparam._gamma;
		return 2.0 / gamma * Math.sqrt(this.projparam._s1s2p1 - gamma *
			Math.sin(theta * deg)) / deg;
	}

});

