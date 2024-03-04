/**
 #	This file part of:	VisiOmatic
 * @file User Interface for managing the channels of a VisiOmatic layer.

 * @requires control/UI.js

 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/

import {DomEvent, DomUtil, Util}  from 'leaflet';

import {rgb} from '../util';
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
	 * Create a VisiOmatic dialog for managing the VisiOmatic layer channels.

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
			setting = settings[mode];

		setting.channel = visio.channel;
		setting.cMap = visio.cMap;
		setting.rgb = [];
		for (let c in visio.rgb) {
			setting.rgb[c] = visio.rgb[c].clone();
		}
	},

	/**
	 * Copy channel mixing settings to a VisiOmatic layer.
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
			vrgb = visio.rgb,
			srgb = setting.rgb;

		if (!keepChannel) {
			visio.channel = setting.channel;
		}
		visio.cMap = setting.cMap;
		for (let c in srgb) {
			vrgb[c] = srgb[c].clone();
		}
	},

	/**
	 * Initialize the channel mixing dialog.
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
		this._addRadioButton(
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
		this._addRadioButton(
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
	 * @private
	 * @param {VTileLayer} layer
	   VisiOmatic layer.
	 * @param {object} box
	   The parent box element.
	 */
	_initMonoDialog: function (layer, box) {
		// Single Channels with colour map
		const	_this = this,
			visio = layer.visio,
			channels = layer.visio.channelLabels,
			className = this._className;


		layer.updateMono();

		if (visio.nChannel > 1) {
			const	line = this._addDialogLine('Channel:', box),
				elem = this._addDialogElement(line);

			this._chanSelect = this._addSelectMenu(
				this._className + '-select',
				elem,
				visio.channelLabels,
				undefined,
				visio.channel,
				'Select image channel',
				function () {
					visio.channel = parseInt(
						this._chanSelect.selectedIndex - 1,
						10
					);
					this._updateChannel(layer, visio.channel);
					layer.redraw();
				}
			);


			const line2 = this._addDialogLine('Animate:', box),
				elem2 = this._addDialogElement(line2);
			// Go to first frame
			this._addButton(
				className + '-button',
				elem2,
				'channel-first',
				'Go to first frame/channel',
				() => {
					_this._gotoChannel(layer, 0);
				}
			);
			// Play animation backward
			const	playbackward = this._addButton(
				className + '-button',
				elem2,
				'channel-reverse',
				'Animate frames/channels in reverse',
				() => {
					if (visio.playAnimation && visio.reverseAnimation) {
						DomUtil.removeClass(playbackward, 'playing');
						_this._pauseAnimation(layer);
					} else {
						if (visio.playAnimation && !visio.reverseAnimation) {
							DomUtil.removeClass(playforward, 'playing');
						}
						DomUtil.addClass(playbackward, 'playing');
						_this._playAnimation(layer, reverse=true);
					}
				}
			);
			// Go to previous frame
			this._addButton(
				className + '-button',
				elem2,
				'channel-previous',
				'Go to previous frame/channel',
				() => {
					if (visio.playAnimation) {
						DomUtil.removeClass(
							visio.reverseAnimation? playbackward : playforward,
							'playing'
						);
						_this._pauseAnimation(layer);
					}
					const	chan = visio.channel - 1;
					_this._gotoChannel(
						layer,
						chan < 0 ? visio.nChannel - 1 : chan
					);
				}
			);
			// Go to next frame
			this._addButton(
				className + '-button',
				elem2,
				'channel-next',
				'Go to next frame/channel',
				() => {
					if (visio.playAnimation) {
						DomUtil.removeClass(
							visio.reverseAnimation? playbackward : playforward,
							'playing'
						);
						_this._pauseAnimation(layer);
					}
					const	chan = visio.channel + 1;
					_this._gotoChannel(
						layer,
						chan < visio.nChannel ? chan: 0
					);
				}
			);
			// Play animation forward
			const	playforward = this._addButton(
				className + '-button',
				elem2,
				'channel-play',
				'Animate channels/frames',
				() => {
					if (visio.playAnimation && !visio.reverseAnimation) {
						DomUtil.removeClass(playforward, 'playing');
						_this._pauseAnimation(layer);
					} else {
						if (visio.playAnimation && visio.reverseAnimation) {
							DomUtil.removeClass(playbackward, 'playing');
						}
						DomUtil.addClass(playforward, 'playing');
						_this._playAnimation(layer);
					}
				}
			);
			// Go to last frame
			this._addButton(
				className + '-button',
				elem2,
				'channel-last',
				'Go to last frame/channel',
				() => {
					_this._gotoChannel(layer, visio.nChannel - 1);
				}
			);

			// Frame rate adjusment
			this._addNumericalInput(
				layer,
				'framerate',
				box,
				'Framerate:',
				'Adjust animation framerate',
				visio.framerate,
				0.2, 0.2, 30,
				() => {
					if (visio.playAnimation) {
						this._playAnimation(
							layer,
							reverse=visio.reverseAnimation
						);
					};
				},
			);

		}

		const	line3 = this._addDialogLine('LUT:', box),
			elem3 = this._addDialogElement(line3);

		const	cmapinput = DomUtil.create('div', className + '-cmaps', elem3),
			cbutton = [],
			cmaps = ['grey', 'jet', 'cold', 'hot'],
			_changeMap = function (value) {
				layer._setAttr('cMap', value);
			};

		for (let c in cmaps) {
			cbutton[c] = this._addRadioButton(
				'leaflet-cmap',
				cmapinput,
				cmaps[c],
				(cmaps[c] === this.options.cMap),
				'Select "' + cmaps[c].charAt(0).toUpperCase() +
				    cmaps[c].substr(1) + '" color-map',
				_changeMap
			);
		}

		this._addMinMax(layer, visio.channel, box);
		layer.redraw();
	},
 
	/**
	 * Initialize the ``'color'`` flavor of the channel mixing dialog.
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
				layer.getChannelColor(visio.channel),
				'visiomaticChannel',
				title='Channel color. Click to edit',
				fn=(colorStr) => {
					this._updateChannelMix(layer, visio.channel, rgb(colorStr));
				}
			);

		layer._setAttr('cMap', 'grey');
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
				this._updateChannel(layer, visio.channel, updateColor=true);
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
				this._updateColPick(layer, layer.visio.channel);
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
					vrgb = visio.rgb,
					defcol = layer.visioDefault.channelColors;
				let	nchanon = 0;

				for (const c in vrgb) {
					nchanon++;
				}
				if (nchanon >= defcol.length) {
					nchanon = defcol.length - 1;
				}

				let	cc = 0;
				for (const c in vrgb) {
					if (cc < nchanon) {
						vrgb[c] = rgb(defcol[nchanon][cc++]);
					}
				}
				layer.updateMix();
				this._updateColPick(layer, layer.visio.channel);
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
			'Adjust lower clipping limit in ' + visio.channelUnits[channel],
			visio.minValue[channel], step
		);

		// Max
		this._maxElem = this._addNumericalInput(
			layer,
			'maxValue[' + channel + ']',
			box,
			'Max:',
			'Adjust upper clipping limit in ' + visio.channelUnits[channel],
			visio.maxValue[channel], step
		);
	},

	/**
	   Play Animation by iterating over channels/slices.
	 * @private
	 * @param {VTileLayer} layer
	   VisiOmatic layer.
	 * @param {boolean) [reverse=false]
	   Play in reverse?
	 */
	_playAnimation: function (layer, reverse=false) {
		const visio = layer.visio;
		if (visio.nChannel <= 1) {
			return;
		}
		this._pauseAnimation(layer);
		visio.reverseAnimation = reverse;
		visio.playAnimation = true;
		visio.intervalID = setInterval(
			reverse ?
				() => {
					const	chan = visio.channel - 1;
					visio.channel = chan < 0 ? visio.nChannel - 1 : chan;
					this._updateChannel(layer, visio.channel);
					layer.redraw();
				} : () => {
					const	chan = visio.channel + 1;
					visio.channel = chan < visio.nChannel ? chan : 0;
					this._updateChannel(layer, visio.channel);
					layer.redraw();
				},
			visio.framerate > 0.? 1000. / visio.framerate : 1000. 
		)
	},

	/**
	   Pause Animation.
	 * @private
	 * @param {VTileLayer} layer
	   VisiOmatic layer.
	 */
	_pauseAnimation: function (layer) {
		const visio = layer.visio;
		visio.playAnimation = false;
		if (visio.intervalID) {
			clearInterval(visio.intervalID);
			visio.intervalID = 0;
		}
	},

	/**
	   Set current channel.
	 * @private
	 * @param {VTileLayer} layer
	   VisiOmatic layer.
	 * @param {number} [channel=0]
	   Image channel.
	 */
	_gotoChannel: function (layer, channel=0) {
		const visio = layer.visio;
		if (visio.nChannel <= 1) {
			return;
		}
		this._updateChannel(layer, visio.channel=channel);
		layer.redraw();
	},

	/**
	   Set/update the channel controls for a given channel.
	 * @private
	 * @param {VTileLayer} layer
	   VisiOmatic layer.
	 * @param {number} channel
	   Image channel.
	 * @param {boolean) [updateColor=false]
	   Update Color patch element?
	 */
	_updateChannel: function (layer, channel, updateColor=false) {
		const	_this = this,
			visio = layer.visio,
			step = this._spinboxStep(
				visio.minValue[channel],
				visio.maxValue[channel]);
		_this._chanSelect.selectedIndex = channel + 1;

		/**
		 * Fired when the image channel is being updated.
		 * @event channelupdate
		 * @memberof VTileLayer
		 */
		layer.fire('channelupdate');
		if (updateColor) {
			this._updateColPick(layer, channel);
		}

		this._minElem.spinbox
			.value(visio.minValue[channel])
			.step(step)
			.off('change')
			.on('change', function () {
				layer._setAttr(
					'minValue[' + channel + ']',
					_this._minElem.spinbox.value()
				);
			}, this);

		this._maxElem.spinbox
			.value(visio.maxValue[channel])
			.step(step)
			.off('change')
			.on('change', function () {
				layer._setAttr(
					'maxValue[' + channel + ']',
					_this._maxElem.spinbox.value()
				);
			}, this);
	},

	/**
	   Update the color mixing matrix with the RGB contribution of a given
	   channel and redraw the VisiOmatic layer.
	 * @private
	 * @param {VTileLayer} layer
	   VisiOmatic layer.
	 * @param {number} channel
	   Image channel.
	 * @param {RGB} channel_rgb
	   RGB color.
	 */
	_updateChannelMix: function (layer, channel, channel_rgb) {
		layer.rgbToMix(channel, channel_rgb);
		this._updateChannelList(layer);
		layer.redraw();
	},

	/**
	   Update the list of channels in the dialog.
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

		for (c in visio.rgb) {
			var	chan = parseInt(c, 10),
				vrgb = visio.rgb[chan],
				chanElem = DomUtil.create(
					'div',
					this._className + '-channel',
					chanList
				),
				color = DomUtil.create(
					'div',
					this._className + '-chancolor',
					chanElem
				);
			color.style.backgroundColor = vrgb.toStr();
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
	},

	/**
	   Update the color picker value based on the given channel color.
	 * @private
	 * @param {number} layer
	   VisiOmatic layer.
	 * @param {number} channel
	   Image channel.
	 */
	_updateColPick: function (layer, channel) {
		const	rgbStr = layer.getChannelColor(channel);
		
		this._chanColPick.style.backgroundColor =
			this._chanColPick.value = rgbStr;
	},

	/**
	   Add listener to a trash element for blackening the current channel color
	   of a given VisiOmatic layer.
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
			this._updateChannelMix(layer, channel, false);
			if (layer === this._layer && channel === layer.visio.channel) {
				this._updateColPick(layer, channel);
			}
		}, this);
	},

	/**
	   Add listener to a channel element for setting the current channel
	   of a given VisiOmatic layer.
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
			this._updateChannel(layer, channel, updateColor=true);
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

