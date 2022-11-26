/*
#	Add world and pixel units to the standard Control.Scale.
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#	                         Chiara Marmo    - Paris-Saclay
*/
import {Control, DomUtil} from 'leaflet';


export const Scale = Control.Scale.extend({
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
			this._mScale = DomUtil.create('div', className, container);
			this._mScale.title = options.metricTitle ? options.metricTitle : options.title;
		}
		if (options.imperial) {
			this._iScale = DomUtil.create('div', className, container);
			this._iScale.title = options.imperialTitle ? options.imperialTitle : options.title;
		}
		if (options.degrees) {
			this._dScale = DomUtil.create('div', className, container);
			this._dScale.title = options.degreesTitle ? options.degreesTitle : options.title;
		}
		if (options.pixels) {
			this._pScale = DomUtil.create('div', className, container);
			this._pScale.title = options.pixelsTitle ? options.pixelsTitle : options.title;
		}
		if (options.custom) {
			this._cScale = DomUtil.create('div', className, container);
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

export const scale = function (options) {
	return new Scale(options);
};

