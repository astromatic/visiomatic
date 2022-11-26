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
		var deg = Math.PI / 180.0,
		    projparam = this.projparam,
		    dy = projparam.y0 - red.y,
				rTheta = projparam.sthetaA * Math.sqrt(red.x * red.x + dy * dy);
		return latLng(rTheta, Math.atan2(red.x / rTheta, dy / rTheta) / projparam.c / deg);
	},

	// \phi, r [deg] -> (x, y) ["deg"] for conical projections.
	_phiRToRed: function (phiR) {
		var	deg = Math.PI / 180.0,
		     p = this.projparam.c * phiR.lng * deg;
		return point(phiR.lat * Math.sin(p), - phiR.lat * Math.cos(p) + this.projparam.y0);
	}
});


export const COE = Projection.conical.extend({

	_paramInit: function (projparam) {
		var	deg = Math.PI / 180.0;
		this.projparam = projparam;
		projparam.cdinv = this._invertCD(projparam.cd);
		projparam.thetaA = projparam.pv[1][1];
		projparam.eta = projparam.pv[1][2];
		projparam.sthetaA = projparam.thetaA >= 0.0 ? 1.0 : -1.0;
		var theta1 = projparam.thetaA - projparam.eta,
	      theta2 = projparam.thetaA + projparam.eta,
		    s1 = Math.sin(theta1 * deg),
		    s2 = Math.sin(theta2 * deg);
		projparam.gamma = s1 + s2;
		projparam.s1s2p1 = s1 * s2 + 1.0;
		projparam.c = projparam.gamma / 2.0;
		projparam.y0 = 2.0 / projparam.gamma * Math.sqrt(projparam.s1s2p1 -
		   projparam.gamma * Math.sin(projparam.thetaA * deg)) / deg;
		projparam.natrval = latLng(projparam.thetaA, 0.0);
		projparam.natpole = this._natpole();
		projparam.cpole = this._cpole();
	},

	_rToTheta: function (r) {
		var deg = Math.PI / 180.0,
		    gamma = this.projparam.gamma,
		    sinarg = this.projparam.s1s2p1 / gamma - gamma * r * r * deg * deg / 4.0;
		if (sinarg < -1.0) {
			sinarg = -1.0;
		} else if (sinarg > 1.0) {
			sinarg = 1.0;
		}
		return Math.asin(sinarg) / deg;
	},

	_thetaToR: function (theta) {
		var	deg = Math.PI / 180.0,
		    gamma = this.projparam.gamma;
		return 2.0 / gamma * Math.sqrt(this.projparam.s1s2p1 - gamma * Math.sin(theta * deg)) / deg;
	}

});

