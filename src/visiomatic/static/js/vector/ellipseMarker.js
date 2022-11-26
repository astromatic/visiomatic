/*
# 	Add an ellipse marker defined by its semi-major and semi-minor axes (in pixels),
#	as well as a position angle in degrees (CCW from x axis).
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2015-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
*/
import {
	Bounds,
	Canvas,
	Path,
	SVG,
	Util,
	latLng
} from 'leaflet';


EllipseMarker = Path.extend({
	CANVAS: true,
	SVG: false,

	options: {
		fill: true,
		majAxis: 10,
		minAxis: 10,
		posAngle: 0
	},

	initialize: function (latlng, options) {
		Util.setOptions(this, options);

		this._majAxis = this.options.majAxis;
		this._minAxis = this.options.majAxis;
		this._posAngle = this.options.posAngle;
		this._latlng = latLng(latlng);

		var	deg = Math.PI / 180.0,
			  cpa = Math.cos(this._posAngle * deg),
			  spa = Math.sin(this._posAngle * deg),
			  cpa2 = cpa * cpa,
			  spa2 = spa * spa,
			  a2 = this._majAxis * this._majAxis,
			  b2 = this._minAxis * this._minAxis,
			  mx2 = a2 * cpa2 + b2 * spa2,
			  my2 = a2 * spa2 + b2 * cpa2,
			  mxy = (a2 - b2) * cpa * spa,
			  c = mx2 * my2 - mxy * mxy;

		this._limX = Math.sqrt(mx2);
		this._limY = Math.sqrt(my2);
		// Manage ellipses with minor axis = 0
		if (c <= 0.0) {
			mx2 += 1.0;
			my2 += 1.0;
			c = mx2 * my2 - mxy * mxy;
		}
		// Necessary for computing the exact ellipse boundaries
		this._cXX = my2 / c;
		this._cYY = mx2 / c;
		this._cXY = -2.0 * mxy / c;
	},

	setLatLng: function (latlng) {
		this._latlng = latLng(latlng);
		this.redraw();
		return this.fire('move', {latlng: this._latlng});
	},

	getLatLng: function () {
		return this._latlng;
	},

	setParams: function (ellipseParams) {
		this.options.majAxis = this._majAxis = ellipseParams.majAxis;
		this.options.minAxis = this._minAxis = ellipseParams.minAxis;
		this.options.posAngle = this._posAngle = ellipseParams.posAngle;
		return this.redraw();
	},

	getParams: function () {
		var	ellipseParams;

		ellipseParams.majAxis = this._majAxis;
		ellipseParams.minAxis = this._minAxis;
		ellipseParams.posAngle = this._posAngle;
		return ellipseParams;
	},

	setStyle: Path.prototype.setStyle,

	_project: function () {
		this._point = this._map.latLngToLayerPoint(this._latlng);
		this._updateBounds();
	},

	_updateBounds: function () {
		var w = this._clickTolerance(),
		    p = [this._limX + w, this._limY + w];
		this._pxBounds = new Bounds(this._point.subtract(p), this._point.add(p));
	},

	_update: function () {
		if (this._map) {
			this._updatePath();
		}
	},

	_updatePath: function () {
		this._renderer._updateEllipse(this);
	},

	_empty: function () {
		return this._majAxis && !this._renderer._bounds.intersects(this._pxBounds);
	},

	_containsPoint: function (p) {
		var	dp = p.subtract(this._point),
			  ct = this._clickTolerance(),
			  dx = Math.abs(dp.x) - ct,
			  dy = Math.abs(dp.y) - ct;

		return this._cXX * (dx > 0.0 ? dx * dx : 0.0) +
		  this._cYY * (dy > 0.0 ? dy * dy : 0.0) + this._cXY * (dp.x * dp.y) <= 1.0;
	}
});

export const ellipseMarker = function (latlng, options) {
	return new EllipseMarker(latlng, options);
};

Canvas.include({
	_updateEllipse: function (layer) {

		if (layer._empty()) { return; }

		var p = layer._point,
		    ctx = this._ctx,
		    r = layer._minAxis,
		    s = layer._majAxis / layer._minAxis;

		ctx.save();
		ctx.translate(p.x, p.y);
		ctx.rotate(layer._posAngle * Math.PI / 180.0);
		ctx.scale(1, s);

		ctx.beginPath();
		ctx.arc(0, 0, r, 0, Math.PI * 2, false);
		ctx.restore();

		this._fillStroke(ctx, layer);
	}
});

SVG.include({
	_updateEllipse: function (layer) {
		var deg = Math.PI / 180.0,
		    p = layer._point,
		    r = layer._minAxis,
		    r2 = layer._majAxis,
		    dx = r * Math.cos(layer._posAngle * deg),
				dy = r * Math.sin(layer._posAngle * deg),
		    arc = 'a' + r + ',' + r2 + ' ' + layer._posAngle + ' 1,0 ';

		// drawing a circle with two half-arcs
		var d = layer._empty() ? 'M0 0' :
				'M' + (p.x - dx) + ',' + (p.y - dy) +
				arc + (dx * 2) + ',' + (dy * 2) + ' ' +
				arc + (-dx * 2) + ',' + (-dy * 2) + ' ';

		this._setPath(layer, d);
	}
});

