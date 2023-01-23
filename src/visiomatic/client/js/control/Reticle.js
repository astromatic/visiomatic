/**
 #	This file part of:	VisiOmatic
 * @file Add a reticle at the center of the map container.

 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/
import {Control, DomUtil, Util} from 'leaflet';


export const Reticle = Control.extend( /** @lends Reticle */ {

	/**
	 * Create a new reticle.

	 * @extends leaflet.Control.Reticle
	 * @memberof module:control/Reticle.js
	 * @constructs
	 * @override
	 * @returns {Reticle} Instance of a reticle.
	 */
	initialize: function (options) {
		Util.setOptions(this, options);
	},

	/**
	 * Add the reticle to the map.
	 * @memberof control/Reticle
	 * @param {object} map - Leaflet map the reticle has been added to.
	 * @returns {object} A new container (dummy: does not contain the reticle).
	 */
	onAdd: function (map) {
		// Create central reticle
		const	reticle = this._reticle = DomUtil.create(
				'div',
				'leaflet-reticle',
				this._map._controlContainer
			),
			style = reticle.style;
		style.position = 'absolute';
		style.left = '50%';
		style.bottom = '50%';
		style.textAlign = 'center';
		style.verticalAlign = 'middle';
		style.pointerEvents = 'none';
		reticle.innerHTML = '';

		const	container = this._container =
			DomUtil.create('div', 'leaflet-dummy');

		return container;
	},

	/**
	 * Remove the reticle.
	 * @param {leaflet.map} [map] - The parent map.
	 */
	onRemove: function (map) {
		this._reticle.parentNode.removeChild(this._reticle);
	}

});

/**
 * Instantiate a reticle.
 *
 * @function
 * @returns {Reticle} Instance of a reticle.

 * @example
 * const ret = reticle().addTo(map);
 */
export const reticle = function (options) {
	return new Reticle(options);
};

