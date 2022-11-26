/*
# 	Compute a list of FITS WCS (World Coordinate System)
#	(de-)projections (see http://www.atnf.csiro.au/people/mcalabre/WCS/)
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#                            Chiara Marmo    - Paris-Saclay
*/
import {
	Class,
	Point,
	bounds,
	latLng,
	point,
} from 'leaflet';


Projection = Class.extend({

	bounds: bounds([-0.5, -0.5], [0.5, 0.5]),

	// LatLng [deg] -> Point
	project: function (latlng) {
		var phiTheta = this._raDecToPhiTheta(this.celsysflag ?
			this.eqToCelsys(latlng) : latlng);
		phiTheta.lat = this._thetaToR(phiTheta.lat);
		return this._redToPix(this._phiRToRed(phiTheta));
	},

	// Point -> LatLng [deg]
	unproject: function (point) {
		var  phiTheta = this._redToPhiR(this._pixToRed(point));
		phiTheta.lat = this._rToTheta(phiTheta.lat);
		var latlng = this._phiThetaToRADec(phiTheta);
		if (latlng.lng < -180.0) {
			latlng.lng += 360.0;
		}
		return this.celsysflag ? this.celsysToEq(latlng) : latlng;
	},

	// Set up native pole
	_natpole: function () {
		var	deg = Math.PI / 180.0,
		    projparam = this.projparam,
				natpole = latLng(90.0, 180.0);
		// Special case of fiducial point lying at the native pole
		if (projparam.natrval.lat === 90.0) {
			if (projparam.natpole.lng === 999.0) {
				natpole.lng = 180.0;
			}
			natpole.lat = projparam.crval.lat;
		} else if (projparam.natpole.lng === 999.0) {
			natpole.lng = (projparam.crval.lat < projparam.natrval.lat) ? 180.0 : 0.0;
		}

		return natpole;
	},

	// Set up celestial pole
	_cpole: function () {
		var	deg = Math.PI / 180.0,
		    projparam = this.projparam,
		    dphip = projparam.natpole.lng - projparam.natrval.lng,
		    cdphip = Math.cos(dphip * deg),
		    sdphip = Math.sin(dphip * deg),
		    ct0 = Math.cos(projparam.natrval.lat * deg),
		    st0 = Math.sin(projparam.natrval.lat * deg),
		    cd0 = Math.cos(projparam.crval.lat * deg),
		    sd0 = Math.sin(projparam.crval.lat * deg),
		    deltap = Math.atan2(st0, ct0 * cdphip) / deg,
		    ddeltap = Math.acos(sd0 / Math.sqrt(1.0 - ct0 * ct0 * sdphip * sdphip)) / deg,
		    deltap1 = deltap + ddeltap,
		    deltap2 = deltap - ddeltap;
		if (deltap1 < -180.0) {
			deltap1 += 360.0;
		} else if (deltap1 > 180.0) {
			deltap1 -= 360.0;
		}
		if (deltap2 < -180.0) {
			deltap2 += 360.0;
		} else if (deltap2 > 180.0) {
			deltap2 -= 360.0;
		}
		if (deltap1 > 90.0) {
			deltap = deltap2;
		} else if (deltap2 < -90.0) {
			deltap = deltap1;
		} else {
			deltap = (Math.abs(deltap1 - projparam.natpole.lat) <
			   Math.abs(deltap2 - projparam.natpole.lat)) ? deltap1 : deltap2;
		}
		var alphap = Math.abs(projparam.crval.lat) === 90.0 ? projparam.crval.lng
		      : (deltap === 90.0 ? projparam.crval.lng + projparam.natpole.lng -
		          projparam.natrval.lng - 180.0
		        : (deltap === -90.0 ? projparam.crval.lng - projparam.natpole.lng +
		           projparam.natrval.lng
		          : projparam.crval.lng - Math.atan2(sdphip * ct0 / cd0,
		             (st0 - Math.sin(deltap * deg) * sd0) /
                   (Math.cos(deltap * deg) * cd0)) / deg));
		return L.latLng(deltap, alphap);
	},

	// (phi,theta) [rad] -> RA, Dec [deg] for zenithal projections.
	_phiThetaToRADec: function (phiTheta) {
		var	projparam = this.projparam,
		    deg = Math.PI / 180.0,
			  rad = 180.0 / Math.PI,
			  t = phiTheta.lat * deg,
			  ct = Math.cos(t),
			  st = Math.sin(t),
			  dp = projparam.cpole.lat * deg,
			  cdp = Math.cos(dp),
			  sdp = Math.sin(dp),
			  dphi = (phiTheta.lng - projparam.natpole.lng) * deg,
			  cdphi = Math.cos(dphi),
			  asinarg = st * sdp + ct * cdp * cdphi;
		if (asinarg > 1.0) {
			asinarg = 1.0;
		} else if (asinarg < -1.0) {
			asinarg = -1.0;
		}
		return latLng(Math.asin(asinarg) * rad,
		 projparam.cpole.lng + Math.atan2(- ct * Math.sin(dphi),
		  st * cdp  - ct * sdp * cdphi) * rad);
	},

	// (RA, Dec) [deg] -> (phi,theta) [rad] for zenithal projections.
	_raDecToPhiTheta: function (raDec) {
		var	projparam = this.projparam,
		    deg = Math.PI / 180.0,
			  rad = 180.0 / Math.PI,
			  da = (raDec.lng - projparam.cpole.lng) * deg,
			  cda = Math.cos(da),
			  sda = Math.sin(da),
			  d = raDec.lat * deg,
			  cd = Math.cos(d),
			  sd = Math.sin(d),
			  dp = projparam.cpole.lat * deg,
			  cdp = Math.cos(dp),
			  sdp = Math.sin(dp),
			  asinarg = sd * sdp + cd * cdp * cda,
				phitheta = latLng(Math.asin(asinarg > 1.0 ? 1.0
		       : (asinarg < -1.0 ? -1.0 : asinarg)) * rad,
		         projparam.natpole.lng + Math.atan2(- cd * sda,
		         sd * cdp  - cd * sdp * cda) * rad);
		if (phitheta.lng > 180.0) {
			phitheta.lng -= 360.0;
		} else if (phitheta.lng < -180.0) {
			phitheta.lng += 360.0;
		}
		return phitheta;
	},

	// Convert from pixel to reduced coordinates.
	_pixToRed: function (pix) {
		var	projparam = this.projparam,
		    cd = projparam.cd,
		    red = pix.subtract(projparam.crpix);
		return point(red.x * cd[0][0] + red.y * cd[0][1],
			red.x * cd[1][0] + red.y * cd[1][1]);
	},

	// Convert from reduced to pixel coordinates.
	_redToPix: function (red) {
		var projparam = this.projparam,
		    cdinv = projparam.cdinv;
		return point(red.x * cdinv[0][0] + red.y * cdinv[0][1],
		 red.x * cdinv[1][0] + red.y * cdinv[1][1]).add(projparam.crpix);
	},

	// Compute the CD matrix invert.
	_invertCD: function (cd) {
		var detinv = 1.0 / (cd[0][0] * cd[1][1] - cd[0][1] * cd[1][0]);
		return [[cd[1][1] * detinv, -cd[0][1] * detinv],
		 [-cd[1][0] * detinv, cd[0][0] * detinv]];
	}
});

Projection.PIX = Projection.extend({
	code: 'PIX',

	_paramInit: function (projparam) {
		this.projparam = projparam;
		projparam.cdinv = this._invertCD(projparam.cd);
		projparam.cpole = projparam.crval;
		this.bounds = bounds([0.5, this.projparam.naxis.y - 0.5], [this.projparam.naxis.x - 0.5, 0.5]);
	},

	project: function (latlng) {
		return point(latlng.lng, latlng.lat);
	},

	unproject: function (point) {
		return latLng(point.y, point.x);
	}
});

Projection.zenithal = Projection.extend({

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

Projection.TAN = Projection.zenithal.extend({
	code: 'TAN',

	_rToTheta: function (r) {
		return Math.atan2(180.0, Math.PI * r) * 180.0 / Math.PI;
	},

	_thetaToR: function (theta) {
		return Math.tan((90.0 - theta) * Math.PI / 180.0) * 180.0 / Math.PI;
	}
});

Projection.ZEA = Projection.zenithal.extend({
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

Projection.cylindrical = Projection.extend({

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

Projection.CAR = Projection.cylindrical.extend({

	// (x, y) ["deg"] -> \phi, r [deg] for CAR projections.
	_redToPhiR: function (red) {
		return latLng(red.y, red.x);
	},

	// \phi, r [deg] -> (x, y) ["deg"] for CAR projections.
	_phiRToRed: function (phiR) {
		return point(phiR.lng, phiR.lat);
	}
});

Projection.CEA = Projection.cylindrical.extend({

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

Projection.WCS.conical = Projection.WCS.extend({

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

Projection.COE = Projection.conical.extend({

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

