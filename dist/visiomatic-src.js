/*
Copyright:    (C) 2014-2016 Emmanuel Bertin - IAP/CNRS/UPMC,
                            Chiara Marmo - IDES/Paris-Sud,
                            Ruven Pillay - C2RMF/CNRS
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are
permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice, this list of
      conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice, this list
      of conditions and the following disclaimer in the documentation and/or other materials
      provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*
# L.Projection.WCS computes a list of FITS WCS (World Coordinate System)
# (de-)projections (see http://www.atnf.csiro.au/people/mcalabre/WCS/)
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014,2015 Emmanuel Bertin - IAP/CNRS/UPMC,
#                          Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 14/11/2015
*/

L.Projection.WCS = L.Class.extend({

	bounds: L.bounds([-0.5, -0.5], [0.5, 0.5]),

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
				natpole = L.latLng(90.0, 180.0);
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
		return L.latLng(Math.asin(asinarg) * rad,
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
				phitheta = L.latLng(Math.asin(asinarg > 1.0 ? 1.0
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
		return L.point(red.x * cd[0][0] + red.y * cd[0][1],
			red.x * cd[1][0] + red.y * cd[1][1]);
	},

	// Convert from reduced to pixel coordinates.
	_redToPix: function (red) {
		var projparam = this.projparam,
		    cdinv = projparam.cdinv;
		return L.point(red.x * cdinv[0][0] + red.y * cdinv[0][1],
		 red.x * cdinv[1][0] + red.y * cdinv[1][1]).add(projparam.crpix);
	},

	// Compute the CD matrix invert.
	_invertCD: function (cd) {
		var detinv = 1.0 / (cd[0][0] * cd[1][1] - cd[0][1] * cd[1][0]);
		return [[cd[1][1] * detinv, -cd[0][1] * detinv],
		 [-cd[1][0] * detinv, cd[0][0] * detinv]];
	}
});

L.Projection.WCS.PIX = L.Projection.WCS.extend({
	code: 'PIX',

	_paramInit: function (projparam) {
		this.projparam = projparam;
		projparam.cdinv = this._invertCD(projparam.cd);
		projparam.cpole = projparam.crval;
		this.bounds = L.bounds([0.5, this.projparam.naxis.y - 0.5], [this.projparam.naxis.x - 0.5, 0.5]);
	},

	project: function (latlng) {
		return L.point(latlng.lng, latlng.lat);
	},

	unproject: function (point) {
		return L.latLng(point.y, point.x);
	}
});

L.Projection.WCS.zenithal = L.Projection.WCS.extend({

	_paramInit: function (projparam) {
		this.projparam = projparam;
		projparam.cdinv = this._invertCD(projparam.cd);
		projparam.natrval = L.latLng(90.0, 0.0);
		projparam.natpole = this._natpole();
		projparam.cpole = this._cpole();
	},

	// (x, y) ["deg"] -> \phi, r [deg] for zenithal projections.
	_redToPhiR: function (red) {
		return L.latLng(Math.sqrt(red.x * red.x + red.y * red.y),
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
		return Math.tan((90.0 - theta) * Math.PI / 180.0) * 180.0 / Math.PI;
	}
});

L.Projection.WCS.ZEA = L.Projection.WCS.zenithal.extend({
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

L.Projection.WCS.cylindrical = L.Projection.WCS.extend({

	_paramInit: function (projparam) {
		var	deg = Math.PI / 180.0;
		this.projparam = projparam;
		projparam.cdinv = this._invertCD(projparam.cd);
		projparam.lambda = projparam.pv[1][1];
		if (projparam.lambda === 0.0) { projparam.lambda = 1.0; }
		projparam.natrval = L.latLng(0.0, 0.0);
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

L.Projection.WCS.CAR = L.Projection.WCS.cylindrical.extend({

	// (x, y) ["deg"] -> \phi, r [deg] for CAR projections.
	_redToPhiR: function (red) {
		return L.latLng(red.y, red.x);
	},

	// \phi, r [deg] -> (x, y) ["deg"] for CAR projections.
	_phiRToRed: function (phiR) {
		return L.point(phiR.lng, phiR.lat);
	}
});

L.Projection.WCS.CEA = L.Projection.WCS.cylindrical.extend({

	// (x, y) ["deg"] -> \phi, r [deg] for CEA projections.
	_redToPhiR: function (red) {
		var deg = Math.PI / 180.0,
				slat = red.y * this.projparam.lambda * deg;
		return L.latLng(slat > -1.0 ?
		  (slat < 1.0 ? Math.asin(slat) / deg : 90.0) : -90.0, red.x);
	},

	// \phi, r [deg] -> (x, y) ["deg"] for CEA projections.
	_phiRToRed: function (phiR) {
		var deg = Math.PI / 180.0;
		return L.point(phiR.lng,
		               Math.sin(phiR.lat * deg) / (this.projparam.lambda * deg));
	}
});

L.Projection.WCS.conical = L.Projection.WCS.extend({

	// (x, y) ["deg"] -> \phi, r [deg] for conical projections.
	_redToPhiR: function (red) {
		var deg = Math.PI / 180.0,
		    projparam = this.projparam,
		    dy = projparam.y0 - red.y,
				rTheta = projparam.sthetaA * Math.sqrt(red.x * red.x + dy * dy);
		return L.latLng(rTheta, Math.atan2(red.x / rTheta, dy / rTheta) / projparam.c / deg);
	},

	// \phi, r [deg] -> (x, y) ["deg"] for conical projections.
	_phiRToRed: function (phiR) {
		var	deg = Math.PI / 180.0,
		     p = this.projparam.c * phiR.lng * deg;
		return L.point(phiR.lat * Math.sin(p), - phiR.lat * Math.cos(p) + this.projparam.y0);
	}
});

L.Projection.WCS.COE = L.Projection.WCS.conical.extend({

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
		projparam.natrval = L.latLng(projparam.thetaA, 0.0);
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



/*
# L.WCS emulates the FITS WCS (World Coordinate System) popular among
# the astronomical community (see http://www.atnf.csiro.au/people/mcalabre/WCS/)
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2017 Emmanuel Bertin - IAP/CNRS/UPMC,
#                                Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 01/12/2017
*/

L.CRS.WCS = L.extend({}, L.CRS, {
	code: 'WCS',

	options: {
		nzoom: 9,
		tileSize: [256, 256],
		nativeCelsys: false			// If true, world coordinates are returned
			                      // in the native celestial system
	},

	defaultparam: {
		ctype: {x: 'PIXEL', y: 'PIXEL'},
		naxis: [256, 256],
		crpix: [129, 129],
		crval: [0.0, 0.0],										// (\delta_0, \alpha_0)
//	cpole: (equal to crval by default)		// (\delta_p, \alpha_p)
		cd: [[1.0, 0.0], [0.0, 1.0]],
		natrval: [90.0, 0.0],										// (\theta_0. \phi_0)
		natpole: [90.0, 999.0],								// (\theta_p, \phi_p)
		pv: [[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
		     [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]]
	},

	initialize: function (hdr, options) {
		options = L.setOptions(this, options);
		var	defaultparam = this.defaultparam;

		this.tileSize = L.point(options.tileSize);
		this.nzoom = options.nzoom;
		this.ctype = {x: defaultparam.ctype.x, y: defaultparam.ctype.y};
		this.naxis = L.point(defaultparam.naxis, true);
		this.projparam = new this._paramInit(defaultparam);
		if (hdr) {
			this._readWCS(hdr);
		}
		this._paramInit(options, this.projparam);

		// Identify the WCS projection type
		switch (this.ctype.x.substr(5, 3)) {
		case 'ZEA':
			this.projection = new L.Projection.WCS.ZEA();
			this.pixelFlag = false;
			this.infinite = true;
			break;
		case 'TAN':
			this.projection = new L.Projection.WCS.TAN();
			this.pixelFlag = false;
			this.infinite = true;
			break;
		case 'CAR':
			this.projection = new L.Projection.WCS.CAR();
			this.pixelFlag = false;
			this.infinite = true;
			break;
		case 'CEA':
			this.projection = new L.Projection.WCS.CEA();
			this.pixelFlag = false;
			this.infinite = true;
			break;
		case 'COE':
			this.projection = new L.Projection.WCS.COE();
			this.pixelFlag = false;
			this.infinite = true;
			break;
		default:
			this.projection = new L.Projection.WCS.PIX();
			this.pixelFlag = true;
			this.infinite = false;
			// Center on image if WCS is in pixels
			if (!this.options.crval) {
				this.projparam.crval = L.latLng((this.naxis.y + 1.0) / 2.0,
				                                (this.naxis.x + 1.0) / 2.0);
			}
			this.wrapLng = [0.5, this.naxis.x - 0.5];
			this.wrapLat = [this.naxis.y - 0.5, 0.5];
			break;
		}

		if (!this.pixelFlag) {
			// Identify the native celestial coordinate system
			switch (this.ctype.x.substr(0, 1)) {
			case 'G':
				this.celsyscode = 'galactic';
				break;
			case 'E':
				this.celsyscode = 'ecliptic';
				break;
			case 'S':
				this.celsyscode = 'supergalactic';
				break;
			default:
				this.celsyscode = 'equatorial';
				break;
			}

			if (this.celsyscode !== 'equatorial') {
				this.projparam.celsysmat = this._celsysmatInit(this.celsyscode);
				this.projection.celsysToEq = this.celsysToEq;
				this.projection.eqToCelsys = this.eqToCelsys;
				this.forceNativeCelsys = (this.options.nativeCelsys === true);
				this.projection.celsysflag = !this.forceNativeCelsys;
			}
		}

		this.transformation = new L.Transformation(1.0, -0.5, -1.0, this.naxis.y + 0.5);
		this.projection._paramInit(this.projparam);
		this.code += ':' + this.projection.code;
	},

	// convert celestial (angular) coordinates to equatorial
	celsysToEq: function (latlng) {
		var	cmat = this.projparam.celsysmat,
		    deg = Math.PI / 180.0,
				invdeg = 180.0 / Math.PI,
			  a2 = latlng.lng * deg - cmat[1],
			  d2 = latlng.lat * deg,
				sd2 = Math.sin(d2),
				cd2cp = Math.cos(d2) * cmat[2],
				sd = sd2 * cmat[3] - cd2cp * Math.cos(a2);
		return L.latLng(Math.asin(sd) * invdeg,
		                ((Math.atan2(cd2cp * Math.sin(a2), sd2 - sd * cmat[3]) +
		                 cmat[0]) * invdeg + 360.0) % 360.0);
	},

	// convert equatorial (angular) coordinates to celestial
	eqToCelsys: function (latlng) {
		var	cmat = this.projparam.celsysmat,
		    deg = Math.PI / 180.0,
				invdeg = 180.0 / Math.PI,
			  a = latlng.lng * deg - cmat[0],
			  sd = Math.sin(latlng.lat * deg),
				cdcp = Math.cos(latlng.lat * deg) * cmat[2],
				sd2 = sd * cmat[3] + cdcp * Math.cos(a);
		return L.latLng(Math.asin(sd2) * invdeg,
		                ((Math.atan2(cdcp * Math.sin(a), sd2 * cmat[3] - sd) +
		                 cmat[1]) * invdeg + 360.0) % 360.0);
	},


	scale: function (zoom) {
		return Math.pow(2, zoom - this.nzoom + 1);
	},

	zoom: function (scale) {
		return Math.log(scale) / Math.LN2 + this.nzoom - 1;
	},

	// return the raw pixel scale in degrees
	rawPixelScale: function (latlng) {
		var p0 = this.projection.project(latlng),
		    latlngdx = this.projection.unproject(p0.add([10.0, 0.0])),
		    latlngdy = this.projection.unproject(p0.add([0.0, 10.0])),
				dlngdx = latlngdx.lng - latlng.lng,
				dlngdy = latlngdy.lng - latlng.lng;

		if (dlngdx > 180.0) { dlngdx -= 360.0; }
		else if (dlngdx < -180.0) { dlngdx += 360.0; }
		if (dlngdy > 180.0) { dlngdy -= 360.0; }
		else if (dlngdy < -180.0) { dlngdy += 360.0; }

		return 0.1 * Math.sqrt(Math.abs((dlngdx * (latlngdy.lat - latlng.lat) -
		  dlngdy * (latlngdx.lat - latlng.lat))) *
		  Math.cos(latlng.lat * Math.PI / 180.0));
	},

	// return the current pixel scale in degrees
	pixelScale: function (zoom, latlng) {
		return this.rawPixelScale(latlng) / this.scale(zoom);
	},

	// return the zoom level that corresponds to the given FoV in degrees
	fovToZoom: function (map, fov, latlng) {
		var scale = this.rawPixelScale(latlng),
			size = map.getSize();

		if (fov < scale) { fov = scale; }
		scale *= Math.sqrt(size.x * size.x + size.y * size.y);
		return fov > 0.0 ? this.zoom(scale / fov) : this.nzoom - 1;
	},

	// return the FoV in degrees that corresponds to the given zoom level
	zoomToFov: function (map, zoom, latlng) {
		var size = map.getSize(),
			scale = this.rawPixelScale(latlng) *
			  Math.sqrt(size.x * size.x + size.y * size.y),
			zscale = this.scale(zoom);
		return  zscale > 0.0 ? scale / zscale : scale;
	},

	distance: function (latlng1, latlng2) {
		var rad = Math.PI / 180.0,
		    lat1 = latlng1.lat * rad,
		    lat2 = latlng2.lat * rad,
		    a = Math.sin(lat1) * Math.sin(lat2) +
		        Math.cos(lat1) * Math.cos(lat2) * Math.cos((latlng2.lng - latlng1.lng) * rad);

		return 180.0 / Math.PI * Math.acos(Math.min(a, 1));
	},

	// Parse a string of coordinates. Return undefined if parsing failed
	parseCoords: function (str) {
		var result, latlng;

		// Try VisiOmatic sexagesimal first
		latlng = L.IIPUtils.hmsDMSToLatLng(str);
		if (typeof latlng === 'undefined') {
			// Parse regular deg, deg. The heading "J" is to support the Sesame@CDS output
			result = /(?:%J\s|^)([-+]?\d+\.?\d*)\s*[,\s]+\s*([-+]?\d+\.?\d*)/g.exec(str);
			if (result && result.length >= 3) {
				latlng = L.latLng(Number(result[2]), Number(result[1]));
			}
		}
		if (latlng) {
			if (this.forceNativeCelsys) {
				latlng = this.eqToCelsys(latlng);
			}
			return latlng;
		} else {
			return undefined;
		}
	},

	// Initialize WCS parameters
	_paramInit: function (newparam, param) {
		if (!param) {
			param = this;
		}
		if (newparam.naxis) {
			param.naxis = L.point(newparam.naxis);
		}
		if (newparam.crval) {
			param.crval = param.cpole = L.latLng(newparam.crval);
		}
		if (newparam.crpix) {
			param.crpix = L.point(newparam.crpix);
		}
		if (newparam.cd) {
			param.cd = [[newparam.cd[0][0], newparam.cd[0][1]],
		           [newparam.cd[1][0], newparam.cd[1][1]]];
		}
		if (newparam.natrval) {
			param.natrval = L.latLng(newparam.natrval);
		}
		if (newparam.natpole) {
			param.natpole = L.latLng(newparam.natpole);
		}
		if (newparam.pv) {
			param.pv = [];
			param.pv[0] = newparam.pv[0].slice();
			param.pv[1] = newparam.pv[1].slice();
		}
	},

	// Generate a celestial coordinate system transformation matrix
	_celsysmatInit: function (celcode) {
		var	deg = Math.PI / 180.0,
				corig, cpole,
				cmat = [];
		switch (celcode) {
		case 'galactic':
			corig = L.latLng(-28.93617242, 266.40499625);
			cpole = L.latLng(27.12825120, 192.85948123);
			break;
		case 'ecliptic':
			corig = L.latLng(0.0, 0.0);
			cpole = L.latLng(66.99111111, 273.85261111);
			break;
		case 'supergalactic':
			corig = L.latLng(59.52315, 42.29235);
			cpole = L.latLng(15.70480, 283.7514);
			break;
		default:
			corig = L.latLng(0.0, 0.0);
			cpole = L.latLng(0.0, 0.0);
			break;
		}
		cmat[0] = cpole.lng * deg;
		cmat[1] = Math.asin(Math.cos(corig.lat * deg) * Math.sin((cpole.lng - corig.lng) * deg));
		cmat[2] = Math.cos(cpole.lat * deg);
		cmat[3] = Math.sin(cpole.lat * deg);

		return cmat;
	},

	// Read WCS information from a FITS header
	_readWCS: function (hdr) {
		var key = L.IIPUtils.readFITSKey,
		    projparam = this.projparam,
		    v;
		if ((v = key('CTYPE1', hdr))) { this.ctype.x = v; }
		if ((v = key('CTYPE2', hdr))) { this.ctype.y = v; }
		if ((v = key('NAXIS1', hdr))) { projparam.naxis.x = this.naxis.x = parseInt(v, 10); }
		if ((v = key('NAXIS2', hdr))) { projparam.naxis.y = this.naxis.y = parseInt(v, 10); }
		if ((v = key('CRPIX1', hdr))) { projparam.crpix.x = parseFloat(v, 10); }
		if ((v = key('CRPIX2', hdr))) { projparam.crpix.y = parseFloat(v, 10); }
		if ((v = key('CRVAL1', hdr))) { projparam.crval.lng = parseFloat(v, 10); }
		if ((v = key('CRVAL2', hdr))) { projparam.crval.lat = parseFloat(v, 10); }
		if ((v = key('LONPOLE', hdr))) { projparam.natpole.lng = parseFloat(v, 10); }
		if ((v = key('LATPOLE', hdr))) { projparam.natpol.lat = parseFloat(v, 10); }
		if ((v = key('CD1_1', hdr))) { projparam.cd[0][0] = parseFloat(v, 10); }
		if ((v = key('CD1_2', hdr))) { projparam.cd[0][1] = parseFloat(v, 10); }
		if ((v = key('CD2_1', hdr))) { projparam.cd[1][0] = parseFloat(v, 10); }
		if ((v = key('CD2_2', hdr))) { projparam.cd[1][1] = parseFloat(v, 10); }
		for (var d = 0; d < 2; d++) {
			for (var j = 0; j < 20; j++) {
				if ((v = key('PV' + (d + 1) + '_' + j, hdr))) {
					projparam.pv[d][j] = parseFloat(v, 10);
				}
			}
		}
	},

	_deltaLng: function (latLng, latLng0) {
		var	dlng = latLng.lng - latLng0.lng;

		return dlng > 180.0 ? dlng - 360.0 : (dlng < -180.0 ? dlng + 360.0 : dlng);
	}
});

L.CRS.WCS = L.Class.extend(L.CRS.WCS);

L.CRS.wcs = function (options) {
	return new L.CRS.WCS(options);
};


/*
# L.IIPUtils contains general utility methods
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2018 Emmanuel Bertin - IAP/CNRS/SorbonneU,
#	                         Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 17/05/2018
*/
L.IIPUtils = {
// Definitions for RegExp
	REG_PDEC: '(\\d+\\.\\d*)',
	REG_FLOAT: '([-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?)',

// Ajax call to server
	requestURL: function (url, purpose, action, context, timeout) {
		var	httpRequest;

		if (window.XMLHttpRequest) { // Mozilla, Safari, ...
			httpRequest = new XMLHttpRequest();
		} else if (window.ActiveXObject) { // IE
			try {
				httpRequest = new ActiveXObject('Msxml2.XMLHTTP');
			}
			catch (e) {
				try {
					httpRequest = new ActiveXObject('Microsoft.XMLHTTP');
				}
				catch (e) {}
			}
		}
		if (!httpRequest) {
			alert('Giving up: Cannot create an XMLHTTP instance for ' + purpose);
			return false;
		}
		if (timeout) {
			httpRequest.timeout = timeout * 1000;	// seconds -> milliseconds
			httpRequest.ontimeout = function () {
				alert('Time out while ' + purpose);
			};
		}
		httpRequest.open('GET', url);

		// Send Credrentials
		if ((context) && (context.options.credentials)) {
			httpRequest.withCredentials = true;

		}

		// if request catalog need authenticate
		if ((context) && (context.options.authenticate === 'csrftoken')) {
			httpRequest.setRequestHeader('X-CSRFToken', this.getCookie('csrftoken'));
		}

		if ((action)) {
			httpRequest.onreadystatechange = function () {
				action(context, httpRequest);
			};
		}
		httpRequest.send();
	},

	// Return a dictionary of name/value pairs from a URL string, from
	// http://stevenbenner.com/2010/03/javascript-regex-trick-parse-a-query-string-into-an-object/
	parseURL: function (url) {
		var dict = {};
		url.replace(
			new RegExp('([^?=&]+)(=([^&]*))?', 'g'),
			function ($0, $1, $2, $3) { dict[$1] = $3; }
		);
		return dict;
	},

	// Return a URL with an updated keyword/value queryString(from http://stackoverflow.com/a/5999118)
	updateURL: function (url, keyword, value) {
		var re = new RegExp('([?&])' + keyword + '=.*?(&|$)', 'i'),
			separator = url.indexOf('?') !== -1 ? '&' : '?';

		return url.match(re) ? url.replace(re, '$1' + keyword + '=' + value + '$2') :
		  url + separator + keyword + '=' + value;
	},

	// Return the domain of a given URL (from http://stackoverflow.com/a/28054735)
	checkDomain: function (url) {
		if (url.indexOf('//') === 0) {
			url = location.protocol + url;
		}
		return url.toLowerCase().replace(/([a-z])?:\/\//, '$1').split('/')[0];
	},

	// Check if a given URL is external (from http://stackoverflow.com/a/28054735)
	isExternal: function (url) {
		return ((url.indexOf(':') > -1 || url.indexOf('//') > -1) &&
			this.checkDomain(location.href) !== this.checkDomain(url));
	},

	// Copy string to clipboard (from http://stackoverflow.com/a/33928558)
	// Chrome 43+, Firefox 42+, Edge and Safari 10+ supported
	copyToClipboard: function (text) {
		if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
			var textarea = document.createElement('textarea');
			textarea.textContent = text;
			textarea.style.position = 'fixed';  // Prevent scrolling to bottom of page in MS Edge.
			document.body.appendChild(textarea);
			textarea.select();
			try {
				return document.execCommand('copy');  // Security exception may be thrown by some browsers.
			} catch (ex) {
				console.warn('Copy to clipboard failed.', ex);
				return false;
			} finally {
				document.body.removeChild(textarea);
			}
		}
	},

	// Add a short (<400ms) "flash" animation to an element
	flashElement: function (elem) {
		L.DomUtil.addClass(elem, 'leaflet-control-flash');
		setTimeout(function () {
			L.DomUtil.removeClass(elem, 'leaflet-control-flash');
		}, 400);

	},

	// Read content of a FITS header keyword
	readFITSKey: function (keyword, str) {
		var key = keyword.trim().toUpperCase().substr(0, 8),
			nspace = 8 - key.length,
			keyreg = new RegExp(key + (nspace > 0 ? '\\ {' + nspace.toString() + '}' : '') +
			 '=\\ *(?:\'((?:\\ *[^\'\\ ]+)*)\\ *\'|([-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?))'),
			match = keyreg.exec(str);
		if (!match) {
			return null;
		} else if (match[1]) {
			return match[1];
		} else {
			return match[2];
		}
	},

// Return the distance between two world coords latLng1 and latLng2 in degrees
	distance: function (latlng1, latlng2) {
		var d2r = Math.PI / 180.0,
		 lat1 = latlng1.lat * d2r,
		 lat2 = latlng2.lat * d2r,
		 dLat = lat2 - lat1,
		 dLon = (latlng2.lng - latlng1.lng) * d2r,
		 sin1 = Math.sin(dLat / 2),
		 sin2 = Math.sin(dLon / 2);

		var a = sin1 * sin1 + sin2 * sin2 * Math.cos(lat1) * Math.cos(lat2);

		return Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 360.0 / Math.PI;
	},

	// Convert degrees to HMSDMS (DMS code from the Leaflet-Coordinates plug-in)
	latLngToHMSDMS : function (latlng) {
		var lng = (latlng.lng + 360.0) / 360.0;
		lng = (lng - Math.floor(lng)) * 24.0;
		var h = Math.floor(lng),
		 mf = (lng - h) * 60.0,
		 m = Math.floor(mf),
		 sf = (mf - m) * 60.0;
		if (sf >= 60.0) {
			m++;
			sf = 0.0;
		}
		if (m === 60) {
			h++;
			m = 0;
		}
		var str = (h < 10 ? '0' : '') + h.toString() + ':' + (m < 10 ? '0' : '') + m.toString() +
		 ':' + (sf < 10.0 ? '0' : '') + sf.toFixed(3),
		 lat = Math.abs(latlng.lat),
		 sgn = latlng.lat < 0.0 ? '-' : '+',
		 d = Math.floor(lat);
		mf = (lat - d) * 60.0;
		m = Math.floor(mf);
		sf = (mf - m) * 60.0;
		if (sf >= 60.0) {
			m++;
			sf = 0.0;
		}
		if (m === 60) {
			h++;
			m = 0;
		}
		return str + ' ' + sgn + (d < 10 ? '0' : '') + d.toString() + ':' +
		 (m < 10 ? '0' : '') + m.toString() + ':' +
		 (sf < 10.0 ? '0' : '') + sf.toFixed(2);
	},

	// Convert HMSDMS to degrees
	hmsDMSToLatLng: function (str) {
		var result;

		result = /^\s*(\d+)[h:](\d+)[m':](\d+\.?\d*)[s"]?\s*,?\s*([-+]?)(\d+)[d°:](\d+)[m':](\d+\.?\d*)[s"]?/g.exec(str);
		if (result && result.length >= 8) {
			var	sgn = Number(result[4] + '1');

			return L.latLng(sgn *
			    (Number(result[5]) + Number(result[6]) / 60.0 + Number(result[7]) / 3600.0),
			    Number(result[1]) * 15.0 + Number(result[2]) / 4.0 + Number(result[3]) / 240.0);
		} else {
			return undefined;
		}
	},


	// returns the value of a specified cookie (from http://www.w3schools.com/js/js_cookies.asp)
	getCookie: function (cname) {
	    var name = cname + '=';
	    var ca = document.cookie.split(';');
	    for (var i = 0; i < ca.length; i++) {
	        var c = ca[i];
	        while (c.charAt(0) === ' ') {
	            c = c.substring(1);
	        }
	        if (c.indexOf(name) === 0) {
	            return c.substring(name.length, c.length);
	        }
	    }
	    return '';
	}

};



/*
# L.TileLayer.IIP adds support for IIP layers to Leaflet
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	VisiOmatic
#
#	Copyright:		(C) 2014-2017 IAP/CNRS/UPMC, IDES/Paris-Sud and C2RMF/CNRS
#
#	Last modified:		01/12/2017
*/

L.TileLayer.IIP = L.TileLayer.extend({
	options: {
		title: '',
		crs: null,
		nativeCelsys: false,
		center: false,
		fov: false,
		minZoom: 0,
		maxZoom: null,
		maxNativeZoom: 18,
		noWrap: true,
		contrast: 1.0,
		colorSat: 1.0,
		gamma: 1.0,
		cMap: 'grey',
		invertCMap: false,
		quality: 90,
		mixingMode: 'color',
		channelColors: [],
		channelLabels: [],
		channelLabelMatch: '.*',
		channelUnits: [],
		minMaxValues: [],
		defaultChannel: 0,
		credentials: false,
		sesameURL: 'https://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame'

		/*
		pane: 'tilePane',
		opacity: 1,
		attribution: <String>,
		maxNativeZoom: <Number>,
		zIndex: <Number>,
		bounds: <LatLngBounds>
		unloadInvisibleTiles: L.Browser.mobile,
		updateWhenIdle: L.Browser.mobile,
		updateInterval: 150,
		tms: <Boolean>,
		zoomReverse: <Number>,
		detectRetina: <Number>,
		*/
	},

	// Default IIPImage rendering parameters
	iipdefault: {
		contrast: 1,
		gamma: 1,
		cMap: 'grey',
		invertCMap: false,
		minValue: [],
		maxValue: [],
		channelColors: [
			[''],
			['#FFFFFF'],
			['#00BAFF', '#FFBA00'],
			['#0000FF', '#00FF00', '#FF0000'],
			['#0000E0', '#00BA88', '#88BA00', '#E00000'],
			['#0000CA', '#007BA8', '#00CA00', '#A87B00', '#CA0000'],
			['#0000BA', '#00719B', '#009B71', '#719B00', '#9B7100', '#BA0000']
		],
		quality: 90
	},

	initialize: function (url, options) {
		this.type = 'tilelayer';
		this._url = url.replace(/\&.*$/g, '');

		options = L.setOptions(this, options);

		// detecting retina displays, adjusting tileSize and zoom levels
		if (options.detectRetina && L.Browser.retina && options.maxZoom > 0) {

			options.tileSize = Math.floor(options.tileSize / 2);
			options.zoomOffset++;

			options.minZoom = Math.max(0, options.minZoom);
			options.maxZoom--;
		}

		if (typeof options.subdomains === 'string') {
			options.subdomains = options.subdomains.split('');
		}

		this.iipTileSize = {x: 256, y: 256};
		this.iipImageSize = [];
		this.iipImageSize[0] = this.iipTileSize;
		this.iipGridSize = [];
		this.iipGridSize[0] = {x: 1, y: 1};
		this.iipBPP = 8;
		this.iipMode = options.mixingMode;		// Image rendering mode: 'mono' or 'color'
		this.iipChannel = 0;
		this.iipNChannel = 1;
		this.iipMinZoom = options.minZoom;
		this.iipMaxZoom = options.maxZoom;
		this.iipContrast = options.contrast;
		this.iipColorSat = options.colorSat;
		this.iipGamma = options.gamma;
		this.iipCMap = options.cMap;
		this.iipInvertCMap = options.invertCMap;
		this.iipMinValue = [];
		this.iipMinValue[0] = 0.0;
		this.iipMaxValue = [];
		this.iipMaxValue[0] = 255.0;
		this.iipMix = [[]];
		this.iipRGB = [];
		this.iipChannelLabels = [];
		this.iipChannelFlags = [];
		this.iipChannelUnits = [];
		this.iipQuality = options.quality;

		this._title = options.title.length > 0 ? options.title :
		                this._url.match(/^.*\/(.*)\..*$/)[1];
		this.getIIPMetaData(this._url);

		// for https://github.com/Leaflet/Leaflet/issues/137
		if (!L.Browser.android) {
			this.on('tileunload', this._onTileRemove);
		}
		return this;
	},

	getIIPMetaData: function (url) {
		L.IIPUtils.requestURL(url +
			'&obj=IIP,1.0&obj=max-size&obj=tile-size' +
			'&obj=resolution-number&obj=bits-per-channel' +
			'&obj=min-max-sample-values&obj=subject',
			'getting IIP metadata',
			this._parseMetadata, this);
	},

	_parseMetadata: function (layer, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var response = httpRequest.responseText,
				 matches = layer._readIIPKey(response, 'IIP', L.IIPUtils.REG_PDEC);
				if (!matches) {
					alert('Error: Unexpected response from IIP server ' +
					 layer._url.replace(/\?.*$/g, ''));
				}
				var options = layer.options,
				    iipdefault = layer.iipdefault;

				matches = layer._readIIPKey(response, 'Max-size', '(\\d+)\\s+(\\d+)');
				var maxsize = {
					x: parseInt(matches[1], 10),
					y: parseInt(matches[2], 10)
				};
				matches = layer._readIIPKey(response, 'Tile-size', '(\\d+)\\s+(\\d+)');
				layer.iipTileSize = {
					x: parseInt(matches[1], 10),
					y: parseInt(matches[2], 10)
				};

				options.tileSize = layer.iipTileSize.x;

				// Find the lowest and highest zoom levels
				matches = layer._readIIPKey(response, 'Resolution-number', '(\\d+)');
				layer.iipMaxZoom = parseInt(matches[1], 10) - 1;
				if (layer.iipMinZoom > options.minZoom) {
					options.minZoom = layer.iipMinZoom;
				}
				if (!options.maxZoom) {
					options.maxZoom = layer.iipMaxZoom + 6;
				}
				options.maxNativeZoom = layer.iipMaxZoom;

				// Set grid sizes
				for (var z = 0; z <= layer.iipMaxZoom; z++) {
					layer.iipImageSize[z] = {
						x: Math.floor(maxsize.x / Math.pow(2, layer.iipMaxZoom - z)),
						y: Math.floor(maxsize.y / Math.pow(2, layer.iipMaxZoom - z))
					};
					layer.iipGridSize[z] = {
						x: Math.ceil(layer.iipImageSize[z].x / layer.iipTileSize.x),
						y: Math.ceil(layer.iipImageSize[z].y / layer.iipTileSize.y)
					};
				}
				// (Virtual) grid sizes for extra zooming
				for (z = layer.iipMaxZoom; z <= options.maxZoom; z++) {
					layer.iipGridSize[z] = layer.iipGridSize[layer.iipMaxZoom];
				}

				// Set pixel bpp
				matches = layer._readIIPKey(response, 'Bits-per-channel', '(\\d+)');
				layer.iipBPP = parseInt(matches[1], 10);
				// Only 32bit data are likely to be linearly quantized
				if (layer.iipGamma === layer.iipdefault.gamma) {
					layer.iipGamma = layer.iipBPP >= 32 ? 2.2 : 1.0;
				}

				// Pre-computed min and max pixel values, as well as number of channels
				matches = layer._readIIPKey(response, 'Min-Max-sample-values',
				 '\\s*(.*)');
				var str = matches[1].split(/\s+/),
				    nchannel = layer.iipNChannel = (str.length / 2),
				    mmc = 0;
				for (var c = 0; c < nchannel; c++) {
					iipdefault.minValue[c] = parseFloat(str[mmc++]);
					iipdefault.maxValue[c] = parseFloat(str[mmc++]);
				}

				// Override min and max pixel values based on user provided options
				var minmax = options.minMaxValues;
				if (minmax.length) {
					for (c = 0; c < nchannel; c++) {
						if (minmax[c] !== undefined && minmax[c].length) {
							layer.iipMinValue[c] = minmax[c][0];
							layer.iipMaxValue[c] = minmax[c][1];
						} else {
							layer.iipMinValue[c] = iipdefault.minValue[c];
							layer.iipMaxValue[c] = iipdefault.maxValue[c];
						}
					}
				} else {
					for (c = 0; c < nchannel; c++) {
						layer.iipMinValue[c] = iipdefault.minValue[c];
						layer.iipMaxValue[c] = iipdefault.maxValue[c];
					}
				}

				// Default channel
				layer.iipChannel = options.defaultChannel;

				// Channel labels
				var inlabels = options.channelLabels,
				    ninlabel = inlabels.length,
				    labels = layer.iipChannelLabels,
				    inunits = options.channelUnits,
				    ninunits = inunits.length,
				    units = layer.iipChannelUnits,
						key = L.IIPUtils.readFITSKey,
						numstr, value;

				for (c = 0; c < nchannel; c++) {
					if (c < ninlabel) {
						labels[c] = inlabels[c];
					} else {
						numstr = (c + 1).toString();
						value = key('CHAN' +
						  (c < 9 ? '000' : (c < 99 ? '00' : (c < 999 ? '0' : ''))) + numstr,
						  response);
						labels[c] = value ? value : 'Channel #' + numstr;
					}
				}

				// Copy those units that have been provided
				for (c = 0; c < ninunits; c++) {
					units[c] = inunits[c];
				}
				// Fill out units that are not provided with a default string
				for (c = ninunits; c < nchannel; c++) {
					units[c] = 'ADUs';
				}

				// Initialize mixing matrix depending on arguments and the number of channels
				var cc = 0,
				    mix = layer.iipMix,
						omix = options.channelColors,
						rgb = layer.iipRGB,
						re = new RegExp(options.channelLabelMatch),
						nchanon = 0,
						channelflags = layer.iipChannelFlags;

				nchanon = 0;
				for (c = 0; c < nchannel; c++) {
					channelflags[c] = re.test(labels[c]);
					if (channelflags[c]) {
						nchanon++;
					}
				}
				if (nchanon >= iipdefault.channelColors.length) {
					nchanon = iipdefault.channelColors.length - 1;
				}

				for (c = 0; c < nchannel; c++) {
					mix[c] = [];
					var	col = 3;
					if (omix.length && omix[c] && omix[c].length === 3) {
						// Copy RGB triplet
						rgb[c] = L.rgb(omix[c][0], omix[c][1], omix[c][2]);
					} else {
						rgb[c] = L.rgb(0.0, 0.0, 0.0);
					}
					if (omix.length === 0 && channelflags[c] && cc < nchanon) {
						rgb[c] = L.rgb(iipdefault.channelColors[nchanon][cc++]);
					}
					// Compute the current row of the mixing matrix
					layer.rgbToMix(c);
				}

				if (options.bounds) {
					options.bounds = L.latLngBounds(options.bounds);
				}
				layer.wcs = options.crs ? options.crs : new L.CRS.WCS(response, {
					nativeCelsys: layer.options.nativeCelsys,
					nzoom: layer.iipMaxZoom + 1,
					tileSize: layer.iipTileSize
				});
				layer.iipMetaReady = true;
				layer.fire('metaload');
			} else {
				alert('There was a problem with the IIP metadata request.');
			}
		}
	},

	// Convert an RGB colour and saturation settings to mixing matrix elements
	rgbToMix: function (chan, rgb) {
		if (rgb) {
			this.iipRGB[chan] = rgb.clone();
		} else {
			rgb = this.iipRGB[chan];
		}

		var	cr = this._gammaCorr(rgb.r),
			  cg = this._gammaCorr(rgb.g),
				cb = this._gammaCorr(rgb.b),
			  lum = (cr + cg + cb) / 3.0,
			  alpha = this.iipColorSat / 3.0;

		this.iipMix[chan][0] = lum + alpha * (2.0 * cr - cg - cb);
		this.iipMix[chan][1] = lum + alpha * (2.0 * cg - cr - cb);
		this.iipMix[chan][2] = lum + alpha * (2.0 * cb - cr - cg);

		return;
	},

	// Current channel index defines mixing matrix elements in "mono" mode
	updateMono: function () {
		this.iipMode = 'mono';
	},

	// RGB colours and saturation settings define mixing matrix elements in "color" mode
	updateMix: function () {
		var nchannel = this.iipNChannel;

		this.iipMode = 'color';
		for (var c = 0; c < nchannel; c++) {
			this.rgbToMix(c, this.iipRGB[c]);
		}
	},

	// Apply gamma correction
	_gammaCorr: function (val) {
		return val > 0.0 ? Math.pow(val, this.iipGamma) : 0.0;
	},

	_readIIPKey: function (str, keyword, regexp) {
		var reg = new RegExp(keyword + ':' + regexp);
		return reg.exec(str);
	},

	addTo: function (map) {
		if (this.iipMetaReady) {
			// IIP data are ready so we can go
			this._addToMap(map);
		}
		else {
			// Wait for metadata request to complete
			this.once('metaload', function () {
				this._addToMap(map);
			}, this);
		}
		return this;
	},

	_addToMap: function (map) {
		var zoom,
		    newcrs = this.wcs,
				curcrs = map.options.crs,
				prevcrs = map._prevcrs,
				maploadedflag = map._loaded,
				center;

		if (maploadedflag) {
			curcrs._prevLatLng = map.getCenter();
			curcrs._prevZoom = map.getZoom();
		}

		map._prevcrs = map.options.crs = newcrs;
		L.TileLayer.prototype.addTo.call(this, map);

		// Go to previous layers' coordinates if applicable
		if (prevcrs && newcrs !== curcrs && maploadedflag &&
		    newcrs.pixelFlag === curcrs.pixelFlag) {
			center = curcrs._prevLatLng;
			zoom = curcrs._prevZoom;
			var prevpixscale = prevcrs.pixelScale(zoom, center),
			    newpixscale = newcrs.pixelScale(zoom, center);
			if (prevpixscale > 1e-20 && newpixscale > 1e-20) {
				zoom += Math.round(Math.LOG2E *
				  Math.log(newpixscale / prevpixscale));
			}
		// Else go back to previous recorded position for the new layer
		} else if (newcrs._prevLatLng) {
			center = newcrs._prevLatLng;
			zoom = newcrs._prevZoom;
		} else if (this.options.center) {
			// Default center coordinates and zoom
			var latlng = (typeof this.options.center === 'string') ?
			  newcrs.parseCoords(decodeURI(this.options.center)) :
			  this.options.center;
			if (latlng) {
				if (this.options.fov) {
					zoom = newcrs.fovToZoom(map, this.options.fov, latlng);
				}
				map.setView(latlng, zoom, {reset: true, animate: false});
			} else {
				// If not, ask Sesame@CDS!
				L.IIPUtils.requestURL(
					this.options.sesameURL + '/-oI/A?' +
					  this.options.center,
					'getting coordinates for ' + this.options.center,
					function (_this, httpRequest) {
						if (httpRequest.readyState === 4) {
							if (httpRequest.status === 200) {
								var str = httpRequest.responseText,
									latlng = newcrs.parseCoords(str);
								if (latlng) {
									if (_this.options.fov) {
										zoom = newcrs.fovToZoom(map, _this.options.fov, latlng);
									}
									map.setView(latlng, zoom, {reset: true, animate: false});
								} else {
									map.setView(newcrs.projparam.crval, zoom, {reset: true, animate: false});
									alert(str + ': Unknown location');
								}
							} else {
								map.setView(newcrs.projparam.crval, zoom, {reset: true, animate: false});
								alert('There was a problem with the request to the Sesame service at CDS');
							}
						}
					}, this, 10
				);
			}
		} else {
			map.setView(newcrs.projparam.crval, zoom, {reset: true, animate: false});
		}
	},

	_getTileSizeFac: function () {
		var	map = this._map,
			zoom = this._tileZoom,
			zoomN = this.options.maxNativeZoom;
		return (zoomN && zoom > zoomN) ?
				Math.round(map.getZoomScale(zoom) / map.getZoomScale(zoomN)) : 1;
	},

	_isValidTile: function (coords) {
		var crs = this._map.options.crs;

		if (!crs.infinite) {
			// don't load tile if it's out of bounds and not wrapped
			var bounds = this._globalTileRange;
			if ((!crs.wrapLng && (coords.x < bounds.min.x || coords.x > bounds.max.x)) ||
			    (!crs.wrapLat && (coords.y < bounds.min.y || coords.y > bounds.max.y))) { return false; }
		}

		// don't load tile if it's out of the tile grid
		var z = this._getZoomForUrl(),
		    wcoords = coords.clone();
		this._wrapCoords(wcoords);
		if (wcoords.x < 0 || wcoords.x >= this.iipGridSize[z].x ||
			wcoords.y < 0 || wcoords.y >= this.iipGridSize[z].y) {
			return false;
		}

		if (!this.options.bounds) { return true; }

		// don't load tile if it doesn't intersect the bounds in options
		var tileBounds = this._tileCoordsToBounds(coords);
		return L.latLngBounds(this.options.bounds).intersects(tileBounds);
	},

	createTile: function (coords, done) {
		var	tile = L.TileLayer.prototype.createTile.call(this, coords, done);

		tile.coords = coords;

		return tile;
	},

	getTileUrl: function (coords) {
		var	str = this._url,
			z = this._getZoomForUrl();

		if (this.iipCMap !== this.iipdefault.cMap) {
			str += '&CMP=' + this.iipCMap;
		}
		if (this.iipInvertCMap !== this.iipdefault.invertCMap) {
			str += '&INV';
		}
		if (this.iipContrast !== this.iipdefault.contrast) {
			str += '&CNT=' + this.iipContrast.toString();
		}
		if (this.iipGamma !== this.iipdefault.gamma) {
			str += '&GAM=' + (1.0 / this.iipGamma).toFixed(4);
		}
		for (var c = 0; c < this.iipNChannel; c++) {
			if (this.iipMinValue[c] !== this.iipdefault.minValue[c] ||
			   this.iipMaxValue[c] !== this.iipdefault.maxValue[c]) {
				str += '&MINMAX=' + (c + 1).toString() + ':' +
				   this.iipMinValue[c].toString() + ',' + this.iipMaxValue[c].toString();
			}
		}

		var nchannel = this.iipNChannel,
		    mix = this.iipMix,
		    m, n;

		str += '&CTW=';

		if (this.iipMode === 'color') {
			for (n = 0; n < 3; n++) {
				if (n) { str += ';'; }
				str += mix[0][n].toString();
				for (m = 1; m < nchannel; m++) {
					if (mix[m][n] !== undefined) {
						str += ',' + mix[m][n].toString();
					}
				}
			}
		} else {
			var	cc = this.iipChannel;

			if (cc >= nchannel) { cc = 0; }
			if (cc < nchannel) { nchannel = cc + 1; }
			for (n = 0; n < 3; n++) {
				if (n) { str += ';'; }
				str += (cc === 0 ? '1' : '0');
				for (m = 1; m < nchannel; m++) {
					str += ',' + (cc === m ? '1' : '0');
				}
			}
		}

		if (this.iipQuality !== this.iipdefault.quality) {
			str += '&QLT=' + this.iipQuality.toString();
		}
		return str + '&JTL=' + z.toString() + ',' +
		 (coords.x + this.iipGridSize[z].x * coords.y).toString();
	},

	_initTile: function (tile) {
		L.DomUtil.addClass(tile, 'leaflet-tile');
		var	tileSizeFac = this._getTileSizeFac();

		// Force pixels to be visible at high zoom factos whenever possible
		if (tileSizeFac > 1) {
			if (L.Browser.ie) {
				tile.style.msInterpolationMode = 'nearest-neighbor';
			} else if (L.Browser.chrome) {
				tile.style.imageRendering = 'pixelated';
			} else if (L.Browser.gecko) {
				tile.style.imageRendering = '-moz-crisp-edges';
			} else {
				tile.style.imageRendering = '-webkit-optimize-contrast';
			}
		}

		// Compute tile size (IIP tile size can be less at image borders)
		var	coords = tile.coords,
			z = this._getZoomForUrl();

		if (z > this.iipMaxZoom) { z = this.iipMaxZoom; }
		var sizeX = coords.x + 1 === this.iipGridSize[z].x ?
			    this.iipImageSize[z].x % this.iipTileSize.x : this.iipTileSize.x,
			  sizeY = coords.y + 1 === this.iipGridSize[z].y ?
			    this.iipImageSize[z].y % this.iipTileSize.y : this.iipTileSize.y;

		if (sizeX === 0) {
			sizeX = this.iipTileSize.x;
		}
		if (sizeY === 0) {
			sizeY = this.iipTileSize.y;
		}

		sizeX *= tileSizeFac;
		sizeY *= tileSizeFac;
/*
		// Add an extra 1/2 pixel as an ugly fix to the tile gap pb in some browsers
		if (L.Browser.chrome || L.Browser.safari) {
			sizeX += 0.5;
			sizeY += 0.5;
		}
*/
		tile.style.width = sizeX  + 'px';
		tile.style.height = sizeY + 'px';

		tile.onselectstart = L.Util.falseFn;
		tile.onmousemove = L.Util.falseFn;

		// update opacity on tiles in IE7-8 because of filter inheritance problems
		if (L.Browser.ielt9 && this.options.opacity < 1) {
			L.DomUtil.setOpacity(tile, this.options.opacity);
		}

		// without this hack, tiles disappear after zoom on Chrome for Android
		// https://github.com/Leaflet/Leaflet/issues/2078
		if (L.Browser.android && !L.Browser.android23) {
			tile.style.WebkitBackfaceVisibility = 'hidden';
		}
	}

});

L.tileLayer.iip = function (url, options) {
	return new L.TileLayer.IIP(url, options);
};


/*
# L.RGB.js manages RGB triplets
#
#	This file part of:	VisiOmatic
#
#	Copyright:		(C) 2015 Emmanuel Bertin - IAP/CNRS/UPMC
#
#	Last modified:		04/11/2015
*/

L.RGB = function (r, g, b) {
	this.r = r;
	this.g = g;
	this.b = b;
};

L.RGB.prototype = {

	clone: function () {
		return new L.RGB(this.r, this.g, this.b);
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

L.rgb = function (r, g, b) {
	if (r instanceof L.RGB) {
		return r;
	}
	if (typeof r === 'string') {
		var bigint = parseInt('0x' + r.slice(1), 16);

		return new L.RGB(((bigint >> 16) & 255) / 255.0,
			((bigint >> 8) & 255) / 255.0,
			(bigint & 255) / 255.0);
	}
	if (L.Util.isArray(r)) {
		return new L.RGB(r[0], r[1], r[2]);
	}
	if (r === undefined || r === null) {
		return r;
	}
	return new L.RGB(r, g, b);
};


/*
# Add an ellipse defined by its semi-major and semi-minor axes (in pixels), as
# well as a position angle in degrees (CCW from x axis).
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2015 Emmanuel Bertin - IAP/CNRS/UPMC,
#
#	Last modified: 15/10/2015
*/

L.EllipseMarker = L.Path.extend({
	CANVAS: true,
	SVG: false,

	options: {
		fill: true,
		majAxis: 10,
		minAxis: 10,
		posAngle: 0
	},

	initialize: function (latlng, options) {
		L.setOptions(this, options);

		this._majAxis = this.options.majAxis;
		this._minAxis = this.options.majAxis;
		this._posAngle = this.options.posAngle;
		this._latlng = L.latLng(latlng);

		var	deg = Math.PI / 180.0,
			  cpa = Math.cos(this._posAngle * deg),
			  spa = Math.sin(this._posAngle * deg),
			  cpa2 = cpa * cpa,
			  spa2 = spa * spa,
			  a2 = this._majAxis * this._majAxis,
			  b2 = this._minAxis * this._minAxis,
			  mx2 = a2 * cpa2 + b2 * spa2,
			  my2 = a2 * spa2 + b2 * cpa2,
			  mxy = (a2 - b2) * cpa * spa,
			  c = mx2 * my2 - mxy * mxy;

		this._limX = Math.sqrt(mx2);
		this._limY = Math.sqrt(my2);
		// Manage ellipses with minor axis = 0
		if (c <= 0.0) {
			mx2 += 1.0;
			my2 += 1.0;
			c = mx2 * my2 - mxy * mxy;
		}
		// Necessary for computing the exact ellipse boundaries
		this._cXX = my2 / c;
		this._cYY = mx2 / c;
		this._cXY = -2.0 * mxy / c;
	},

	setLatLng: function (latlng) {
		this._latlng = L.latLng(latlng);
		this.redraw();
		return this.fire('move', {latlng: this._latlng});
	},

	getLatLng: function () {
		return this._latlng;
	},

	setParams: function (ellipseParams) {
		this.options.majAxis = this._majAxis = ellipseParams.majAxis;
		this.options.minAxis = this._minAxis = ellipseParams.minAxis;
		this.options.posAngle = this._posAngle = ellipseParams.posAngle;
		return this.redraw();
	},

	getParams: function () {
		var	ellipseParams;

		ellipseParams.majAxis = this._majAxis;
		ellipseParams.minAxis = this._minAxis;
		ellipseParams.posAngle = this._posAngle;
		return ellipseParams;
	},

	setStyle: L.Path.prototype.setStyle,

	_project: function () {
		this._point = this._map.latLngToLayerPoint(this._latlng);
		this._updateBounds();
	},

	_updateBounds: function () {
		var w = this._clickTolerance(),
		    p = [this._limX + w, this._limY + w];
		this._pxBounds = new L.Bounds(this._point.subtract(p), this._point.add(p));
	},

	_update: function () {
		if (this._map) {
			this._updatePath();
		}
	},

	_updatePath: function () {
		this._renderer._updateEllipse(this);
	},

	_empty: function () {
		return this._majAxis && !this._renderer._bounds.intersects(this._pxBounds);
	},

	_containsPoint: function (p) {
		var	dp = p.subtract(this._point),
			  ct = this._clickTolerance(),
			  dx = Math.abs(dp.x) - ct,
			  dy = Math.abs(dp.y) - ct;

		return this._cXX * (dx > 0.0 ? dx * dx : 0.0) +
		  this._cYY * (dy > 0.0 ? dy * dy : 0.0) + this._cXY * (dp.x * dp.y) <= 1.0;
	}
});

L.ellipseMarker = function (latlng, options) {
	return new L.EllipseMarker(latlng, options);
};

L.Canvas.include({
	_updateEllipse: function (layer) {

		if (layer._empty()) { return; }

		var p = layer._point,
		    ctx = this._ctx,
		    r = layer._minAxis,
		    s = layer._majAxis / layer._minAxis;

		ctx.save();
		ctx.translate(p.x, p.y);
		ctx.rotate(layer._posAngle * Math.PI / 180.0);
		ctx.scale(1, s);

		ctx.beginPath();
		ctx.arc(0, 0, r, 0, Math.PI * 2, false);
		ctx.restore();

		this._fillStroke(ctx, layer);
	}
});

L.SVG.include({
	_updateEllipse: function (layer) {
		var deg = Math.PI / 180.0,
		    p = layer._point,
		    r = layer._minAxis,
		    r2 = layer._majAxis,
		    dx = r * Math.cos(layer._posAngle * deg),
				dy = r * Math.sin(layer._posAngle * deg),
		    arc = 'a' + r + ',' + r2 + ' ' + layer._posAngle + ' 1,0 ';

		// drawing a circle with two half-arcs
		var d = layer._empty() ? 'M0 0' :
				'M' + (p.x - dx) + ',' + (p.y - dy) +
				arc + (dx * 2) + ',' + (dy * 2) + ' ' +
				arc + (-dx * 2) + ',' + (-dy * 2) + ' ';

		this._setPath(layer, d);
	}
});



/*
# Add an ellipse defined by its semi-major and semi-minor axes (in degrees), as
# well as a position angle in degrees (east of north).
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2015 Emmanuel Bertin - IAP/CNRS/UPMC,
#
#	Last modified: 15/10/2015
*/

L.Ellipse = L.EllipseMarker.extend({

	options: {
		fill: true
	},

	initialize: function (latlng, options) {
		L.setOptions(this, options);

		var	deg = Math.PI / 180.0,
			  cpa = Math.cos(this.options.posAngle * deg),
			  spa = Math.sin(this.options.posAngle * deg),
			  cpa2 = cpa * cpa,
			  spa2 = spa * spa,
			  a2 = this.options.majAxis * this.options.majAxis,
			  b2 = this.options.minAxis * this.options.minAxis;
		this._latlng = L.latLng(latlng);
		// Compute quadratic forms to be used for coordinate transforms
		this._mLat2 = a2 * cpa2 + b2 * spa2;
		this._mLng2 = a2 * spa2 + b2 * cpa2;
		this._mLatLng = (a2 - b2) * cpa * spa;
	},

	getBounds: function () {
		var half = [this._limX, this._limY];

		return new L.LatLngBounds(
			this._map.layerPointToLatLng(this._point.subtract(half)),
			this._map.layerPointToLatLng(this._point.add(half)));
	},

	_project: function () {
		var	map = this._map,
			  crs = map.options.crs;

		this._point = map.latLngToLayerPoint(this._latlng);
		if (!this._majAxis1) {
			var lng = this._latlng.lng,
			    lat = this._latlng.lat,
					deg = Math.PI / 180.0,
					clat = Math.cos(lat * deg),
					dl = lat < 90.0 ? 0.001 : -0.001,
					point = crs.project(this._latlng),
			    dpointdlat = crs.project(L.latLng(lat + dl, lng)).subtract(point),
			    dpointdlng = crs.project(L.latLng(lat, lng + dl * 1.0 /
					  (clat > dl ? clat : dl))).subtract(point),
					c11 = dpointdlat.x / dl,
					c12 = dpointdlng.x / dl,
					c21 = dpointdlat.y / dl,
					c22 = dpointdlng.y / dl,
				  mx2 = c11 * c11 * this._mLat2 + c12 * c12 * this._mLng2 +
			  2.0 * c11 * c12 * this._mLatLng,
				  my2 = c21 * c21 * this._mLat2 + c22 * c22 * this._mLng2 +
			  2.0 * c21 * c22 * this._mLatLng,
				  mxy = c11 * c21 * this._mLat2 + c12 * c22 * this._mLng2 +
			  (c11 * c22 + c12 * c21) * this._mLatLng,
				  a1 = 0.5 * (mx2 + my2),
				  a2 = Math.sqrt(0.25 * (mx2 - my2) * (mx2 - my2) + mxy * mxy),
				  a3 = mx2 * my2 - mxy * mxy;
			this._majAxis = this._majAxis1 = Math.sqrt(a1 + a2);
			this._minAxis = this._minAxis1 = a1 > a2 ? Math.sqrt(a1 - a2) : 0.0;
			this._posAngle = 0.5 * Math.atan2(2.0 * mxy, mx2 - my2) / deg;
			this._limX = this._limX1 = Math.sqrt(mx2);
			this._limY = this._limY1 = Math.sqrt(my2);
			// Manage ellipses with minor axis = 0
			if (a3 <= 0.0) {
				mx2 += 1.0;
				my2 += 1.0;
				a3 = mx2 * my2 - mxy * mxy;
			}
			// Necessary for computing the exact ellipse boundaries
			this._cXX1 = my2 / a3;
			this._cYY1 = mx2 / a3;
			this._cXY1 = -2.0 * mxy / a3;
		}

		var scale = crs.scale(map._zoom),
			  invscale2 = 1.0 / (scale * scale);
		// Ellipse parameters have already
		this._majAxis = this._majAxis1 * scale;
		this._minAxis = this._minAxis1 * scale;
		this._limX = this._limX1 * scale;
		this._limY = this._limY1 * scale;
		this._cXX = this._cXX1 * invscale2;
		this._cYY = this._cYY1 * invscale2;
		this._cXY = this._cXY1 * invscale2;

		this._updateBounds();
	}
});

L.ellipse = function (latlng, options) {
	return new L.Ellipse(latlng, options);
};



/*
# L.Catalog contains specific catalog settings and conversion tools.
#
#	This file part of:       VisiOmatic
#
#	Copyright: (C) 2014-2018 Emmanuel Bertin - IAP/CNRS/UPMC,
#	                         Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 25/04/2018
*/

L.Catalog = {
	nmax: 10000,	// Sets the maximum number of sources per query

	_csvToGeoJSON: function (str) {
		// Check to see if the delimiter is defined. If not, then default to comma.
		var badreg = new RegExp('#|--|objName|string|^$'),
		 lines = str.split('\n'),
		 geo = {type: 'FeatureCollection', features: []};

		for (var i in lines) {
			var line = lines[i];
			if (badreg.test(line) === false) {
				var feature = {
					type: 'Feature',
					id: '',
					properties: {
						items: []
					},
					geometry: {
						type: 'Point',
						coordinates: [0.0, 0.0]
					}
				},
				geometry = feature.geometry,
				properties = feature.properties;

				var cell = line.split(/[,;\t]/);
				feature.id = cell[0];
				geometry.coordinates[0] = parseFloat(cell[1]);
				geometry.coordinates[1] = parseFloat(cell[2]);
				var items = cell.slice(3),
				    item;
				for (var j in items) {
					properties.items.push(this.readProperty(items[j]));
				}
				geo.features.push(feature);
			}
		}
		return geo;
	},

	readProperty: function (item) {
		var	fitem = parseFloat(item);
		return isNaN(fitem) ? '--' : fitem;
	},

	toGeoJSON: function (str) {
		return this._csvToGeoJSON(str);
	},

	popup: function (feature) {
		var str = '<div>';
		if (this.objurl) {
			str += 'ID: <a href=\"' +  L.Util.template(this.objurl, L.extend({
				ra: feature.geometry.coordinates[0].toFixed(6),
				dec: feature.geometry.coordinates[1].toFixed(6)
			})) + '\" target=\"_blank\">' + feature.id + '</a></div>';
		} else {
			str += 'ID: ' + feature.id + '</div>';
		}
		str += '<TABLE style="margin:auto;">' +
		       '<TBODY style="vertical-align:top;text-align:left;">';
		for (var i in this.properties) {
			if (this.propertyMask === undefined || this.propertyMask[i] === true) {
				str += '<TR><TD>' + this.properties[i] + ':</TD>' +
				       '<TD>' + feature.properties.items[i].toString() + ' ';
				if (this.units[i]) {
					str += this.units[i];
				}
				str += '</TD></TR>';
			}
		}
		str += '</TBODY></TABLE>';
		return str;

	},

	draw: function (feature, latlng) {
		var refmag = feature.properties.items[this.magindex ? this.magindex : 0];
		return L.circleMarker(latlng, {
			radius: refmag ? this.maglim + 5 - refmag : 8
		});
	},

	filter: function (feature) {
		return true;
	},

	vizierURL: 'https://vizier.unistra.fr/viz-bin',
	mastURL: 'https://archive.stsci.edu'

};

L.Catalog['2MASS'] = L.extend({}, L.Catalog, {
	service: 'Vizier@CDS',
	name: '2MASS',
	className: 'logo-catalog-vizier',
	attribution: '2MASS All-Sky Catalog of Point Sources (Cutri et al. 2003)',
	color: 'red',
	maglim: 17.0,
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=II/246&' +
	 '-out=2MASS,RAJ2000,DEJ2000,Jmag,Hmag,Kmag&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&' +
	 '-out.max={nmax}&-sort=Jmag',
	properties: ['J', 'H', 'K'],
	units: ['', '', ''],
	objurl: L.Catalog.vizierURL + '/VizieR-5?-source=II/246&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

L.Catalog.SDSS = L.extend({}, L.Catalog, {
	service: 'Vizier@CDS',
	name: 'SDSS release 12',
	className: 'logo-catalog-vizier',
	attribution: 'SDSS Photometric Catalog, Release 12 (Alam et al. 2015)',
	color: 'yellow',
	maglim: 25.0,
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=V/147&' +
	 '-out=SDSS12,RA_ICRS,DE_ICRS,umag,gmag,rmag,imag,zmag&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=rmag',
	properties: ['u', 'g', 'r', 'i', 'z'],
	units: ['', '', '', '', ''],
	objurl: L.Catalog.vizierURL + '/VizieR-5?-source=V/147/sdss12&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

L.Catalog.PanSTARRS1 = L.extend({}, L.Catalog, {
	service: 'Vizier@CDS',
	name: 'PanSTARRS 1',
	className: 'logo-catalog-vizier',
	attribution: 'Pan-STARRS release 1 (PS1) Survey (Chambers et al. 2016)',
	color: 'yellow',
	maglim: 24.0,
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=II/349&' +
	 '-out=objID,RAJ2000,DEJ2000,gKmag,rKmag,iKmag,zKmag,yKmag&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=rmag',
	properties: ['g', 'r', 'i', 'z', 'y'],
	units: ['', '', '', '', ''],
	objurl: L.Catalog.vizierURL + '/VizieR-5?-source=II/349/ps1&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

L.Catalog.PPMXL = L.extend({}, L.Catalog, {
	service: 'Vizier@CDS',
	name: 'PPMXL',
	className: 'logo-catalog-vizier',
	attribution: 'PPM-Extended, positions and proper motions (Roeser et al. 2008)',
	color: 'green',
	maglim: 20.0,
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=I/317&' +
	 '-out=PPMXL,RAJ2000,DEJ2000,Jmag,Hmag,Kmag,b1mag,b2mag,r1mag,r2mag,imag,pmRA,pmDE&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=Jmag',
	properties: ['J', 'H', 'K', 'b<sub>1</sub>', 'b<sub>2</sub>', 'r<sub>1</sub>',
	             'r<sub>2</sub>', 'i',
	             '&#956;<sub>&#593;</sub> cos &#948;', '&#956;<sub>&#948;</sub>'],
	units: ['', '', '', '', '', '', '', '', 'mas/yr', 'mas/yr'],
	objurl: L.Catalog.vizierURL + '/VizieR-5?-source=I/317&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

L.Catalog.Abell = L.extend({}, L.Catalog, {
	service: 'Vizier@CDS',
	name: 'Abell clusters',
	className: 'logo-catalog-vizier',
	attribution: 'Rich Clusters of Galaxies (Abell et al. 1989) ',
	color: 'orange',
	maglim: 30.0,
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=VII/110A&' +
	 '-out=ACO,_RAJ2000,_DEJ2000,m10,Rich,Dclass&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=m10',
	properties: ['m<sub>10</sub>', 'Richness', 'D<sub>class</sub>'],
	units: ['', '', ''],
	objurl: L.Catalog.vizierURL + '/VizieR-5?-source=VII/110A&-c={ra},{dec},eq=J2000&-c.rs=0.2'
});

L.Catalog.NVSS = L.extend({}, L.Catalog, {
	service: 'Vizier@CDS',
	name: 'NVSS',
	className: 'logo-catalog-vizier',
	attribution: '1.4GHz NRAO VLA Sky Survey (NVSS) (Condon et al. 1998)',
	color: 'magenta',
	maglim: 30.0,
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=VIII/65/NVSS&' +
	 '-out=NVSS,_RAJ2000,_DEJ2000,S1.4,MajAxis,MinAxis,PA&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=-S1.4',
	properties: ['S<sub>1.4GHz</sub>', 'Major axis', 'Minor axis', 'Position angle'],
	units: ['mJy', '&#8243;', '&#8243;', '&#176;'],
	objurl: L.Catalog.vizierURL + '/VizieR-5?-source=VIII/65/NVSS&-c={ra},{dec},eq=J2000&-c.rs=0.2',
	draw: function (feature, latlng) {
		return L.ellipse(latlng, {
			majAxis: feature.properties.items[1] / 7200.0,
			minAxis: feature.properties.items[2] / 7200.0,
			posAngle: feature.properties.items[3] === '--' ? 0.0 : feature.properties.items[3]
		});
	}
});

L.Catalog.FIRST = L.extend({}, L.Catalog, {
	service: 'Vizier@CDS',
	name: 'FIRST',
	className: 'logo-catalog-vizier',
	attribution: 'The FIRST Survey Catalog (Helfand et al. 2015)',
	color: 'blue',
	maglim: 30.0,
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=VIII/92/first14&' +
	 '-out=FIRST,_RAJ2000,_DEJ2000,Fpeak,fMaj,fMin,fPA&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=-Fpeak',
	properties: ['F<sub>peak</sub>(1.4GHz)', 'Major axis FWHM', 'Minor axis FWHM', 'Position angle'],
	units: ['mJy', '&#8243;', '&#8243;', '&#176;'],
	objurl: L.Catalog.vizierURL + '/VizieR-5?-source=VIII/92/first14&-c={ra},{dec},eq=J2000&-c.rs=0.2',
	draw: function (feature, latlng) {
		return L.ellipse(latlng, {
			majAxis: feature.properties.items[1] / 7200.0,
			minAxis: feature.properties.items[2] / 7200.0,
			posAngle: feature.properties.items[3] === '--' ? 0.0 : feature.properties.items[3]
		});
	}
});

L.Catalog.AllWISE = L.extend({}, L.Catalog, {
	service: 'Vizier@CDS',
	name: 'AllWISE',
	className: 'logo-catalog-vizier',
	attribution: 'AllWISE Data Release (Cutri et al. 2013)',
	color: 'red',
	maglim: 18.0,
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=II/328/allwise&' +
	 '-out=AllWISE,_RAJ2000,_DEJ2000,W1mag,W2mag,W3mag,W4mag&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=W1mag',
	properties: ['W1<sub>mag</sub> (3.4µm)', 'W2<sub>mag</sub> (4.6µm)',
	  'W3<sub>mag</sub> (12µm)', 'W4<sub>mag</sub> (22µm)'],
	units: ['', '', '', ''],
	objurl: L.Catalog.vizierURL + '/VizieR-5?-source=II/328/allwise&-c={ra},{dec},eq=J2000&-c.rs=0.2'
});

L.Catalog.GALEX_AIS = L.extend({}, L.Catalog, {
	service: 'Vizier@CDS',
	name: 'GALEX AIS',
	className: 'logo-catalog-vizier',
	attribution: 'GALEX catalogs of UV sources: All-sky Imaging Survey (Bianchi et al. 2011)',
	color: 'magenta',
	maglim: 21.0,
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=II/312/ais&' +
	 '-out=objid,_RAJ2000,_DEJ2000,FUV,NUV&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=FUV',
	properties: ['FUV<sub>AB</sub>', 'NUV<sub>AB</sub>'],
	units: ['', ''],
	objurl: L.Catalog.vizierURL + '/VizieR-5?-source=II/312/ais&-c={ra},{dec},eq=J2000&-c.rs=0.2'
});

L.Catalog.GAIA_DR1 = L.extend({}, L.Catalog, {
	service: 'Vizier@CDS',
	name: 'Gaia DR1',
	className: 'logo-catalog-vizier',
	attribution: 'First Gaia Data Release (2016)',
	color: 'green',
	maglim: 21.0,
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=I/337&' +
	 '-out=Source,RA_ICRS,DE_ICRS,<Gmag>,pmRA,pmDE&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=<Gmag>',
	properties: ['G', '&#956;<sub>&#593;</sub> cos &#948;', '&#956;<sub>&#948;</sub>'],
	units: ['', 'mas/yr', 'mas/yr'],
	objurl: L.Catalog.vizierURL + '/VizieR-5?-source=I/337&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

L.Catalog.GAIA_DR2 = L.extend({}, L.Catalog, {
	service: 'Vizier@CDS',
	name: 'Gaia DR2',
	className: 'logo-catalog-vizier',
	attribution: 'Second Gaia Data Release (2018)',
	color: 'green',
	maglim: 21.0,
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=I/345&' +
	 '-out=Source,RA_ICRS,DE_ICRS,Gmag,BPmag,RPmag,pmRA,pmDE&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=Gmag',
	properties: ['G', 'B<sub>P</sub>', 'R<sub>P</sub>',
	 '&#956;<sub>&#593;</sub> cos &#948;', '&#956;<sub>&#948;</sub>'],
	units: ['', '', '', 'mas/yr', 'mas/yr'],
	objurl: L.Catalog.vizierURL + '/VizieR-5?-source=I/345&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

L.Catalog.URAT_1 = L.extend({}, L.Catalog, {
	service: 'Vizier@CDS',
	name: 'URAT1',
	className: 'logo-catalog-vizier',
	attribution: 'The first U.S. Naval Observatory Astrometric Robotic Telescope Catalog (Zacharias et al. 2015)',
	color: 'yellow',
	maglim: 17.0,
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=I/329&' +
	 '-out=URAT1,RAJ2000,DEJ2000,f.mag,pmRA,pmDE&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=f.mag',
	properties: ['f<sub>mag</sub>', '&#956;<sub>&#593;</sub> cos &#948;', '&#956;<sub>&#948;</sub>'],
	units: ['', 'mas/yr', 'mas/yr'],
	objurl: L.Catalog.vizierURL + '/VizieR-5?-source=I/329&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

L.Catalog.GLEAM = L.extend({}, L.Catalog, {
	service: 'Vizier@CDS',
	name: 'GLEAM',
	className: 'logo-catalog-vizier',
	attribution: 'GaLactic and Extragalactic All-sky Murchison Wide Field Array (GLEAM)' +
	    ' low-frequency extragalactic catalogue (Hurley-Walker et al. 2017)',
	color: 'blue',
	maglim: 30.0,
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=VIII/100/gleamegc&' +
	 '-out=GLEAM,RAJ2000,DEJ2000,Fintwide,awide,bwide,pawide&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=-Fintwide',
	properties: ['F<sub>int</sub>(170-231MHz)', 'Major axis FWHM', 'Minor axis FWHM', 'Position angle'],
	units: ['Jy', '&#8243;', '&#8243;', '&#176;'],
	objurl: L.Catalog.vizierURL + '/VizieR-5?-source=-source=VIII/100/gleamegc&-c={ra},{dec},eq=J2000&-c.rs=0.2',
	draw: function (feature, latlng) {
		return L.ellipse(latlng, {
			majAxis: feature.properties.items[1] / 3600.0,
			minAxis: feature.properties.items[2] / 3600.0,
			posAngle: feature.properties.items[3] === '--' ? 0.0 : feature.properties.items[3]
		});
	}
});

L.Catalog.TGSS = L.extend({}, L.Catalog, {
	service: 'Vizier@CDS',
	name: 'TGSS',
	className: 'logo-catalog-vizier',
	attribution: 'The GMRT 150 MHz all-sky radio survey. TGSS ADR1 (Intema et al. 2017)',
	color: 'blue',
	maglim: 30.0,
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=J/A%2bA/598/A78/table3&' +
	 '-out=TGSSADR,RAJ2000,DEJ2000,Stotal,Maj,Min,PA&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=-Stotal',
	properties: ['F<sub>peak</sub>(150MHz)', 'Major axis FWHM', 'Minor axis FWHM', 'Position angle'],
	units: ['mJy', '&#8243;', '&#8243;', '&#176;'],
	objurl: L.Catalog.vizierURL + '/VizieR-3?-source=-source=J/A%2bA/598/A78/table3&-c={ra},{dec},eq=J2000&-c.rs=0.2',
	draw: function (feature, latlng) {
		return L.ellipse(latlng, {
			majAxis: feature.properties.items[1] / 7200.0,
			minAxis: feature.properties.items[2] / 7200.0,
			posAngle: feature.properties.items[3] === '--' ? 0.0 : feature.properties.items[3]
		});
	}
});




/*
# SpinBox implements a number spinbox with adaptive step increment
# Adapted from Proto.io On/Off FlipSwitch designed by Anna Mitsinga:
# https://proto.io/freebies/onoff/
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2015 Emmanuel Bertin - IAP/CNRS/UPMC
#
*/

L.FlipSwitch = L.Evented.extend({
	options: {
		// All widget options
		checked: false,
		title: 'Click to switch',
		className: 'leaflet-flipswitch',
		id: 'leaflet-flipswitch'
	},

	initialize: function (parent, options) {
		options = L.setOptions(this, options);
		var _this = this,
			  className = options.className,
			  button = L.DomUtil.create('div', className, parent),
				input = this._input = L.DomUtil.create('input', className, button),
				label = L.DomUtil.create('label', className, button);

		input.type = 'checkbox';
		input.name = options.className;
		input.checked = options.checked;
		label.htmlFor = input.id = options.id;
		if (options.title) {
			label.title = options.title;
		}

		L.DomUtil.create('span', className + '-inner', label);
		L.DomUtil.create('span', className + '-button', label);

		L.DomEvent
				.disableClickPropagation(button)
				.disableScrollPropagation(button);
		L.DomEvent.on(input, 'change', function () {
			this.fire('change');
		}, this);

		return button;
	},

	value: function (val) {
		if (val === undefined) {
			return this._input.checked;
		}
		else {
			this._input.checked = val ? true : false;
			return this;
		}
	}

});

L.flipswitch = function (parent, options) {
	return new L.FlipSwitch(parent, options);
};


/*
# SpinBox implements a number spinbox with adaptive step increment
# Adapted from JTSage's spinbox (original attribution below), with all the
# jQuery and jQuery Mobile stuff removed.
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2015 Emmanuel Bertin - IAP/CNRS/UPMC
#
#	Last modified: 13/11/2015
/*
 * jQuery Mobile Framework : plugin to provide number spinbox.
 * Copyright (c) JTSage
 * CC 3.0 Attribution.  May be relicensed without permission/notification.
 * https://github.com/jtsage/jquery-mobile-spinbox
 */

L.SpinBox = L.Evented.extend({
	options: {
		// All widget options
		dmin: undefined,
		dmax: undefined,
		step: undefined,
		initValue: undefined,
		repButton: true,
		clickEvent: 'click',
		instantUpdate: false,
		title: 'Enter value',
		className: 'leaflet-spinbox'
	},

	initialize: function (parent, options) {
		options = L.setOptions(this, options);
		var _this = this,
			drag = this._drag = {
				startEvent: 'touchstart mousedown',
				stopEvent : 'touchend mouseup mouseout touchcancel',
				move      : false,
				start     : false,
				end       : false,
				pos       : false,
				target    : false,
				delta     : false,
				tmp       : false,
				cnt       : 0,
				step      : options.step,
				prec      : this._prec(options.step)
			},
			wrap = this._wrap = L.DomUtil.create('div', options.className, parent),
			input = this._input = L.DomUtil.create('input', options.className + '-input', wrap),
			down = this._down = L.DomUtil.create('div', options.className + '-down', wrap),
			up = this._up = L.DomUtil.create('div', options.className + '-up', wrap);

		input.type = 'number';
		input.step = 0.1;	// Tells input that decimal numbers are valid
		L.DomEvent
				.disableClickPropagation(wrap)
				.disableScrollPropagation(wrap);

		if (input.disabled === true) {
			options.disabled = true;
		}

		if (options.dmin === undefined) {
			options.dmin = - Number.MAX_VALUE;
		}
		if (options.dmax === undefined) {
			options.dmax = Number.MAX_VALUE;
		}
		if (options.step === undefined) {
			options.step = 1;
		}

		if (options.initValue === undefined) {
			options.initValue = (options.dmin + options.dmax) / 2.0;
		}

		this.value(options.initValue);

		input.title = options.title;
		down.title = 'Decrease number by ' + options.step;
		up.title = 'Increase number by ' + options.step;

		L.DomEvent.on(this._input, 'change', function () {
			this.fire('change');
		}, this);

		if (options.repButton === false) {
			L.DomEvent.on(down, options.clickEvent, function (e) {
				e.preventDefault();
				this._offset(e.currentTarget, -1);
			}, this);
			L.DomEvent.on(up, options.clickEvent, function (e) {
				e.preventDefault();
				this._offset(e.currentTarget, 1);
			}, this);
		} else {
			L.DomEvent.on(down, drag.startEvent, function (e) {
				input.blur();
				drag.move = true;
				drag.cnt = 0;
				drag.step = options.step;
				drag.prec = this._prec(drag.step);
				drag.delta = -1;
				this._offset(e.currentTarget, -1);
				if (!this.runButton) {
					drag.target = e.currentTarget;
					this.runButton = setTimeout(function () {
						_this._sboxRun();
					}, 500);
				}
			}, this);
			L.DomEvent.on(up, drag.startEvent, function (e) {
				input.blur();
				drag.move = true;
				drag.cnt = 0;
				drag.step = options.step;
				drag.prec = this._prec(drag.step);
				drag.delta = 1;
				this._offset(e.currentTarget, 1);
				if (!this.runButton) {
					drag.target = e.currentTarget;
					this.runButton = setTimeout(function () {
						_this._sboxRun();
					}, 500);
				}
			}, this);
			L.DomEvent.on(down, drag.stopEvent, function (e) {
				if (drag.move) {
					e.preventDefault();
					clearTimeout(this.runButton);
					this.runButton = false;
					drag.move = false;
					if (options.instantUpdate === false) {
						this.fire('change');
					}
				}
			}, this);
			L.DomEvent.on(up, drag.stopEvent, function (e) {
				if (drag.move) {
					e.preventDefault();
					clearTimeout(this.runButton);
					this.runButton = false;
					drag.move = false;
					if (options.instantUpdate === false) {
						this.fire('change');
					}
				}
			}, this);
		}
	
		if (options.disabled) {
			this.disable();
		}

		return wrap;
	},

	value: function (val) {
		if (val === undefined) {
			return parseFloat(this._input.value);
		}
		else {
			this._input.value = val;
			return this;
		}
	},

	step: function (val) {
		if (val === undefined) {
			return this.options.step;
		}
		else {
			this.options.step = val;
			return this;
		}
	},

	disable: function () {
		// Disable the element
		var cname = 'disabled';

		this._input.disabled = true;
		this._input.blur();
		L.DomUtil.addClass(this._wrap, cname);
		L.DomUtil.addClass(this._down, cname);
		L.DomUtil.addClass(this._up, cname);
		this.options.disabled = true;
	},

	enable: function () {
		// Enable the element
		var cname = 'disabled';

		this._input.disabled = false;
		L.DomUtil.removeClass(this._wrap, cname);
		L.DomUtil.removeClass(this._down, cname);
		L.DomUtil.removeClass(this._up, cname);
		this.options.disabled = false;
	},

	_sboxRun: function () {
		var	_this = this,
				timer = 150,
				options = this.options,
				drag = this._drag;

		if (drag.cnt === 20) {
			timer = 50;
			drag.step = 10.0 * options.step;
			drag.prec = this._prec(drag.step);
		} else if (drag.cnt === 40) {
			timer = 10;
			drag.step = 100.0 * options.step;
			drag.prec = this._prec(drag.step);
		} else if (drag.cnt === 60) {
			drag.step = 1000.0 * options.step;
			drag.prec = this._prec(drag.step);
		} else if (drag.cnt === 80) {
			drag.step = 10000.0 * options.step;
			drag.prec = this._prec(drag.step);
		}
		drag.didRun = true;
		this._offset(this, drag.delta);
		drag.cnt++;
		this.runButton = setTimeout(function () {
			_this._sboxRun();
		}, timer);
	},

	_prec: function (step) {
		var dprec = -0.4342944 * Math.log(step);
		return dprec > 0.0 ? Math.ceil(dprec) : 0;
	},

	_offset: function (obj, direction) {
		var tmp,
				options = this.options,
				input = this._input,
				drag = this._drag;

		if (!this.disabled) {
			if (direction < 1) {
				tmp = (parseFloat(input.value) - drag.step).toFixed(drag.prec);
				if (tmp >= options.dmin) {
					input.value = tmp;
					if (options.instantUpdate === true) {
						this.fire('change');
					}
				}
			} else {
				tmp = (parseFloat(input.value) + drag.step).toFixed(drag.prec);
				if (tmp <= options.dmax) {
					input.value = tmp;
					if (options.instantUpdate === true) {
						this.fire('change');
					}
				}
			}
		}
	}
});

L.spinbox = function (parent, options) {
	return new L.SpinBox(parent, options);
};


/*
# FileTree parses directory trees serverside.
# Adapted from the jQuery File Tree Plugin (original copyright notice reproduced
# below).
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 11/02/2014
// Originally authored by Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 24 March 2008
//
// Usage: $('.fileTreeDemo').fileTree( options, callback )
//
// Options:  root           - root folder to display; default = /
//           script         - location of the serverside AJAX file to use; default = jqueryFileTree.php
//           folderEvent    - event to trigger expand/collapse; default = click
//           expandSpeed    - default = 500 (ms); use -1 for no animation
//           collapseSpeed  - default = 500 (ms); use -1 for no animation
//           expandEasing   - easing function to use on expand (optional)
//           collapseEasing - easing function to use on collapse (optional)
//           multiFolder    - whether or not to limit the browser to one subfolder at a time
//           loadMessage    - Message to display while initial tree loads (can be HTML)
//
// TERMS OF USE
// 
// This plugin is dual-licensed under the GNU General Public License and the MIT License and
// is copyright 2008 A Beautiful Site, LLC. 
//
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery-browser');
}

$.extend($.fn, {
	fileTree: function (options, file) {
		// Default options
		if (options.root === undefined) {options.root = '/'; }
		if (options.script === undefined) {options.script			= 'dist/filetree.php'; }
		if (options.folderEvent === undefined) {options.folderEvent = 'click'; }
		if (options.expandSpeed === undefined) {options.expandSpeed = 500; }
		if (options.collapseSpeed === undefined) {options.collapseSpeed = 500; }
		if (options.expandEasing === undefined) {options.expandEasing = null; }
		if (options.collapseEasing === undefined) {options.collapseEasing = null; }
		if (options.multiFolder === undefined) {options.multiFolder = true; }
		if (options.loadMessage === undefined) {options.loadMessage	= 'Loading...'; }

		$(this).each(function () {

			function showTree(element, dir) {
				$(element).addClass('wait');
				$('.filetree.start').remove();
				$.post(options.script, { dir: dir }, function (data) {
					$(element).find('.start').html('');
					$(element).removeClass('wait').append(data);
					if (options.root === dir) {
						$(element).find('UL:hidden').show();
					} else {
						$(element).find('UL:hidden').slideDown({
							duration: options.expandSpeed,
							easing: options.expandEasing
						});
					}
					bindTree(element);
				});
			}

			function bindTree(element) {
				$(element).find('LI A').on(options.folderEvent, function () {
					if ($(this).parent().hasClass('directory')) {
						if ($(this).parent().hasClass('collapsed')) {
							// Expand
							if (!options.multiFolder) {
								$(this).parent().parent().find('UL').slideUp({
									duration: options.collapseSpeed,
									easing: options.collapseEasing
								});
								$(this).parent().parent().find('LI.directory')
								  .removeClass('expanded')
								  .addClass('collapsed');
							}
							$(this).parent().find('UL').remove(); // cleanup
							showTree($(this).parent(), encodeURI($(this).attr('rel').match(/.*\//)));
							$(this).parent().removeClass('collapsed').addClass('expanded');
						} else {
							// Collapse
							$(this).parent().find('UL').slideUp({
								duration: options.collapseSpeed,
								easing: options.collapseEasing
							});
							$(this).parent().removeClass('expanded').addClass('collapsed');
						}
					} else {
						file($(this).attr('rel'));
					}
					return false;
				});
				// Prevent A from triggering the # on non-click events
				if (options.folderEvent.toLowerCase !== 'click') {
					$(element).find('LI A').on('click', function () {return false; });
				}
			}
			// Loading message
			$(this).html('<ul class="filetree start"><li class="wait">' + options.loadMessage + '<li></ul>');
			// Get the initial file list
			showTree($(this), encodeURI(options.root));
		});
	}
});



/*
# L.Control.Attribution.Logos adds a VisiOmatic logo to the map.
#
#  This file part of: VisiOmatic
#
#  Copyright:         (C) 2013-2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                                   Chiara Marmo - IDES/Paris-Sud,
#
#  Last modified: 07/03/2014
*/

// Remove this ugly Pipe sign
L.Control.Attribution.include({
	_update: function () {
		if (!this._map) { return; }

		var attribs = [];

		for (var i in this._attributions) {
			if (this._attributions[i]) {
				attribs.push(i);
			}
		}

		var prefixAndAttribs = [];

		if (this.options.prefix) {
			prefixAndAttribs.push(this.options.prefix);
		}
		if (attribs.length) {
			prefixAndAttribs.push(attribs.join(', '));
		}

		this._container.innerHTML = prefixAndAttribs.join(' &#169; ');
	}
});

// Set Attribution prefix to a series of clickable logos
L.Map.addInitHook(function () {
	if (this.options.visiomaticLogo !== false &&
	 this.options.attributionControl) {
		this.attributionControl.setPrefix(
			'<a id="logo-visiomatic" class="leaflet-control-attribution-logo"' +
			 'href="http://visiomatic.org">&nbsp;</a>' +
			 '<a id="logo-iipimage" class="leaflet-control-attribution-logo"' +
			 'href="http://iipimage.sourceforge.net">&nbsp;</a>' +
			 '<a id="logo-leaflet" class="leaflet-control-attribution-logo"' +
			 'href="http://leafletjs.com">&nbsp;</a>'
		);
	}
});




/*
# L.Control.ExtraMap adds support for extra synchronized maps
# (Picture-in-Picture style). Adapted from L.Control.MiniMap by Norkart
# (original copyright notice reproduced below).
#
#	This file part of:	VisiOmatic
#	Copyright:		(C) 2014,2016 Emmanuel Bertin - IAP/CNRS/UPMC,
#                                             Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 08/09/2016

Original code Copyright (c) 2012-2015, Norkart AS
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are
permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice, this list of
      conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice, this list
      of conditions and the following disclaimer in the documentation and/or other materials
      provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
L.Control.ExtraMap = L.Control.extend({
	options: {
		position: 'bottomright',
		title: 'Navigation mini-map. Grab to navigate',
		toggleDisplay: true,
		zoomLevelFixed: false,
		zoomLevelOffset: -5,
		zoomAnimation: false,
		autoToggleDisplay: false,
		width: 150,
		height: 150,
		collapsedWidth: 24,
		collapsedHeight: 24,
		aimingRectOptions: {
			color:  '#FFFFFF',
			weight: 1,
			clickable: false
		},
		shadowRectOptions: {
			color: '#FDC82F',
			weight: 1,
			clickable: false,
			opacity: 0,
			fillOpacity: 0
		},
		strings: {hideText: 'Hide map', showText: 'Show map'}
	},

	// Layer is the map layer to be shown in the minimap
	initialize: function (layer, options) {
		L.Util.setOptions(this, options);
		// Make sure the aiming rects are non-clickable even if the user tries to set
		// them clickable (most likely by forgetting to specify them false)
		this.options.aimingRectOptions.clickable = false;
		this.options.shadowRectOptions.clickable = false;
		this._layer = layer;
	},

	onAdd: function (map) {

		this._mainMap = map;

		// Creating the container and stopping events from spilling through to the main map.
		this._container = L.DomUtil.create('div', 'leaflet-control-extramap');
		this._container.style.width = this.options.width + 'px';
		this._container.style.height = this.options.height + 'px';
		this._container.title = this.options.title;
		L.DomEvent.disableClickPropagation(this._container);
		L.DomEvent.on(this._container, 'mousewheel', L.DomEvent.stopPropagation);

		this._extraMap = new L.Map(this._container, {
			attributionControl: false,
			zoomControl: false,
			zoomAnimation: this.options.zoomAnimation,
			autoToggleDisplay: this.options.autoToggleDisplay,
			touchZoom: !this._isZoomLevelFixed(),
			scrollWheelZoom: !this._isZoomLevelFixed(),
			doubleClickZoom: !this._isZoomLevelFixed(),
			boxZoom: !this._isZoomLevelFixed()
		});

		this._layer.addTo(this._extraMap);

		// These bools are used to prevent infinite loops of the two maps notifying
		// each other that they've moved.
		// this._mainMapMoving = false;
		// this._extraMapMoving = false;

		//Keep a record of this to prevent auto toggling when the user explicitly doesn't want it.
		this._userToggledDisplay = false;
		this._minimized = false;

		if (this.options.toggleDisplay) {
			this._addToggleButton();
		}

		this._layer.once('metaload', function () {
			this._mainMap.whenReady(L.Util.bind(function () {
				this._extraMap.whenReady(L.Util.bind(function () {
					this._aimingRect = L.rectangle(this._mainMap.getBounds(),
					  this.options.aimingRectOptions).addTo(this._extraMap);
					this._shadowRect = L.rectangle(this._mainMap.getBounds(),
					  this.options.shadowRectOptions).addTo(this._extraMap);
					this._mainMap.on('moveend', this._onMainMapMoved, this);
					this._mainMap.on('move', this._onMainMapMoving, this);
					this._extraMap.on('movestart', this._onExtraMapMoveStarted, this);
					this._extraMap.on('move', this._onExtraMapMoving, this);
					this._extraMap.on('moveend', this._onExtraMapMoved, this);
					this._extraMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
					this._setDisplay(this._decideMinimized());
				}, this));
			}, this));
		}, this);

		return this._container;
	},

	addTo: function (map) {
		L.Control.prototype.addTo.call(this, map);
		return this;
	},

	onRemove: function (map) {
		this._mainMap.off('moveend', this._onMainMapMoved, this);
		this._mainMap.off('move', this._onMainMapMoving, this);
		this._extraMap.off('moveend', this._onExtraMapMoved, this);

		this._extraMap.removeLayer(this._layer);
	},

	changeLayer: function (layer) {
		this._extraMap.removeLayer(this._layer);
		this._layer = layer;
		this._extraMap.addLayer(this._layer);
	},

	_addToggleButton: function () {
		this._toggleDisplayButton = this.options.toggleDisplay ? this._createButton(
			'', this.options.strings.hideText, (
				'leaflet-control-extramap-toggle-display ' +
			  'leaflet-control-extramap-toggle-display-' + this.options.position
			),
			this._container, this._toggleDisplayButtonClicked, this
		) : undefined;

		this._toggleDisplayButton.style.width = this.options.collapsedWidth + 'px';
		this._toggleDisplayButton.style.height = this.options.collapsedHeight + 'px';
	},

	_createButton: function (html, title, className, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.innerHTML = html;
		link.href = '#';
		link.title = title;

		var stop = L.DomEvent.stopPropagation;

		L.DomEvent
			.on(link, 'click', stop)
			.on(link, 'mousedown', stop)
			.on(link, 'dblclick', stop)
			.on(link, 'click', L.DomEvent.preventDefault)
			.on(link, 'click', fn, context);

		return link;
	},

	_toggleDisplayButtonClicked: function () {
		this._userToggledDisplay = true;
		if (!this._minimized) {
			this._minimize();
			this._toggleDisplayButton.title = this.options.strings.showText;
		} else {
			this._restore();
			this._toggleDisplayButton.title = this.options.strings.hideText;
		}
	},

	_setDisplay: function (minimize) {
		if (minimize !== this._minimized) {
			if (!this._minimized) {
				this._minimize();
			} else {
				this._restore();
			}
		}
	},

	_minimize: function () {
		// hide the minimap
		if (this.options.toggleDisplay) {
			this._container.style.width = this.options.collapsedWidth + 'px';
			this._container.style.height = this.options.collapsedHeight + 'px';
			this._toggleDisplayButton.className += (' minimized-' + this.options.position);
		} else {
			this._container.style.display = 'none';
		}
		this._minimized = true;
	},

	_restore: function () {
		if (this.options.toggleDisplay) {
			this._container.style.width = this.options.width + 'px';
			this._container.style.height = this.options.height + 'px';
			this._toggleDisplayButton.className = this._toggleDisplayButton.className
				.replace('minimized-'  + this.options.position, '');
		} else {
			this._container.style.display = 'block';
		}
		this._minimized = false;
	},

	_onMainMapMoved: function (e) {
		if (!this._extraMapMoving) {
			this._mainMapMoving = true;
			this._extraMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
			this._setDisplay(this._decideMinimized());
		} else {
			this._extraMapMoving = false;
		}
		this._aimingRect.setBounds(this._mainMap.getBounds());
	},

	_onMainMapMoving: function (e) {
		this._aimingRect.setBounds(this._mainMap.getBounds());
	},

	_onExtraMapMoveStarted: function (e) {
		var lastAimingRect = this._aimingRect.getBounds();
		var sw = this._extraMap.latLngToContainerPoint(lastAimingRect.getSouthWest());
		var ne = this._extraMap.latLngToContainerPoint(lastAimingRect.getNorthEast());
		this._lastAimingRectPosition = {sw: sw, ne: ne};
	},

	_onExtraMapMoving: function (e) {
		if (!this._mainMapMoving && this._lastAimingRectPosition) {
			this._shadowRect.setBounds(new L.LatLngBounds(
				this._extraMap.containerPointToLatLng(this._lastAimingRectPosition.sw),
				this._extraMap.containerPointToLatLng(this._lastAimingRectPosition.ne)
			));
			this._shadowRect.setStyle({opacity: 1, fillOpacity: 0.3});
		}
	},

	_onExtraMapMoved: function (e) {
		if (!this._mainMapMoving) {
			this._extraMapMoving = true;
			this._mainMap.setView(this._extraMap.getCenter(), this._decideZoom(false));
			this._shadowRect.setStyle({opacity: 0, fillOpacity: 0});
		} else {
			this._mainMapMoving = false;
		}
	},

	_isZoomLevelFixed: function () {
		var zoomLevelFixed = this.options.zoomLevelFixed;
		return this._isDefined(zoomLevelFixed) && this._isInteger(zoomLevelFixed);
	},

	_decideZoom: function (fromMaintoExtra) {
		if (!this._isZoomLevelFixed()) {
			if (fromMaintoExtra) {
				return this._mainMap.getZoom() + this.options.zoomLevelOffset;
			} else {
				var currentDiff = this._extraMap.getZoom() - this._mainMap.getZoom();
				var proposedZoom = this._extraMap.getZoom() - this.options.zoomLevelOffset;
				var toRet;

				if (currentDiff > this.options.zoomLevelOffset &&
				  this._mainMap.getZoom() < this._extraMap.getMinZoom() - this.options.zoomLevelOffset) {
					// This means the extraMap is zoomed out to the minimum zoom level and
					// can't zoom any more.
					if (this._extraMap.getZoom() > this._lastExtraMapZoom) {
						// This means the user is trying to zoom in by using the minimap, zoom the main map.
						toRet = this._mainMap.getZoom() + 1;
						// Also we cheat and zoom the minimap out again to keep it visually consistent.
						this._extraMap.setZoom(this._extraMap.getZoom() - 1);
					} else {
						// Either the user is trying to zoom out past the minimap's min zoom or
						// has just panned using it, we can't tell the difference. Therefore, we ignore it!
						toRet = this._mainMap.getZoom();
					}
				} else {
					// This is what happens in the majority of cases, and always if you
					// configure the min levels + offset in a sane fashion.
					toRet = proposedZoom;
				}
				this._lastExtraMapZoom = this._extraMap.getZoom();
				return toRet;
			}
		} else {
			if (fromMaintoExtra) {
				return this.options.zoomLevelFixed;
			} else {
				return this._mainMap.getZoom();
			}
		}
	},

	_decideMinimized: function () {
		if (this._userToggledDisplay) {
			return this._minimized;
		}

		if (this.options.autoToggleDisplay) {
			if (this._mainMap.getBounds().contains(this._extraMap.getBounds())) {
				return true;
			}
			return false;
		}

		return this._minimized;
	},

	_isInteger: function (value) {
		return typeof value === 'number';
	},

	_isDefined: function (value) {
		return typeof value !== 'undefined';
	}
});

L.Map.mergeOptions({
	extraMapControl: false
});

L.Map.addInitHook(function () {
	if (this.options.extraMapControl) {
		this.extraMapControl = (new L.Control.ExtraMap()).addTo(this);
	}
});

L.control.extraMap = function (layer, options) {
	return new L.Control.ExtraMap(layer, options);
};


/*
# L.Control.FullScreen adds a full screen toggle button to the map.
# Adapted from the leaflet.fullscreen plugin by Bruno Bergot (fixed jake errors)
# (original copyright notice reproduced below).
#
#	This file part of:	VisiOmatic
#
#	Copyright:		(C) 2013-2015 Emmanuel Bertin - IAP/CNRS/UPMC,
#                             Chiara Marmo - IDES/Paris-Sud.
#
#	Last modified: 10/02/2014

original code Copyright (c) 2013, Bruno Bergot
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are
permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice, this list of
      conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice, this list
      of conditions and the following disclaimer in the documentation and/or other materials
      provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

if (typeof require !== 'undefined') {
	var jQuery = require('jquery-browser');
}


(function () {

	L.Control.FullScreen = L.Control.extend({
		options: {
			position: 'topleft',
			title: 'Toggle full screen mode',
			forceSeparateButton: false
		},
	
		onAdd: function (map) {
			var className = 'leaflet-control-zoom-fullscreen', container;
		
			if (map.zoomControl && !this.options.forceSeparateButton) {
				container = map.zoomControl._container;
			} else {
				container = L.DomUtil.create('div', 'leaflet-bar');
			}
		
			this._createButton(this.options.title, className, container, this.toogleFullScreen, map);

			return container;
		},
	
		_createButton: function (title, className, container, fn, context) {
			var link = L.DomUtil.create('a', className, container);
			link.href = '#';
			link.title = title;

			L.DomEvent
				.addListener(link, 'click', L.DomEvent.stopPropagation)
				.addListener(link, 'click', L.DomEvent.preventDefault)
				.addListener(link, 'click', fn, context);

			L.DomEvent
				.addListener(container, fullScreenApi.fullScreenEventName, L.DomEvent.stopPropagation)
				.addListener(container, fullScreenApi.fullScreenEventName, L.DomEvent.preventDefault)
				.addListener(container, fullScreenApi.fullScreenEventName, this._handleEscKey, context);

			L.DomEvent
				.addListener(document, fullScreenApi.fullScreenEventName, L.DomEvent.stopPropagation)
				.addListener(document, fullScreenApi.fullScreenEventName, L.DomEvent.preventDefault)
				.addListener(document, fullScreenApi.fullScreenEventName, this._handleEscKey, context);

			return link;
		},

		toogleFullScreen: function () {
			this._exitFired = false;
			var container = this._container;
			if (this._isFullscreen) {
				if (fullScreenApi.supportsFullScreen) {
					fullScreenApi.cancelFullScreen(container);
				} else {
					L.DomUtil.removeClass(container, 'leaflet-pseudo-fullscreen');
				}
				this.invalidateSize();
				this.fire('exitFullscreen');
				this._exitFired = true;
				this._isFullscreen = false;
			} else {
				if (fullScreenApi.supportsFullScreen) {
					fullScreenApi.requestFullScreen(container);
				} else {
					L.DomUtil.addClass(container, 'leaflet-pseudo-fullscreen');
				}
				this.invalidateSize();
				this.fire('enterFullscreen');
				this._isFullscreen = true;
			}
		},
	
		_handleEscKey: function () {
			if (!fullScreenApi.isFullScreen(this) && !this._exitFired) {
				this.fire('exitFullscreen');
				this._exitFired = true;
				this._isFullscreen = false;
			}
		}
	});

	L.Map.addInitHook(function () {
		if (this.options.fullscreenControl) {
			this.fullscreenControl = L.control.fullscreen(this.options.fullscreenControlOptions);
			this.addControl(this.fullscreenControl);
		}
	});

	L.control.fullscreen = function (options) {
		return new L.Control.FullScreen(options);
	};

/* 
Native FullScreen JavaScript API
-------------
Assumes Mozilla naming conventions instead of W3C for now

source : http://johndyer.name/native-fullscreen-javascript-api-plus-jquery-plugin/

*/

	var fullScreenApi = {
			supportsFullScreen: false,
			isFullScreen: function () { return false; },
			requestFullScreen: function () {},
			cancelFullScreen: function () {},
			fullScreenEventName: '',
			prefix: ''
		},
		browserPrefixes = 'webkit moz o ms khtml'.split(' ');
	
	// check for native support
	if (typeof document.exitFullscreen !== 'undefined') {
		fullScreenApi.supportsFullScreen = true;
	} else {
		// check for fullscreen support by vendor prefix
		for (var i = 0, il = browserPrefixes.length; i < il; i++) {
			fullScreenApi.prefix = browserPrefixes[i];
			if (typeof document[fullScreenApi.prefix + 'CancelFullScreen'] !== 'undefined') {
				fullScreenApi.supportsFullScreen = true;
				break;
			}
		}
	}
	
	// update methods to do something useful
	if (fullScreenApi.supportsFullScreen) {
		fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
		fullScreenApi.isFullScreen = function () {
			switch (this.prefix) {
			case '':
				return document.fullScreen;
			case 'webkit':
				return document.webkitIsFullScreen;
			default:
				return document[this.prefix + 'FullScreen'];
			}
		};
		fullScreenApi.requestFullScreen = function (el) {
			return (this.prefix === '') ? el.requestFullscreen() : el[this.prefix + 'RequestFullScreen']();
		};
		fullScreenApi.cancelFullScreen = function (el) {
			return (this.prefix === '') ? document.exitFullscreen() : document[this.prefix + 'CancelFullScreen']();
		};
	}

	// jQuery plugin
	if (typeof jQuery !== 'undefined') {
		jQuery.fn.requestFullScreen = function () {
			return this.each(function () {
				var el = jQuery(this);
				if (fullScreenApi.supportsFullScreen) {
					fullScreenApi.requestFullScreen(el);
				}
			});
		};
	}

	// export api
	window.fullScreenApi = fullScreenApi;
})();


/*
# L.Control.IIP adjusts the rendering of an IIP layer
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2018 Emmanuel Bertin - IAP/CNRS/SorbonneU,
#                                Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 14/05/2018
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery');
}

L.Control.IIP = L.Control.extend({
	options: {
		title: 'a control related to IIPImage',
		collapsed: true,
		position: 'topleft'
	},

	initialize: function (baseLayers,  options) {
		L.setOptions(this, options);
		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipimage';
		this._layers = baseLayers;
	},

	// addTo can be used to add the regular leaflet controls or to the sidebar
	addTo: function (dest) {
		if (dest._sidebar) {
			this._sidebar = dest;
		// dest is a sidebar class instance
			this._map = dest._map;
			this._dialog = L.DomUtil.create('div', this._className + '-dialog');
			dest.addTab(this._id, this._className, this.options.title, this._dialog,
			   this._sideClass);
			this._map.on('layeradd', this._checkIIP, this);
			return dest;
		} else {
			return L.Control.prototype.addTo.call(this, dest);
		}
	},

	onAdd: function (map) {
		var className = this._className,
		 id = this._id,
		 container = this._container = L.DomUtil.create('div', className + ' leaflet-bar');
		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		L.DomEvent
				.disableClickPropagation(container)
				.disableScrollPropagation(container);

		this._dialog = L.DomUtil.create('div', className + '-dialog', container);
		if (this.options.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent
					.on(container, 'mouseover', this._expand, this)
					.on(container, 'mouseout', this._collapse, this);
			}

			var toggle = this._toggle = L.DomUtil.create('a', className + '-toggle leaflet-bar', container);
			toggle.href = '#';
			toggle.id = id + '-toggle';
			toggle.title = this.options.title;

			if (L.Browser.touch) {
				L.DomEvent
				    .on(toggle, 'click', L.DomEvent.stop, this)
				    .on(toggle, 'click', this._expand, this);
			}
			else {
				L.DomEvent.on(toggle, 'focus', this._expand, this);
			}

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility
		} else {
			this._expand();
		}

//		this._checkIIP();
		this._map.on('layeradd', this._checkIIP, this);

		return	this._container;
	},

	_checkIIP: function (e) {
		var layer = e.layer;

		// Exit if not an IIP layer
		if (!layer || !layer.iipdefault) {
			return;
		}
		this._layer = layer;
		if (this._reloadFlag) {
			layer.once('load', this._resetDialog, this);
		} else {
			this._initDialog();
			this._reloadFlag = true;
		}
	},

	_initDialog: function () {
/*
		var className = this._className,
			container = this._container,
			dialog = this._dialog,
			toggle = this._toggle,
			layer = this._layer;
		dialog.innerHTML = '';
*/
    // Setup the rest of the dialog window here
	},

	_resetDialog: function () {
		this._dialog.innerHTML = '';
		this._initDialog();
	},

	_addDialogBox: function (id) {
		var box = L.DomUtil.create('div', this._className + '-box', this._dialog);
		if (id) {
			box.id = id;
		}
		return box;
	},

	_addDialogLine: function (label, dialogBox) {
		var line = L.DomUtil.create('div', this._className + '-line', dialogBox),
		 text = L.DomUtil.create('div', this._className + '-label', line);
		text.innerHTML = label;
		return line;
	},

	_addDialogElement: function (line) {
		return L.DomUtil.create('div', this._className + '-element', line);
	},

	_expand: function () {
		L.DomUtil.addClass(this._container, this._className + '-expanded');
	},

	_collapse: function () {
		this._container.className = this._container.className.replace(' ' + this._className + '-expanded', '');
	},

  /**
* Get currently active base layer on the map
* @return {Object} l where l.name - layer name on the control,
* l.layer is L.TileLayer, l.overlay is overlay layer.
*/
	getActiveBaseLayer: function () {
		return this._activeBaseLayer;
	},

  /**
* Get currently active overlay layers on the map
* @return {{layerId: l}} where layerId is <code>L.stamp(l.layer)</code>
* and l @see #getActiveBaseLayer jsdoc.
*/

	_findActiveBaseLayer: function () {
		var layers = this._layers;
		this._prelayer = undefined;
		for (var layername in layers) {
			var layer = layers[layername];
			if (!layer.overlay) {
				if (!layer._map) {
					this._prelayer = layer;
				} else if (this._map.hasLayer(layer) && layer.iipdefault) {
					return layer;
				}
			}
		}
		return undefined;
	},

	_createButton: function (className, parent, subClassName, fn, title) {
		var button = L.DomUtil.create('a', className, parent);
		button.target = '_blank';
		if (subClassName) {
			button.id = className + '-' + subClassName;
		}
		if (fn) {
			L.DomEvent.on(button, 'click touch', fn, this);
		}
		if (title) {
			button.title = title;
		}
		return button;
	},

	_createRadioButton: function (className, parent, value, checked, fn, title) {
		var button = L.DomUtil.create('input', className, parent);

		button.type = 'radio';
		button.name = className;
		button.value = value;
		button.checked = checked;
		if (fn) {
			L.DomEvent.on(button, 'click touch', function () {
				fn(value);
			}, this);
		}

		var label =  L.DomUtil.create('label', className, parent);

		label.htmlFor = button.id = className + '-' + value;
		if (title) {
			label.title = title;
		}
		return button;
	},

	_createSelectMenu: function (className, parent, items, disabled, selected, fn, title) {
		// Wrapper around the select element for better positioning and sizing
		var	div =  L.DomUtil.create('div', className, parent),
			select = L.DomUtil.create('select', className, div),
			choose = document.createElement('option'),
			opt = select.opt = [],
			index;

		choose.text = 'choose';
		choose.disabled = true;
		if (!selected || selected < 0) {
			choose.selected = true;
		}
		select.add(choose, null);
		for (var i in items) {
			index = parseInt(i, 10);
			opt[index] = document.createElement('option');
			opt[index].text = items[index];
			opt[index].value = index;
			if (disabled && disabled[index]) {
				opt[index].disabled = true;
			} else if (index === selected) {
				opt[index].selected = true;
			}
			select.add(opt[index], null);
		}

		// Fix collapsing dialog issue when selecting a channel
		if (this._container && !L.Browser.android && this.options.collapsed) {
			L.DomEvent.on(select, 'mousedown', function () {
				L.DomEvent.off(this._container, 'mouseout', this._collapse, this);
				this.collapsedOff = true;
			}, this);

			L.DomEvent.on(this._container, 'mouseover', function () {
				if (this.collapsedOff) {
					L.DomEvent.on(this._container, 'mouseout', this._collapse, this);
					this.collapsedOff = false;
				}
			}, this);
		}

		if (fn) {
			L.DomEvent.on(select, 'change keyup', fn, this);
		}
		if (title) {
			div.title = title;
		}

		return select;
	},


	_createColorPicker: function (className, parent, subClassName, defaultColor,
	    fn, storageKey, title) {
		var _this = this,
			colpick = L.DomUtil.create('input', className, parent);

		colpick.type = 'color';
		colpick.value = defaultColor;
		colpick.id = className + '-' + subClassName;

		$(document).ready(function () {
			$(colpick).spectrum({
				showInput: true,
				appendTo: '#' + _this._id,
				showPaletteOnly: true,
				togglePaletteOnly: true,
				localStorageKey: storageKey,
				change: function (color) {
					colpick.value = color.toHexString();
				}
			}).on('show.spectrum', function () {
				if (_this._container) {
					L.DomEvent.off(_this._container, 'mouseout', _this._collapse);
				}
			});
			if (fn) {
				$(colpick).on('change', fn);
			}
			if (title) {
				$('#' + colpick.id + '+.sp-replacer').prop('title', title);
			}
		});

		return colpick;
	},


	_addSwitchInput:	function (layer, box, label, attr, title, id, checked) {
		var line = this._addDialogLine(label, box),
			elem = this._addDialogElement(line),
			flip = elem.flip = L.flipswitch(elem, {
				checked: checked,
				id: id,
				title: title
			});

		flip.on('change', function () {
			this._onInputChange(layer, attr, flip.value());
		}, this);

		return elem;
	},

	_addNumericalInput:	function (layer, box, label, attr, title, id, initValue,
	  step, min, max, func) {
		var line = this._addDialogLine(label, box),
			elem = this._addDialogElement(line),
			spinbox = elem.spinbox = L.spinbox(elem, {
				step: step,
				dmin:  min,
				dmax:  max,
				initValue: initValue,
				title: title
			});

		spinbox.on('change', function () {
			L.IIPUtils.flashElement(spinbox._input);
			this._onInputChange(layer, attr, spinbox.value(), func);
		}, this);

		return elem;
	},

	_updateInput:	function (elem, value) {
		if (elem.spinbox) {
			elem.spinbox.value(value);
		} else if (elem.flip) {
			elem.flip.value(value);
		}
	},

	_spinboxStep: function (min, max) {
		var step = parseFloat((Math.abs(max === min ? max : max - min) *
			         0.01).toPrecision(1));

		return step === 0.0 ? 1.0 : step;
	},

	_onInputChange:	function (layer, pname, value, func) {

		var pnamearr = pname.split(/\[|\]/);
		if (pnamearr[1]) {
			layer[pnamearr[0]][parseInt(pnamearr[1], 10)] = value;
		}	else {
			layer[pnamearr[0]] = value;
		}
		if (func) {
			func(layer);
		}
		layer.redraw();
	},

	_updateLayerList: function () {
		if (!this._dialog) {
			return this;
		}

		if (this._layerList) {
			L.DomUtil.empty(this._layerList);
		} else {
			this._layerList = L.DomUtil.create('div', 'leaflet-control-iip' + '-layerlist',
			  this._dialog);
		}

		for (var i in this._layers) {
			this._addLayerItem(this._layers[i]);
		}

		return this;
	},

	_addLayerItem: function (obj) {
		var _this = this,
		 layerItem = L.DomUtil.create('div', 'leaflet-control-iip-layer'),
		 inputdiv = L.DomUtil.create('div', 'leaflet-control-iip-layerswitch', layerItem);

		if (obj.layer.notReady) {
			L.DomUtil.create('div', 'leaflet-control-iip-activity', inputdiv);
		} else {
			var input,
			    checked = this._map.hasLayer(obj.layer);
			input = document.createElement('input');
			input.type = 'checkbox';
			input.className = 'leaflet-control-iip-selector';
			input.defaultChecked = checked;
			input.layerId = L.stamp(obj.layer);
			L.DomEvent.on(input, 'click', function () {
				var i, input, obj,
			      inputs = this._layerList.getElementsByTagName('input'),
				    inputsLen = inputs.length;

				this._handlingClick = true;

				for (i = 0; i < inputsLen; i++) {
					input = inputs[i];
					if (!('layerId' in input)) {
						continue;
					}
					obj = this._layers[input.layerId];
					if (input.checked && !this._map.hasLayer(obj.layer)) {
						obj.layer.addTo(this._map);
					} else if (!input.checked && this._map.hasLayer(obj.layer)) {
						this._map.removeLayer(obj.layer);
					}
				}

				this._handlingClick = false;
			}, this);
			inputdiv.appendChild(input);
		}
	
		var name = L.DomUtil.create('div', 'leaflet-control-iip-layername', layerItem);
		name.innerHTML = ' ' + obj.name;
		name.style.textShadow = '0px 0px 5px ' + obj.layer.nameColor;

		this._createButton('leaflet-control-iip-trash',
			layerItem,
			undefined,
			function () {
				_this.removeLayer(obj.layer);
				if (!obj.notReady) {
					_this._map.removeLayer(obj.layer);
				}
			},
			'Delete layer'
		);

		this._layerList.appendChild(layerItem);

		return layerItem;
	},

	addLayer: function (layer, name, index) {
		layer.on('add remove', this._onLayerChange, this);

		var id = L.stamp(layer);

		this._layers[id] = {
			layer: layer,
			name: name,
			index: index
		};

		return this._updateLayerList();
	},

	removeLayer: function (layer) {
		layer.off('add remove', this._onLayerChange, this);
		layer.fire('trash', {index: this._layers[L.stamp(layer)].index});
		layer.off('trash');

		delete this._layers[L.stamp(layer)];
		return this._updateLayerList();
	},

	_onLayerChange: function (e) {
		if (!this._handlingClick) {
			this._updateLayerList();
		}

		var obj = this._layers[L.stamp(e.target)],
		    type = e.type === 'add' ? 'overlayadd' : 'overlayremove';

		this._map.fire(type, obj);
	}

});

L.control.iip = function (baseLayers, options) {
	return new L.Control.IIP(baseLayers, options);
};



/*
# L.Control.IIP.Catalog manages catalog overlays
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2018 Emmanuel Bertin - IAP/CNRS/UPMC,
#                          Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 25/04/2018
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery');
}

L.Control.IIP.Catalog = L.Control.IIP.extend({

	defaultCatalogs: [
		L.Catalog.GAIA_DR2,
		L.Catalog['2MASS'],
		L.Catalog.SDSS,
		L.Catalog.PPMXL,
		L.Catalog.Abell
	],

	options: {
		title: 'Catalog overlays',
		collapsed: true,
		position: 'topleft',
		nativeCelsys: true,
		color: '#FFFF00',
		timeOut: 30,	// seconds
		authenticate: false // string define a method used to authenticate
	},

	initialize: function (catalogs, options) {
		L.setOptions(this, options);
		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipcatalog';
		this._layers = {};
		this._handlingClick = false;
		this._sideClass = 'catalog';
		this._catalogs = catalogs ? catalogs : this.defaultCatalogs;
	},

	_initDialog: function () {
		var	className = this._className,
			catalogs = this._catalogs,
			box = this._addDialogBox(),
			// CDS catalog overlay
			line = this._addDialogLine('', box),
			elem = this._addDialogElement(line),
			colpick = this._createColorPicker(
				className + '-color',
				elem,
				'catalog',
			  this.options.color,
				false,
				'iipCatalog',
				'Click to set catalog color'
			);

		var catselect = this._createSelectMenu(
			this._className + '-select',
			elem,
			catalogs.map(function (catalog) { return catalog.name; }),
			undefined,
			-1,
			function () {
				var className = catalogs[catselect.selectedIndex - 1].className;
				if (className === undefined) {
					className = '';
				}
				L.DomUtil.setClass(catselect, this._className + '-select ' + className);
				return;
			},
			'Select Catalog'
		);

		L.DomEvent.on(catselect, 'change keyup', function () {
			var catalog = catalogs[catselect.selectedIndex - 1];
			catselect.title = catalog.attribution + ' from ' + catalog.service;
		}, this);

		elem = this._addDialogElement(line);

		this._createButton(className + '-button', elem, 'catalog', function () {
			var	index = catselect.selectedIndex - 1;	// Ignore dummy 'Choose catalog' entry
			if (index >= 0) {
				var catalog = catalogs[index];
				catalog.color = colpick.value;
				catselect.selectedIndex = 0;
				catselect.title = 'Select Catalog';
				L.DomUtil.setClass(catselect, this._className + '-select ');
				this._getCatalog(catalog, this.options.timeOut);
			}
		}, 'Query catalog');
	},

	_resetDialog: function () {
	// Do nothing: no need to reset with layer changes
	},

	_getCatalog: function (catalog, timeout) {
		var _this = this,
		    map = this._map,
				wcs = map.options.crs,
				sysflag = wcs.forceNativeCelsys && !this.options.nativeCelsys,
		    center = sysflag ? wcs.celsysToEq(map.getCenter()) : map.getCenter(),
		    b = map.getPixelBounds(),
		    z = map.getZoom(),
		    templayer = new L.LayerGroup(null);

		// Add a temporary "dummy" layer to activate a spinner sign
		templayer.notReady = true;
		this.addLayer(templayer, catalog.name);

		if (catalog.authenticate) {
			this.options.authenticate = catalog.authenticate;
		} else {
			this.options.authenticate = false;
		}

		// Compute the search cone
		var lngfac = Math.abs(Math.cos(center.lat * Math.PI / 180.0)),
			  c = sysflag ?
				   [wcs.celsysToEq(map.unproject(b.min, z)),
			      wcs.celsysToEq(map.unproject(L.point(b.min.x, b.max.y), z)),
			      wcs.celsysToEq(map.unproject(b.max, z)),
			      wcs.celsysToEq(map.unproject(L.point(b.max.x, b.min.y), z))] :
			                    [map.unproject(b.min, z),
			                     map.unproject(L.point(b.min.x, b.max.y), z),
			                     map.unproject(b.max, z),
			                     map.unproject(L.point(b.max.x, b.min.y), z)],
			  sys;
		if (wcs.forceNativeCelsys && this.options.nativeCelsys) {
			switch (wcs.celsyscode) {
			case 'ecliptic':
				sys = 'E2000.0';
				break;
			case 'galactic':
				sys = 'G';
				break;
			case 'supergalactic':
				sys = 'S';
				break;
			default:
				sys = 'J2000.0';
				break;
			}
		} else {
			sys = 'J2000.0';
		}

		if (catalog.regionType === 'box') {
			// CDS box search
			var	dlng = (Math.max(wcs._deltaLng(c[0], center),
				                   wcs._deltaLng(c[1], center),
				                   wcs._deltaLng(c[2], center),
				                   wcs._deltaLng(c[3], center)) -
			            Math.min(wcs._deltaLng(c[0], center),
				                   wcs._deltaLng(c[1], center),
				                   wcs._deltaLng(c[2], center),
				                   wcs._deltaLng(c[3], center))) * lngfac,
		       dlat = Math.max(c[0].lat, c[1].lat, c[2].lat, c[3].lat) -
		              Math.min(c[0].lat, c[1].lat, c[2].lat, c[3].lat);
			if (dlat < 0.0001) {
				dlat = 0.0001;
			}
			if (dlng < 0.0001) {
				dlng = 0.0001;
			}

			L.IIPUtils.requestURL(
				L.Util.template(catalog.url, L.extend({
					sys: sys,
					lng: center.lng.toFixed(6),
					lat: center.lat.toFixed(6),
					dlng: dlng.toFixed(4),
					dlat: dlat.toFixed(4),
					nmax: catalog.nmax + 1,
					maglim: catalog.maglim
				})),
				'getting ' + catalog.service + ' data',
				function (context, httpRequest) {
					_this._loadCatalog(catalog, templayer, context, httpRequest);
				},
				this,
				timeout
			);
		} else {
			// Regular cone search
			var	dr = Math.max(wcs.distance(c[0], center),
				                wcs.distance(c[0], center),
				                wcs.distance(c[0], center),
				                wcs.distance(c[0], center));
			L.IIPUtils.requestURL(
				L.Util.template(catalog.url, L.extend({
					sys: sys,
					lng: center.lng.toFixed(6),
					lat: center.lat.toFixed(6),
					dr: dr.toFixed(4),
					drm: (dr * 60.0).toFixed(4),
					nmax: catalog.nmax + 1
				})), 'querying ' + catalog.service + ' data', function (context, httpRequest) {
					_this._loadCatalog(catalog, templayer, context, httpRequest);
				}, this, this.options.timeOut);
		}
	},

	_loadCatalog: function (catalog, templayer, _this, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var wcs = _this._map.options.crs,
				 response = httpRequest.responseText,
				 geo = catalog.toGeoJSON(response),
				 geocatalog = L.geoJson(geo, {
					onEachFeature: function (feature, layer) {
						if (feature.properties && feature.properties.items) {
							layer.bindPopup(catalog.popup(feature));
						}
					},
					coordsToLatLng: function (coords) {
						if (wcs.forceNativeCelsys) {
							var latLng = wcs.eqToCelsys(L.latLng(coords[1], coords[0]));
							return new L.LatLng(latLng.lat, latLng.lng, coords[2]);
						} else {
							return new L.LatLng(coords[1], coords[0], coords[2]);
						}
					},
					filter: function (feature) {
						return catalog.filter(feature);
					},
					pointToLayer: function (feature, latlng) {
						return catalog.draw(feature, latlng);
					},
					style: function (feature) {
						return {color: catalog.color, weight: 2};
					}
				}),
				 excessflag;
				geocatalog.nameColor = catalog.color;
				geocatalog.addTo(_this._map);
				this.removeLayer(templayer);
				if (geo.features.length > catalog.nmax) {
					geo.features.pop();
					excessflag = true;
				}
				this.addLayer(geocatalog, catalog.name +
				  ' (' + geo.features.length.toString() +
				  (excessflag ? '+ entries)' : ' entries)'));
				if (excessflag) {
					alert('Selected area is too large: ' + catalog.name +
					  ' sample has been truncated to the brightest ' + catalog.nmax + ' sources.');
				}
			} else {
				if (httpRequest.status !== 0) {
					alert('Error ' + httpRequest.status + ' while querying ' +
					  catalog.service + '.');
				}
				this.removeLayer(templayer);
			}
		}
	}

});

L.control.iip.catalog = function (catalogs, options) {
	return new L.Control.IIP.Catalog(catalogs, options);
};



/*
# L.Control.IIP.Channel manages the channel mixing of an IIP layer
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	VisiOmatic
#
#	Copyright:		(C) 2014-2017 IAP/CNRS/UPMC and GEOPS/Paris-Sud
#
#	Last modified:		17/05/2017
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery');
}

L.Control.IIP.Channel = L.Control.IIP.extend({
	options: {
		title: 'Channel mixing',
		collapsed: true,
		cMap: 'grey',
		mixingMode : null,	//	'color' or 'mono' (or null for layer settings)
		position: 'topleft',
	},

	initialize: function (mode, options) {
		L.setOptions(this, options);

		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipchannel';
		this._sideClass = 'channel';
		this._settings = [];
		this._initsettings = [];
	},

	// Copy channel mixing settings from layer
	saveSettings: function (layer, settings, mode) {
		if (!settings[mode]) {
			settings[mode] = {};
		}

		var setting = settings[mode],
			nchan = layer.iipNChannel;

		setting.channel = layer.iipChannel;
		setting.cMap = layer.iipCMap;
		setting.rgb = [];
		for (var c = 0; c < nchan; c++) {
			setting.rgb[c] = layer.iipRGB[c].clone();
		}
	},

	// Copy channel mixing settings to layer
	loadSettings: function (layer, settings, mode, keepchanflag) {
		var setting = settings[mode],
			nchan = layer.iipNChannel;

		if (!setting) {
			return;
		}

		if (!keepchanflag) {
			layer.iipChannel = setting.channel;
		}
		layer.iipCMap = setting.cMap;
		for (var c = 0; c < nchan; c++) {
			layer.iipRGB[c] = setting.rgb[c].clone();
		}
	},

	_initDialog: function () {
		var _this = this,
			layer = this._layer,
			className = this._className,
			dialog = this._dialog;

		// copy initial IIP mixing parameters from the layer object
		this.saveSettings(layer, this._initsettings, 'mono');
		this.saveSettings(layer, this._initsettings, 'color');

		// copy current IIP mixing parameters from the layer object
		this.saveSettings(layer, this._settings, 'mono');
		this.saveSettings(layer, this._settings, 'color');

		this._mode = this.options.mixingMode ?
		  this.options.mixingMode : layer.iipMode;

		var	box = this._addDialogBox(),
			modeline = this._addDialogLine('Mode:', box),
			modelem = this._addDialogElement(modeline),
			modeinput = L.DomUtil.create('div', className + '-radios', modelem),
			elem, modebutton;

		// Create Mode selection control section
		modebutton = this._createRadioButton(className + '-radio', modeinput, 'mono',
		  (this._mode === 'mono'), function () {
			// Save previous settings 
			_this.saveSettings(layer, _this._settings, _this._mode);

			// Remove previous dialogs
			for (elem = box.lastChild; elem !== modeline; elem = box.lastChild) {
				box.removeChild(elem);
			}
			for (elem = dialog.lastChild; elem !== box; elem = dialog.lastChild) {
				dialog.removeChild(elem);
			}
			_this._channelList = undefined;
			_this.loadSettings(layer, _this._settings, 'mono');
			_this._initMonoDialog(layer, box);
			_this._mode = 'mono';
		}, 'Select mono-channel palettized mode');

		modebutton = this._createRadioButton(className + '-radio', modeinput, 'color',
		  (this._mode !== 'mono'), function () {
			// Save previous settings 
			_this.saveSettings(layer, _this._settings, _this._mode);
			// Remove previous dialogs
			for (elem = box.lastChild; elem !== modeline; elem = box.lastChild) {
				box.removeChild(elem);
			}
			for (elem = dialog.lastChild; elem !== box; elem = dialog.lastChild) {
				dialog.removeChild(elem);
			}
			_this.loadSettings(layer, _this._settings, 'color');
			_this._channelList = undefined;
			_this._initColorDialog(layer, box);
			_this._mode = 'color';
		}, 'Select color mixing mode');

		if (_this._mode === 'mono') {
			_this._initMonoDialog(layer, box);
		} else {
			_this._initColorDialog(layer, box);
		}
	},

	_initMonoDialog: function (layer, box) {
		// Single Channels with colour map
		var _this = this,
			channels = layer.iipChannelLabels,
			className = this._className,
			line = this._addDialogLine('Channel:', box),
			elem = this._addDialogElement(line);

		layer.updateMono();

		this._chanSelect = this._createSelectMenu(
			this._className + '-select',
			elem,
			layer.iipChannelLabels,
			undefined,
			layer.iipChannel,
			function () {
				layer.iipChannel = parseInt(this._chanSelect.selectedIndex - 1, 10);
				this._updateChannel(layer, layer.iipChannel);
				layer.redraw();
			},
			'Select image channel'
		);

		line = this._addDialogLine('LUT:', box);
		elem = this._addDialogElement(line);

		var	cmapinput = L.DomUtil.create('div', className + '-cmaps', elem),
			cbutton = [],
			cmaps = ['grey', 'jet', 'cold', 'hot'],
			_changeMap = function (value) {
				_this._onInputChange(layer, 'iipCMap', value);
			},
			i;
		for (i in cmaps) {
			cbutton[i] = this._createRadioButton('leaflet-cmap', cmapinput, cmaps[i],
			  (cmaps[i] === this.options.cMap), _changeMap,
			  '"' + cmaps[i].charAt(0).toUpperCase() + cmaps[i].substr(1) +  '" color-map');
		}

		this._addMinMax(layer, layer.iipChannel, box);
		layer.redraw();
	},
 
	_initColorDialog: function (layer, box) {
		// Multiple Channels with mixing matrix

		var _this = this,
			className = this._className,
			line = this._addDialogLine('Channel:', box),
			elem = this._addDialogElement(line),
			colpick = this._chanColPick = this._createColorPicker(
				className + '-color',
				elem,
				'channel',
			  layer.iipRGB[layer.iipChannel].toStr(),
				function () {
					var chan = layer.iipChannel,
				    hex = $(colpick).val();
					_this._updateMix(layer, chan, L.rgb(hex));
					_this.collapsedOff = true;
				},
				'iipChannel',
				'Click to set channel color'
			);

		this._onInputChange(layer, 'iipCMap', 'grey');
		layer.updateMix();

		this._chanSelect = this._createSelectMenu(
			this._className + '-select',
			elem,
			layer.iipChannelLabels,
			undefined,
			layer.iipChannel,
			function () {
				layer.iipChannel =  this._chanSelect.selectedIndex - 1;
				this._updateChannel(layer, layer.iipChannel, colpick);
			},
			'Select image channel'
		);

		this._addMinMax(layer, layer.iipChannel, box);

		line = this._addDialogLine('Colors:', box);
		elem = this._addDialogElement(line);

		// Create reset color settings button
		this._createButton(className + '-button', elem, 'colormix-reset', function () {
			_this.loadSettings(layer, _this._initsettings, 'color', true);
			layer.updateMix();
			this._updateColPick(layer);
			this._updateChannelList(layer);
			layer.redraw();
		}, 'Reset color mix');

		// Create automated color settings button
		this._createButton(className + '-button', elem, 'colormix-auto', function () {
			var	nchan = layer.iipNChannel,
				cc = 0,
				nchanon = 0,
				rgb = layer.iipRGB,
				defcol = layer.iipdefault.channelColors;

			for (var c = 0; c < nchan; c++) {
				if (rgb[c].isOn()) {
					nchanon++;
				}
			}
			if (nchanon >= defcol.length) {
				nchanon = defcol.length - 1;
			}

			for (c = 0; c < nchan; c++) {
				if (rgb[c].isOn() && cc < nchanon) {
					rgb[c] = L.rgb(defcol[nchanon][cc++]);
				}
			}
			layer.updateMix();
			this._updateColPick(layer);
			this._updateChannelList(layer);
			layer.redraw();

		}, 'Re-color active channels');


		_this._updateChannelList(layer);
		layer.redraw();
	},

	// Add Spinboxes for setting the min and max clipping limits of pixel values
	_addMinMax: function (layer, chan, box) {
		var	step = this._spinboxStep(layer.iipMinValue[chan], layer.iipMaxValue[chan]);

		// Min
		this._minElem = this._addNumericalInput(layer, box, 'Min:',
		  'iipMinValue[' + chan + ']',
		  'Lower clipping limit in ' + layer.iipChannelUnits[chan] + '.',
		  'leaflet-channel-minvalue', layer.iipMinValue[chan], step);

		// Max
		this._maxElem = this._addNumericalInput(layer, box, 'Max:',
			'iipMaxValue[' + chan + ']',
		  'Upper clipping limit in ' + layer.iipChannelUnits[chan] + '.',
		  'leaflet-channel-maxvalue', layer.iipMaxValue[chan], step);
	},

	_updateChannel: function (layer, chan, colorElem) {
		var _this = this,
			  step = this._spinboxStep(layer.iipMinValue[chan], layer.iipMaxValue[chan]);
		_this._chanSelect.selectedIndex = chan + 1;
		if (colorElem) {
			$(colorElem).spectrum('set', layer.iipRGB[chan].toStr());
			$(colorElem)
				.val(layer.iipRGB[chan].toStr())
				.off('change')
				.on('change', function () {
					_this._updateMix(layer, chan, L.rgb($(colorElem).val()));
				});
		}

		this._minElem.spinbox
			.value(layer.iipMinValue[chan])
			.step(step)
			.off('change')
			.on('change', function () {
				_this._onInputChange(layer, 'iipMinValue[' + chan + ']',
				_this._minElem.spinbox.value());
			}, this);

		this._maxElem.spinbox
			.value(layer.iipMaxValue[chan])
			.step(step)
			.off('change')
			.on('change', function () {
				_this._onInputChange(layer, 'iipMaxValue[' + chan + ']',
				_this._maxElem.spinbox.value());
			}, this);
	},

	_updateMix: function (layer, chan, rgb) {
		layer.rgbToMix(chan, rgb);
		this._updateChannelList(layer);
		layer.redraw();
	},

	_updateChannelList: function (layer) {
		var chanLabels = layer.iipChannelLabels,
		    chanList = this._channelList,
				chanElems = this._channelElems,
				trashElems = this._trashElems,
		    chanElem, trashElem, rgb, color, label, c, chan;
		if (chanList) {
/*
			for (c in chanElems) {
				L.DomEvent.off(chanElems[c], 'click touch');
				L.DomEvent.off(trashElems[c], 'click touch');
			}
*/
			L.DomUtil.empty(this._channelList);
		} else {
			chanList = this._channelList = L.DomUtil.create('div', this._className + '-chanlist',
			  this._dialog);
		}

		chanElems = this._channelElems = [];
		trashElems = this._trashElems = [];

		for (c in chanLabels) {
			chan = parseInt(c, 10);
			rgb = layer.iipRGB[chan];
			if (rgb.isOn()) {
				chanElem = L.DomUtil.create('div', this._className + '-channel', chanList);
				color = L.DomUtil.create('div', this._className + '-chancolor', chanElem);
				color.style.backgroundColor = rgb.toStr();
				this._activateChanElem(color, layer, chan);
				label = L.DomUtil.create('div', this._className + '-chanlabel', chanElem);
				label.innerHTML = chanLabels[c];
				this._activateChanElem(label, layer, chan);
				trashElem = this._createButton('leaflet-control-iip-trash', chanElem,
					undefined, undefined, 'Delete channel');
				this._activateTrashElem(trashElem, layer, chan);
				chanElems.push(chanElem);
				trashElems.push(trashElem);
			}
		}
	},

	_updateColPick: function (layer) {
		$(this._chanColPick).spectrum('set', layer.iipRGB[layer.iipChannel].toStr());
		$(this._chanColPick).val(layer.iipRGB[layer.iipChannel].toStr());
	},

	_activateTrashElem: function (trashElem, layer, chan) {
		L.DomEvent.on(trashElem, 'click touch', function () {
			this._updateMix(layer, chan, L.rgb(0.0, 0.0, 0.0));
			if (layer === this._layer && chan === layer.iipChannel) {
				this._updateColPick(layer);
			}
		}, this);
	},

	_activateChanElem: function (chanElem, layer, chan) {
		L.DomEvent.on(chanElem, 'click touch', function () {
			layer.iipChannel = chan;
			this._updateChannel(layer, chan, this._chanColPick);
		}, this);
	}

});

L.control.iip.channel = function (options) {
	return new L.Control.IIP.Channel(options);
};



/*
# L.Control.IIP.Doc adds online documentation to the VisiOmatic interface
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	VisiOmatic
#
#	Copyright:		(C) 2015 Emmanuel Bertin - IAP/CNRS/UPMC,
#				                 Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		10/11/2015
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery');
}

L.Control.IIP.Doc = L.Control.IIP.extend({
	options: {
		title: 'Documentation',
		collapsed: true,
		position: 'topleft',
		pdflink: undefined
	},

	initialize: function (url, options) {
		L.setOptions(this, options);

		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipdoc';
		this._sideClass = 'doc';
		this._url = url;
	},

	_initDialog: function () {
		var _this = this,
			className = this._className,
			layer = this._layer,
			frameBox = L.DomUtil.create('div',
		    this._className + '-framebox', this._dialog),
			iframe = this._iframe = L.DomUtil.create('iframe',
			  this._className + '-doc', frameBox);
		iframe.src = this._url;
		iframe.frameborder = 0;

		this._navHistory = [];
		this._navPos = 0;
		this._ignore = false;

		L.DomEvent.on(iframe, 'load hashchange', this._onloadNav, this);

		var	box = this._addDialogBox('leaflet-iipdoc-dialog'),
			line = this._addDialogLine('Navigate:', box),
			elem = this._addDialogElement(line);

		this._homeButton = this._createButton(className + '-button', elem,
		  'home', this._homeNav, 'Navigate home');
		this._backButton = this._createButton(className + '-button', elem,
		  'back', this._backNav, 'Navigate backward');
		this._forwardButton = this._createButton(className + '-button', elem,
		  'forward', this._forwardNav, 'Navigate forward');

		if (this.options.pdflink) {
			var pdfButton = this._createButton(className + '-button', elem,
			  'pdf', undefined, 'Download PDF version');
			pdfButton.href = this.options.pdflink;
		}
	},

	// Update navigation buttons, based on http://stackoverflow.com/a/7704305
	_updateNav: function (newPos) {
		if (newPos !== this._navPos) {
			this._navPos = newPos;
			this._navIgnore = true;
			this._iframe.src = this._navHistory[this._navPos - 1];
			this._disableNav();
		}
	},

	_disableNav: function () {
		// Enable / disable back button?
		this._backButton.disabled = (this._navPos === 1);
		// Enable / disable forward button?
		this._forwardButton.disabled = (this._navPos >= this._navHistory.length);
	},

	// Navigate back in IFrame, based on http://stackoverflow.com/a/7704305
	_backNav: function () {
		if (!this._backButton.disabled) {
			this._updateNav(Math.max(1, this._navPos - 1));
		}
	},

	// Navigate forward in IFrame, based on http://stackoverflow.com/a/7704305
	_forwardNav: function () {
		if (!this._forwardButton.disabled) {
			this._updateNav(Math.min(this._navHistory.length, this._navPos + 1));
		}
	},

	// Navigate home in IFrame
	_homeNav: function () {
		if (!this._backButton.disabled) {
			this._updateNav(1);
		}
	},

	// Triggered on IFrame load, based on http://stackoverflow.com/a/7704305
	_onloadNav: function () {
		if (true) {
			// Force all external iframe links to open in new tab/window
			// from 
			var	as = this._iframe.contentDocument.getElementsByTagName('a');
			for (var i = 0; i < as.length; i++) {
				if (L.IIPUtils.isExternal(as[i].href)) {
					as[i].setAttribute('target', '_blank');
				}
			}
			this._iframeLoad1 = true;
		}

		if (!this._navIgnore) {
			var href = this._iframe.contentWindow.location.href;
			if (href !== this._navHistory[this._navPos - 1]) {
				this._navHistory.splice(this._navPos, this._navHistory.length - this._navPos);
				this._navHistory.push(href);
				this._navPos = this._navHistory.length;
				this._disableNav();
			}
		} else {
			this._navIgnore = false;
		}
	}

});

L.control.iip.doc = function (url, options) {
	return new L.Control.IIP.Doc(url, options);
};



/*
# L.Control.IIP.image adjusts the basic rendering options of an IIP layer
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	VisiOmatic
#
#	Copyright:		(C) 2014,2017 Emmanuel Bertin - IAP/CNRS/UPMC,
#				                      Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		29/11/2017
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery');
}

L.Control.IIP.Image = L.Control.IIP.extend({
	options: {
		title: 'Image preferences',
		collapsed: true,
		position: 'topleft'
	},

	initialize: function (options) {
		L.setOptions(this, options);

		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipimage';
		this._sideClass = 'image';
		this._initsettings = {};
	},

	// Copy image settings from layer
	saveSettings: function (layer, settings) {
		if (!settings) {
			return;
		}

		settings.invertCMap = layer.iipInvertCMap;
		settings.contrast = layer.iipContrast;
		settings.colorSat = layer.iipColorSat;
		settings.gamma = layer.iipGamma;
		settings.quality = layer.iipQuality;
	},

	// Copy image settings back to layer and update widget values
	loadSettings: function (layer, settings) {
		if (!settings) {
			return;
		}

		layer.iipInvertCMap = settings.invertCMap;
		this._updateInput(this._input.invertCMap, settings.invertCMap);
		layer.iipContrast = settings.contrast;
		this._updateInput(this._input.contrast, settings.contrast);
		layer.iipColorSat = settings.colorSat;
		this._updateInput(this._input.colorSat, settings.colorSat);
		layer.iipGamma = settings.gamma;
		this._updateInput(this._input.gamma, settings.gamma);
		layer.iipQuality = settings.quality;
		this._updateInput(this._input.quality, settings.quality);
	},

	_initDialog: function () {
		var _this = this,
			className = this._className,
			layer = this._layer,
			map = this._map;

		// _input will contain widget instances
		this._input = {};

		// copy initial IIP image parameters from the layer object
		this.saveSettings(layer, this._initsettings);

		// Invert
		this._input.invertCMap = this._addSwitchInput(layer, this._dialog,
		  'Invert:', 'iipInvertCMap',
		  'Invert color map(s)', 'leaflet-invertCMap', layer.iipInvertCMap);

		// Contrast
		this._input.contrast = this._addNumericalInput(layer,
		  this._dialog, 'Contrast:', 'iipContrast',
		  'Adjust Contrast. 1.0: normal.', 'leaflet-contrastValue',
		  layer.iipContrast, 0.05, 0.0, 10.0);

		// Colour saturation
		this._input.colorSat = this._addNumericalInput(layer,
		  this._dialog, 'Color Sat.:', 'iipColorSat',
		  'Adjust Color Saturation. 0: B&W, 1.0: normal.', 'leaflet-colorsatvalue',
		  layer.iipColorSat, 0.05, 0.0, 5.0, this._updateMix);

		// Gamma
		this._input.gamma = this._addNumericalInput(layer,
		  this._dialog,  'Gamma:', 'iipGamma',
		  'Adjust Gamma correction. The standard value is 2.2.',
		  'leaflet-gammavalue', layer.iipGamma, 0.05, 0.5, 5.0);

		// JPEG quality
		this._input.quality = this._addNumericalInput(layer,
		  this._dialog,  'JPEG quality:', 'iipQuality',
		  'Adjust JPEG compression quality. 1: lowest, 100: highest',
		  'leaflet-qualvalue', layer.iipQuality, 1, 1, 100);

		// Reset settings button
		var line = this._addDialogLine('Reset:', this._dialog),
		    elem = this._addDialogElement(line);

		this._createButton(className + '-button', elem, 'image-reset', function () {
			_this.loadSettings(layer, _this._initsettings);
			layer.updateMix();
			layer.redraw();
		}, 'Reset image settings');

	},

	_updateMix: function (layer) {
		var nchannel = layer.iipNChannel;
		for (var c = 0; c < nchannel; c++) {
			layer.rgbToMix(c);
		}
		return;
	}

});

L.control.iip.image = function (options) {
	return new L.Control.IIP.Image(options);
};



/*
# L.Control.IIP.Profile manages image profile diagrams
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2017 Emmanuel Bertin - IAP/CNRS/UPMC,
#                                Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 22/11/2017
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery');
}

L.Control.IIP.Profile = L.Control.IIP.extend({

	options: {
		title: 'Profile overlays',
		collapsed: true,
		position: 'topleft',
		profile: true,
		profileColor: '#FF00FF',
		spectrum: true,
		spectrumColor: '#A000FF'
	},

	initialize: function (options) {
		L.setOptions(this, options);
		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipprofile';
		this._layers = {};
		this._sideClass = 'profile';
		this._handlingClick = false;
	},

	_initDialog: function () {
		var _this = this,
			options = this.options,
			className = this._className,
			box = this._addDialogBox(),
			line, elem;

		if (options.profile) {
			line = this._addDialogLine('Profile:', box);
			elem = this._addDialogElement(line);
			var	linecolpick = this._createColorPicker(
				className + '-color',
				elem,
				'profile',
			  options.profileColor,
				false,
				'iipProfile',
				'Click to set line color'
				);

			// Create start profile line button
			this._createButton(className + '-button', elem, 'start', function () {
				if (this._currProfileLine) {
					this._updateLine();
				} else {
					var map = _this._map,
					 point = map.getCenter(),
					 line = this._currProfileLine = L.polyline([point, point], {
						color: linecolpick.value,
						weight: 7,
						opacity: 0.5
					});
					line.nameColor = linecolpick.value;
					line.addTo(map);
					map.on('drag', this._updateLine, this);
				}
			}, 'Start drawing a profile line');

			// Create end profile line button
			this._createButton(className + '-button', elem, 'end',
			  this._profileEnd, 'End line and plot');
		}

		if (options.spectrum) {
			// Create Spectrum dialog line
			line = this._addDialogLine('Spectrum:', box);
			elem = this._addDialogElement(line);

			// Create Spectrum color picker
			var speccolpick = this._createColorPicker(
					className + '-color',
					elem,
					'spectrum',
				  options.spectrumColor,
					false,
					'iipSpectra',
					'Click to set marker color'
				);

			// Create Spectrum button
			this._createButton(className + '-button', elem, 'spectrum', function () {
				var map = _this._map,
					latLng = map.getCenter(),
					zoom = map.options.crs.options.nzoom - 1,
					point = map.project(latLng, zoom).floor().add([0.5, 0.5]),
					rLatLng = map.unproject(point, zoom),
					marker = this._spectrumMarker = L.circleMarker(rLatLng, {
						color: speccolpick.value,
						radius: 6,
						title: 'Spectrum'
					}).addTo(map),
					popdiv = L.DomUtil.create('div', this._className + '-popup'),
			    activity = L.DomUtil.create('div', this._className + '-activity', popdiv);

				popdiv.id = 'leaflet-spectrum-plot';
				marker.bindPopup(popdiv,
				  {minWidth: 16, maxWidth: 1024, closeOnClick: false}).openPopup();
				L.IIPUtils.requestURL(this._layer._url.replace(/\&.*$/g, '') +
				  '&PFL=' + zoom.toString() + ':' +
				  (point.x - 0.5).toFixed(0) + ',' + (point.y - 0.5).toFixed(0) + '-' +
				  (point.x - 0.5).toFixed(0) + ',' + (point.y - 0.5).toFixed(0),
				  'getting IIP layer spectrum', this._plotSpectrum, this);
			}, 'Plot a spectrum at the current map position');
		}
	},

	_updateLine: function (e) {
		var map = this._map,
		 latLng = map.getCenter(),
		 maxzoom = map.options.crs.options.nzoom - 1,
		 path = this._currProfileLine.getLatLngs(),
		 point1 = map.project(path[0], maxzoom),
		 point2 = map.project(map.getCenter(), maxzoom);
		if (Math.abs(point1.x - point2.x) > Math.abs(point1.y - point2.y)) {
			point2.y = point1.y;
		} else {
			point2.x = point1.x;
		}

		path[1] = map.unproject(point2, maxzoom);
		this._currProfileLine.redraw();
	},

	_profileEnd: function () {
		var map = this._map,
		    point = map.getCenter(),
		    line = this._profileLine = this._currProfileLine;

		map.off('drag', this._updateLine, this);
		this._currProfileLine = undefined;

		var popdiv = L.DomUtil.create('div', this._className + '-popup'),
		    activity = L.DomUtil.create('div', this._className + '-activity', popdiv);

		popdiv.id = 'leaflet-profile-plot';
		line.bindPopup(popdiv,
			 {minWidth: 16, maxWidth: 1024, closeOnClick: false}).openPopup();
		var zoom = map.options.crs.options.nzoom - 1,
			  path = line.getLatLngs(),
			  point1 = map.project(path[0], zoom),
			  point2 = map.project(path[1], zoom),
				x, y;

		if (point2.x < point1.x) {
			x = point2.x;
			point2.x = point1.x;
			point1.x = x;
		}
		if (point2.y < point1.y) {
			y = point2.y;
			point2.y = point1.y;
			point1.y = y;
		}

		L.IIPUtils.requestURL(this._layer._url.replace(/\&.*$/g, '') +
			'&PFL=' + zoom.toString() + ':' + (point1.x - 0.5).toFixed(0) + ',' +
			 (point1.y - 0.5).toFixed(0) + '-' + (point2.x - 0.5).toFixed(0) + ',' +
			 (point2.y - 0.5).toFixed(0),
			'getting IIP layer profile',
			this._plotProfile, this);
	},

	_getMeasurementString: function () {
		var currentLatLng = this._currentLatLng,
		 previousLatLng = this._markers[this._markers.length - 1].getLatLng(),
		 distance, distanceStr, unit;

		// calculate the distance from the last fixed point to the mouse position
		distance = this._measurementRunningTotal + L.IIPUtils.distance(currentLatLng, previousLatLng);

		if (distance >= 1.0) {
			unit = '&#176;';
		} else {
			distance *= 60.0;
			if (distance >= 1.0) {
				unit = '&#39;';
			} else {
				distance *= 60.0;
				unit = '&#34;';
			}
		}
		distanceStr = distance.toFixed(2) + unit;

		return distanceStr;
	},

	_plotProfile: function (self, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var json = JSON.parse(httpRequest.responseText),
				    rawprof = json.profile,
						layer = self._layer,
						line = self._profileLine,
						popdiv = document.getElementById('leaflet-profile-plot'),
						prof = [],
						series = [],
						title, ylabel;

				self.addLayer(line, 'Image profile');

				if (layer.iipMode === 'mono') {
					prof.push(self._extractProfile(layer, rawprof, layer.iipChannel));
					series.push({
						color: 'black',
					});
					title = 'Image profile for ' + layer.iipChannelLabels[layer.iipChannel];
					ylabel = 'Pixel value in ' + layer.iipChannelUnits[layer.iipChannel];
				} else {
					var rgb = layer.iipRGB;
					for (var chan = 0; chan < layer.iipNChannel; chan++) {
						if (rgb[chan].isOn()) {
							prof.push(self._extractProfile(layer, rawprof, chan));
							series.push({
								color: rgb[chan].toStr(),
								label: layer.iipChannelLabels[chan]
							});
						}
					}
					title = 'Image profiles';
					ylabel = 'Pixel value';
				}

				$(document).ready(function () {
					$.jqplot.config.enablePlugins = true;
					$.jqplot('leaflet-profile-plot', prof, {
						title: title,
						grid: {
							backgroundColor: '#ddd',
							gridLineColor: '#eee'
						},
						axes: {
							xaxis: {
								label: 'position along line',
								labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
								pad: 1.0
							},
							yaxis: {
								label: ylabel,
								labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
								pad: 1.0
							}
						},
						legend: {
							show: (layer.iipMode !== 'mono'),
							location: 'ne',
						},
						highlighter: {
							show: true,
							sizeAdjust: 2,
							tooltipLocation: 'n',
							tooltipAxes: 'y',
							tooltipFormatString: '%.6g ' + layer.iipChannelUnits[layer.iipChannel],
							useAxesFormatters: false,
							bringSeriesToFront: true
						},
						cursor: {
							show: true,
							zoom: true
						},
						series: series,
						seriesDefaults: {
							lineWidth: 2.0,
							showMarker: false
						}
					});
				});

				popdiv.removeChild(popdiv.childNodes[0]);	// Remove activity spinner

				line._popup.update();	// TODO: avoid private method
			}
		}
	},

	// Extract the image profile in a given channel
	_extractProfile: function (layer, rawprof, chan) {
		var	prof = [],
			nchan = layer.iipNChannel,
			npix = rawprof.length / nchan;

		for (var i = 0; i < npix; i++) {
			prof.push(rawprof[i * nchan + chan]);
		}

		return prof;
	},

	_plotSpectrum: function (self, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var json = JSON.parse(httpRequest.responseText),
				    rawprof = json.profile,
						layer = self._layer,
						marker = self._spectrumMarker,
						popdiv = document.getElementById('leaflet-spectrum-plot'),
						spec = [],
						series = [],
						title, ylabel;
				self.addLayer(marker, 'Image spectrum');

				for (var chan = 0; chan < layer.iipNChannel; chan++) {
					spec.push([
						layer.iipChannelLabels[chan],
						self._extractAverage(layer, rawprof, chan)
					]);
				}
				title = 'Image Spectrum';
				ylabel = 'Average pixel value';
				$(document).ready(function () {
					$.jqplot.config.enablePlugins = true;
					$.jqplot('leaflet-spectrum-plot', [spec], {
						title: title,
						grid: {
							backgroundColor: '#F0F0F0',
							gridLineColor: '#F8F8F8'
						},
						axes: {
							xaxis: {
								renderer: $.jqplot.CategoryAxisRenderer,
								tickRenderer: $.jqplot.CanvasAxisTickRenderer,
								tickOptions: {
									angle: -30,
									fontSize: '6pt'
								}
							},
							yaxis: {
								label: ylabel,
								labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
							}
						},
						highlighter: {
							show: true,
							sizeAdjust: 2,
							tooltipLocation: 'n',
							tooltipAxes: 'y',
							tooltipFormatString: '%.6g ' + layer.iipChannelUnits[layer.iipChannel],
							useAxesFormatters: false
						},
						cursor: {
							show: true,
							zoom: true
						},
						seriesDefaults: {
							lineWidth: 2.0,
							showMarker: false
						}
					});
				});

				popdiv.removeChild(popdiv.childNodes[0]);	// Remove activity spinner

				marker._popup.update();	// TODO: avoid private method
			}
		}
	},

	// Extract the average of a series of pixels in a given channel
	_extractAverage: function (layer, rawprof, chan) {
		var	nchan = layer.iipNChannel,
			npix = rawprof.length / nchan,
			val = 0.0;

		if (npix === 0) { return 0.0; }

		for (var i = 0; i < npix; i++) {
			val += rawprof[i * nchan + chan];
		}

		return val / npix;
	}

});

L.control.iip.profile = function (options) {
	return new L.Control.IIP.Profile(options);
};



/*
# L.Control.IIP.Regions manages overlays of regions or points of interest
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2015 Emmanuel Bertin - IAP/CNRS/UPMC
#
#
#	Last modified: 24/11/2015
*/

L.Control.IIP.Region = L.Control.IIP.extend({

	options: {
		title: 'Region overlays',
		collapsed: true,
		position: 'topleft',
		nativeCelsys: true,
		color: '#00FFFF',
		timeOut: 30	// seconds
	},

	initialize: function (regions, options) {
		// Regions is an array of {url, name [, description]} objects
		L.setOptions(this, options);
		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipregion';
		this._layers = {};
		this._handlingClick = false;
		this._sideClass = 'region';
		this._regions =	regions && regions[0] ? regions : [];
	},

	_initDialog: function () {
		var	className = this._className,
			regions = this._regions,
			box = this._addDialogBox(),
			line = this._addDialogLine('Regions:', box),
			elem = this._addDialogElement(line),
			colpick = this._createColorPicker(
				className + '-color',
				elem,
				'region',
			  this.options.color,
				false,
				'iipRegion',
				'Click to set region color'
			);

		var	select = this._regionSelect = this._createSelectMenu(
				this._className + '-select',
				elem,
				regions.map(function (o) { return o.name; }),
				regions.map(function (o) { return (o.load ? true : false); }),
				-1,
				undefined,
				'Select region'
			);

		elem = this._addDialogElement(line);
		this._createButton(className + '-button',
			elem,
			'region',
			function () {
				var	index = select.selectedIndex - 1;	// Ignore 'Choose region' entry
				if (index >= 0) {
					var region = this._regions[index];
					region.color = colpick.value;
					select.selectedIndex = 0;
					select.opt[index].disabled = true;
					this._getRegion(region, this.options.timeOut);
				}
			},
			'Display region'
		);

		// Load regions that have the 'load' option set.
		var region;
		for (var index = 0; index < regions.length; index++) {
			region = regions[index];
			region.index = index;
			if (region.load === true) {
				if (!region.color) {
					region.color = this.options.color;
				}
				this._getRegion(regions[index], this.options.timeOut);
			}
		}
	},

	_resetDialog: function () {
	// Do nothing: no need to reset with layer changes
	},

	_getRegion: function (region, timeout) {
		var _this = this,
		    map = this._map,
				wcs = map.options.crs,
				sysflag = wcs.forceNativeCelsys && !this.options.nativeCelsys,
		    templayer = new L.LayerGroup(null);

		// Add a temporary "dummy" layer to activate a spinner sign
		templayer.notReady = true;
		this.addLayer(templayer, region.name);

		L.IIPUtils.requestURL(region.url, 'loading ' + region.name + ' data',
			function (context, httpRequest) {
				_this._loadRegion(region, templayer, context, httpRequest);
			}, this, this.options.timeOut);
	},

	_loadRegion: function (region, templayer, _this, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var wcs = _this._map.options.crs,
				 response = httpRequest.responseText,
				 geoRegion = L.geoJson(JSON.parse(response), {
					onEachFeature: function (feature, layer) {
						if (feature.properties && feature.properties.description) {
							layer.bindPopup(feature.properties.description);
						} else if (region.description) {
							layer.bindPopup(region.description);
						}
					},
					coordsToLatLng: function (coords) {
						if (wcs.forceNativeCelsys) {
							var latLng = wcs.eqToCelsys(L.latLng(coords[1], coords[0]));
							return new L.LatLng(latLng.lat, latLng.lng, coords[2]);
						} else {
							return new L.LatLng(coords[1], coords[0], coords[2]);
						}
					},
					style: function (feature) {
						return {color: region.color, weight: 2};
					},
					pointToLayer: function (feature, latlng) {
						return region.drawPoint ?
						  region.drawPoint(feature, latlng) : L.marker(latlng);
					}
				});
				geoRegion.nameColor = region.color;
				geoRegion.addTo(_this._map);
				_this.removeLayer(templayer);
				_this.addLayer(geoRegion, region.name, region.index);
				L.DomEvent.on(geoRegion, 'trash', function (e) {
					if (e.index || e.index === 0) {
						_this._regionSelect.opt[e.index].disabled = false;
					}
				}, _this);
			} else {
				if (httpRequest.status !== 0) {
					alert('Error ' + httpRequest.status + ' while downloading ' +
					  region.url + '.');
				}
				_this.removeLayer(templayer);
				_this._regionSelect.opt[region.index].disabled = false;
			}
		}
	}

});

L.control.iip.region = function (regions, options) {
	return new L.Control.IIP.Region(regions, options);
};



/*
# L.Control.IIP.snapshot offers several options to take snapshots of the current image/field
#	This file part of:	VisiOmatic
#
#	Copyright:		(C) 2014,2017 Emmanuel Bertin - IAP/CNRS/UPMC,
#				                      Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		11/07/2017
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery'),
		html2canvas = require('html2canvas');
}

L.Control.IIP.Snapshot = L.Control.IIP.extend({
	options: {
		title: 'Field snapshot',
		collapsed: true,
		position: 'topleft'
	},

	initialize: function (options) {
		L.setOptions(this, options);

		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipsnapshot';
		this._sideClass = 'snapshot';
	},

	_initDialog: function () {
		var _this = this,
			className = this._className,
			layer = this._layer,
			map = this._map;

		// Image snapshot
		var	line = this._addDialogLine('Snap:', this._dialog),
			elem = this._addDialogElement(line),
			items = ['Screen pixels', 'Native pixels'];

		this._snapType = 0;
		this._snapSelect =  this._createSelectMenu(
			this._className + '-select',
			elem,
			items,
			undefined,
			this._snapType,
			function () {
				this._snapType = parseInt(this._snapSelect.selectedIndex - 1, 10);
			},
			'Select snapshot resolution'
		);

		var	hiddenlink = document.createElement('a'),
			button = this._createButton(className + '-button', elem, 'snapshot',
			  function (event) {
				var	latlng = map.getCenter(),
					bounds = map.getPixelBounds(),
					z = map.getZoom(),
					zfac;

				if (z > layer.iipMaxZoom) {
					zfac = Math.pow(2, z - layer.iipMaxZoom);
					z = layer.iipMaxZoom;
				} else {
					zfac = 1;
				}

				var	sizex = layer.iipImageSize[z].x * zfac,
					sizey = layer.iipImageSize[z].y * zfac,
					dx = (bounds.max.x - bounds.min.x),
					dy = (bounds.max.y - bounds.min.y);

				hiddenlink.href = layer.getTileUrl({x: 1, y: 1}
				  ).replace(/JTL\=\d+\,\d+/g,
				  'RGN=' + bounds.min.x / sizex + ',' +
				  bounds.min.y / sizey + ',' +
				  dx / sizex + ',' + dy / sizey +
				  '&WID=' + (this._snapType === 0 ?
				    Math.floor(dx / zfac) :
				    Math.floor(dx / zfac / layer.wcs.scale(z))) + '&CVT=jpeg');
				hiddenlink.download = layer._title + '_' +
				  L.IIPUtils.latLngToHMSDMS(latlng).replace(/[\s\:\.]/g, '') +
				  '.jpg';
				hiddenlink.click();
			}, 'Take a snapshot of the displayed image');

		document.body.appendChild(hiddenlink);

		line = this._addDialogLine('Print:', this._dialog);
		elem = this._addDialogElement(line);
		button = this._createButton(className + '-button', elem, 'print',
			function (event) {
				var	control = document.querySelector('#map > .leaflet-control-container');
				control.style.display = 'none';
				window.print();
				control.style.display = 'unset';
			}, 'Print current map');
	}

});

L.control.iip.snapshot = function (options) {
	return new L.Control.IIP.Snapshot(options);
};



/*
# L.Control.Layers.IIP adds new features to the standard L.Control.Layers
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 22/03/2014
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery-browser');
}

L.Control.Layers.IIP = L.Control.Layers.extend({
	options: {
		title: 'overlay menu',
		collapsed: true,
		position: 'topright',
		autoZIndex: true,
		fileMenu: false,
		fileURL: '/fcgi-bin/iipsrv.fcgi?FIF=',
		fileRoot: '',
		fileTreeScript: 'visiomatic/dist/filetree.php',
		fileProcessScript: 'visiomatic/dist/processfits.php'
	},

	onAdd: function (map) {
		map._layerControl = this;
		this._initLayout();
		this._update();

//		map
//		    .on('layeradd', this._onLayerChange, this)
//		    .on('layerremove', this._onLayerChange, this);

		return this._container;
	},

	_initLayout: function () {
		var className = 'leaflet-control-layers',
		    container = this._container = L.DomUtil.create('div', className);

		// makes this work on IE touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		if (!L.Browser.touch) {
			L.DomEvent
				.disableClickPropagation(container)
				.disableScrollPropagation(container);
		} else {
			L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
		}

		var form = this._form = L.DomUtil.create('form', className + '-list');

		if (this.options.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent.on(container, {
					mouseover: this._expand,
				    mouseout: this._collapse
				}, this);
			}

			var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
			link.href = '#';
			link.title = 'Layers';

			if (L.Browser.touch) {
				L.DomEvent
				    .on(link, 'click', L.DomEvent.stop)
				    .on(link, 'click', this._expand, this);
			} else {
				L.DomEvent.on(link, 'focus', this._expand, this);
			}

			// work around for Firefox Android issue https://github.com/Leaflet/Leaflet/issues/2033
			L.DomEvent.on(form, 'click', function () {
				setTimeout(L.bind(this._onInputClick, this), 0);
			}, this);

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility
		} else {
			this._expand();
		}

		this._baseLayersList = L.DomUtil.create('div', className + '-base', form);

		if (this.options.fileMenu) {
			var addbutton = this._addButton = L.DomUtil.create('input', className + '-add', form);
			addbutton.type = 'button';
			addbutton.value = 'Add...';
			L.DomEvent.on(addbutton, 'click', this._openFileMenu, this);
		}

		this._separator = L.DomUtil.create('div', className + '-separator', form);
		this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);

		container.appendChild(form);
	},

	_addItem: function (obj) {
		var _this = this,
		 item = L.DomUtil.create('div', 'leaflet-control-layers-item'),
		 inputdiv = L.DomUtil.create('div', 'leaflet-control-layers-select', item);

		if (obj.layer.notReady) {
			L.DomUtil.create('div', 'leaflet-control-activity', inputdiv);
		} else {
			var input,
				checked = this._map.hasLayer(obj.layer);
			if (obj.overlay) {
				input = document.createElement('input');
				input.type = 'checkbox';
				input.className = 'leaflet-control-layers-selector';
				input.defaultChecked = checked;
			}
			else {
				input = this._createRadioElement('leaflet-base-layers', checked);
			}
			input.layerId = L.stamp(obj.layer);
			L.DomEvent.on(input, 'click', this._onInputClick, this);
			inputdiv.appendChild(input);
		}
		
		var name = L.DomUtil.create('div', 'leaflet-control-layers-name', item);
		name.innerHTML = ' ' + obj.name;
		name.style.textShadow = '0px 0px 5px ' + obj.layer.nameColor;

		var trashbutton = L.DomUtil.create('input', 'leaflet-control-layers-trash', item);
		trashbutton.type = 'button';
		L.DomEvent.on(trashbutton, 'click', function () {
			_this.removeLayer(obj.layer);
			if (!obj.notReady) {
				_this._map.removeLayer(obj.layer);
			}
		}, this);

		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
		container.appendChild(item);

		return item;
	},

	_onInputClick: function () {
		var i, input, obj,
		    inputs = this._form.getElementsByTagName('input'),
		    inputsLen = inputs.length;

		this._handlingClick = true;

		for (i = 0; i < inputsLen; i++) {
			input = inputs[i];
			if (!('layerId' in input)) {
				continue;
			}
			obj = this._layers[input.layerId];
			if (input.checked && !this._map.hasLayer(obj.layer)) {
				obj.layer.addTo(this._map);
			} else if (!input.checked && this._map.hasLayer(obj.layer)) {
				this._map.removeLayer(obj.layer);
			}
		}

		this._handlingClick = false;
	},

	_addDialogLine: function (label, dialog) {
		var elem = L.DomUtil.create('div', this._className + '-element', dialog),
		 text = L.DomUtil.create('span', this._className + '-label', elem);
		text.innerHTML = label;
		return elem;
	},

	_openFileMenu: function () {
		var _this = this,
		    fileMenu = L.DomUtil.create('div', 'leaflet-control-filemenu',
		                 this._map._controlContainer);
		fileMenu.title = 'Open file';
		this._addButton.disabled = true;
		L.DomEvent
				.disableClickPropagation(fileMenu)
				.disableScrollPropagation(fileMenu);

		$('.leaflet-control-filemenu').dialog({
			appendTo: 'body',
			close: function (event, ui) {
				L.DomUtil.remove(fileMenu);
				_this._addButton.disabled = false;
			},
			show: {
				effect: 'clip',
				duration: 250
			},
			hide: {
				effect: 'clip',
				duration: 250
			},
			height: 200
		});
		var fileTree = L.DomUtil.create('div', 'leaflet-control-filetree',
		                 fileMenu);
		fileTree.id = 'leaflet-filetree';

		$(document).ready(function () {
			$('#leaflet-filetree').fileTree({
				root: _this.options.fileRoot,
				script: _this.options.fileTreeScript
			},
			function (fitsname) {
				var layercontrol = _this._map._layerControl,
				    redname = fitsname.replace(/(^.*\/|\..*$)/g, ''),
				    templayer;
				if (layercontrol) {
					templayer = new L.LayerGroup(null);

					templayer.notReady = true;
					layercontrol.addBaseLayer(templayer, 'converting ' + redname + '...');
					if (layercontrol.options.collapsed) {
						layercontrol._expand();
					}
				}
				$.post(_this.options.fileProcessScript, {
					fitsname: fitsname
				}, function (ptifname) {
					ptifname = ptifname.trim();
					var layer = L.tileLayer.iip(_this.options.fileURL + ptifname, {title: redname});
					if (layer.iipMetaReady) {
						_this._updateBaseLayer(templayer, layer);
					} else {
						layer.once('metaload', function () {
							_this._updateBaseLayer(templayer, layer);
						});
					}
				});
			});
		});
	},

	_updateBaseLayer: function (templayer, layer) {
		var map = this._map,
		    layercontrol = map._layerControl;
		layercontrol.removeLayer(templayer);
		map.eachLayer(map.removeLayer);
		layer.addTo(map);
		layercontrol.addBaseLayer(layer, layer._title);
		map.fire('baselayerchange');
		if (layercontrol.options.collapsed) {
			layercontrol._collapse();
		}
	}
});

L.control.layers.iip = function (baselayers, overlays, options) {
	return new L.Control.Layers.IIP(baselayers, overlays, options);
};



/*
# L.Control.Reticle adds a reticle at the center of the map container
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		10/02/2014
*/
L.Control.Reticle = L.Control.extend({
	options: {
		position: 'bottomleft'
	},

	onAdd: function (map) {
		// Create central reticle
		var reticle = this._reticle = L.DomUtil.create('div', 'leaflet-reticle', this._map._controlContainer),
			style = reticle.style;
		style.position = 'absolute';
		style.left = '50%';
		style.bottom = '50%';
		style.textAlign = 'center';
		style.verticalAlign = 'middle';
		style.pointerEvents = 'none';
		reticle.innerHTML = '';

		var container = this._container = L.DomUtil.create('div', 'leaflet-dummy');

		return container;
	},

	onRemove: function (map) {
		this._reticle.parentNode.removeChild(this._reticle);
	}

});

L.control.reticle = function (options) {
    return new L.Control.Reticle(options);
};


/*
# L.Control.Scale.WCS adds degree and pixel units to the standard L.Control.Scale
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014,2015 Emmanuel Bertin - IAP/CNRS/UPMC,
#                          Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 20/10/2015
*/

L.Control.Scale.WCS = L.Control.Scale.extend({
	options: {
		position: 'bottomleft',
		title: 'Scale',
		maxWidth: 128,
		metric: false,
		imperial: false,
		degrees: true,
		pixels: true,
		custom: false,
		customScale: 1.0,
		customUnits: '',
		planetRadius: 6378137.0,
		updateWhenIdle: false
	},

	_addScales: function (options, className, container) {
		if (options.metric) {
			this._mScale = L.DomUtil.create('div', className, container);
			this._mScale.title = options.metricTitle ? options.metricTitle : options.title;
		}
		if (options.imperial) {
			this._iScale = L.DomUtil.create('div', className, container);
			this._iScale.title = options.imperialTitle ? options.imperialTitle : options.title;
		}
		if (options.degrees) {
			this._dScale = L.DomUtil.create('div', className, container);
			this._dScale.title = options.degreesTitle ? options.degreesTitle : options.title;
		}
		if (options.pixels) {
			this._pScale = L.DomUtil.create('div', className, container);
			this._pScale.title = options.pixelsTitle ? options.pixelsTitle : options.title;
		}
		if (options.custom) {
			this._cScale = L.DomUtil.create('div', className, container);
			this._cScale.title = options.customTitle ? options.customTitle : options.title;
		}

		this.angular = options.metric || options.imperial || options.degrees;
	},

	_update: function () {
		var options = this.options,
		    map = this._map,
		    crs = map.options.crs;

		if (options.pixels && crs.options && crs.options.nzoom) {
			var pixelScale = Math.pow(2.0, crs.options.nzoom - 1 - map.getZoom());
			this._updatePixels(pixelScale * options.maxWidth);
		}

		if (options.custom && crs.options && crs.options.nzoom) {
			var customScale = Math.pow(2.0,
			      crs.options.nzoom - 1 - map.getZoom()) * options.customScale;
			this._updateCustom(customScale * options.maxWidth, options.customUnits);
		}

		if (this.angular) {
			var center = map.getCenter(),
			    cosLat = Math.cos(center.lat * Math.PI / 180),
			    dist = Math.sqrt(this._jacobian(center)) * cosLat,
			    maxDegrees = dist * options.maxWidth;

			if (options.metric) {
				this._updateMetric(maxDegrees * Math.PI / 180.0 * options.planetRadius);
			}
			if (options.imperial) {
				this._updateImperial(maxDegrees * Math.PI / 180.0 * options.planetRadius);
			}
			if (options.degrees) {
				this._updateDegrees(maxDegrees);
			}
		}
	},

// Return the Jacobian determinant of the astrometric transformation at latLng
	_jacobian: function (latlng) {
		var map = this._map,
		    p0 = map.project(latlng),
		    latlngdx = map.unproject(p0.add([10.0, 0.0])),
		    latlngdy = map.unproject(p0.add([0.0, 10.0]));
		return 0.01 * Math.abs((latlngdx.lng - latlng.lng) *
		                        (latlngdy.lat - latlng.lat) -
		                       (latlngdy.lng - latlng.lng) *
		                        (latlngdx.lat - latlng.lat));
	},

	_updateCustom: function (maxCust, units) {
		var scale = this._cScale;

		if (maxCust > 1.0e9) {
			var maxGCust = maxCust * 1.0e-9,
			gCust = this._getRoundNum(maxGCust);
			this._updateScale(scale, gCust + ' G' + units, gCust / maxGCust);
		} else if (maxCust > 1.0e6) {
			var maxMCust = maxCust * 1.0e-6,
			mCust = this._getRoundNum(maxMCust);
			this._updateScale(scale, mCust + ' M' + units, mCust / maxMCust);
		} else if (maxCust > 1.0e3) {
			var maxKCust = maxCust * 1.0e-3,
			kCust = this._getRoundNum(maxKCust);
			this._updateScale(scale, kCust + ' k' + units, kCust / maxKCust);
		} else {
			var cust = this._getRoundNum(maxCust);
			this._updateScale(scale, cust + ' ' + units, cust / maxCust);
		}
	},

	_updatePixels: function (maxPix) {
		var scale = this._pScale;

		if (maxPix > 1.0e6) {
			var maxMPix = maxPix * 1.0e-6,
			mPix = this._getRoundNum(maxMPix);
			this._updateScale(scale, mPix + ' Mpx', mPix / maxMPix);
		} else if (maxPix > 1.0e3) {
			var maxKPix = maxPix * 1.0e-3,
			kPix = this._getRoundNum(maxKPix);
			this._updateScale(scale, kPix + ' kpx', kPix / maxKPix);
		} else {
			var pix = this._getRoundNum(maxPix);
			this._updateScale(scale, pix + ' px', pix / maxPix);
		}
	},

	_updateDegrees: function (maxDegrees) {
		var maxSeconds = maxDegrees * 3600.0,
		    scale = this._dScale;

		if (maxSeconds < 1.0) {
			var maxMas = maxSeconds * 1000.0,
			mas = this._getRoundNum(maxMas);
			this._updateScale(scale, mas + ' mas', mas / maxMas);
		} else if (maxSeconds < 60.0) {
			var seconds = this._getRoundNum(maxSeconds);
			this._updateScale(scale, seconds + ' &#34;', seconds / maxSeconds);
		} else if (maxSeconds < 3600.0) {
			var maxMinutes = maxDegrees * 60.0,
			    minutes = this._getRoundNum(maxMinutes);
			this._updateScale(scale, minutes + ' &#39;', minutes / maxMinutes);
		} else {
			var degrees = this._getRoundNum(maxDegrees);
			this._updateScale(scale, degrees + ' &#176;', degrees / maxDegrees);
		}
	}

});

L.control.scale.wcs = function (options) {
	return new L.Control.Scale.WCS(options);
};



/*
# L.Control.Sidebar adds support for responsive side bars 
# Adapted from the leaflet-sidebar plugin by Tobias Bieniek
# (original copyright notice reproduced below).
#
#	This file part of:	VisiOmatic
#	Copyright:		(C) 2015 Emmanuel Bertin - IAP/CNRS/UPMC,
#                        Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 20/11/2015

The MIT License (MIT)

Copyright (c) 2013 Tobias Bieniek

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
L.Control.Sidebar = L.Control.extend({
	includes: L.Mixin.Events,

	options: {
		position: 'left',
		title: 'Toggle advanced menu',
		collapsed: true,
		forceSeparateButton: false
	},

	/**
	 * Create a new sidebar on this jQuery object.
	 *
	 * @constructor
	 * @param {string} id - The id of the sidebar element (without the # character)
	 * @param {Object} [options] - Optional options object
	 * @param {string} [options.position=left] - Position of the sidebar: 'left' or 'right'
	 */
	initialize: function (options) {
		var i, child;

		L.setOptions(this, options);

		// Create sidebar
		this._sidebar = L.DomUtil.create('div', 'leaflet-container sidebar');
		if (this.options.collapsed) {
			L.DomUtil.addClass(this._sidebar, 'collapsed');
		} else {
			L.DomUtil.addClass(this._sidebar, 'closed');
		}
		// Attach .sidebar-left/right class
		L.DomUtil.addClass(this._sidebar, 'sidebar-' + this.options.position);

		// Attach touch styling if necessary
		if (L.Browser.touch) {
			L.DomUtil.addClass(this._sidebar, 'leaflet-touch');
		}

		// Create containers for tabs and their contents (panes)
		this._tabs = L.DomUtil.create('div', 'sidebar-tabs', this._sidebar);
		this._tabitems = [];

		this._container = L.DomUtil.create('div', 'sidebar-content', this._sidebar);
		this._panes = [];
		this._closeButtons = [];
	},

	/**
	 * Add this sidebar to the specified map.
	 *
	 * @param {L.Map} map
	 * @returns {L.Control.Sidebar}
	 */
	addTo: function (map) {
		var className = 'leaflet-control-zoom-sidebar',
				parent = map._controlContainer,
		    buttonContainer;
	
		// Create sidebar
		L.DomUtil.addClass(map._container, 'sidebar-map');
		parent.insertBefore(this._sidebar, parent.firstChild);
		L.DomEvent
				.disableClickPropagation(this._sidebar)
				.disableScrollPropagation(this._sidebar);

		this._map = map;

		// Create sidebar toggle button
		if (map.zoomControl && !this.options.forceSeparateButton) {
			buttonContainer = map.zoomControl._container;
		} else {
			buttonContainer = L.DomUtil.create('div', 'leaflet-bar');
		}
		
		this._toggleButton = this._createButton(this.options.title,
		  className + (this.options.collapsed ? ' collapsed' : ''), buttonContainer);

		return this;
	},

	// Add sidebar tab list
	addTabList: function () {
		this._tablist = L.DomUtil.create('ul', '', this._tabs);
		this._tablist.setAttribute('role', 'tablist');
		return this._tablist;
	},

	// Add sidebar tab
	addTab: function (id, tabClass, title, content, sideClass) {
		var	tablist = this._tablist ? this._tablist : this.addTabList(),
		    item = L.DomUtil.create('li', '', tablist),
		    button = L.DomUtil.create('a', tabClass, item);
		item.setAttribute('role', 'tab');
		item._sidebar = this;
		button.href = '#' + id;
		button.id = id + '-toggle';
		button.title = title;
		L.DomEvent.on(button, 'click', L.DomEvent.preventDefault);
		L.DomEvent.on(button, 'click', this._onClick, item);
		item.sideClass = sideClass;
		this._tabitems.push(item);

		// Sidebar pane
		var	pane = L.DomUtil.create('div', 'sidebar-pane', this._container),
		    header = L.DomUtil.create('h1', 'sidebar-header', pane);

		header.innerHTML = title;

		var closeButton = L.DomUtil.create('div', 'sidebar-close', header);
		this._closeButtons.push(closeButton);
		L.DomEvent.on(closeButton, 'click', this._onCloseClick, this);
		pane.id = id;
		pane.sideClass = sideClass;
		pane.appendChild(content);
		this._panes.push(pane);
		return pane;
	},

	/**
	 * Remove this sidebar from the map.
	 *
	 * @param {L.Map} map
	 * @returns {L.Control.Sidebar}
	 */
	removeFrom: function (map) {
		var i, child;

		this._map = null;

		for (i = this._tabitems.length - 1; i >= 0; i--) {
			child = this._tabitems[i];
			L.DomEvent.off(child.querySelector('a'), 'click', this._onClick);
		}

		for (i = this._closeButtons.length - 1; i >= 0; i--) {
			child = this._closeButtons[i];
			L.DomEvent.off(child, 'click', this._onCloseClick, this);
		}

		return this;
	},

	/**
	 * Open sidebar (if necessary) and show the specified tab.
	 *
	 * @param {string} id - The id of the tab to show (without the # character)
	 */
	open: function (id) {
		var i, child;

		// hide old active contents and show new content
		for (i = this._panes.length - 1; i >= 0; i--) {
			child = this._panes[i];
			if (child.id === id) {
				L.DomUtil.addClass(child, 'active');
				if (child.sideClass) {
					L.DomUtil.addClass(this._sidebar, child.sideClass);
				}
			} else if (L.DomUtil.hasClass(child, 'active')) {
				L.DomUtil.removeClass(child, 'active');
				if (child.sideClass) {
					L.DomUtil.removeClass(this._sidebar, child.sideClass);
				}
			}
		}

		// remove old active highlights and set new highlight
		for (i = this._tabitems.length - 1; i >= 0; i--) {
			child = this._tabitems[i];
			if (child.querySelector('a').hash === '#' + id) {
				L.DomUtil.addClass(child, 'active');
			} else if (L.DomUtil.hasClass(child, 'active')) {
				L.DomUtil.removeClass(child, 'active');
			}
		}

		this.fire('content', {id: id});

		// open sidebar (if necessary)
		if (L.DomUtil.hasClass(this._sidebar, 'closed')) {
			this.fire('opening');
			L.DomUtil.removeClass(this._sidebar, 'closed');
		}

		return this;
	},

	/**
	 * Close the sidebar (if necessary).
	 */
	close: function () {
		// remove old active highlights
		for (var i = this._tabitems.length - 1; i >= 0; i--) {
			var child = this._tabitems[i];
			if (L.DomUtil.hasClass(child, 'active')) {
				L.DomUtil.removeClass(child, 'active');
				if (child.sideClass) {
					L.DomUtil.removeClass(this._sidebar, child.sideClass);
				}
			}
		}

		// close sidebar
		if (!L.DomUtil.hasClass(this._sidebar, 'closed')) {
			this.fire('closing');
			L.DomUtil.addClass(this._sidebar, 'closed');
		}

		return this;
	},

	/**
	 * Collapse/Expanding the sidebar.
	 */
	toggle: function () {
		this.close();
		if (L.DomUtil.hasClass(this._sidebar, 'collapsed')) {
			L.DomUtil.addClass(this._sidebar, 'closed');
			this.fire('expanding');
			L.DomUtil.removeClass(this._sidebar, 'collapsed');
			L.DomUtil.removeClass(this._toggleButton, 'collapsed');
		} else {
			L.DomUtil.removeClass(this._sidebar, 'closed');
			this.fire('collapsing');
			L.DomUtil.addClass(this._sidebar, 'collapsed');
			L.DomUtil.addClass(this._toggleButton, 'collapsed');
		}
	},

	/**
	 * @private
	 */
	_onClick: function () {
		if (L.DomUtil.hasClass(this, 'active')) {
			this._sidebar.close();
		} else if (!L.DomUtil.hasClass(this, 'disabled')) {
			this._sidebar.open(this.querySelector('a').hash.slice(1));
		}
	},

	/**
	 * @private
	 */
	_onCloseClick: function () {
		this.close();
	},

	/**
	 * @private
	 */
	_createButton: function (title, className, container) {
		var link = L.DomUtil.create('a', className, container);
		link.href = '#';
		link.title = title;

		L.DomEvent
			.addListener(link, 'click', L.DomEvent.stopPropagation)
			.addListener(link, 'click', L.DomEvent.preventDefault)
			.addListener(link, 'click', this.toggle, this);

		return link;
	}

});

/**
 * Create a new sidebar on this jQuery object.
 *
 * @example
 * var sidebar = L.control.sidebar('sidebar').addTo(map);
 *
 * @param {string} id - The id of the sidebar element (without the # character)
 * @param {Object} [options] - Optional options object
 * @param {string} [options.position=left] - Position of the sidebar: 'left' or 'right'
 * @returns {L.Control.Sidebar} A new sidebar instance
 */
L.control.sidebar = function (map, options) {
	return new L.Control.Sidebar(map, options);
};


/*
# L.Control.WCS Manage coordinate display and input
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2017 Emmanuel Bertin - IAP/CNRS/UPMC,
#                                Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 30/11/2017
*/
L.Control.WCS = L.Control.extend({
	options: {
		position: 'bottomleft',
		title: 'Center coordinates. Click to change',
		coordinates: [{
			label: 'RA, Dec',
			units: 'HMS',
			nativeCelsys: false
		}],
		centerQueryKey: 'center',
		fovQueryKey: 'fov',
		sesameURL: 'https://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame'
	},

	onAdd: function (map) {
		// Create coordinate input/display box
		var _this = this,
			  className = 'leaflet-control-wcs',
			  dialog = this._wcsdialog =  L.DomUtil.create('div', className + '-dialog'),
			  coordSelect = L.DomUtil.create('select', className + '-select', dialog),
			  choose = document.createElement('option'),
			  coords = this.options.coordinates,
			  opt = [],
			  coordIndex;

		L.DomEvent.disableClickPropagation(coordSelect);
		this._currentCoord = 0;
		coordSelect.id = 'leaflet-coord-select';
		coordSelect.title = 'Switch coordinate system';
		for (var c in coords) {
			opt[c] = document.createElement('option');
			opt[c].text = coords[c].label;
			coordIndex = parseInt(c, 10);
			opt[c].value = coordIndex;
			if (coordIndex === 0) {
				opt[c].selected = true;
			}
			coordSelect.add(opt[c], null);
		}

		L.DomEvent.on(coordSelect, 'change', function (e) {
			_this._currentCoord = coordSelect.value;
			_this._onDrag();
		});

		var	input = this._wcsinput = L.DomUtil.create('input', className + '-input', dialog);

		L.DomEvent.disableClickPropagation(input);
		input.type = 'text';
		input.title = this.options.title;

		// Speech recognition on WebKit engine
		if ('webkitSpeechRecognition' in window) {
			input.setAttribute('x-webkit-speech', 'x-webkit-speech');
		}

		map.on('move zoomend', this._onDrag, this);
		L.DomEvent.on(input, 'focus', function () {
			this.setSelectionRange(0, this.value.length);
		}, input);
		L.DomEvent.on(input, 'change', function () {
			this.panTo(this._wcsinput.value);
		}, this);

		var	clipboardbutton = L.DomUtil.create('div', className + '-clipboard', dialog);
		clipboardbutton.title = 'Copy to clipboard';
		L.DomEvent.on(clipboardbutton, 'click', function () {
			var stateObj = {},
				url = location.href,
				wcs = this._map.options.crs,
				latlng = map.getCenter();
			L.IIPUtils.flashElement(this._wcsinput);
			url = L.IIPUtils.updateURL(url, this.options.centerQueryKey,
			  L.IIPUtils.latLngToHMSDMS(latlng));
			url = L.IIPUtils.updateURL(url, this.options.fovQueryKey,
			  wcs.zoomToFov(map, map.getZoom(), latlng).toPrecision(4));
			history.pushState(stateObj, '', url);
			L.IIPUtils.copyToClipboard(url);
		}, this);

		return this._wcsdialog;
	},

	onRemove: function (map) {
		map.off('drag', this._onDrag);
	},

	_onDrag: function (e) {
		var latlng = this._map.getCenter(),
		    wcs = this._map.options.crs,
				coord = this.options.coordinates[this._currentCoord];

		if (wcs.pixelFlag) {
			this._wcsinput.value = latlng.lng.toFixed(0) + ' , ' + latlng.lat.toFixed(0);
		} else {
			if (!coord.nativeCelsys && wcs.forceNativeCelsys) {
				latlng = wcs.celsysToEq(latlng);
			} else if (coord.nativeCelsys && wcs.forceNativeCelsys === false) {
				latlng = wcs.eqToCelsys(latlng);
			}
			switch (coord.units) {
			case 'HMS':
				this._wcsinput.value = L.IIPUtils.latLngToHMSDMS(latlng);
				break;
			case 'deg':
				this._wcsinput.value = latlng.lng.toFixed(5) + ' , ' + latlng.lat.toFixed(5);
				break;
			default:
				this._wcsinput.value = latlng.lng.toFixed(1) + ' , ' + latlng.lat.toFixed(1);
				break;
			}
		}
	},

	panTo: function (str) {
		var	wcs = this._map.options.crs,
			coord = this.options.coordinates[this._currentCoord],
			latlng = wcs.parseCoords(str);

		if (latlng) {
			if (wcs.pixelFlag) {
				this._map.panTo(latlng);
			} else {
				if (!coord.nativeCelsys && wcs.forceNativeCelsys) {
					latlng = wcs.eqToCelsys(latlng);
				} else if (coord.nativeCelsys && wcs.forceNativeCelsys === false) {
					latlng = wcs.celsysToEq(latlng);
				}
				this._map.panTo(latlng);
			}
		} else {
			// If not, ask Sesame@CDS!
			L.IIPUtils.requestURL(this.options.sesameURL + '/-oI/A?' + str,
			 'getting coordinates for ' + str, this._getCoordinates, this, 10);
		}
	},

	_getCoordinates: function (_this, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var str = httpRequest.responseText,
					latlng = _this._map.options.crs.parseCoords(str);

				if (latlng) {
					_this._map.panTo(latlng);
					_this._onDrag();
				} else {
					alert(str + ': Unknown location');
				}
			} else {
				alert('There was a problem with the request to the Sesame service at CDS');
			}
		}
	}
});

L.Map.mergeOptions({
    positionControl: false
});

L.Map.addInitHook(function () {
    if (this.options.positionControl) {
        this.positionControl = new L.Control.MousePosition();
        this.addControl(this.positionControl);
    }
});

L.control.wcs = function (options) {
    return new L.Control.WCS(options);
};


