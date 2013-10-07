/*
# L.Control.IIP.image adjusts the rendering of an IIP layer
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	Leaflet-IVV
#
#	Copyright:		(C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#				         Chiara Marmo - IDES/Paris-Sud
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
#	Last modified:		04/10/2013
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery-browser');
}

L.Control.IIP.Image = L.Control.IIP.extend({
	options: {
		title: 'Image adjustment',
		collapsed: true,
		cmap: 'grey',
		position: 'topleft',
	},

	initialize: function (baseLayers,  options) {
		L.setOptions(this, options);
		this._className = 'leaflet-control-iipimage';
		this._layers = baseLayers;
	},

	_initDialog: function () {

		var _this = this,
			className = this._className,
			dialog = this._dialog,
			layer = this._layer,
			cmaps = ['grey', 'jet', 'cold', 'hot'],
			elem;

		// Colour lookup table (Colour maps)
		elem = this._addDialogLine('LUT:');
		var cmapinput = L.DomUtil.create('span', className + '-cmaps', elem);
		for (var i in cmaps) {
			var	button = document.createElement('input');
			button.className = 'leaflet-cmap-' + cmaps[i];
			button.type = 'button';
			button.name = 'button';
			button.cmap = cmaps[i];
			button.layer = layer;
			cmapinput.appendChild(button);
			if (cmaps[i] === this.options.cmap) {
				button.checked = 'checked';
			}
		}

		$('.' + className + '-cmaps').buttonset();
		$('.' + className + '-cmaps :button').click(function (e) {
			_this._onInputChange(this, 'CMap', this.cmap);
		});

		this._separator = L.DomUtil.create('div', className + '-separator', dialog);

		// Min and max pixel values
		var step = ((layer.iip.MaxValue[0] - layer.iip.MinValue[0]) / 100.0).toPrecision(1);

		// Min
		elem = this._addDialogLine('Min:');
		var	mininput = L.DomUtil.create('input', '', elem);
		mininput.id = 'leaflet-minvalue';
		mininput.type = 'text';
		mininput.value = String(layer.iip.MinValue[0]);
		mininput.layer = layer;
		$('#leaflet-minvalue').spinner({
			stop: function (event, ui) {
				_this._onInputChange(mininput, 'MinValue[0]', mininput.value);
			},
			icons: { down: 'icon-minus', up: 'icon-plus' },
			step: step
		});
		L.DomEvent.on(mininput, 'change', function () {
			_this._onInputChange(mininput, 'MinValue[0]', mininput.value);
		}, this);

		// Max
		elem = this._addDialogLine('Max:');
		var	maxinput = L.DomUtil.create('input', '', elem);
		maxinput.id = 'leaflet-maxvalue';
		maxinput.type = 'text';
		maxinput.value = String(layer.iip.MaxValue[0]);
		maxinput.layer = layer;
		$('#leaflet-maxvalue').spinner({
			stop: function (event, ui) {
				_this._onInputChange(maxinput, 'MaxValue[0]', maxinput.value);
			},
			icons: { down: 'icon-minus', up: 'icon-plus' },
			step: step
		});
		L.DomEvent.on(maxinput, 'change', function () {
			_this._onInputChange(maxinput, 'MaxValue[0]', maxinput.value);
		}, this);

		// Gamma
		elem = this._addDialogLine('Gamma:');
		var	gaminput = L.DomUtil.create('input', '', elem);
		gaminput.id = 'leaflet-gammavalue';
		gaminput.type = 'text';
		gaminput.value = String(layer.iip.Gamma);
		gaminput.layer = layer;
		$('#leaflet-gammavalue').spinner({
			stop: function (event, ui) {
				_this._onInputChange(maxinput, 'Gamma', gaminput.value);
			},
			icons: { down: 'icon-minus', up: 'icon-plus' },
			step: 0.05,
			min: 0.5,
			max: 5.0,
		});
		L.DomEvent.on(gaminput, 'change', function () {
			_this._onInputChange(gaminput, 'Gamma', gaminput.value);
		}, this);

		// Contrast
		elem = this._addDialogLine('Contrast:');
		var	continput = L.DomUtil.create('input', '', elem);
		continput.id = 'leaflet-contrastvalue';
		continput.type = 'text';
		continput.value = String(layer.iip.Contrast);
		continput.layer = layer;
		$('#leaflet-contrastvalue').spinner({
			stop: function (event, ui) {
				_this._onInputChange(maxinput, 'Contrast', continput.value);
			},
			icons: { down: 'icon-minus', up: 'icon-plus' },
			step: 0.05,
			min: 0.0,
			max: 10.0,
		});
		L.DomEvent.on(continput, 'change', function () {
			_this._onInputChange(continput, 'Contrast', continput.value);
		}, this);

		// JPEG quality
		elem = this._addDialogLine('JPEG quality:');
		var	qualinput = L.DomUtil.create('input', '', elem);
		qualinput.id = 'leaflet-qualvalue';
		qualinput.type = 'text';
		qualinput.value = String(layer.iip.Quality);
		qualinput.layer = layer;
		$('#leaflet-qualvalue').spinner({
			stop: function (event, ui) {
				_this._onInputChange(maxinput, 'Quality', qualinput.value);
			},
			icons: { down: 'icon-minus', up: 'icon-plus' },
			step: 1,
			min: 0,
			max: 100,
		});
		L.DomEvent.on(qualinput, 'change', function () {
			_this._onInputChange(qualinput, 'quality', qualinput.value);
		}, this);

	},

	_addDialogLine: function (label) {
		var elem = L.DomUtil.create('div', this._className + '-element', this._dialog),
		 text = L.DomUtil.create('span', this._className + '-label', elem);
		text.innerHTML = label;
		return elem;
	}
});

L.control.iip.image = function (baseLayers, options) {
	return new L.Control.IIP.Image(baseLayers, options);
};

