/*
# L.CRS.WCS emulates the FITS WCS (World Coordinate System) popular among
# the astronomical community (see http://www.atnf.csiro.au/people/mcalabre/WCS/)
#
#	This file part of:	Leaflet-IVV
#
#	Copyright:		(C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#                        Chiara Marmo - IDES/Paris-Sud
#
#	License:		GNU General Public License
#
#	This code is free software: you can redistribute it and/or modify
#	it under the terms of the GNU General Public License as published by
#	the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#	This code is distributed in the hope that it will be useful,
#	but WITHOUT ANY WARRANTY; without even the implied warranty of
#	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#	GNU General Public License for more details.
#	You should have received a copy of the GNU General Public License
#	along with this code. If not, see <http://www.gnu.org/licenses/>.
#
#	Last modified:		26/07/2013
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
		this.transformation = new L.Transformation(1, -1, -1, projparam.naxis.y);
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

	}

});


