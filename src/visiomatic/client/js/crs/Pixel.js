/**
 #	This file part of:	VisiOmatic
 * @file Pixel (de-)projections.
 * @requires util/VUtil.js
 * @requires crs/Projection.js

 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
 */
import {bounds, latLng, point} from 'leaflet';

import {Projection} from './Projection';


export const Pixel = Projection.extend( /** @lends PIX */ {
	code: 'PIX',

	/**
	 * Pixel (identity) projection.
	 *
	 * @name PIX
	 * @extends Projection
	 * @memberof module:crs/Pixel.js
	 * @constructs
	 * @param {object} header
	   JSON representation of the image header.
	 * @param {projParam} [options]
	   Projection options: see {@link Projection}.

	 * @returns {PIX} Instance of a PIX projection.
	 */
	// Initialize() is inherited from the parent class

	/**
	 * Initialize a pixel (identity) projection.
	 * @method
	 * @static
	 * @private
	 */
	_projInit: function () {
		const	projparam = this.projparam;

		// Center on image
		if (!options.crval) {
			projparam.crval = latLng(
				(projparam.naxis.y + 1.0) / 2.0,
				(projparam.naxis.x + 1.0) / 2.0
			);
		}
		projparam._cdinv = this._invertCD(projparam.cd);
		projparam._cpole = projparam.crval;
		this.bounds = bounds(
			[0.5, this.projparam.naxis.y - 0.5],
			[this.projparam.naxis.x - 0.5, 0.5]
		);
		projparam._pixelFlag = true;
		projparam._infinite = false;
	},

	/**
	 * Project "world" pixel coordinates to (image) pixel coordinates
	   (identity).
	 * @method
	 * @static
	 * @override
	 * @param {leaflet.LatLng} latlng
	   "World" pixel coordinates.
	 * @returns {leaflet.Point}
	   Pixel (image) coordinates.
	 */
	project: function (latlng) {
		return point(latlng.lng, latlng.lat);
	},

	/**
	 * De-project (image) pixel coordinates to "world" pixel coordinates
	   (identity).
	 * @method
	 * @static
	 * @override
	 * @param {leaflet.Point} pnt
	   Pixel (image) coordinates.
	 * @returns {leaflet.LatLng}
	   "World" pixel coordinates.
	 */
	unproject: function (point) {
		return latLng(point.y, point.x);
	}
});

