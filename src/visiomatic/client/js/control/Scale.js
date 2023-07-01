/**
 #	This file part of:	VisiOmatic
 * @file Add world, pixel and custom units to the standard Control.Scale.

 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/
import {Control, DomUtil, Util} from 'leaflet';


export const Scale = Control.Scale.extend( /** @lends Scale */ {
	options: {
		title: 'Scale',
		position: 'bottomleft',
		maxWidth: 128,
		metric: false,
		imperial: false,
		degrees: true,
		pixels: false,
		custom: false,
		customScale: 1.0,
		customUnits: '',
		planetRadius: 6378137.0,
		updateWhenIdle: false
	},

	/**
	 * Create a new scale bar.

	 * @extends leaflet.Control.Scale
	 * @memberof module:control/Scale.js
	 * @constructs
	 * @override
	 * @param {object} [options] - Options.

	 * @param {string} [options.title='Scale']
	   Title of the control.

	 * @param {'bottomleft'|'bottomright'|'topleft'|'topright'} [options.position='topright']
	   Position of the scale bar.

	 * @param {number} [options.maxWidth=128]
	   Maximum length of the scale bar.

	 * @param {boolean} [options.metric=false]
	   Show metric scale?

	 * @param {string} [options.metricTitle]
	   Title of the control in metric mode. Defaults to global title.

	 * @param {boolean} [options.imperial=false]
	   Show imperial scale?

	 * @param {string} [options.imperialTitle]
	   Title of the control in imperial mode. Defaults to global title.

	 * @param {boolean} [options.degrees=true]
	   Show scale in degrees/arcminutes/arcseconds?

	 * @param {string} [options.degreesTitle]
	   Title of the control in degrees mode. Defaults to global title.

	 * @param {boolean} [options.pixels=false]
	   Show scale in pixels?

	 * @param {string} [options.pixelsTitle]
	   Title of the control in pixels mode. Defaults to global title.

	 * @param {boolean} [options.custom=false]
	   Show custom scale?

	 * @param {string} [options.customTitle]
	   Title of the control in custom mode. Defaults to global title.

	 * @param {number} [options.customScale=1.0]
	   Scaling factor for the custom scale.

	 * @param {string} [options.customUnits='']
	   Units of the custom scale.

	 * @param {boolean} [options.updateWhenIdle=false]
	   Update only when the map stops moving?

	 * @param {number} [options.planetRadius]
	   Planet radius (in meters) for the metric and imperial modes.

	 * @returns {Scale} Instance of a scale bar.
	 */
	initialize: function (options) {
		Util.setOptions(this, options);
	},
	
	/**
	 * Add the scale bar(s).
	 * @private
	 * @override
	 * @param {object} options
	   Scale bar options (see {link @Scale} for details).
	 * @param {string} className
	   Element class name for the scale bar.
	 * @param {object} container
	   Scale bar container
	 */
	_addScales: function (options, className, container) {
		if (options.metric) {
			this._mScale = DomUtil.create('div', className, container);
			this._mScale.title = options.metricTitle ?
				options.metricTitle : options.title;
		}
		if (options.imperial) {
			this._iScale = DomUtil.create('div', className, container);
			this._iScale.title = options.imperialTitle ?
				options.imperialTitle : options.title;
		}
		if (options.degrees) {
			this._dScale = DomUtil.create('div', className, container);
			this._dScale.title = options.degreesTitle ?
				options.degreesTitle : options.title;
		}
		if (options.pixels) {
			this._pScale = DomUtil.create('div', className, container);
			this._pScale.title = options.pixelsTitle ?
				options.pixelsTitle : options.title;
		}
		if (options.custom) {
			this._cScale = DomUtil.create('div', className, container);
			this._cScale.title = options.customTitle ?
				options.customTitle : options.title;
		}

		this.angular = options.metric || options.imperial || options.degrees;
	},

	/**
	 * Update the scale bar(s).
	 * @private
	 * @override
	 */
	_update: function () {
		const	options = this.options,
			map = this._map,
			crs = map.options.crs;

		if (options.pixels && crs.options && crs.options.nzoom) {
			const	pixelScale = Math.pow(
				2.0,
				crs.options.nzoom - 1 - map.getZoom()
			);

			this._updatePixels(pixelScale * options.maxWidth);
		}

		if (options.custom && crs.options && crs.options.nzoom) {
			const	customScale = Math.pow(
				2.0,
				crs.options.nzoom - 1 - map.getZoom()
			) * options.customScale;

			this._updateCustom(
				customScale * options.maxWidth,
				options.customUnits
			);
		}

		if (this.angular) {
			const	center = map.getCenter(),
				cosLat = Math.cos(center.lat * Math.PI / 180),
				dist = Math.sqrt(this._jacobian(center)) * cosLat,
				maxDegrees = dist * options.maxWidth;

			if (options.metric) {
				this._updateMetric(
					maxDegrees * Math.PI / 180.0 * options.planetRadius
				);
			}
			if (options.imperial) {
				this._updateImperial(
					maxDegrees * Math.PI / 180.0 * options.planetRadius
				);
			}
			if (options.degrees) {
				this._updateDegrees(maxDegrees);
			}
		}
	},

	/**
	 * Return the Jacobian determinant of the deprojection at the given world
	   coordinates.
	 * @private
	 * @param {leaflet.LatLng} 
	 * @returns {number} Jacobian determinant of the deprojection.
	 */
	_jacobian: function (latlng) {
		const	map = this._map,
			p0 = map.project(latlng),
			latlngdx = map.unproject(p0.add([10.0, 0.0])),
		    latlngdy = map.unproject(p0.add([0.0, 10.0]));

		return 0.01 * Math.abs((latlngdx.lng - latlng.lng) *
		                        (latlngdy.lat - latlng.lat) -
		                       (latlngdy.lng - latlng.lng) *
		                        (latlngdx.lat - latlng.lat));
	},

	/**
	 * Update the custom scale.
	 * @private
	 * @param {number} maxCust
	   Maximum scale value in custom units.
	 * @param {string} units
	   Custom units.
	 */
	_updateCustom: function (maxCust, units) {
		const	scale = this._cScale;

		if (maxCust > 1.0e9) {
			var	maxGCust = maxCust * 1.0e-9,
				gCust = this._getRoundNum(maxGCust);
			this._updateScale(scale, gCust + ' G' + units, gCust / maxGCust);
		} else if (maxCust > 1.0e6) {
			var	maxMCust = maxCust * 1.0e-6,
				mCust = this._getRoundNum(maxMCust);
			this._updateScale(scale, mCust + ' M' + units, mCust / maxMCust);
		} else if (maxCust > 1.0e3) {
			var	maxKCust = maxCust * 1.0e-3,
				kCust = this._getRoundNum(maxKCust);
			this._updateScale(scale, kCust + ' k' + units, kCust / maxKCust);
		} else {
			var	cust = this._getRoundNum(maxCust);
			this._updateScale(scale, cust + ' ' + units, cust / maxCust);
		}
	},

	/**
	 * Update the pixel scale.
	 * @private
	 * @param {number} maxPix
	   Maximum scale value in pixel units.
	 */
	_updatePixels: function (maxPix) {
		const	scale = this._pScale;

		if (maxPix > 1.0e6) {
			var	maxMPix = maxPix * 1.0e-6,
				mPix = this._getRoundNum(maxMPix);
			this._updateScale(scale, mPix + ' Mpx', mPix / maxMPix);
		} else if (maxPix > 1.0e3) {
			var	maxKPix = maxPix * 1.0e-3,
				kPix = this._getRoundNum(maxKPix);
			this._updateScale(scale, kPix + ' kpx', kPix / maxKPix);
		} else {
			var pix = this._getRoundNum(maxPix);
			this._updateScale(scale, pix + ' px', pix / maxPix);
		}
	},

	/**
	 * Update the degree scale.
	 * @private
	 * @param {number} maxdegrees
	   Maximum scale value in pixel units.
	 */
	_updateDegrees: function (maxDegrees) {
		const	maxSeconds = maxDegrees * 3600.0,
			scale = this._dScale;

		if (maxSeconds < 1.0) {
			var	maxMas = maxSeconds * 1000.0,
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

/**
 * Instantiate a scale bar.
 *
 * @function
 * @param {object} [options] - Options: see {@link Scale}
 * @returns {Scale} Instance of a scale bar.

 * @example
 * const doubleScale = scale({degrees: true, pixels: true}).addTo(map);
 */
export const scale = function (options) {
	return new Scale(options);
};

