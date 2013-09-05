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
#	Last modified:		05/09/2013
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery-browser');
}

L.Control.IIP.Image = L.Control.IIP.extend({
	options: {
		title: 'Image adjustment',
		collapsed: true,
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
			layer = this._layer;
		this._min = L.DomUtil.create('div', className + '-min', dialog);
		this._max = L.DomUtil.create('div', className + '-max', dialog);
		this._separator = L.DomUtil.create('div', className + '-separator', dialog);

		var step = ((layer.iipMaxValue[0] - layer.iipMinValue[0]) / 100.0).toPrecision(1);
		var	mininput = document.createElement('input');
		mininput.className = 'leaflet-minValue';
		mininput.type = 'text';
		mininput.value = String(layer.iipMinValue[0]);
		mininput.layer = layer;
		this._min.appendChild(mininput);
		$('.leaflet-minValue').spinner({
			stop: function (event, ui) {
				_this._onInputChange(mininput, 'iipMinValue[0]');
			},
			icons: { down: 'icon-minus', up: 'icon-plus' },
			step: step
		});
		L.DomEvent.on(mininput, 'change', function () {
			_this._onInputChange(mininput, 'iipMinValue[0]');
		}, this);

		var	maxinput = document.createElement('input');
		maxinput.className = 'leaflet-maxValue';
		maxinput.type = 'text';
		maxinput.value = String(layer.iipMaxValue[0]);
		maxinput.layer = layer;
		this._max.appendChild(maxinput);
		$('.leaflet-maxValue').spinner({
			stop: function (event, ui) {
				_this._onInputChange(maxinput, 'iipMaxValue[0]');
			},
			icons: { down: 'icon-minus', up: 'icon-plus' },
			step: step
		});
		L.DomEvent.on(maxinput, 'change', function () {
			_this._onInputChange(maxinput, 'iipMaxValue[0]');
		}, this);

	},

});

L.control.iip.image = function (baseLayers, options) {
	return new L.Control.IIP.Image(baseLayers, options);
};

