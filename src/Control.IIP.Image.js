/*
# L.Control.IIP.image adjusts the rendering of an IIP layer
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	VisiOmatic
#
#	Copyright:		(C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#				                 Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		12/06/2014
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

	initialize: function (baseLayers, options) {
		L.setOptions(this, options);
		// Fix precision issue in jQuery spinner
		$.widget('ui.spinner', $.ui.spinner, {
			_precision: function () {
				return Math.max(0,
				                Math.ceil(-Math.log(this.options.step) * Math.LOG10E));
			}
		});
		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipimage';
		this._layers = baseLayers;
	},

	_initDialog: function () {
		var _this = this,
			className = this._className,
			layer = this._layer,
			cmaps = ['grey', 'jet', 'cold', 'hot'],
			elem;

		// Colour lookup table (Colour maps)
		elem = this._addDialogLine('LUT:');
		var	invbutton =  L.DomUtil.create('input', 'leaflet-cmap-inv', elem);
		invbutton.id = 'leaflet-invertcmap';
		invbutton.type = 'button';

		var cmapinput = L.DomUtil.create('span', className + '-cmaps', elem);
		var cbutton = [];
		for (var i in cmaps) {
			cbutton[i] = document.createElement('input');
			cbutton[i].className = 'leaflet-cmap-' + cmaps[i];
			cbutton[i].type = 'button';
			cbutton[i].name = 'button';
			cbutton[i].cmap = cmaps[i];
			cmapinput.appendChild(cbutton[i]);
			if (cmaps[i] === this.options.cmap) {
				cbutton[i].checked = 'checked';
			}
		}

		$('.' + className + '-cmaps').buttonset();
		$('.' + className + '-cmaps :button').click(function (e) {
			_this._onInputChange(layer, 'iipCMap', this.cmap);
		});
		$('#leaflet-invertcmap').button();
		L.DomEvent.on(invbutton, 'click', function () {
			_this._onInputChange(layer, 'iipInvertCMap', !layer.iipInvertCMap);
			var style = layer.iipInvertCMap ? 'scaleY(-1.0)' : 'none';
			for (var i in cmaps) {
				if (L.Browser.ie) {
					cbutton[i].style.msTransform = style;
				} else if (L.Browser.webkit) {
					cbutton[i].style.webkitTransform = style;
				} else {
					cbutton[i].style.transform = style;
				}
			}
		}, this);

		// Min and max pixel values
		var step = parseFloat(((layer.iipMaxValue[0] - layer.iipMinValue[0]) * 0.01)
		                      .toPrecision(1));

		// Min
		this._addNumericalInput(layer, 'Min:', 'iipMinValue[0]',
		 'leaflet-minvalue', layer.iipMinValue[0], step);

		// Max
		this._addNumericalInput(layer, 'Max:', 'iipMaxValue[0]',
		 'leaflet-maxvalue', layer.iipMaxValue[0], step);

		// Gamma
		this._addNumericalInput(layer, 'Gamma:', 'iipGamma',
		 'leaflet-gammavalue', layer.iipGamma, 0.05, 0.5, 5.0);

		// Contrast
		this._addNumericalInput(layer, 'Contrast:', 'iipContrast',
		 'leaflet-contrastvalue', layer.iipContrast, 0.05, 0.0, 10.0);

		// JPEG quality
		this._addNumericalInput(layer, 'JPEG quality:', 'iipQuality',
		 'leaflet-qualvalue', layer.iipQuality, 1, 0, 100);
	},

	_addNumericalInput:	function (layer, label, attr, id, initValue, step,
	 min, max) {
		var _this = this,
		    elem = this._addDialogLine(label),
		    input = L.DomUtil.create('input', '', elem);
		input.id = id;
		input.type = 'number';
		input.value = initValue;
		input.size = 5;
		$('#' + input.id).spinner({
			start: function (event, ui) {
				if (L.Browser.mobile) {
					$('#' + input.id).blur();	// Avoid keyboard popup on touch devices
				}
			},
			stop: function (event, ui) {
				_this._onInputChange(layer, attr, input.value);
				if (L.Browser.mobile) {
					$('#' + input.id).blur();	// Avoid keyboard popup on touch devices
				}
			},
			icons: { down: 'icon-minus', up: 'icon-plus' },
			step: step,
			min: min,
			max: max,
		});
		return elem;
	}

});

L.control.iip.image = function (baseLayers, options) {
	return new L.Control.IIP.Image(baseLayers, options);
};

