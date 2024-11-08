/**
 #	This file part of:	VisiOmatic
 * @file Celestial system conversions for sky coordinates.
 
 * @copyright (c) 2014-2024 CFHT/CNRS/CEA/AIM/UParisSaclay
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
 */
import {Class, latLng} from 'leaflet';

export const CelSys = Class.extend( /** @lends CelSys */ {
	options: {
		code: 'equatorial'
	},

	/**
	 * Instantiate a celestial system.
	 *
	 * @extends leaflet.Class
	 * @memberof module:catalog/Catalog.js
	 * @constructs
	 * @param {'galactic'|'ecliptic'|'supergalactic'} [code='equatorial']
	   Celestial system.

	 * @returns {CelSys} Instance of a celestial system.
	 */
	initialize: function (code) {
		this._celsysmat = this._celsysmatInit(code)
	},

	/**
	 * Convert celestial (angular) coordinates to equatorial.
	 * @param {leaflet.LagLng} latlng
	   Celestial coordinates (e.g., ecliptic latitude and longitude).
	 * @returns {leaflet.LatLng}
	   Equatorial coordinates.
	 */
	ToEq: function (latlng) {
		const	cmat = this._celsysmat,
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
	fromEq: function (latlng) {
		const	cmat = this._celsysmat,
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
	 * Return the transformation matrix between celestial coordinates for the
	 * given system and equatorial coordinates.
	 * @private
	 * @param {'galactic'|'ecliptic'|'supergalactic'} celsys
	   Type of celestial system.
	 * @returns {number[][]}
	   Transformation matrix.
	 */
	_celsysmatInit: function (celsys) {
		const	deg = Math.PI / 180.0,
			cmat = [];
		var	corig, cpole;

		switch (celsys) {
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
	}
});

