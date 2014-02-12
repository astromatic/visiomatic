/*
# L.Control.IIP.image adjusts the rendering of an IIP layer
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	VisiOmatic
#
#	Copyright:		(C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#				                 Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		10/02/2014
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
		var step = ((layer.iipMaxValue[0] - layer.iipMinValue[0]) / 100.0).toPrecision(1);

		// Min
		elem = this._addDialogLine('Min:');
		var	mininput = L.DomUtil.create('input', '', elem);
		mininput.id = 'leaflet-minvalue';
		mininput.type = 'text';
		mininput.value = String(layer.iipMinValue[0]);
		$('#' + mininput.id).spinner({
			stop: function (event, ui) {
				_this._onInputChange(layer, 'iipMinValue[0]', mininput.value);
			},
			icons: { down: 'icon-minus', up: 'icon-plus' },
			step: step
		});
		L.DomEvent.on(mininput, 'change', function () {
			_this._onInputChange(layer, 'iipMinValue[0]', mininput.value);
		}, this);

		// Max
		elem = this._addDialogLine('Max:');
		var	maxinput = L.DomUtil.create('input', '', elem);
		maxinput.id = 'leaflet-maxvalue';
		maxinput.type = 'text';
		maxinput.value = String(layer.iipMaxValue[0]);
		$('#' + maxinput.id).spinner({
			stop: function (event, ui) {
				_this._onInputChange(layer, 'iipMaxValue[0]', maxinput.value);
			},
			icons: { down: 'icon-minus', up: 'icon-plus' },
			step: step
		});
		L.DomEvent.on(maxinput, 'change', function () {
			_this._onInputChange(layer, 'iipMaxValue[0]', maxinput.value);
		}, this);

		// Gamma
		elem = this._addDialogLine('Gamma:');
		var	gaminput = L.DomUtil.create('input', '', elem);
		gaminput.id = 'leaflet-gammavalue';
		gaminput.type = 'text';
		gaminput.value = String(layer.iipGamma);
		$('#' + gaminput.id).spinner({
			stop: function (event, ui) {
				_this._onInputChange(layer, 'iipGamma', gaminput.value);
			},
			icons: { down: 'icon-minus', up: 'icon-plus' },
			step: 0.05,
			min: 0.5,
			max: 5.0,
		});
		L.DomEvent.on(gaminput, 'change', function () {
			_this._onInputChange(layer, 'iipGamma', gaminput.value);
		}, this);

		// Contrast
		elem = this._addDialogLine('Contrast:');
		var	continput = L.DomUtil.create('input', '', elem);
		continput.id = 'leaflet-contrastvalue';
		continput.type = 'text';
		continput.value = String(layer.iipContrast);
		$('#' + continput.id).spinner({
			stop: function (event, ui) {
				_this._onInputChange(layer, 'iipContrast', continput.value);
			},
			icons: { down: 'icon-minus', up: 'icon-plus' },
			step: 0.05,
			min: 0.0,
			max: 10.0,
		});
		L.DomEvent.on(continput, 'change', function () {
			_this._onInputChange(layer, 'iipContrast', continput.value);
		}, this);

		// JPEG quality
		elem = this._addDialogLine('JPEG quality:');
		var	qualinput = L.DomUtil.create('input', '', elem);
		qualinput.id = 'leaflet-qualvalue';
		qualinput.type = 'text';
		qualinput.value = String(layer.iipQuality);
		$('#' + qualinput.id).spinner({
			stop: function (event, ui) {
				_this._onInputChange(layer, 'iipQuality', qualinput.value);
			},
			icons: { down: 'icon-minus', up: 'icon-plus' },
			step: 1,
			min: 0,
			max: 100,
		});
		L.DomEvent.on(qualinput, 'change', function () {
			_this._onInputChange(layer, 'iipQuality', qualinput.value);
		}, this);

	}

});

L.control.iip.image = function (baseLayers, options) {
	return new L.Control.IIP.Image(baseLayers, options);
};

