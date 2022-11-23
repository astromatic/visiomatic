/*
# Add an ellipse defined by its semi-major and semi-minor axes (in degrees), as
# well as a position angle in degrees (east of north).
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2015-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
*/
import L from 'leaflet';

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

