/*
# L.Control.AdjustLayers adjusts the rendering of an IIP layer
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
# derived from the L.Control.ActiveLayers plugin
# (see https://github.com/vogdb/Leaflet.ActiveLayers)
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
L.Control.AdjustLayers = L.Control.Layers.extend({

  /**
* Get currently active base layer on the map
* @return {Object} l where l.name - layer name on the control,
* l.layer is L.TileLayer, l.overlay is overlay layer.
*/
	getActiveBaseLayer: function () {
		return this._activeBaseLayer;
	},

  /**
* Get currently active overlay layers on the map
* @return {{layerId: l}} where layerId is <code>L.stamp(l.layer)</code>
* and l @see #getActiveBaseLayer jsdoc.
*/
	getActiveOverlayLayers: function () {
		return this._activeOverlayLayers;
	},

	onAdd: function (map) {
		var container = L.Control.Layers.prototype.onAdd.call(this, map);

//    this._activeBaseLayer = this._findActiveBaseLayer();
//    this._activeOverlayLayers = this._findActiveOverlayLayers();
		return container;
	},

	_findActiveBaseLayer: function () {
		var layers = this._layers;
		for (var layerId in layers) {
			if (this._layers.hasOwnProperty(layerId)) {
				var layer = layers[layerId];
				if (!layer.overlay && this._map.hasLayer(layer.layer)) {
					return layer;
				}
			}
		}
		throw new Error('Control doesn\'t have any active base layer!');
	},

	_findActiveOverlayLayers: function () {
		var result = {};
		var layers = this._layers;
		for (var layerId in layers) {
			if (this._layers.hasOwnProperty(layerId)) {
				var layer = layers[layerId];
				if (layer.overlay && this._map.hasLayer(layer.layer)) {
					result[layerId] = layer;
				}
			}
		}
		return result;
	},

	_onInputClick: function () {
		var i, input, obj,
			inputs = this._form.getElementsByClassName('leaflet-control-layers-selector'),
			inputsLen = inputs.length,
			baseLayer;

		this._handlingClick = true;

		for (i = 0; i < inputsLen; i++) {
			input = inputs[i];
			obj = this._layers[input.layerId];

			if (input.checked && !this._map.hasLayer(obj.layer)) {
				this._map.addLayer(obj.layer);
				if (!obj.overlay) {
					baseLayer = obj.layer;
					this._activeBaseLayer = obj;
				} else {
					this._activeOverlayLayers[input.layerId] = obj;
				}
			} else if (!input.checked && this._map.hasLayer(obj.layer)) {
				this._map.removeLayer(obj.layer);
				if (obj.overlay) {
					delete this._activeOverlayLayers[input.layerId];
				}
			}
		}

		if (baseLayer) {
			this._map.setZoom(this._map.getZoom());
			this._map.fire('baselayerchange', {layer: baseLayer});
		}

		this._handlingClick = false;
	},

	_addItem: function (obj) {
		var	_this = this;

		var label = document.createElement('div'),
				input,
				checked = this._map.hasLayer(obj.layer);

		if (obj.overlay) {
			input = document.createElement('input');
			input.type = 'checkbox';
			input.className = 'leaflet-control-layers-selector';
			input.defaultChecked = checked;
		} else {
			input = this._createRadioElement('leaflet-base-layers', checked);
		}

		input.layerId = L.stamp(obj.layer);

		L.DomEvent.on(input, 'click', this._onInputClick, this);

		var name = document.createElement('span');
		name.innerHTML = ' ' + obj.name + ' ';
		label.appendChild(input);
		label.appendChild(name);

		if (!obj.overlay) {
			var	mininput = document.createElement('input');
			mininput.className = 'leaflet-minValue';
			mininput.type = 'text';
			mininput.value = String(obj.layer.iipMinValue[0]);
			mininput.layer = obj.layer;
			label.appendChild(mininput);
			L.DomEvent.on(mininput, 'change', function () {
				_this._onInputChange(mininput, 'iipMinValue[0]');
			}, this);

			var	maxinput = document.createElement('input');
			maxinput.className = 'leaflet-minValue';
			maxinput.type = 'text';
			maxinput.value = String(obj.layer.iipMaxValue[0]);
			maxinput.layer = obj.layer;
			label.appendChild(maxinput);
			L.DomEvent.on(maxinput, 'change', function () {
				_this._onInputChange(maxinput, 'iipMaxValue[0]');
			}, this);
		}

		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
		container.appendChild(label);
		return label;
	},

	_onInputChange:	function (input, pname) {
		var pnamearr = pname.split(/\[|\]/);
		if (pnamearr[1]) {
			input.layer[pnamearr[0]][parseInt(pnamearr[1], 10)] = input.value;
		}	else {
			input.layer[pnamearr[0]] = input.value;
		}
		input.layer.redraw();
	}

});

L.control.adjustLayers = function (baseLayers, overlays, options) {
	return new L.Control.AdjustLayers(baseLayers, overlays, options);
};

