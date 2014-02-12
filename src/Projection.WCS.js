/*
# L.Projection.WCS computes a list of FITS WCS (World Coordinate System)
# (de-)projections (see http://www.atnf.csiro.au/people/mcalabre/WCS/)
#
#	This file part of:	Leaflet-IVV
#
#	Copyright: (C) 2013-2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                          Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 12/01/2014
*/

L.Projection.WCS = L.Class.extend({

	bounds: L.bounds([0.0, -90.0], [360.0, 90.0]),

	// (phi,theta) [rad] -> RA, Dec [deg] for zenithal projections.
	_phiThetaToRADec: function (phiTheta) {
		var	projparam = this.projparam,
		    deg = Math.PI / 180.0,
			  rad = 180.0 / Math.PI,
			  t = phiTheta.lat * deg,
			  ct = Math.cos(t),
			  st = Math.sin(t),
			  dp = projparam.celpole.lat * deg,
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
		return new L.LatLng(Math.asin(asinarg) * rad,
		 projparam.celpole.lng + Math.atan2(- ct * Math.sin(dphi),
		  st * cdp  - ct * sdp * cdphi) * rad);
	},

	// (RA, Dec) [deg] -> (phi,theta) [rad] for zenithal projections.
	_raDecToPhiTheta: function (raDec) {
		var	projparam = this.projparam,
		    deg = Math.PI / 180.0,
			  rad = 180.0 / Math.PI,
			  da = (raDec.lng - projparam.celpole.lng) * deg,
			  cda = Math.cos(da),
			  sda = Math.sin(da),
			  d = raDec.lat * deg,
			  cd = Math.cos(d),
			  sd = Math.sin(d),
			  dp = projparam.celpole.lat * deg,
			  cdp = Math.cos(dp),
			  sdp = Math.sin(dp),
			  asinarg = sd * sdp + cd * cdp * cda;
		if (asinarg > 1.0) {
			asinarg = 1.0;
		} else if (asinarg < -1.0) {
			asinarg = -1.0;
		}
		return new L.LatLng(Math.asin(asinarg) * rad,
		 projparam.natpole.lng + Math.atan2(- cd * sda,
		    sd * cdp  - cd * sdp * cda) * rad);
	},

	// Convert from pixel to reduced coordinates.
	_pixToRed: function (pix) {
		var	projparam = this.projparam,
		    cd = projparam.cd,
		    red = pix.subtract(projparam.crpix);
		return new L.Point(red.x * cd[0][0] + red.y * cd[0][1],
			red.x * cd[1][0] + red.y * cd[1][1]);
	},

	// Convert from reduced to pixel coordinates.
	_redToPix: function (red) {
		var projparam = this.projparam,
		    cdinv = projparam.cdinv;
		return new L.point(red.x * cdinv[0][0] + red.y * cdinv[0][1],
		 red.x * cdinv[1][0] + red.y * cdinv[1][1]).add(projparam.crpix);
	},

	// Compute the CD matrix invert.
	_invertCD: function (cd) {
		var detinv = 1.0 / (cd[0][0] * cd[1][1] - cd[0][1] * cd[1][0]);
		return [[cd[1][1] * detinv, -cd[0][1] * detinv],
		 [-cd[1][0] * detinv, cd[0][0] * detinv]];
	}
});

L.Projection.WCS.zenithal = L.Projection.WCS.extend({

	paraminit: function (projparam) {
		this.projparam = projparam;
		projparam.cdinv = this._invertCD(projparam.cd);
		projparam.natfid = new L.LatLng(0.0, 90.0);
		projparam.celpole = projparam.crval;
	},

	project: function (latlng) { // LatLng [deg] -> Point
		var phiTheta = this._raDecToPhiTheta(latlng);
		phiTheta.lat = this._thetaToR(phiTheta.lat);
		return this._redToPix(this._phiRToRed(phiTheta));
	},

	unproject: function (point) { // Point -> LatLng [deg]		
		var  phiTheta = this._redToPhiR(this._pixToRed(point));
		phiTheta.lat = this._rToTheta(phiTheta.lat);
		return this._phiThetaToRADec(phiTheta);
	},

	// (x, y) ["deg"] -> \phi, r [deg] for zenithal projections.
	_redToPhiR: function (red) {
		return new L.LatLng(Math.sqrt(red.x * red.x + red.y * red.y),
		 Math.atan2(red.x, - red.y) * 180.0 / Math.PI);
	},

	// \phi, r [deg] -> (x, y) ["deg"] for zenithal projections.
	_phiRToRed: function (phiR) {
		var	deg = Math.PI / 180.0,
			p = phiR.lng * deg;
		return new L.Point(phiR.lat * Math.sin(p), - phiR.lat * Math.cos(p));
	}
});

L.Projection.WCS.TAN = L.Projection.WCS.zenithal.extend({
	code: 'TAN',

	_rToTheta: function (r) {
		return Math.atan2(180.0, Math.PI * r) * 180.0 / Math.PI;
	},

	_thetaToR: function (theta) {
		return 180.0 / Math.PI * Math.tan((90.0 - theta) * Math.PI / 180.0);
	}
});

L.Projection.WCS.ZEA = L.Projection.WCS.zenithal.extend({
	code: 'ZEA',

	_rToTheta: function (r) {
		var rr = Math.PI * r / 360.0;
		if (Math.abs(rr) < 1.0) {
			return 90.0 - 2.0 * Math.asin(rr) * 180.0 / Math.PI;
		} else {
			return 90.0;
		}
	},

	_thetaToR: function (theta) {
		return 360.0 / Math.PI * Math.sin((90.0 - theta) * Math.PI / 360.0);
	}

});
