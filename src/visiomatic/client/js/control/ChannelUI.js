/*
#	UI for channel mixing in a VisiOmatic layer.
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#	                         Chiara Marmo    - Paris-Saclay
*/
import jQuery from 'jquery';
window.$ = window.jQuery = jQuery;

import {DomEvent, DomUtil, Util}  from 'leaflet';

import {UI} from './UI';


export const ChannelUI = UI.extend({
	options: {
		title: 'Channel mixing',
		collapsed: true,
		cMap: 'grey',
		mixingMode : null,	//	'color' or 'mono' (or null for layer settings)
		position: 'topleft',
	},

	initialize: function (mode, options) {
		Util.setOptions(this, options);

		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipchannel';
		this._sideClass = 'channel';
		this._settings = [];
		this._initsettings = [];
	},

	// Copy channel mixing settings from layer
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

	// Copy channel mixing settings to layer
	loadSettings: function (layer, settings, mode, keepchanflag) {
		const	setting = settings[mode];

		if (!setting) {
			return;
		}

		const	visio = layer.visio,
			nchan = visio.nChannel,
			vrgb = visio.rgb,
			srgb = setting.rgb;

		if (!keepchanflag) {
			visio.channel = setting.channel;
		}
		visio.cMap = setting.cMap;
		for (let c = 0; c < nchan; c++) {
			vrgb[c] = srgb[c].clone();
		}
	},

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
			this.options.mixingMode : layer.visio.mode;

		const	box = this._addDialogBox(),
			modeline = this._addDialogLine('Mode:', box),
			modelem = this._addDialogElement(modeline),
			modeinput = DomUtil.create('div', className + '-radios', modelem);

		// Create Mode selection control section
		var modebutton = this._createRadioButton(
			className + '-radio',
			modeinput,
			'mono',
			(this._mode === 'mono'),
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
			}, 'Select mono-channel palettized mode'
		);

		var	modebutton = this._createRadioButton(
			className + '-radio',
			modeinput,
			'color',
			(this._mode !== 'mono'),
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
			}, 'Select color mixing mode'
		);

		if (_this._mode === 'mono') {
			_this._initMonoDialog(layer, box);
		} else {
			_this._initColorDialog(layer, box);
		}
	},

	_initMonoDialog: function (layer, box) {
		// Single Channels with colour map
		const	_this = this,
			channels = layer.visio.channelLabels,
			className = this._className;

		var	line = this._addDialogLine('Channel:', box),
			elem = this._addDialogElement(line);

		layer.updateMono();

		this._chanSelect = this._createSelectMenu(
			this._className + '-select',
			elem,
			layer.visio.channelLabels,
			undefined,
			layer.visio.channel,
			function () {
				layer.visio.channel = parseInt(
					this._chanSelect.selectedIndex - 1,
					10
				);
				this._updateChannel(layer, layer.visio.channel);
				layer.redraw();
			},
			'Select image channel'
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
			cbutton[c] = this._createRadioButton(
				'leaflet-cmap',
				cmapinput,
				cmaps[c],
				(cmaps[c] === this.options.cMap),
				_changeMap,
				'"' + cmaps[c].charAt(0).toUpperCase() + cmaps[c].substr(1) +
					'" color-map');
		}

		this._addMinMax(layer, layer.visio.channel, box);
		layer.redraw();
	},
 
	_initColorDialog: function (layer, box) {
		// Multiple Channels with mixing matrix

		const	_this = this,
			visio = layer.visio,
			className = this._className,
			line = this._addDialogLine('Channel:', box),
			elem = this._addDialogElement(line),
			colpick = this._chanColPick = this._createColorPicker(
				className + '-color',
				elem,
				'channel',
				visio.rgb[visio.channel].toStr(),
				function () {
					const	chan = visio.channel,
				    hex = $(colpick).val();
					_this._updateMix(layer, chan, rgb(hex));
					_this.collapsedOff = true;
				},
				'visiomaticChannel',
				'Click to set channel color'
			);

		this._onInputChange(layer, 'cMap', 'grey');
		layer.updateMix();

		this._chanSelect = this._createSelectMenu(
			this._className + '-select',
			elem,
			visio.channelLabels,
			undefined,
			visio.channel,
			function () {
				visio.channel =  this._chanSelect.selectedIndex - 1;
				this._updateChannel(layer, visio.channel, colpick);
			},
			'Select image channel'
		);

		this._addMinMax(layer, visio.channel, box);

		const line2 = this._addDialogLine('Colors:', box),
			elem2 = this._addDialogElement(line2);

		// Create reset color settings button
		this._createButton(
			className + '-button',
			elem2,
			'colormix-reset',
			function () {
				_this.loadSettings(layer, _this._initsettings, 'color', true);
				layer.updateMix();
				this._updateColPick(layer);
				this._updateChannelList(layer);
				layer.redraw();
			},
			'Reset color mix'
		);

		// Create automated color settings button
		this._createButton(
			className + '-button',
			elem2,
			'colormix-auto',
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

			},
			'Re-color active channels'
		);


		_this._updateChannelList(layer);
		layer.redraw();
	},

	// Add Spinboxes for setting the min and max clipping limits of pixel values
	_addMinMax: function (layer, chan, box) {
		const	visio = layer.visio,
			step = this._spinboxStep(
				visio.minValue[chan],
				visio.maxValue[chan]
			);

		// Min
		this._minElem = this._addNumericalInput(
			layer,
			box,
			'Min:',
			'minValue[' + chan + ']',
			'Lower clipping limit in ' + visio.channelUnits[chan] + '.',
			'leaflet-channel-minvalue',
			visio.minValue[chan],
			step
		);

		// Max
		this._maxElem = this._addNumericalInput(
			layer,
			box,
			'Max:',
			'maxValue[' + chan + ']',
			'Upper clipping limit in ' + visio.channelUnits[chan] + '.',
			'leaflet-channel-maxvalue',
		 	visio.maxValue[chan],
		 	step
		);
	},

	_updateChannel: function (layer, chan, colorElem) {
		const	_this = this,
			visio = layer.visio,
			step = this._spinboxStep(
				visio.minValue[chan],
				visio.maxValue[chan]);
		_this._chanSelect.selectedIndex = chan + 1;
		if (colorElem) {
			$(colorElem).spectrum('set', visio.rgb[chan].toStr());
			$(colorElem)
				.val(visio.rgb[chan].toStr())
				.off('change')
				.on('change', function () {
					_this._updateMix(layer, chan, rgb($(colorElem).val()));
				});
		}

		this._minElem.spinbox
			.value(visio.minValue[chan])
			.step(step)
			.off('change')
			.on('change', function () {
				_this._onInputChange(
					layer, 'minValue[' + chan + ']',
					_this._minElem.spinbox.value()
				);
			}, this);

		this._maxElem.spinbox
			.value(visio.maxValue[chan])
			.step(step)
			.off('change')
			.on('change', function () {
				_this._onInputChange(
					layer, 'maxValue[' + chan + ']',
					_this._maxElem.spinbox.value()
				);
			}, this);
	},

	_updateMix: function (layer, chan, rgb) {
		layer.rgbToMix(chan, rgb);
		this._updateChannelList(layer);
		layer.redraw();
	},

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
				var	trashElem = this._createButton(
					'leaflet-control-iip-trash',
					chanElem,
					undefined,
					undefined,
					'Delete channel'
				);
				this._activateTrashElem(trashElem, layer, chan);
				chanElems.push(chanElem);
				trashElems.push(trashElem);
			}
		}
	},

	_updateColPick: function (layer) {
		const	visio = layer.visio;
		$(this._chanColPick).spectrum('set', visio.rgb[visio.channel].toStr());
		$(this._chanColPick).val(visio.rgb[visio.channel].toStr());
	},

	_activateTrashElem: function (trashElem, layer, chan) {
		DomEvent.on(trashElem, 'click touch', function () {
			this._updateMix(layer, chan, rgb(0.0, 0.0, 0.0));
			if (layer === this._layer && chan === layer.visio.channel) {
				this._updateColPick(layer);
			}
		}, this);
	},

	_activateChanElem: function (chanElem, layer, chan) {
		DomEvent.on(chanElem, 'click touch', function () {
			layer.visio.channel = chan;
			this._updateChannel(layer, chan, this._chanColPick);
		}, this);
	}

});

export const channelUI = function (options) {
	return new ChannelUI(options);
};

