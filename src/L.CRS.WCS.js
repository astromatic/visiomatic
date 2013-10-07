/*
# L.CRS.WCS emulates the FITS WCS (World Coordinate System) popular among
# the astronomical community (see http://www.atnf.csiro.au/people/mcalabre/WCS/)
#
#	This file part of:	Leaflet-IVV
#
#	Copyright: (C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		07/10/2013
*/

L.CRS.WCS = L.extend({}, L.CRS, {
	projparam: {
		projection: L.Projection.WCS.TAN,
		ctype: {x: 'RA--TAN', y: 'DEC--TAN'},
		naxis: new L.point(256, 256, true),
		nzoom: 1,
		crpix: L.point(129, 129),
		crval: L.latLng(0.0, 0.0),		// (\delta_0, \phi_0)
		cd: [[1.0, 0.0], [0.0, 1.0]],
		natpole: L.latLng(90.0, 180.0),	// (\theta_p, \phi_p)
		tileSize: L.point(256, 256),
		celpole: L.latLng(0.0, 0.0),	// (\delta_p, \alpha_p)
		natfid: L.latLng(0.0, 90.0),	// (\theta_0, \phi_0)
		cdinv: [[1.0, 0.0], [0.0, 1.0]],
	},

	initialize: function () {
		var projparam = this.projparam;
		this.transformation = new L.Transformation(1, -0.5, -1, projparam.naxis.y + 0.5);
		projparam.projection.paraminit(projparam);
		this.code += ':' + projparam.projection.code;
		this.ready = true;
	},

	code: 'WCS',

	projection: L.Projection.WCS,

	latLngToPoint: function (latlng, zoom) { // (LatLng, Number) -> Point
		if (!this.ready) {
			this.initialize();
		}
		var projectedPoint = this.projparam.projection.project(latlng, this.projparam),
		    scale = this.scale(zoom);
		return this.transformation._transform(projectedPoint, scale);
	},

	pointToLatLng: function (point, zoom) { // (Point, Number[, Boolean]) -> LatLng
		if (!this.ready) {
			this.initialize();
		}
		var scale = this.scale(zoom),
				untransformedPoint = this.transformation.untransform(point, scale);
		return this.projparam.projection.unproject(untransformedPoint, this.projparam);
	},

	project: function (latlng) {
		if (!this.ready) {
			this.initialize();
		}
		return this.projparam.projection.project(latlng, this.projparam);
	},

	scale: function (zoom) {
		return Math.pow(2, zoom - this.projparam.nzoom + 1);
	},

// Return base zoom level at a given resolution for a given tile size
	zoom1: function (point, tileSize) {
		return Math.ceil(Math.log(Math.max(point.x / tileSize.x, point.y / tileSize.y)) / Math.LN2);
	},

// Distance between p1 and p2 in degrees
	distance: function (p1, p2) {

		var d2r = L.LatLng.DEG_TO_RAD,
		 lat1 = p1.lat * d2r,
		 lat2 = p2.lat * d2r,
		 dLat = lat2 - lat1,
		 dLon = (p2.lng - p1.lng) * d2r,
		 sin1 = Math.sin(dLat / 2),
		 sin2 = Math.sin(dLon / 2);

		var a = sin1 * sin1 + sin2 * sin2 * Math.cos(lat1) * Math.cos(lat2);

		return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * L.LatLng.RAD_TO_DEG;
	}
});

