/**
 #	This file part of:	VisiOmatic
 * @file Provide an ellipse marker in world coordinates.
 * @requires vector/EllipseMarker.js

 * @copyright (c) 2015-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/
import {
	LatLngBounds,
	Util,
	latLng
} from 'leaflet';

import {EllipseMarker} from './EllipseMarker'


export const Ellipse = EllipseMarker.extend( /** @lends Ellipse */ {

	options: {
		fill: true
	},

	/**
	 * Create a new ellipse marker with a shape that scales with zooming.
	 * @extends EllipseMarker
	 * @memberof module:vector/Ellipse.js
	 * @constructs
	 * @param {leaflet.LatLng} latlng
	   World coordinates of the center of the marker.
	 * @param {object} [options]
	   Options.
	 * @param {boolean} [options.fill=true]
	   Fill the ellipse?

	 * @returns {Ellipse} Instance of an ellipse.
	 */
	initialize: function (latlng, options) {
		Util.setOptions(this, options);

		const	deg = Math.PI / 180.0,
			cpa = Math.cos(this.options.posAngle * deg),
			spa = Math.sin(this.options.posAngle * deg),
			cpa2 = cpa * cpa,
			spa2 = spa * spa,
			a2 = this.options.majAxis * this.options.majAxis,
			b2 = this.options.minAxis * this.options.minAxis;

		this._latlng = latLng(latlng);
		// Compute quadratic forms to be used for coordinate transforms
		this._mLat2 = a2 * cpa2 + b2 * spa2;
		this._mLng2 = a2 * spa2 + b2 * cpa2;
		this._mLatLng = (a2 - b2) * cpa * spa;
	},

	/**
	 * Get the bounds of the ellipse in world coordinates.
	 * @returns {leaflet.LatLngBounds} Boundary box in world coordinates.
	 */
	getBounds: function () {
		const	half = [this._limX, this._limY];

		return new LatLngBounds(
			this._map.layerPointToLatLng(this._point.subtract(half)),
			this._map.layerPointToLatLng(this._point.add(half)));
	},

	/**
	 * Project the marker to pixel coordinates.
	 * @private
	 * @override
	 */
	_project: function () {
		const	map = this._map,
			crs = map.options.crs;

		this._point = map.latLngToLayerPoint(this._latlng);
		if (!this._majAxis1) {
			const	lng = this._latlng.lng,
				lat = this._latlng.lat,
				deg = Math.PI / 180.0,
				clat = Math.cos(lat * deg),
				dl = lat < 90.0 ? 0.001 : -0.001,
				point = crs.project(this._latlng),
			    dpointdlat = crs.project(latLng(lat + dl, lng)).subtract(point),
			    dpointdlng = crs.project(
					latLng(
						lat,
						lng + dl * 1.0 /
						(clat > dl ? clat : dl)
					)
				).subtract(point),
				c11 = dpointdlat.x / dl,
				c12 = dpointdlng.x / dl,
				c21 = dpointdlat.y / dl,
				c22 = dpointdlng.y / dl;
			let	mx2 = c11 * c11 * this._mLat2 + c12 * c12 * this._mLng2 +
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

		const	scale = crs.scale(map._zoom),
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

/**
 * Instantiate an ellipse marker with a shape that scales with zooming.
 *
 * @function
 * @param {leaflet.LatLng} latlng
   World coordinates of the center of the marker.
 * @param {object} [options]
   Options: see {@link Ellipse}.
 * @returns {Ellipse} Instance of an ellipse marker.

 * @example
   ...
   const marker = ellipse(latLng(30.0, 24.0), {
				majAxis: 4.3,
				minAxis: 2.1,
				posAngle: 47.3
	});
 */
export const ellipse = function (latlng, options) {
	return new Ellipse(latlng, options);
};

