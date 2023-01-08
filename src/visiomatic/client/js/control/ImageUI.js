/*
#	UI for basic rendering options of a VisiOmatic layer.
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#	                         Chiara Marmo    - Paris-Saclay
*/
import {Util} from 'leaflet';

import {UI} from './UI';


export const ImageUI = UI.extend({
	options: {
		title: 'Image preferences',
		collapsed: true,
		position: 'topleft'
	},

	initialize: function (options) {
		Util.setOptions(this, options);

		this._className = 'visiomatic-control';
		this._id = 'visiomatic-image';
		this._sideClass = 'image';
		this._initsettings = {};
	},

	// Copy image settings from layer
	saveSettings: function (layer, settings) {
		if (!settings) {
			return;
		}

		const	visio = layer.visio;
		settings.invertCMap = visio.invertCMap;
		settings.contrast = visio.contrast;
		settings.colorSat = visio.colorSat;
		settings.gamma = visio.gamma;
		settings.quality = visio.quality;
	},

	// Copy image settings back to layer and update widget values
	loadSettings: function (layer, settings) {
		if (!settings) {
			return;
		}

		const	visio = layer.visio;
		visio.invertCMap = settings.invertCMap;
		this._updateInput(this._input.invertCMap, settings.invertCMap);
		visio.contrast = settings.contrast;
		this._updateInput(this._input.contrast, settings.contrast);
		visio.colorSat = settings.colorSat;
		this._updateInput(this._input.colorSat, settings.colorSat);
		visio.gamma = settings.gamma;
		this._updateInput(this._input.gamma, settings.gamma);
		visio.quality = settings.quality;
		this._updateInput(this._input.quality, settings.quality);
	},

	_initDialog: function () {
		const	_this = this,
			className = this._className,
			layer = this._layer,
			visio = layer.visio,
			map = this._map;

		// _input will contain widget instances
		this._input = {};

		// copy initial image parameters from the layer object
		this.saveSettings(layer, this._initsettings);

		// Invert
		this._input.invertCMap = this._addSwitchInput(
			layer,
			this._dialog,
			'Invert:',
			'invertCMap',
			'Invert color map(s)',
			'leaflet-invertCMap',
			visio.invertCMap
		);

		// Contrast
		this._input.contrast = this._addNumericalInput(
			layer,
			this._dialog,
			'Contrast:',
			'contrast',
			'Adjust Contrast. 1.0: normal.',
			'leaflet-contrastValue',
			visio.contrast,
			0.05, 0.0, 10.0
		);

		// Colour saturation
		this._input.colorSat = this._addNumericalInput(
			layer,
			this._dialog,
			'Color Sat.:',
			'colorSat',
			'Adjust Color Saturation. 0: B&W, 1.0: normal.',
			'leaflet-colorsatvalue',
			visio.colorSat,
			0.05, 0.0, 5.0,
			this._updateMix
		);

		// Gamma
		this._input.gamma = this._addNumericalInput(
			layer,
			this._dialog,
			'Gamma:',
			'gamma',
			'Adjust Gamma correction. The standard value is 2.2.',
			'leaflet-gammavalue',
			visio.gamma,
			0.05, 0.5, 5.0
		);

		// JPEG quality
		this._input.quality = this._addNumericalInput(
			layer,
			this._dialog,
			'JPEG quality:',
			'quality',
			'Adjust JPEG compression quality. 1: lowest, 100: highest',
			'leaflet-qualvalue',
			visio.quality,
			1, 1, 100
		);

		// Reset settings button
		const line = this._addDialogLine('Reset:', this._dialog),
		    elem = this._addDialogElement(line);

		this._addButton(
			className + '-button',
			elem,
			'image-reset',
			function () {
				_this.loadSettings(layer, _this._initsettings);
				layer.updateMix();
				layer.redraw();
			},
			'Reset image settings'
		);

	},

	_updateMix: function (layer) {
		const	nchannel = layer.visio.nChannel;
		for (let c = 0; c < nchannel; c++) {
			layer.rgbToMix(c);
		}
		return;
	}

});

export const imageUI = function (options) {
	return new ImageUI(options);
};

