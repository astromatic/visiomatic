/*
# UI for adjusting the basic rendering options of a VisiOmatic layer.
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#	                         Chiara Marmo    - Paris-Saclay
*/
import jQuery from 'jquery';
window.$ = window.jQuery = jQuery;

//if (typeof require !== 'undefined') {
//	var jQuery = require('jquery');
//}

import {Util} from 'leaflet';

import {UI} from './ui'

ImageUI = UI.extend({
	options: {
		title: 'Image preferences',
		collapsed: true,
		position: 'topleft'
	},

	initialize: function (options) {
		Util.setOptions(this, options);

		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipimage';
		this._sideClass = 'image';
		this._initsettings = {};
	},

	// Copy image settings from layer
	saveSettings: function (layer, settings) {
		if (!settings) {
			return;
		}

		settings.invertCMap = layer.iipInvertCMap;
		settings.contrast = layer.iipContrast;
		settings.colorSat = layer.iipColorSat;
		settings.gamma = layer.iipGamma;
		settings.quality = layer.iipQuality;
	},

	// Copy image settings back to layer and update widget values
	loadSettings: function (layer, settings) {
		if (!settings) {
			return;
		}

		layer.iipInvertCMap = settings.invertCMap;
		this._updateInput(this._input.invertCMap, settings.invertCMap);
		layer.iipContrast = settings.contrast;
		this._updateInput(this._input.contrast, settings.contrast);
		layer.iipColorSat = settings.colorSat;
		this._updateInput(this._input.colorSat, settings.colorSat);
		layer.iipGamma = settings.gamma;
		this._updateInput(this._input.gamma, settings.gamma);
		layer.iipQuality = settings.quality;
		this._updateInput(this._input.quality, settings.quality);
	},

	_initDialog: function () {
		var _this = this,
			className = this._className,
			layer = this._layer,
			map = this._map;

		// _input will contain widget instances
		this._input = {};

		// copy initial IIP image parameters from the layer object
		this.saveSettings(layer, this._initsettings);

		// Invert
		this._input.invertCMap = this._addSwitchInput(layer, this._dialog,
		  'Invert:', 'iipInvertCMap',
		  'Invert color map(s)', 'leaflet-invertCMap', layer.iipInvertCMap);

		// Contrast
		this._input.contrast = this._addNumericalInput(layer,
		  this._dialog, 'Contrast:', 'iipContrast',
		  'Adjust Contrast. 1.0: normal.', 'leaflet-contrastValue',
		  layer.iipContrast, 0.05, 0.0, 10.0);

		// Colour saturation
		this._input.colorSat = this._addNumericalInput(layer,
		  this._dialog, 'Color Sat.:', 'iipColorSat',
		  'Adjust Color Saturation. 0: B&W, 1.0: normal.', 'leaflet-colorsatvalue',
		  layer.iipColorSat, 0.05, 0.0, 5.0, this._updateMix);

		// Gamma
		this._input.gamma = this._addNumericalInput(layer,
		  this._dialog,  'Gamma:', 'iipGamma',
		  'Adjust Gamma correction. The standard value is 2.2.',
		  'leaflet-gammavalue', layer.iipGamma, 0.05, 0.5, 5.0);

		// JPEG quality
		this._input.quality = this._addNumericalInput(layer,
		  this._dialog,  'JPEG quality:', 'iipQuality',
		  'Adjust JPEG compression quality. 1: lowest, 100: highest',
		  'leaflet-qualvalue', layer.iipQuality, 1, 1, 100);

		// Reset settings button
		var line = this._addDialogLine('Reset:', this._dialog),
		    elem = this._addDialogElement(line);

		this._createButton(className + '-button', elem, 'image-reset', function () {
			_this.loadSettings(layer, _this._initsettings);
			layer.updateMix();
			layer.redraw();
		}, 'Reset image settings');

	},

	_updateMix: function (layer) {
		var nchannel = layer.iipNChannel;
		for (var c = 0; c < nchannel; c++) {
			layer.rgbToMix(c);
		}
		return;
	}

});

export const imageUI = function (options) {
	return new ImageUI(options);
};

