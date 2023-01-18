/**
 #	This file part of:	VisiOmatic
 * @file Common WCS (World Coordinate System) (de-)projection assets.
 * @requires util/VUtil.js

 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
 */
 import {
	Class,
	bounds,
	latLng,
	point
} from 'leaflet';

import {VUtil} from '../util';


export const Projection = Class.extend( /** @lends Projection */ {

	bounds: bounds([-0.5, -0.5], [0.5, 0.5]),

	/**
	 * Projection parameters. The ordering of array elements follows
	   the Leaflet convention: latitude comes first in [latitude,longitude]
	   pairs, while x comes first in Cartesian coordinates. However the center
	   of the first pixel in the array has image coordinates [1.0, 1.0],
	   conforming to the FITS convention.
	 * @see {@link https://www.atnf.csiro.au/people/mcalabre/WCS/ccs.pdf}
	 * @typedef projParam
	 * @property {string} name
	   Extension name.
	 * @property {{x: string, y: string}} ctype
 	   Projection coordinate types (`CTYPEi` FITS keyword values).
	 * @property {number[]} naxis
	   Image shape (`NAXISi` FITS keyword values)
	 * @property {number[]} crpix (`CRPIXi` FITS keyword values).
	   Image coordinates of the projection center.
	 * @property {number[]} crval
	   Celestial latitude and longitude of the projection center. (`CRVALi` FITS
	   keyword values).
	 * @property {number[][]} cd
	   Jacobian matrix of the deprojection (`CDi_j` FITS keyword values).
	 * @property {number[][]} cdinv
	   Jacobian matrix of the projection (inverse of the `CD` matrix).
	 * @property {number[]} natrval
	   Native latitude and longitude of the projection center.
	 * @property {number[]} natpole
	   Latitude and longitude of the native pole.
	 * @property {number[][]} pv
	   Projection distortion terms on each axis (`PVi_j` FITS keyword values).
	 * @property {number[][]} dataslice
	   Start index, end index, and direction (+1 only) of the used section of
	   the image data for each axis. The range notation follows the FITS
	   convention (start at index 1 and include the end index).
	 * @property {number[][]} detslice
	   Start index, end index, and direction (+1 or -1) of the used section of
	   the detector in the merged image for each axis. The range notation
	   follows the FITS convention (start at index 1 and include the end index).
	 * @property {boolean} pixelFlag
	   True for a Cartesian projection.
	 * @property {'equatorial'|'galactic'|'ecliptic'|'supergalactic'} celsyscode
	   Type of celestial system.
	 * @property {number[][]} celsysmat
	   Celestial system transformation matrix
	 */

	/**
	 * Default WCS projection parameters.
	 * @type {projParam}
	 * @static
	 */
	defaultProjParam: {
		name: '',
		ctype: {x: 'PIXEL', y: 'PIXEL'},
		naxis: [256, 256],
		crpix: [129, 129],
		crval: [0.0, 0.0],							// (\delta_0, \alpha_0)
		//	cpole: (equal to crval by default)		// (\delta_p, \alpha_p)
		cd: [[1.0, 0.0], [0.0, 1.0]],
		natrval: [90.0, 0.0],						// (\theta_0. \phi_0)
		natpole: [90.0, 999.0],						// (\theta_p, \phi_p)
		pv: [[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
		     [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]]
	},

	options: {
		// If true, world coordinates are returned
		// in the native celestial system
		nativeCelsys: false,
		dataslice: undefined,
		detslice: undefined
	},
	/**
	 * Base class for the WCS (World Coordinate System) projections used in
	   astronomy.
	 *
	 * @extends leaflet.Projection
	 * @memberof module:crs/Projection.js
	 * @constructs
	 * @param {object} header - JSON representation of the image header.
	 * @param {object} [options] - Options.

	 * @param {number} [options.nativeCelsys=false]
	   Return world coordinates in their native celestial system?

	 * @param {number[][]} [options.dataslice=undefined]
	   Start index, end index, and direction (+1 only) of the used section of
	   the image data for each axis. The range notation follows the FITS
	   convention (start at index 1 and include the end index).

	 * @param {number[][]} [options.detslice=undefined]
	   Start index, end index, and direction (+1 or -1) of the used section of
	   the detector in the merged image for each axis. The range notation
	   follows the FITS convention (start at index 1 and include the end index).


	 * @returns {Projection} Instance of a projection.
	 */
	initialize: function (header, options) {
		const	projparam = this._paramUpdate(this.defaultProjParam);

		this.options = options;

		this._readWCS(header);
		// Override selected WCS parameters with options
		if (options) {
			if (options.dataslice && options.detslice) {
				projparam.dataslice = options.dataslice;
				projparam.detslice = options.detslice;
				this._shiftWCS();
			}
			this._paramUpdate(options);
		}
		this._projInit();
		if (!projparam.pixelFlag) {
			// Identify the native celestial coordinate system
			switch (projparam.ctype.x.substr(0, 1)) {
			case 'G':
				projparam.celsyscode = 'galactic';
				break;
			case 'E':
				projparam.celsyscode = 'ecliptic';
				break;
			case 'S':
				projparam.celsyscode = 'supergalactic';
				break;
			default:
				projparam.celsyscode = 'equatorial';
				break;
			}

			if (projparam.celsyscode !== 'equatorial') {
				projparam.celsysmat = this._celsysmatInit(this.celsyscode);
				projection.celsysToEq = this.celsysToEq;
				projection.eqToCelsys = this.eqToCelsys;
				this.forceNativeCelsys = (this.options.nativeCelsys === true);
				projection.celsysflag = !this.forceNativeCelsys;
			}
		}

	},

	// Initialize WCS parameters
	/**
	 * Initialize WCS parameters.
	 * @method
	 * @static
	 * @param {projParam} paramSrc
	   Input layer coordinates at the given zoom level.
	 * @param {number} zoom
	   Zoom level.
	 * @returns {leaflet.LatLng}
	   De-projected world coordinates.
	 */
	_paramUpdate: function (paramsrc) {
		let	projparam = {};

		if (!this.projparam) {
			this.projparam = {};
			projparam = this.projparam;
		}
		if (paramsrc.ctype) {
			projparam.ctype = {x: paramsrc.ctype.x, y: paramsrc.ctype.y};
		}
		if (paramsrc.naxis) {
			projparam.naxis = point(paramsrc.naxis);
		}
		if (paramsrc.crval) {
			projparam.crval = projparam.cpole = latLng(paramsrc.crval);
		}
		if (paramsrc.crpix) {
			projparam.crpix = point(paramsrc.crpix);
		}
		if (paramsrc.cd) {
			projparam.cd = [[paramsrc.cd[0][0], paramsrc.cd[0][1]],
		           [paramsrc.cd[1][0], paramsrc.cd[1][1]]];
		}
		if (paramsrc.natrval) {
			projparam.natrval = latLng(paramsrc.natrval);
		}
		if (paramsrc.natpole) {
			projparam.natpole = latLng(paramsrc.natpole);
		}
		if (paramsrc.pv) {
			// Still incomplete
			projparam.pv = [];
			projparam.pv[0] = paramsrc.pv[0].slice();
			projparam.pv[1] = paramsrc.pv[1].slice();
		}
		return projparam;
	},

	// Read WCS information from a FITS header
	_readWCS: function (header) {
		const	projparam = this.projparam;
		var	v;

		this.name = projparam.name;
		if ((v = header['EXTNAME'])) { this.name = v; }
		if ((v = header['CTYPE1'])) { projparam.ctype.x = v; }
		if ((v = header['CTYPE2'])) { projparam.ctype.y = v; }
		if ((v = header['NAXIS1'])) { projparam.naxis.x = v; }
		if ((v = header['NAXIS2'])) { projparam.naxis.y = v; }
		if ((v = header['CRPIX1'])) { projparam.crpix.x = v; }
		if ((v = header['CRPIX2'])) { projparam.crpix.y = v; }
		if ((v = header['CRVAL1'])) { projparam.crval.lng = v; }
		if ((v = header['CRVAL2'])) { projparam.crval.lat = v; }
		if ((v = header['LONPOLE'])) { projparam.natpole.lng = v; }
		if ((v = header['LATPOLE'])) { projparam.natpole.lat = v; }
		if ((v = header['CD1_1'])) { projparam.cd[0][0] = v; }
		if ((v = header['CD1_2'])) { projparam.cd[0][1] = v; }
		if ((v = header['CD2_1'])) { projparam.cd[1][0] = v; }
		if ((v = header['CD2_2'])) { projparam.cd[1][1] = v; }
		for (var d = 0; d < 2; d++) {
			for (var j = 0; j < 20; j++) {
				if ((v = header['PV' + (d + 1) + '_' + j])) {
					projparam.pv[d][j] = v;
				}
			}
		}
	},

	_shiftWCS: function (dataslice, detslice) {
		var projparam = this.projparam,
			crpix = projparam.crpix,
			cd = projparam.cd,
			dataslice = projparam.dataslice,
			detslice = projparam.detslice;

		crpix.x = detslice[0][0] + detslice[0][2] * (crpix.x - dataslice[0][0]);
		crpix.y = detslice[1][0] + detslice[1][2] * (crpix.y - dataslice[1][0]);
		cd[0][0] *= detslice[0][2];
		cd[0][1] *= detslice[1][2];
		cd[1][0] *= detslice[0][2];
		cd[1][1] *= detslice[1][2];
	},

	// Generate a celestial coordinate system transformation matrix
	_celsysmatInit: function (celcode) {
		var deg = Math.PI / 180.0,
			corig, cpole,
			cmat = [];
		switch (celcode) {
		case 'galactic':
			corig = latLng(-28.93617242, 266.40499625);
			cpole = latLng(27.12825120, 192.85948123);
			break;
		case 'ecliptic':
			corig = latLng(0.0, 0.0);
			cpole = latLng(66.99111111, 273.85261111);
			break;
		case 'supergalactic':
			corig = latLng(59.52315, 42.29235);
			cpole = latLng(15.70480, 283.7514);
			break;
		default:
			corig = latLng(0.0, 0.0);
			cpole = latLng(0.0, 0.0);
			break;
		}
		cmat[0] = cpole.lng * deg;
		cmat[1] = Math.asin(Math.cos(corig.lat * deg) * Math.sin((cpole.lng - corig.lng) * deg));
		cmat[2] = Math.cos(cpole.lat * deg);
		cmat[3] = Math.sin(cpole.lat * deg);

		return cmat;
	},

	// LatLng [deg] -> Point
	project: function (latlng) {
		var phiTheta = this._raDecToPhiTheta(this.celsysflag ?
			this.eqToCelsys(latlng) : latlng);
		phiTheta.lat = this._thetaToR(phiTheta.lat);
		return this._redToPix(this._phiRToRed(phiTheta));
	},

	// Point -> LatLng [deg]
	unproject: function (pnt) {
		var  phiTheta = this._redToPhiR(this._pixToRed(pnt));
		phiTheta.lat = this._rToTheta(phiTheta.lat);
		var latlng = this._phiThetaToRADec(phiTheta);
		if (latlng.lng < -180.0) {
			latlng.lng += 360.0;
		}
		return this.celsysflag ? this.celsysToEq(latlng) : latlng;
	},

	_getCenter(projection) {
		const	projparam = this.projparam,
			detslice = projparam.detslice;
		this.centerPnt = projection.project(
			this.unproject(point(detslice[0][0], detslice[1][0]))
		)._add(projection.project(
			this.unproject(point(detslice[0][1], detslice[1][1]))))
			._divideBy(2.0);
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
		return latLng(deltap, alphap);
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

