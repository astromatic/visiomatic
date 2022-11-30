/*
# 	FITS WCS (World Coordinate System) (de-)projection
#	(see http://www.atnf.csiro.au/people/mcalabre/WCS/).
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#                            Chiara Marmo    - Paris-Saclay
*/
import {
	Class,
	LatLng,
	Point,
	bounds
} from 'leaflet';


export const Projection = Class.extend({

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
			natpole = new LatLng(90.0, 180.0);
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
		return new LatLng(deltap, alphap);
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
		return new LatLng(Math.asin(asinarg) * rad,
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
			phitheta = new LatLng(Math.asin(asinarg > 1.0 ? 1.0
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
		return new Point(red.x * cd[0][0] + red.y * cd[0][1],
			red.x * cd[1][0] + red.y * cd[1][1]);
	},

	// Convert from reduced to pixel coordinates.
	_redToPix: function (red) {
		var projparam = this.projparam,
		    cdinv = projparam.cdinv;
		return new Point(red.x * cdinv[0][0] + red.y * cdinv[0][1],
		 red.x * cdinv[1][0] + red.y * cdinv[1][1]).add(projparam.crpix);
	},

	// Compute the CD matrix invert.
	_invertCD: function (cd) {
		var detinv = 1.0 / (cd[0][0] * cd[1][1] - cd[0][1] * cd[1][0]);
		return [[cd[1][1] * detinv, -cd[0][1] * detinv],
		 [-cd[1][0] * detinv, cd[0][0] * detinv]];
	}
});

