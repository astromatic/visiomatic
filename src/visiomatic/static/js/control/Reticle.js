/*
#	Add a reticle at the center of the map container.
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#	                         Chiara Marmo    - Paris-Saclay
*/
import {Control, DomUtil} from 'leaflet';


export const Reticle = Control.extend({
	options: {
		position: 'bottomleft'
	},

	onAdd: function (map) {
		// Create central reticle
		var reticle = this._reticle = DomUtil.create('div', 'leaflet-reticle', this._map._controlContainer),
			style = reticle.style;
		style.position = 'absolute';
		style.left = '50%';
		style.bottom = '50%';
		style.textAlign = 'center';
		style.verticalAlign = 'middle';
		style.pointerEvents = 'none';
		reticle.innerHTML = '';

		var container = this._container = DomUtil.create('div', 'leaflet-dummy');

		return container;
	},

	onRemove: function (map) {
		this._reticle.parentNode.removeChild(this._reticle);
	}

});

export const reticle = function (options) {
	return new Reticle(options);
};

