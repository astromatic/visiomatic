/**
 #	This file part of:	VisiOmatic
 * @file Provide an ellipse marker.

 * @copyright (c) 2015-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/
import {
	Bounds,
	Canvas,
	Path,
	SVG,
	Util,
	latLng
} from 'leaflet';


/**
 * Ellipse shape parameters.
 * @typedef ellipseShape
 * @property {number} [majAxis]
   Length of the ellipse major axis in pixels.
 * @property {number} [minAxis]
   Length of the ellipse minor axis in pixels.
 * @property {number} [posAngle]
   Ellipse position angle in degrees (CCW from x axis).
 */


export const EllipseMarker = Path.extend( /** @lends EllipseMarker */ {
	CANVAS: true,
	SVG: false,

	options: {
		majAxis: 10,
		minAxis: 10,
		posAngle: 0,
		fill: true
	},

	/**
	 * Create a new ellipse marker.
	 * @extends leaflet.Path
	 * @memberof module:vector/EllipseMarker.js
	 * @constructs
	 * @param {leaflet.LatLng} latlng
	   World coordinates of the center of the marker.
	 * @param {object} [options]
	   Options.

	 * @param {number} [options.majAxis=10]
	   Length of the ellipse major axis in pixels.

	 * @param {number} [options.minAxis=10]
	   Length of the ellipse minor axis in pixels.

	 * @param {number} [options.posAngle=0]
	   Ellipse position angle in degrees (CCW from x axis).

	 * @param {boolean} [options.fill=true]
	   Fill the ellipse?

	 * @returns {EllipseMarker} Instance of an ellipse marker.
	 */
	initialize: function (latlng, options) {
		Util.setOptions(this, options);

		this._majAxis = this.options.majAxis;
		this._minAxis = this.options.majAxis;
		this._posAngle = this.options.posAngle;
		this._latlng = latLng(latlng);

		const	deg = Math.PI / 180.0,
			cpa = Math.cos(this._posAngle * deg),
			spa = Math.sin(this._posAngle * deg),
			cpa2 = cpa * cpa,
			spa2 = spa * spa,
			a2 = this._majAxis * this._majAxis,
			b2 = this._minAxis * this._minAxis;
		let	mx2 = a2 * cpa2 + b2 * spa2,
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

	/**
	 * Set/update the world coordinates of the ellipse marker.
	 * @param {leaflet.LatLng} latlng
	   World coordinates of the marker.
	 * @returns {EllipseMarker} this.
	 */
	setLatLng: function (latlng) {
		this._latlng = latLng(latlng);
		this.redraw();
		return this.fire('move', {latlng: this._latlng});
	},

	/**
	 * Return the world coordinates of the ellipse marker.
	 * @returns {leaflet.LatLng} World coordinates of the marker.
	 */
	getLatLng: function () {
		return this._latlng;
	},

	/**
	 * Set/update the shape parameters of the ellipse marker.
	 * @param {ellipseShape} ellipseParams
	   Ellipse shape parameters.
	 * @returns {EllipseMarker} this.
	 */
	setParams: function (ellipseParams) {
		this.options.majAxis = this._majAxis = ellipseParams.majAxis;
		this.options.minAxis = this._minAxis = ellipseParams.minAxis;
		this.options.posAngle = this._posAngle = ellipseParams.posAngle;
		return this.redraw();
	},

	/**
	 * Set/update the shape parameters of the ellipse marker.
	 * @returns {ellipseShape} Ellipse shape parameters.
	 */
	getParams: function () {
		const	ellipseParams = {

			majAxis: this._majAxis,
			minAxis: this._minAxis,
			posAngle: this._posAngle
		};
		return ellipseParams;
	},

	// setStyle: Path.prototype.setStyle,


	/**
	 * Project the marker to pixel coordinates.
	 * @private
	 */
	_project: function () {
		this._point = this._map.latLngToLayerPoint(this._latlng);
		this._updateBounds();
	},

	/**
	 * Project the boundaries of the marker.
	 * @private
	 */
	_updateBounds: function () {
		const	w = this._clickTolerance(),
			p = [this._limX + w, this._limY + w];
		this._pxBounds = new Bounds(this._point.subtract(p), this._point.add(p));
	},

	/**
	 * Update the marker.
	 * @private
	 */
	_update: function () {
		if (this._map) {
			this._updatePath();
		}
	},

	/**
	 * Update the rendering of the marker.
	 * @private
	 */
	_updatePath: function () {
		this._renderer._updateEllipse(this);
	},

	_empty: function () {
		return this._majAxis &&
			!this._renderer._bounds.intersects(this._pxBounds);
	},

	/**
	 * Test if the marker contains the given  point.
	 * @param {leaflet.Point} p
	   Coordinates of the point.
	 * @returns {boolean}
	   True if the marker contains the point, false otherwise.
	 */
	_containsPoint: function (p) {
		const	dp = p.subtract(this._point),
			ct = this._clickTolerance(),
			dx = Math.abs(dp.x) - ct,
			dy = Math.abs(dp.y) - ct;

		return this._cXX * (dx > 0.0 ? dx * dx : 0.0) +
		  this._cYY * (dy > 0.0 ? dy * dy : 0.0) +
		  this._cXY * (dp.x * dp.y) <= 1.0;
	}
});

/**
 * Instantiate an ellipse marker.
 *
 * @function
 * @param {leaflet.LatLng} latlng
   World coordinates of the center of the marker.
 * @param {object} [options]
   Options: see {@link EllipseMarker}.
 * @returns {EllipseMarker} Instance of an ellipse marker.

 * @example
   ...
   const marker = ellipseMarker(latLng(30.0, 24.0), {
				majAxis: 24.7,
				minAxis: 12.1,
				posAngle: 47.3
	});
 */
export const ellipseMarker = function (latlng, options) {
	return new EllipseMarker(latlng, options);
};

/**
 * Ellipse marker rendering recipe for Canvas.
 * @memberof Canvas
 * @mixin
 * @param [EllipseMarker] layer - ellipse marker layer.
*/
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

/**
 * Ellipse marker rendering recipe for SVG.
 * @memberof SVG
 * @mixin
 * @param [EllipseMarker] layer - ellipse marker layer.
*/
SVG.include({
	_updateEllipse: function (layer) {
		const	deg = Math.PI / 180.0,
			p = layer._point,
			r = layer._minAxis,
			r2 = layer._majAxis,
			dx = r * Math.cos(layer._posAngle * deg),
			dy = r * Math.sin(layer._posAngle * deg),
			arc = 'a' + r + ',' + r2 + ' ' + layer._posAngle + ' 1,0 ';

		// drawing a circle with two half-arcs
		const	d = layer._empty() ? 'M0 0' :
			'M' + (p.x - dx) + ',' + (p.y - dy) +
			arc + (dx * 2) + ',' + (dy * 2) + ' ' +
			arc + (-dx * 2) + ',' + (-dy * 2) + ' ';

		this._setPath(layer, d);
	}
});

