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
	   Private properties are set by methods. Other private properties
	   may be added by subclass methods.
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
	 * @property {number[]} natpole
	   Latitude and longitude of the native pole.
	 * @property {number[][]} pv
	   Projection distortion terms on each axis (`PVi_j` FITS keyword values).
	 * @property {number} npv
	   Number of non-zero
	 * @property {number[]} jd
	   Julian Date for start and end of observation.
	 * @property {number[]} obslatlng
	   Latitude and longitude of observatory.
	 * @property {number[][]} dataslice
	   Start index, end index, and direction (+1 only) of the used section of
	   the image data for each axis. The range notation follows the FITS
	   convention (start at index 1 and include the end index).
	 * @property {number[][]} detslice
	   Start index, end index, and direction (+1 or -1) of the used section of
	   the detector in the merged image for each axis. The range notation
	   follows the FITS convention (start at index 1 and include the end index).
	 * @property {boolean} nativeCelSys
	   Return world coordinates in their native celestial system?
	 * @property {number[][]} _cdinv
	   Jacobian matrix of the projection (inverse of the `CD` matrix).
	 * @property {number[]} _natrval
	   Native latitude and longitude of the projection center.
	 * @property {boolean} _pixelFlag
	   True for a Cartesian projection.
	 * @property {'equatorial'|'galactic'|'ecliptic'|'supergalactic'} _celsyscode
	   Type of celestial system.
	 * @property {number[][]} _celsysmat
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
		crval: [0., 0.],							// (\delta_0, \alpha_0)
		cd: [[1., 0.], [0., 1.]],
		natpole: [90., 999.],						// (\theta_p, \phi_p)
		pv: [[0., 0., 0., 0., 0., 0., 0., 0., 0., 0.,
		      0., 0., 0., 0., 0., 0., 0., 0., 0., 0.],
		     [0., 0., 0., 0., 0., 0., 0., 0., 0., 0.,
		      0., 0., 0., 0., 0., 0., 0., 0., 0., 0.]],
		npv: 0,
		jd: [0., 0.],
		obslatlng: [0., 0.]
	},

	/**
	 * Base class for the WCS (World Coordinate System) projections used in
	   astronomy.
	 *
	 * @extends leaflet.Projection
	 * @memberof module:crs/Projection.js
	 * @constructs
	 * @param {object} header - JSON representation of the image header.
	 * @param {projParam} [options] - Projection options.

	 * @returns {Projection} Instance of a projection.
	 */
	initialize: function (header, options) {
		this._paramUpdate(this.defaultProjParam);
		this.options = options;
		this._readWCS(header);

		// Override selected WCS parameters with options
		// (including data slicing)
		if (options) {
			this._paramUpdate(options);
		}

		this._projInit();
		projparam = this.projparam;
		if (!projparam._pixelFlag) {
			// Identify the native celestial coordinate system
			switch (projparam.ctype.x.substr(0, 1)) {
			case 'G':
				projparam._celsyscode = 'galactic';
				break;
			case 'E':
				projparam._celsyscode = 'ecliptic';
				break;
			case 'S':
				projparam._celsyscode = 'supergalactic';
				break;
			default:
				projparam._celsyscode = 'equatorial';
				break;
			}
			// true if world coordinates are equatorial.
			this.equatorialFlag = !projparam.nativeCelSys ||
				projparam._celsyscode == 'equatorial';
			// true if a celestial system transformation is required.
			this.celSysConvFlag = !projparam.nativeCelSys &&
				projparam._celsyscode !== 'equatorial';
			if (this.celSysConvFlag) {
				projparam._celsysmat = this._celsysmatInit(this.celsyscode);
			}
		}
	},

	/**
	 * Update internal projection parameters from external properties.
	 * The internal projection parameter object is initialized if it does not
	 * exist.
	 * @private
	 * @param {projParam} paramSrc
	   Input projection parameters.
	 */
	_paramUpdate: function (paramsrc) {

		if (!this.projparam) {
			this.projparam = {};
		}

		projparam = this.projparam;

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
		if (paramsrc.natpole) {
			projparam.natpole = latLng(paramsrc.natpole);
		}
		if (paramsrc.pv) {
			// Still incomplete
			projparam.pv = [];
			projparam.pv[0] = paramsrc.pv[0].slice();
			projparam.pv[1] = paramsrc.pv[1].slice();
		}
		if (paramsrc.npv) {
			projparam.npv = point(paramsrc.npv);
		}
		if (paramsrc.jd) {
			projparam.jd = [paramsrc.jd[0], paramsrc.jd[1]];
		}
		if (paramsrc.obslatlng) {
			projparam.obslatlng = [
				paramsrc.obslatlng[0], paramsrc.obslatlng[1]
			];
		}

		if (paramsrc.dataslice && paramsrc.detslice) {
			projparam.dataslice = paramsrc.dataslice;
			projparam.detslice = paramsrc.detslice;
			//this._shiftWCS(projparam);
		}
	},

	/**
	 * Update internal projection parameters from an image header.
	 * @private
	 * @param {object} header - JSON representation of the image header.
	 */
	_readWCS: function (header) {
		const	projparam = this.projparam;
		let	npv = -1;
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
		// Check PV keyword values
		for (var d = 0; d < 2; d++) {
			var	pv = projparam.pv[d];
			for (var j = 0; j < 40; j++) {
				if ((v = header['PV' + (d + 1) + '_' + j])) {
					pv[j] = v;
					npv = j > npv? j : npv;
				}
			}
		}
		// Max number of PV terms involved (for any dimension)
		projparam.npv = npv + 1;

		// Time parameters
		// Julian Date/Time at start of observing
		if ((v = header['MJD-OBS']) || (v = header['MJDSTART'])) {
			projparam.jd[0] = v + 2400000.5;
		} else if ((v = header['DATE-OBS'])) {
			// Decode DATE-OBS format: DD/MM/YY or YYYY-MM-DD
			projparam.jd[0] = new Date(v).getTime() / 86400000. + 2440587.5;
		}
		if ((v = header['MJDEND'])) {
			projparam.jd[1] = v + 2400000.5;
		} else if ((v = header['EXPTIME'])) {
			// Add exposure time to compute end JD
			projparam.jd[1] = projparam.jd[0] + v / 86400.
		}

		// Observer's location
		if ((v = header['LONGITUD'])) { projparam.obslatlng[1] = v; }
		if ((v = header['LATITUDE'])) { projparam.obslatlng[0] = v; }
	},

	/**
	 * Correct projection parameters for data slicing.
	 * @private
	 * @param {projParam} projparam
	   Projection parameters.
	 */
	_shiftWCS: function (projparam) {
		const	crpix = projparam.crpix,
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

	/**
	 * Return the transformation matrix between celestial coordinates for the
	 * given system and equatorial coordinates.
	 * @private
	 * @param {'galactic'|'ecliptic'|'supergalactic'} celsyscode
	   Type of celestial system.
	 * @returns {number[][]}
	   Transformation matrix.
	 */
	_celsysmatInit: function (celsyscode) {
		const	deg = Math.PI / 180.0,
			cmat = [];
		var	corig, cpole;

		switch (celsyscode) {
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
		cmat[1] = Math.asin(Math.cos(corig.lat * deg) *
			Math.sin((cpole.lng - corig.lng) * deg));
		cmat[2] = Math.cos(cpole.lat * deg);
		cmat[3] = Math.sin(cpole.lat * deg);

		return cmat;
	},

	/**
	 * Project world coordinates to pixel (image) coordinates.
	 * @param {leaflet.LatLng} latlng
	   World coordinates.
	 * @returns {leaflet.Point}
	   Pixel (image) coordinates.
	 */
	project: function (latlng) {
		const	phiTheta = this._raDecToPhiTheta(
			this.celSysConvFlag ? this.eqToCelSys(latlng) : latlng
		);
		phiTheta.lat = this._thetaToR(phiTheta.lat);
		return this._redToPix(this._phiRToRed(phiTheta));
	},

	/**
	 * De-project pixel (image) coordinates to world coordinates.
	 * @param {leaflet.Point} pnt
	   Pixel coordinates.
	 * @returns {leaflet.LatLng}
	   World coordinates.
	 */
	unproject: function (pnt) {
		const	phiTheta = this._redToPhiR(this._pixToRed(pnt));
		phiTheta.lat = this._rToTheta(phiTheta.lat);

		const	latlng = this._phiThetaToRADec(phiTheta);
		if (latlng.lng < -180.0) {
			latlng.lng += 360.0;
		}
		return this.celSysConvFlag ? this.celSysToEq(latlng) : latlng;
	},

	/**
	 * Convert celestial (angular) coordinates to equatorial.
	 * @param {leaflet.LagLng} latlng
	   Celestial coordinates (e.g., ecliptic latitude and longitude).
	 * @returns {leaflet.LatLng}
	   Equatorial coordinates.
	 */
	celSysToEq: function (latlng) {
		const	cmat = this.projparam._celsysmat,
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

	/**
	 * Convert equatorial coordinates to another celestial system.
	 * @param {leaflet.LagLng} latlng
	   Equatorial coordinates.
	 * @returns {leaflet.LatLng}
	   Celestial coordinates (e.g., ecliptic latitude and longitude).
	 */
	eqToCelSys: function (latlng) {
		const	cmat = this.projparam._celsysmat,
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

	/**
	 * Compute the pixel coordinates of the geometric image center.
	 * @private
	 * @param {Projection} proj
	   Projection for pixel coordinates.
	 * @returns {leaflet.Point}
	   Pixel coordinates of the image center.
	 */
	_getCenter(proj) {
		const	projparam = this.projparam,
			detslice = projparam.detslice;
		return detslice?
			(point(detslice[0][0], detslice[1][0])._add(
				point(detslice[0][1], detslice[1][1])))._divideBy(2.0) :
			point(
				(projparam.naxis.x + 1.0) / 2.0,
				(projparam.naxis.y + 1.0) / 2.0
			);
	},

	/**
	 * Set up the native pole coordinates of the projection (theta_p, phi_p).
	 * @private
	 * @returns {leaflet.LatLng}
	   Latitude and longitude of the pole.
	 */
	_natpole: function () {
		const	deg = Math.PI / 180.0,
			projparam = this.projparam,
			natpole = latLng(90.0, 180.0);

		// Special case of fiducial point lying at the native pole
		if (projparam._natrval.lat === 90.0) {
			if (projparam.natpole.lng === 999.0) {
				natpole.lng = 180.0;
			}
			natpole.lat = projparam.crval.lat;
		} else if (projparam.natpole.lng === 999.0) {
			natpole.lng = (projparam.crval.lat < projparam._natrval.lat) ?
				180.0 : 0.0;
		}

		return natpole;
	},

	/**
	 * Set up the celestial pole coordinates of the projection
	   (delta_p, alpha_p). projection._natpole() should be called first.
	 * @private
	 * @returns {leaflet.LatLng}
	   Celestial coordinates of the pole.
	 */
	_cpole: function () {
		const	deg = Math.PI / 180.0,
			projparam = this.projparam,
			dphip = projparam._natpole.lng - projparam._natrval.lng,
			cdphip = Math.cos(dphip * deg),
			sdphip = Math.sin(dphip * deg),
			ct0 = Math.cos(projparam._natrval.lat * deg),
			st0 = Math.sin(projparam._natrval.lat * deg),
			cd0 = Math.cos(projparam.crval.lat * deg),
			sd0 = Math.sin(projparam.crval.lat * deg),
			ddeltap = Math.acos(sd0 / Math.sqrt(1.0 - ct0 * ct0 *
				sdphip * sdphip)) / deg;
		let	deltap = Math.atan2(st0, ct0 * cdphip) / deg,
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
			deltap = (Math.abs(deltap1 - projparam._natpole.lat) <
			   Math.abs(deltap2 - projparam._natpole.lat)) ? deltap1 : deltap2;
		}
		const	alphap = Math.abs(projparam.crval.lat) === 90.0 ?
			projparam.crval.lng : (deltap === 90.0 ? projparam.crval.lng +
				projparam._natpole.lng - projparam._natrval.lng - 180.0
				: (deltap === -90.0 ? projparam.crval.lng -
					projparam._natpole.lng + projparam._natrval.lng
					: projparam.crval.lng - Math.atan2(sdphip * ct0 / cd0,
						(st0 - Math.sin(deltap * deg) * sd0) /
							(Math.cos(deltap * deg) * cd0)) / deg));
		return latLng(deltap, alphap);
	},

	/**
	 * Convert native coordinates to celestial coordinates.
	 * @private
	 * @param {leaflet.LagLng} latlng
	   Native coordinates.
	 * @returns {leaflet.LatLng}
	   Celestial coordinates.
	 */
	_phiThetaToRADec: function (phiTheta) {
		const	projparam = this.projparam,
			deg = Math.PI / 180.0,
			rad = 180.0 / Math.PI,
			t = phiTheta.lat * deg,
			ct = Math.cos(t),
			st = Math.sin(t),
			dp = projparam._cpole.lat * deg,
			cdp = Math.cos(dp),
			sdp = Math.sin(dp),
			dphi = (phiTheta.lng - projparam._natpole.lng) * deg,
			cdphi = Math.cos(dphi);
		let	asinarg = st * sdp + ct * cdp * cdphi;

		if (asinarg > 1.0) {
			asinarg = 1.0;
		} else if (asinarg < -1.0) {
			asinarg = -1.0;
		}
		return latLng(Math.asin(asinarg) * rad,
		 projparam._cpole.lng + Math.atan2(- ct * Math.sin(dphi),
		  st * cdp  - ct * sdp * cdphi) * rad);
	},

	/**
	 * Convert celestial coordinates to native coordinates.
	 * @private
	 * @param {leaflet.LagLng} latlng
	   Celestial coordinates.
	 * @returns {leaflet.LatLng}
	   Native coordinates.
	 */
	_raDecToPhiTheta: function (raDec) {
		const	projparam = this.projparam,
			deg = Math.PI / 180.0,
			rad = 180.0 / Math.PI,
			da = (raDec.lng - projparam._cpole.lng) * deg,
			cda = Math.cos(da),
			sda = Math.sin(da),
			d = raDec.lat * deg,
			cd = Math.cos(d),
			sd = Math.sin(d),
			dp = projparam._cpole.lat * deg,
			cdp = Math.cos(dp),
			sdp = Math.sin(dp),
			asinarg = sd * sdp + cd * cdp * cda,
			phitheta = latLng(Math.asin(asinarg > 1.0 ? 1.0
				: (asinarg < -1.0 ? -1.0 : asinarg)) * rad,
			projparam._natpole.lng + Math.atan2(- cd * sda,
		         sd * cdp  - cd * sdp * cda) * rad);

		if (phitheta.lng > 180.0) {
			phitheta.lng -= 360.0;
		} else if (phitheta.lng < -180.0) {
			phitheta.lng += 360.0;
		}
		return phitheta;
	},

	/**
	 * Convert pixel coordinates to reduced coordinates.
	 * @private
	 * @param {leaflet.Point} pix
	   Pixel coordinates.
	 * @returns {leaflet.Point}
	   Reduced coordinates.
	 */
	_pixToRed: function (pix) {
		const	projparam = this.projparam,
		    cd = projparam.cd,
		    red = pix.subtract(projparam.crpix);
		return point(red.x * cd[0][0] + red.y * cd[0][1],
			red.x * cd[1][0] + red.y * cd[1][1]);
	},

	/**
	 * Convert reduced coordinates to pixel coordinates.
	 * @private
	 * @param {leaflet.Point} red
	   Reduced coordinates.
	 * @returns {leaflet.Point}
	   Pixel coordinates.
	 */
	_redToPix: function (red) {
		const projparam = this.projparam,
		    cdinv = projparam._cdinv;
		return point(red.x * cdinv[0][0] + red.y * cdinv[0][1],
		 red.x * cdinv[1][0] + red.y * cdinv[1][1]).add(projparam.crpix);
	},

	/**
	 * Convert pixel coordinates to sliced (merged) coordinates.
	 * @private
	 * @param {leaflet.Point} pnt
	   Pixel coordinates.
	 * @returns {leaflet.Point}
	   Sliced (merged) coordinates.
	 */
	_pixToMulti: function (pnt) {
		const	dataslice = this.projparam.dataslice,
			detslice = this.projparam.detslice;
		return point([
			(pnt.x - dataslice[0][0]) * detslice[0][2] + detslice[0][0],
			(pnt.y - dataslice[1][0]) * detslice[0][2] + detslice[1][0],
		]);
	},


	/**
	 * Convert sliced (merged) coordinates to pixel coordinates.
	 * @private
	 * @param {leaflet.Point} pnt
	   Sliced (merged) coordinates.
	 * @returns {leaflet.Point}
	   Pixel coordinates.
	 */
	_multiToPix: function (pnt) {
		const	dataslice = this.projparam.dataslice,
			detslice = this.projparam.detslice;

		return point([
			(pnt.x - detslice[0][0]) / detslice[0][2] + dataslice[0][0],
			(pnt.y - detslice[1][0]) / detslice[0][2] + dataslice[1][0],
		]);
	},


	/**
	 * Invert the `CD` Jacobian matrix of the linear part of the de-projection.
	 * @private
	 * @param {number[][]} cd
	   `CD` Jacobian matrix.
	 * @returns {number[][]}
	   Matrix inverse.
	 */
	_invertCD: function (cd) {
		const	detinv = 1.0 / (cd[0][0] * cd[1][1] - cd[0][1] * cd[1][0]);
		return [[cd[1][1] * detinv, -cd[0][1] * detinv],
		 [-cd[1][0] * detinv, cd[0][0] * detinv]];
	},

	/**
	 * Invert the `PV` distortion polynomial of the de-projection.
	 *
	 * Currently valid only for small distortions.
	 * @private
	 * @param {number[][]} pv
	   `PV` array of polynomial coefficients.
	 * @param {number} npv
	   Number of non-zero polynomial coefficients.
	 * @returns {number[][]}
	   array of coefficients from the pseudo inverse polynomial.
	 */
	_invertPV: function (pv, npv) {
		return pv;
	}
});


