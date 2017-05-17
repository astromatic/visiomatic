/*
# L.Control.IIP.Channel manages the channel mixing of an IIP layer
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	VisiOmatic
#
#	Copyright:		(C) 2014-2016 IAP/CNRS/UPMC and GEOPS/Paris-Sud
#
#	Last modified:		18/07/2016
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery');
}

L.Control.IIP.Channel = L.Control.IIP.extend({
	options: {
		title: 'Channel mixing',
		collapsed: true,
		cMap: 'grey',
		mixingMode : null,	//	'color' or 'mono' (or null for layer settings)
		position: 'topleft',
	},

	initialize: function (mode, options) {
		L.setOptions(this, options);

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

		var setting = settings[mode],
			nchan = layer.iipNChannel;

		setting.channel = layer.iipChannel;
		setting.cMap = layer.iipCMap;
		setting.rgb = [];
		for (var c = 0; c < nchan; c++) {
			setting.rgb[c] = layer.iipRGB[c].clone();
		}
	},

	// Copy channel mixing settings to layer
	loadSettings: function (layer, settings, mode) {
		var setting = settings[mode],
			nchan = layer.iipNChannel;

		if (!setting) {
			return;
		}

		layer.iipChannel = setting.channel;
		layer.iipCMap = setting.cMap;
		for (var c = 0; c < nchan; c++) {
			layer.iipRGB[c] = setting.rgb[c].clone();
		}
	},

	_initDialog: function () {
		var _this = this,
			layer = this._layer,
			className = this._className,
			dialog = this._dialog;

		// copy initial IIP mixing parameters from the layer object
		this.saveSettings(layer, this._initsettings, 'mono');
		this.saveSettings(layer, this._initsettings, 'color');

		// copy current IIP mixing parameters from the layer object
		this.saveSettings(layer, this._settings, 'mono');
		this.saveSettings(layer, this._settings, 'color');

		this._mode = this.options.mixingMode ?
		  this.options.mixingMode : layer.iipMode;

		var	box = this._addDialogBox(),
			modeline = this._addDialogLine('Mode:', box),
			modelem = this._addDialogElement(modeline),
			modeinput = L.DomUtil.create('div', className + '-radios', modelem),
			elem, modebutton;

		// Create Mode selection control section
		modebutton = this._createRadioButton(className + '-radio', modeinput, 'mono',
		  (this._mode === 'mono'), function () {
			// Save previous settings 
			_this.saveSettings(layer, _this._settings, _this._mode);

			// Remove previous dialogs
			for (elem = box.lastChild; elem !== modeline; elem = box.lastChild) {
				box.removeChild(elem);
			}
			for (elem = dialog.lastChild; elem !== box; elem = dialog.lastChild) {
				dialog.removeChild(elem);
			}
			_this._channelList = undefined;
			_this.loadSettings(layer, _this._settings, 'mono');
			_this._initMonoDialog(layer, box);
			_this._mode = 'mono';
		}, 'Select mono-channel palettized mode');

		modebutton = this._createRadioButton(className + '-radio', modeinput, 'color',
		  (this._mode !== 'mono'), function () {
			// Save previous settings 
			_this.saveSettings(layer, _this._settings, _this._mode);
			// Remove previous dialogs
			for (elem = box.lastChild; elem !== modeline; elem = box.lastChild) {
				box.removeChild(elem);
			}
			for (elem = dialog.lastChild; elem !== box; elem = dialog.lastChild) {
				dialog.removeChild(elem);
			}
			_this.loadSettings(layer, _this._settings, 'color');
			_this._channelList = undefined;
			_this._initColorDialog(layer, box);
			_this._mode = 'color';
		}, 'Select color mixing mode');

		if (_this._mode === 'mono') {
			_this._initMonoDialog(layer, box);
		} else {
			_this._initColorDialog(layer, box);
		}
	},

	_initMonoDialog: function (layer, box) {
		// Single Channels with colour map
		var _this = this,
			channels = layer.iipChannelLabels,
			className = this._className,
			line = this._addDialogLine('Channel:', box),
			elem = this._addDialogElement(line);

		layer.updateMono();

		this._chanSelect = this._createSelectMenu(
			this._className + '-select',
			elem,
			layer.iipChannelLabels,
			undefined,
			layer.iipChannel,
			function () {
				layer.iipChannel =  parseInt(this._chanSelect.selectedIndex - 1, 10);
				this._updateChannel(layer, layer.iipChannel);
				layer.redraw();
			},
			'Select image channel'
		);

		line = this._addDialogLine('LUT:', box);
		elem = this._addDialogElement(line);

		var	cmapinput = L.DomUtil.create('div', className + '-cmaps', elem),
			cbutton = [],
			cmaps = ['grey', 'jet', 'cold', 'hot'],
			_changeMap = function () {
				_this._onInputChange(layer, 'iipCMap', this);
			},
			i;
		for (i in cmaps) {
			cbutton[i] = this._createRadioButton('leaflet-cmap', cmapinput, cmaps[i],
			  (cmaps[i] === this.options.cMap), _changeMap,
			  '"' + cmaps[i].charAt(0).toUpperCase() + cmaps[i].substr(1) +  '" color-map');
		}

		this._addMinMax(layer, layer.iipChannel, box);
		layer.redraw();
	},
 
	_initColorDialog: function (layer, box) {
		// Multiple Channels with mixing matrix

		var _this = this,
			className = this._className,
			line = this._addDialogLine('Channel:', box),
			elem = this._addDialogElement(line),
			colpick = this._chanColPick = this._createColorPicker(
				className + '-color',
				elem,
				'channel',
			  layer.iipRGB[layer.iipChannel].toStr(),
				function () {
					var chan = layer.iipChannel,
				    hex = $(colpick).val();
					_this._updateMix(layer, chan, L.rgb(hex));
					_this.collapsedOff = true;
				},
				'iipChannel',
				'Click to set channel color'
			);

		this._onInputChange(layer, 'iipCMap', 'grey');
		layer.updateMix();

		this._chanSelect = this._createSelectMenu(
			this._className + '-select',
			elem,
			layer.iipChannelLabels,
			undefined,
			layer.iipChannel,
			function () {
				layer.iipChannel =  this._chanSelect.selectedIndex - 1;
				this._updateChannel(layer, layer.iipChannel, colpick);
			},
			'Select image channel'
		);

		this._addMinMax(layer, layer.iipChannel, box);

		line = this._addDialogLine('Colors:', box);
		elem = this._addDialogElement(line);

		// Create reset color settings button
		this._createButton(className + '-button', elem, 'colormix-reset', function () {
			_this.loadSettings(layer, _this._initsettings, 'color');
			layer.updateMix();
			this._updateColPick(layer);
			this._updateChannelList(layer);
			layer.redraw();
		}, 'Reset color mix');

		// Create automated color settings button
		this._createButton(className + '-button', elem, 'colormix-auto', function () {
			var	nchan = layer.iipNChannel,
				cc = 0,
				nchanon = 0,
				rgb = layer.iipRGB,
				defcol = layer.iipdefault.channelColors;

			for (var c = 0; c < nchan; c++) {
				if (rgb[c].isOn()) {
					nchanon++;
				}
			}
			if (nchanon >= defcol.length) {
				nchanon = defcol.length - 1;
			}

			for (c = 0; c < nchan; c++) {
				if (rgb[c].isOn() && cc < nchanon) {
					rgb[c] = L.rgb(defcol[nchanon][cc++]);
				}
			}
			layer.updateMix();
			this._updateColPick(layer);
			this._updateChannelList(layer);
			layer.redraw();

		}, 'Re-color active channels');


		_this._updateChannelList(layer);
		layer.redraw();
	},

	// Add Spinboxes for setting the min and max clipping limits of pixel values
	_addMinMax: function (layer, chan, box) {
		var	step = this._spinboxStep(layer.iipMinValue[chan], layer.iipMaxValue[chan]);

		// Min
		this._minElem = this._addNumericalInput(layer, box, 'Min:',
		  'iipMinValue[' + chan + ']',
		  'Lower clipping limit in ' + layer.iipChannelUnits[chan] + '.',
		  'leaflet-channel-minvalue', layer.iipMinValue[chan], step);

		// Max
		this._maxElem = this._addNumericalInput(layer, box, 'Max:',
			'iipMaxValue[' + chan + ']',
		  'Upper clipping limit in ' + layer.iipChannelUnits[chan] + '.',
		  'leaflet-channel-maxvalue', layer.iipMaxValue[chan], step);
	},

	_updateChannel: function (layer, chan, colorElem) {
		var _this = this,
			  step = this._spinboxStep(layer.iipMinValue[chan], layer.iipMaxValue[chan]);
		_this._chanSelect.selectedIndex = chan + 1;
		if (colorElem) {
			$(colorElem).spectrum('set', layer.iipRGB[chan].toStr());
			$(colorElem)
				.val(layer.iipRGB[chan].toStr())
				.off('change')
				.on('change', function () {
					_this._updateMix(layer, chan, L.rgb($(colorElem).val()));
				});
		}

		this._minElem.spinbox
			.value(layer.iipMinValue[chan])
			.step(step)
			.off('change')
			.on('change', function () {
				_this._onInputChange(layer, 'iipMinValue[' + chan + ']',
				_this._minElem.spinbox.value());
			}, this);

		this._maxElem.spinbox
			.value(layer.iipMaxValue[chan])
			.step(step)
			.off('change')
			.on('change', function () {
				_this._onInputChange(layer, 'iipMaxValue[' + chan + ']',
				_this._maxElem.spinbox.value());
			}, this);
	},

	_updateMix: function (layer, chan, rgb) {
		layer.rgbToMix(chan, rgb);
		this._updateChannelList(layer);
		layer.redraw();
	},

	_updateChannelList: function (layer) {
		var chanLabels = layer.iipChannelLabels,
		    chanList = this._channelList,
				chanElems = this._channelElems,
				trashElems = this._trashElems,
		    chanElem, trashElem, rgb, color, label, c, chan;
		if (chanList) {
/*
			for (c in chanElems) {
				L.DomEvent.off(chanElems[c], 'click touch');
				L.DomEvent.off(trashElems[c], 'click touch');
			}
*/
			L.DomUtil.empty(this._channelList);
		} else {
			chanList = this._channelList = L.DomUtil.create('div', this._className + '-chanlist',
			  this._dialog);
		}

		chanElems = this._channelElems = [];
		trashElems = this._trashElems = [];

		for (c in chanLabels) {
			chan = parseInt(c, 10);
			rgb = layer.iipRGB[chan];
			if (rgb.isOn()) {
				chanElem = L.DomUtil.create('div', this._className + '-channel', chanList);
				color = L.DomUtil.create('div', this._className + '-chancolor', chanElem);
				color.style.backgroundColor = rgb.toStr();
				this._activateChanElem(color, layer, chan);
				label = L.DomUtil.create('div', this._className + '-chanlabel', chanElem);
				label.innerHTML = chanLabels[c];
				this._activateChanElem(label, layer, chan);
				trashElem = this._createButton('leaflet-control-iip-trash', chanElem,
					undefined, undefined, 'Delete channel');
				this._activateTrashElem(trashElem, layer, chan);
				chanElems.push(chanElem);
				trashElems.push(trashElem);
			}
		}
	},

	_updateColPick: function (layer) {
		$(this._chanColPick).spectrum('set', layer.iipRGB[layer.iipChannel].toStr());
		$(this._chanColPick).val(layer.iipRGB[layer.iipChannel].toStr());
	},

	_activateTrashElem: function (trashElem, layer, chan) {
		L.DomEvent.on(trashElem, 'click touch', function () {
			this._updateMix(layer, chan, L.rgb(0.0, 0.0, 0.0));
			if (layer === this._layer && chan === layer.iipChannel) {
				this._updateColPick(layer);
			}
		}, this);
	},

	_activateChanElem: function (chanElem, layer, chan) {
		L.DomEvent.on(chanElem, 'click touch', function () {
			this._updateChannel(layer, chan, this._chanColPick);
		}, this);
	}

});

L.control.iip.channel = function (options) {
	return new L.Control.IIP.Channel(options);
};

