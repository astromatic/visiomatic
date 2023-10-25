/**
 #	This file part of:	VisiOmatic
 * @file User Interface for setting the rendering of a VisiOmatic layer.

 * @requires control/UI.js

 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/
import {Util} from 'leaflet';

import {UI} from './UI';


export const ImageUI = UI.extend( /** @lends ImageUI */ {
	options: {
		title: 'Image preferences',
		collapsed: true,
		position: 'topleft'
	},

	/**
	 * Create a VisiOmatic dialog for setting the VisiOmatic layer rendering.

	 * @extends UI
	 * @memberof module:control/ImageUI.js
	 * @constructs
	 * @param {object} [options] - Options.

	 * @param {string} [options.title='Image preferences']
	   Title of the dialog window or panel.

	 * @see {@link UI} for additional control options.

	 * @returns {ImageUI} Instance of a user interface for the rendering
	 * preferences.
	 */
	initialize: function (options) {
		Util.setOptions(this, options);

		this._className = 'visiomatic-control';
		this._id = 'visiomatic-image';
		this._sideClass = 'image';
		this._initsettings = {};
	},

	/**
	 * Copy rendering settings from a VisiOmatic layer.
	 * @param {VTileLayer} layer
	   VisiOmatic layer.
	 * @param {object} settings
	   Object where to save the settings properties.
	 */
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

	/**
	 * Copy rendering settings to a VisiOmatic layer.
	 * @param {VTileLayer} layer
	   VisiOmatic layer.
	 * @param {object} settings
	   Object where to save the settings properties.
	 */
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

	/**
	 * Initialize the rendering preference dialog.
	 * @private
	 */
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
			'invertCMap',
			this._dialog,
			'Invert:',
			'Invert color map(s)',
			visio.invertCMap
		);

		// Contrast
		this._input.contrast = this._addNumericalInput(
			layer,
			'contrast',
			this._dialog,
			'Contrast:',
			'Adjust Contrast. 1.0: normal',
			visio.contrast,
			0.05,
			0.0, 100.0
		);

		// Colour saturation
		this._input.colorSat = this._addNumericalInput(
			layer,
			'colorSat',
			this._dialog,
			'Color Sat.:',
			'Adjust Color Saturation. 0: B&W, 1.0: normal',
			visio.colorSat,
			0.05,
			0.0, 5.0,
			layer.updateMix
		);

		// Gamma
		this._input.gamma = this._addNumericalInput(
			layer,
			'gamma',
			this._dialog,
			'Gamma:',
			'Adjust Gamma correction. The standard value is 2.2',
			visio.gamma,
			0.05,
			0.5, 5.0
		);

		// JPEG quality
		this._input.quality = this._addNumericalInput(
			layer,
			'quality',
			this._dialog,
			'JPEG quality:',
			'Adjust JPEG compression quality. 1: lowest, 100: highest',
			visio.quality,
			1,
			1, 100
		);

		// Reset settings button
		const line = this._addDialogLine('Reset:', this._dialog),
		    elem = this._addDialogElement(line);

		this._addButton(
			className + '-button',
			elem,
			'image-reset',
			'Reset image settings',
			function () {
				_this.loadSettings(layer, _this._initsettings);
				if (layer.visio === 'color') {
					layer.updateMix();
				}
				layer.redraw();
			}
		);

	}

});

/**
 * Instantiate a VisiOmatic dialog for setting the rendering of a VisiOmatic
 * layer.
 * @function
 * @param {object} [options] - Options: see {@link ImageUI}
 * @returns {ImageUI} Instance of a user interface for the rendering
 * preferences.
 */
export const imageUI = function (options) {
	return new ImageUI(options);
};

