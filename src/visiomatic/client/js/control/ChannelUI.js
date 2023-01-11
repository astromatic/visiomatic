/**
 #	This file part of:	VisiOmatic
 * @file User Interface for managing the channels of a VisiOmatic layer.

 * @requires control/UI.js

 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/

import jQuery from 'jquery';
window.$ = window.jQuery = jQuery;

import {DomEvent, DomUtil, Util}  from 'leaflet';

import {UI} from './UI';


export const ChannelUI = UI.extend( /** @lends ChannelUI */ {
	options: {
		title: 'Channel mixing',
		mixingMode : undefined,
		cMap: 'grey',
		collapsed: true,
		position: 'topleft'
	},

	/**
	 * VisiOmatic dialog for managing the channels of a VisiOmatic layer.
	 * @extends UI
	 * @memberof module:control/ChannelUI.js
	 * @constructs
	 * @param {object} [options] - Options.

	 * @param {string} [options.title='Channel mixing']
	   Title of the dialog window or panel.

	 * @param {'grey'|'jet'|'cool'|'hot'} [options.color='grey']
	   Default color map in ``'mono'`` mixing mode.

	 * @param {'mono' | 'color'} [options.mixingMode]
	   Mixing mode: single channel (``'mono'``) or color mix (``'color'``).
	   Defaults to [layer settings]{@link VTileLayer}.

	 * @see {@link UI} for additional control options.

	 * @returns {ChannelUI} Instance of a channel mixing user interface.
	 */
	initialize: function (options) {
		Util.setOptions(this, options);

		this._className = 'visiomatic-control';
		this._id = 'visiomatic-channel';
		this._sideClass = 'channel';
		this._settings = [];
		this._initsettings = [];
	},

	/**
	 * Copy channel mixing settings from a VisiOmatic layer.
	 * @method
	 * @static
	 * @param {VTileLayer} layer
	   VisiOmatic layer.
	 * @param {object} settings
	   Object where to save the settings properties.
	 * @param {'mono' | 'color'} mode
	   Mixing mode: single channel (``'mono'``) or color mix (``'color'``).
	 */
	saveSettings: function (layer, settings, mode) {
		if (!settings[mode]) {
			settings[mode] = {};
		}

		const	visio = layer.visio,
			nchan = visio.nChannel,
			setting = settings[mode];

		setting.channel = visio.channel;
		setting.cMap = visio.cMap;
		setting.rgb = [];
		for (let c = 0; c < nchan; c++) {
			setting.rgb[c] = visio.rgb[c].clone();
		}
	},

	/**
	 * Copy channel mixing settings to a VisiOmatic layer.
	 * @method
	 * @static
	 * @param {VTileLayer} layer
	   VisiOmatic layer.
	 * @param {object} settings
	   Object where to save the settings properties.
	 * @param {'mono' | 'color'} mode
	   Mixing mode: single channel (``'mono'``) or color mix (``'color'``).
	 * @param {boolean} [keepChannel=false]
	   Overwrite the current layer channel?
	 */
	loadSettings: function (layer, settings, mode, keepChannel) {
		const	setting = settings[mode];

		if (!setting) {
			return;
		}

		const	visio = layer.visio,
			nchan = visio.nChannel,
			vrgb = visio.rgb,
			srgb = setting.rgb;

		if (!keepChannel) {
			visio.channel = setting.channel;
		}
		visio.cMap = setting.cMap;
		for (let c = 0; c < nchan; c++) {
			vrgb[c] = srgb[c].clone();
		}
	},

	/**
	 * Initialize the channel mixing dialog.
	 * @method
	 * @static
	 * @private
	 */
	_initDialog: function () {
		const _this = this,
			layer = this._layer,
			className = this._className,
			dialog = this._dialog;

		// copy initial VisiOmatic mixing parameters from the layer object
		this.saveSettings(layer, this._initsettings, 'mono');
		this.saveSettings(layer, this._initsettings, 'color');

		// copy current VisiOmatic mixing parameters from the layer object
		this.saveSettings(layer, this._settings, 'mono');
		this.saveSettings(layer, this._settings, 'color');

		this._mode = this.options.mixingMode ?
			this.options.mixingMode : layer.visio.mixingMode;

		const	box = this._addDialogBox(),
			modeline = this._addDialogLine('Mode:', box),
			modelem = this._addDialogElement(modeline),
			modeinput = DomUtil.create('div', className + '-radios', modelem);

		// Create Mode selection control section
		var modebutton = this._addRadioButton(
			className + '-radio',
			modeinput,
			'mono',
			(this._mode === 'mono'),
			'Select mono-channel palettized mode',
			function () {
				// Save previous settings 
				_this.saveSettings(layer, _this._settings, _this._mode);

				// Remove previous dialogs
				for (let elem = box.lastChild;
					elem !== modeline;
					elem = box.lastChild) {
					box.removeChild(elem);
				}
				for (let elem = dialog.lastChild;
					elem !== box;
					elem = dialog.lastChild) {
					dialog.removeChild(elem);
				}
				_this._channelList = undefined;
				_this.loadSettings(layer, _this._settings, 'mono');
				_this._initMonoDialog(layer, box);
				_this._mode = 'mono';
			}
		);

		var	modebutton = this._addRadioButton(
			className + '-radio',
			modeinput,
			'color',
			(this._mode !== 'mono'),
			'Select color mixing mode',
			function () {
				// Save previous settings 
				_this.saveSettings(layer, _this._settings, _this._mode);
				// Remove previous dialogs
				for (let elem = box.lastChild;
					elem !== modeline;
					elem = box.lastChild) {
					box.removeChild(elem);
				}
				for (let elem = dialog.lastChild;
					elem !== box;
					elem = dialog.lastChild) {
					dialog.removeChild(elem);
				}
				_this.loadSettings(layer, _this._settings, 'color');
				_this._channelList = undefined;
				_this._initColorDialog(layer, box);
				_this._mode = 'color';
			}
		);

		if (_this._mode === 'mono') {
			_this._initMonoDialog(layer, box);
		} else {
			_this._initColorDialog(layer, box);
		}
	},

	/**
	 * Initialize the ``'mono'`` flavor of the channel mixing dialog.
	 * @method
	 * @static
	 * @private
	 * @param {VTileLayer} layer
	   VisiOmatic layer.
	 * @param {object} box
	   The parent box element.
	 */
	_initMonoDialog: function (layer, box) {
		// Single Channels with colour map
		const	_this = this,
			channels = layer.visio.channelLabels,
			className = this._className;

		var	line = this._addDialogLine('Channel:', box),
			elem = this._addDialogElement(line);

		layer.updateMono();

		this._chanSelect = this._addSelectMenu(
			this._className + '-select',
			elem,
			layer.visio.channelLabels,
			undefined,
			layer.visio.channel,
			'Select image channel',
			function () {
				layer.visio.channel = parseInt(
					this._chanSelect.selectedIndex - 1,
					10
				);
				this._updateChannel(layer, layer.visio.channel);
				layer.redraw();
			}
		);

		var line = this._addDialogLine('LUT:', box),
			elem = this._addDialogElement(line);

		const	cmapinput = DomUtil.create('div', className + '-cmaps', elem),
			cbutton = [],
			cmaps = ['grey', 'jet', 'cold', 'hot'],
			_changeMap = function (value) {
				_this._onInputChange(layer, 'cMap', value);
			};

		for (let c in cmaps) {
			cbutton[c] = this._addRadioButton(
				'leaflet-cmap',
				cmapinput,
				cmaps[c],
				(cmaps[c] === this.options.cMap),
				'"' + cmaps[c].charAt(0).toUpperCase() + cmaps[c].substr(1) +
					'" color-map',
				_changeMap
			);
		}

		this._addMinMax(layer, layer.visio.channel, box);
		layer.redraw();
	},
 
	/**
	 * Initialize the ``'color'`` flavor of the channel mixing dialog.
	 * @method
	 * @static
	 * @private
	 * @param {VTileLayer} layer
	   VisiOmatic layer.
	 * @param {object} box
	   The parent box element.
	 */
	_initColorDialog: function (layer, box) {
		// Multiple Channels with mixing matrix

		const	_this = this,
			visio = layer.visio,
			className = this._className,
			line = this._addDialogLine('Channel:', box),
			elem = this._addDialogElement(line),
			colpick = this._chanColPick = this._addColorPicker(
				className + '-color',
				elem,
				'channel',
				visio.rgb[visio.channel].toStr(),
				'visiomaticChannel',
				'Click to set channel color',
				function () {
					const	chan = visio.channel,
				    hex = $(colpick).val();
					_this._updateMix(layer, chan, rgb(hex));
					_this.collapsedOff = true;
				}
			);

		this._onInputChange(layer, 'cMap', 'grey');
		layer.updateMix();

		this._chanSelect = this._addSelectMenu(
			this._className + '-select',
			elem,
			visio.channelLabels,
			undefined,
			visio.channel,
			'Select image channel',
			function () {
				visio.channel =  this._chanSelect.selectedIndex - 1;
				this._updateChannel(layer, visio.channel, colpick);
			}
		);

		this._addMinMax(layer, visio.channel, box);

		const line2 = this._addDialogLine('Colors:', box),
			elem2 = this._addDialogElement(line2);

		// Create reset color settings button
		this._addButton(
			className + '-button',
			elem2,
			'colormix-reset',
			'Reset color mix',
			function () {
				_this.loadSettings(layer, _this._initsettings, 'color', true);
				layer.updateMix();
				this._updateColPick(layer);
				this._updateChannelList(layer);
				layer.redraw();
			}
		);

		// Create automated color settings button
		this._addButton(
			className + '-button',
			elem2,
			'colormix-auto',
			'Re-color active channels',
			function () {
				const	nchan = visio.nChannel,
					rgb = visio.rgb,
					defcol = layer.visioDefault.channelColors;
				let	cc = 0,
					nchanon = 0;

				for (let c = 0; c < nchan; c++) {
					if (rgb[c].isOn()) {
						nchanon++;
					}
				}
				if (nchanon >= defcol.length) {
					nchanon = defcol.length - 1;
				}

				for (let c = 0; c < nchan; c++) {
					if (rgb[c].isOn() && cc < nchanon) {
						rgb[c] = rgb(defcol[nchanon][cc++]);
					}
				}
				layer.updateMix();
				this._updateColPick(layer);
				this._updateChannelList(layer);
				layer.redraw();

			}
		);


		_this._updateChannelList(layer);
		layer.redraw();
	},

	/**
	 * Add a pair of spinboxes for setting the min and max clipping limits of
	   pixel values.
	 * @method
	 * @static
	 * @private
	 * @param {VTileLayer} layer
	   VisiOmatic layer.
	 * @param {number} channel
	   Image channel.
	 * @param {object} box
	   The parent box element.
	 */
	_addMinMax: function (layer, channel, box) {
		const	visio = layer.visio,
			step = this._spinboxStep(
				visio.minValue[channel],
				visio.maxValue[channel]
			);

		// Min
		this._minElem = this._addNumericalInput(
			layer,
			'minValue[' + channel + ']',
			box,
			'Min:',
			'Lower clipping limit in ' + visio.channelUnits[channel] + '.',
			visio.minValue[channel], step
		);

		// Max
		this._maxElem = this._addNumericalInput(
			layer,
			'maxValue[' + channel + ']',
			box,
			'Upper clipping limit in ' + visio.channelUnits[channel] + '.',
			'Max:',
			visio.maxValue[channel], step
		);
	},

	/**
	   Set/update the channel controls for a given channel.
	 * @method
	 * @static
	 * @private
	 * @param {VTileLayer} layer
	   VisiOmatic layer.
	 * @param {number} channel
	   Image channel.
	 * @param {object) colorElem
	   Color patch element (if present).
	 */
	_updateChannel: function (layer, channel, colorElem=undefined) {
		const	_this = this,
			visio = layer.visio,
			step = this._spinboxStep(
				visio.minValue[channel],
				visio.maxValue[channel]);
		_this._chanSelect.selectedIndex = channel + 1;
		if (colorElem) {
			$(colorElem).spectrum('set', visio.rgb[channel].toStr());
			$(colorElem)
				.val(visio.rgb[channel].toStr())
				.off('change')
				.on('change', function () {
					_this._updateMix(layer, channel, rgb($(colorElem).val()));
				});
		}

		this._minElem.spinbox
			.value(visio.minValue[channel])
			.step(step)
			.off('change')
			.on('change', function () {
				_this._onInputChange(
					layer, 'minValue[' + channel + ']',
					_this._minElem.spinbox.value()
				);
			}, this);

		this._maxElem.spinbox
			.value(visio.maxValue[channel])
			.step(step)
			.off('change')
			.on('change', function () {
				_this._onInputChange(
					layer, 'maxValue[' + channel + ']',
					_this._maxElem.spinbox.value()
				);
			}, this);
	},

	/**
	   Update the color mixing matrix with the RGB contribution of a given
	   channel and redraw the VisiOmatic layer.
	 * @method
	 * @static
	 * @private
	 * @param {VTileLayer} layer
	   VisiOmatic layer.
	 * @param {number} channel
	   Image channel.
	 * @param {RGB} rgb
	   RGB color.
	 */
	_updateMix: function (layer, channel, rgb) {
		layer.rgbToMix(channel, rgb);
		this._updateChannelList(layer);
		layer.redraw();
	},

	/**
	   Update the list of channels in the dialog.
	 * @method
	 * @static
	 * @private
	 * @param {VTileLayer} layer
	 * VisiOmatic layer.
	 */
	_updateChannelList: function (layer) {
		const	visio = layer.visio,
			chanLabels = visio.channelLabels;
		let	chanList = this._channelList,
			chanElems = this._channelElems,
			trashElems = this._trashElems;
		if (chanList) {
		/*
			for (c in chanElems) {
				DomEvent.off(chanElems[c], 'click touch');
				DomEvent.off(trashElems[c], 'click touch');
			}
		*/
			DomUtil.empty(this._channelList);
		} else {
			chanList = this._channelList = DomUtil.create(
				'div',
				this._className + '-chanlist',
				this._dialog
			);
		}

		chanElems = this._channelElems = [];
		trashElems = this._trashElems = [];

		for (let c in chanLabels) {
			var	chan = parseInt(c, 10),
				rgb = visio.rgb[chan];
			if (rgb.isOn()) {
				var	chanElem = DomUtil.create(
						'div',
						this._className + '-channel',
						chanList
					),
					color = DomUtil.create(
						'div',
						this._className + '-chancolor',
						chanElem
					);
				color.style.backgroundColor = rgb.toStr();
				this._activateChanElem(color, layer, chan);
				var	label = DomUtil.create(
					'div',
					this._className + '-chanlabel',
					chanElem
				);
				label.innerHTML = chanLabels[c];
				this._activateChanElem(label, layer, chan);
				var	trashElem = this._addButton(
					'visiomatic-control-trash',
					chanElem,
					undefined,
					'Delete channel'
				);
				this._activateTrashElem(trashElem, layer, chan);
				chanElems.push(chanElem);
				trashElems.push(trashElem);
			}
		}
	},

	/**
	   Update the color picker value based on the current layer color.
	 * @method
	 * @static
	 * @private
	 * @param {VTileLayer} layer
	   VisiOmatic layer.
	 */
	_updateColPick: function (layer) {
		const	visio = layer.visio;
		$(this._chanColPick).spectrum('set', visio.rgb[visio.channel].toStr());
		$(this._chanColPick).val(visio.rgb[visio.channel].toStr());
	},

	/**
	   Add listener to a trash element for blackening the current channel color
	   of a given VisiOmatic layer.
	 * @method
	 * @static
	 * @private
	 * @param {object} trashElem
	   Trash element.
	 * @param {VTileLayer} layer
	   VisiOmatic layer.
	 * @param {number} channel
	   Image channel.
	 */
	_activateTrashElem: function (trashElem, layer, channel) {
		DomEvent.on(trashElem, 'click touch', function () {
			this._updateMix(layer, channel, rgb(0.0, 0.0, 0.0));
			if (layer === this._layer && channel === layer.visio.channel) {
				this._updateColPick(layer);
			}
		}, this);
	},

	/**
	   Add listener to a channel element for setting the current channel
	   of a given VisiOmatic layer.
	 * @method
	 * @static
	 * @private
	 * @param {object} trashElem
	   Trash element.
	 * @param {VTileLayer} layer
	   VisiOmatic layer.
	 * @param {number} channel
	   Image channel.
	 */
	_activateChanElem: function (chanElem, layer, channel) {
		DomEvent.on(chanElem, 'click touch', function () {
			layer.visio.channel = channel;
			this._updateChannel(layer, channel, this._chanColPick);
		}, this);
	}

});

/**
 * Instantiate a VisiOmatic dialog for managing channels in a VisiOmatic layer.
 * @function
 * @param {object} [options] - Options: see {@link ChannelUI}
 * @returns {ChannelUI} Instance of a channel mixing user interface.
 */
export const channelUI = function (options) {
	return new ChannelUI(options);
};

