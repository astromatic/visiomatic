/*
# L.Control.Reticle adds a reticle at the center of the map container
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#	                         Chiara Marmo    - Paris-Saclay
*/
import L from 'leaflet';

L.Control.Reticle = L.Control.extend({
	options: {
		position: 'bottomleft'
	},

	onAdd: function (map) {
		// Create central reticle
		var reticle = this._reticle = L.DomUtil.create('div', 'leaflet-reticle', this._map._controlContainer),
			style = reticle.style;
		style.position = 'absolute';
		style.left = '50%';
		style.bottom = '50%';
		style.textAlign = 'center';
		style.verticalAlign = 'middle';
		style.pointerEvents = 'none';
		reticle.innerHTML = '';

		var container = this._container = L.DomUtil.create('div', 'leaflet-dummy');

		return container;
	},

	onRemove: function (map) {
		this._reticle.parentNode.removeChild(this._reticle);
	}

});

L.control.reticle = function (options) {
    return new L.Control.Reticle(options);
};
