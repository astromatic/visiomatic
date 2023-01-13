/**
 #	This file part of:	VisiOmatic
 * @file Base User Interface for VisiOmatic dialogs.

 * @requires util/VUtil
 * @requires control/widget/FlipSwitch.js
 * @requires control/widget/Spinbox.js

 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/
import jQuery from 'jquery';
window.$ = window.jQuery = jQuery;

import 'spectrum-colorpicker';

import {
	Browser,
	Control,
	DomEvent,
	DomUtil,
	Util
} from 'leaflet';

import {FlipSwitch, Spinbox} from './widget';
import {VUtil} from '../util';

// Callback definitions
/**
 * Callbacks for UI control changes.
 * @callback UI~controlCallback
 * @param {object} UI - control object.
 */
/**
 * Callbacks for color picker changes.
 * @callback UI~colorCallback
 */
/**
 * Callbacks for layer attribute changes.
 * @callback UI~layerCallback
 * @param {VTileLayer} layer - VisiOmatic layer.
 */


export const UI = Control.extend( /** @lends UI */ {
	options: {
		title: 'a control related to VisiOmatic',
		collapsed: true,
		position: 'topleft'
	},

	/**
	 * Base class for VisiOmatic dialog controls.

	 * @extends leaflet.Control
	 * @memberof module:control/UI.js
	 * @constructs
	 * @param {VTileLayer[]} baseLayers - Array of layers
	 * @param {object} [options] - Options.

	 * @param {string} [options.title='a control related to VisiOmatic']
	   Layer title. Defaults to the basename of the tile URL with extension
	   removed.

	 * @param {boolean} [options.collapsed=true]
	   Start dialog in the collapsed state?.

	 * @param {boolean} [options.position='topleft']
	   Position of the dialog on the map.

	 * @see [Leaflet API reference]{@link https://leafletjs.com/reference.html#control}
	   for additional control options.

	 * @returns {UI} VisiOmatic UI instance.
	 */
	initialize: function (baseLayers,  options) {
		Util.setOptions(this, options);
		this._className = 'visiomatic-control';
		this._id = 'visiomatic-image';
		this._layers = baseLayers;
	},

	/**
	 * Add the control to the map or to a sidebar.
	 * @method
	 * @static
	 * @override
	 * @param {object} dest - Destination map or sidebar.
	 * @returns {object} Destination object.
	 * @listens layeradd
	 */
	addTo: function (dest) {
		if (dest._sidebar) {
			this._sidebar = dest;
			// dest is a sidebar class instance
			this._map = dest._map;
			this._dialog = DomUtil.create('div', this._className + '-dialog');
			dest.addTab(this._id, this._className, this.options.title, this._dialog,
			   this._sideClass);
			this._map.on('layeradd', this._checkVisiomatic, this);
			return dest;
		} else {
			return Control.prototype.addTo.call(this, dest);
		}
	},

	/**
	 * Add the control dialog directly to the map.
	 * @memberof UI
	 * @method
	 * @static
	 * @param {object} map - Leaflet map the control has been added to.
	 * @returns {object} The newly created container of the dialog.
	 */
	onAdd: function (map) {
		const	className = this._className,
			id = this._id,
			container = this._container = DomUtil.create(
				'div',
				className + ' leaflet-bar'
			);

		// Makes this work on IE10 Touch devices by stopping it
		// from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		DomEvent
			.disableClickPropagation(container)
			.disableScrollPropagation(container);

		this._dialog = DomUtil.create('div', className + '-dialog', container);
		if (this.options.collapsed) {
			if (!Browser.android) {
				DomEvent
					.on(container, 'mouseover', this._expand, this)
					.on(container, 'mouseout', this._collapse, this);
			}

			const toggle = this._toggle = DomUtil.create(
				'a',
				className + '-toggle leaflet-bar',
				container
			);
			toggle.href = '#';
			toggle.id = id + '-toggle';
			toggle.title = this.options.title;

			if (Browser.touch) {
				DomEvent
				    .on(toggle, 'click', DomEvent.stop, this)
				    .on(toggle, 'click', this._expand, this);
			}
			else {
				DomEvent.on(toggle, 'focus', this._expand, this);
			}

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility
		} else {
			this._expand();
		}

		//	this._checkVisiomatic();
		this._map.on('layeradd', this._checkVisiomatic, this);

		return	this._container;
	},

	/**
	 * Check that the layer being loaded is a VisiOmatic layer.
	 * @method
	 * @static
	 * @private
	 * @param {leaflet.LayerEvent} e - Leaflet layer event object.
	 */
	_checkVisiomatic: function (e) {
		const	layer = e.layer;

		// Exit if not a VisiOmatic layer
		if (!layer || !layer.visioDefault) {
			return;
		}
		this._layer = layer;
		if (this._reloadFlag) {
			layer.once('load', this._resetDialog, this);
		} else {
			this._initDialog();
			this._reloadFlag = true;
		}
	},

	/**
	 * Initialize the UI dialog (dummy in the base class, just a placeholder).
	 * @method
	 * @static
	 * @private
	 */
	_initDialog: function () {
		/*
		const	className = this._className,
			container = this._container,
			dialog = this._dialog,
			toggle = this._toggle,
			layer = this._layer;
		dialog.innerHTML = '';
		*/
		// Setup the rest of the dialog window here
	},

	/**
	 * Reset the UI dialog.
	 * @method
	 * @static
	 * @private
	 */
	_resetDialog: function () {
		this._dialog.innerHTML = '';
		this._initDialog();
	},

	/**
	 * Add a new dialog box to the UI.
	 * @method
	 * @static
	 * @private
	 * @param {string} [id] - DOM id property of the box element.
	 * @returns {object} The newly created dialog box.
	 */
	_addDialogBox: function (id) {
		const	box = DomUtil.create(
			'div',
			this._className + '-box',
			this._dialog
		);
		if (id) {
			box.id = id;
		}
		return box;
	},

	/**
	 * Add a new dialog line to the provided dialog box.
	 * @method
	 * @static
	 * @private
	 * @param {string} label - Default text in the dialog line.
	 * @param {object} dialogBox - The destination dialog box.
	 * @returns {object} The newly created dialog line.
	 */
	_addDialogLine: function (label, dialogBox) {
		const	line = DomUtil.create(
				'div',
				this._className + '-line',
				dialogBox
			),
			text = DomUtil.create('div', this._className + '-label', line);

		text.innerHTML = label;
		return line;
	},

	/**
	 * Add a new dialog element to the provided dialog line.
	 * @method
	 * @static
	 * @private
	 * @param {object} line - The destination dialog line.
	 * @returns {object} The newly created dialog element.
	 */
	_addDialogElement: function (line) {
		return DomUtil.create('div', this._className + '-element', line);
	},

	/**
	 * Expand a DOM element (by adding '-expanded' to its class name).
	 * @method
	 * @static
	 * @private
	 */
	_expand: function () {
		DomUtil.addClass(this._container, this._className + '-expanded');
	},

	/**
	 * Collapse a DOM element (by removing '-expanded' from its class name).
	 * @method
	 * @static
	 * @private
	 */
	_collapse: function () {
		this._container.className = this._container.className.replace(
			' ' + this._className + '-expanded',
			''
		);
	},

	/**
	 * Get the base layer currently active on the map.
	 * @method
	 * @static
	 * @returns {object} Tile- or overlay layer.
	 */
	getActiveBaseLayer: function () {
		return this._activeBaseLayer;
	},

	/**
	* Find the base VisiOmatic layer currently active on the map.
	* @returns {object} The active VisiOmatic layer, or ``undefined` otherwise.
	*/
	_findActiveBaseLayer: function () {
		const	layers = this._layers;

		this._prelayer = undefined;
		for (var l in layers) {
			var layer = layers[l];
			if (!layer.overlay) {
				if (!layer._map) {
					this._prelayer = layer;
				} else if (this._map.hasLayer(layer) && layer.visioDefault) {
					return layer;
				}
			}
		}
		return undefined;
	},

	/**
	 * Add a new button to the provided parent element.
	 * @method
	 * @static
	 * @private
	 * @param {string} className
	   Class name for the button.
	 * @param {object} parent
	   The parent element.
	 * @param {string} [subClassName] 
	   Sub-class name for the button (will be combined with ClassName to
	   generate a unique element id).
	 * @param {string} [title]
	   Title of the button (for, e.g., display as a tooltip).
	 * @param {UI~controlCallback} [fn]
	   Callback function for when the button is pressed.
	 * @returns {object} The newly created button.
	 */
	_addButton: function (
		className,
		parent,
		subClassName=undefined,
		title=undefined,
		fn=undefined
	) {
		const	button = DomUtil.create('a', className, parent);

		button.target = '_blank';
		if (subClassName) {
			button.id = className + '-' + subClassName;
		}
		if (fn) {
			DomEvent.on(button, 'click touch', fn, this);
		}
		if (title) {
			button.title = title;
		}
		return button;
	},

	/**
	 * Add a new radio button to the provided parent element.
	 * @method
	 * @static
	 * @private
	 * @param {string} className
	   Class name for the radio button.
	 * @param {object} parent
	   The parent element.
	 * @param {*} value 
	   Value associated with the radio button (e.g., button index or label).
	 * @param {boolean} checked 
	   Initial status of the button.
	 * @param {string} [title]
	   Title of the button (for, e.g., display as a tooltip).
	 * @param {UI~controlCallback} [fn]
	   Callback function for when the button is pressed.
	 * @returns {object} The newly created radio button.
	 */
	_addRadioButton: function (
		className,
		parent,
		value,
		checked,
		title=undefined,
		fn=undefined
	) {
		const	button = DomUtil.create('input', className, parent);

		button.type = 'radio';
		button.name = className;
		button.value = value;
		button.checked = checked;
		if (fn) {
			DomEvent.on(button, 'click touch', function () {
				fn(value);
			}, this);
		}

		const	label =  DomUtil.create('label', className, parent);

		label.htmlFor = button.id = className + '-' + value;
		if (title) {
			label.title = title;
		}
		return button;
	},

	/**
	 * Add a new selection menu to the provided parent element.
	 * @method
	 * @static
	 * @private
	 * @param {string} className
	   Class name for the selection menu.
	 * @param {object} parent
	   The parent element.
	 * @param {string[]} 
	   Item list.
	 * @param {boolean[]} [disabled]
	   Item-disabling flag list.
	 * @param {number} [selected]
	   Selected item index.
	 * @param {string} [title]
	   Title of the selection menu (for, e.g., display as a tooltip).
	 * @param {UI~controlCallback} [fn]
	   Callback function for when an item is selected.
	 * @returns {object} The newly created selection menu.
	 */
	_addSelectMenu: function (
		className,
		parent,
		items,
		disabled=undefined,
		selected=undefined,
		title=undefined,
		fn=undefined
	) {
		// Wrapper around the select element for better positioning and sizing
		const	div =  DomUtil.create('div', className, parent),
			select = DomUtil.create('select', className, div),
			choose = document.createElement('option'),
			opt = select.opt = [];

		choose.text = 'choose';
		choose.disabled = true;
		if (!selected || selected < 0) {
			choose.selected = true;
		}
		select.add(choose, null);
		for (var i in items) {
			var	index = parseInt(i, 10);
			opt[index] = document.createElement('option');
			opt[index].text = items[index];
			opt[index].value = index;
			if (disabled && disabled[index]) {
				opt[index].disabled = true;
			} else if (index === selected) {
				opt[index].selected = true;
			}
			select.add(opt[index], null);
		}

		// Fix collapsing dialog issue when selecting a channel
		if (this._container && !Browser.android && this.options.collapsed) {
			DomEvent.on(select, 'mousedown', function () {
				DomEvent.off(this._container, 'mouseout', this._collapse, this);
				this.collapsedOff = true;
			}, this);

			DomEvent.on(this._container, 'mouseover', function () {
				if (this.collapsedOff) {
					DomEvent.on(this._container, 'mouseout', this._collapse, this);
					this.collapsedOff = false;
				}
			}, this);
		}

		if (fn) {
			DomEvent.on(select, 'change keyup', fn, this);
		}
		if (title) {
			div.title = title;
		}

		return select;
	},


	/**
	 * Add a new color picker to the provided parent element.
	 * @method
	 * @static
	 * @private
	 * @param {string} className
	   Class name for the color picker.
	 * @param {object} parent
	   The parent element.
	 * @param {string} subClassName 
	   Sub-class name for the color picker (will be combined with ClassName to
	   generate a unique element id).
	 * @param {string} defaultColor
	   Default color picked by default.
	 * @param {string} storageKey
	   String to be used as a local browser storage key.
	 * @param {string} [title]
	   Title of the color picker (for, e.g., display as a tooltip).
	 * @param {UI~colorCallback} [fn]
	   Callback function for when a color has been picked.
	 * @returns {object} The newly created color picker.
	 */
	_addColorPicker: function (
		className,
		parent,
		subClassName,
		defaultColor,
	    storageKey,
	    title=undefined,
	    fn=undefined
	) {
		const	_this = this,
			colpick = DomUtil.create('input', className, parent);

		colpick.type = 'color';
		colpick.value = defaultColor;
		colpick.id = className + '-' + subClassName;

		$(document).ready(function () {
			$(colpick).spectrum({
				showInput: true,
				appendTo: '#' + _this._id,
				showPaletteOnly: true,
				togglePaletteOnly: true,
				localStorageKey: storageKey,
				change: function (color) {
					colpick.value = color.toHexString();
				}
			}).on('show.spectrum', function () {
				if (_this._container) {
					DomEvent.off(_this._container, 'mouseout', _this._collapse);
				}
			});
			if (fn) {
				$(colpick).on('change', fn);
			}
			if (title) {
				$('#' + colpick.id + '+.sp-replacer').prop('title', title);
			}
		});

		return colpick;
	},


	/**
	 * Add a new layer attribute flip switch to the provided box element.
	 * @method
	 * @static
	 * @private
	 * @param {VTileLayer} layer
	   Layer affected by the flip switch action.
	 * @param {string} attr
	   Name of the (boolean) layer attribute to be flipped.
	 * @param {object} box
	   The parent box element.
	 * @param {string} label 
	   Text for the created dialog line.
	 * @param {string} [title]
	   Title of the flip switch (for, e.g., display as a tooltip).
	 * @param {boolean} checked
	   Initial switch position.
	 * @returns {object} The newly created flip switch.
	 */
	_addSwitchInput: function (
		layer,
		attr,
		box,
		label,
		title=undefined,
		checked
	) {
		const	line = this._addDialogLine(label, box),
			elem = this._addDialogElement(line),
			flip = elem.flip = new FlipSwitch(elem, {
				checked: checked,
				title: title
			});

		flip.on('change', function () {
			this._onInputChange(layer, attr, flip.value());
		}, this);

		return elem;
	},

	/**
	 * Add a new numerical input widget to the provided box element for
	   updating a layer attribute .
	 * @method
	 * @static
	 * @private
	 * @param {VTileLayer} layer
	   Layer affected by the numerical update.
	 * @param {string} attr
	   Name of the (numerical) layer attribute to be updated.
	 * @param {object} box
	   The parent box element.
	 * @param {string} label 
	   Text for the created dialog line.
	 * @param {string} [title]
	   Title of the numerical input (for, e.g., display as a tooltip).
	 * @param {number} initValue
	   Initial numerical value.
	 * @param {number} step
	   Starting step value.
	 * @param {number} [min]
	   Minimum value.
 	 * @param {number} [max]
	   Maximum value.
	 * @param {UI~layerCallback} [fn]
	   Callback function for when the numerical input has been updated.
	 * @returns {object} The newly created numerical input.
	 */
	_addNumericalInput:	function (
		layer,
		attr,
		box,
		label,
		title=undefined,
		initValue,
		step,
		min=undefined,
		max=undefined,
		fn=undefined
	) {
		const	line = this._addDialogLine(label, box),
			elem = this._addDialogElement(line),
			spinbox = elem.spinbox = new Spinbox(elem, {
				step: step,
				dmin:  min,
				dmax:  max,
				initValue: initValue,
				title: title
			});

		spinbox.on('change', function () {
			VUtil.flashElement(spinbox._input);
			this._onInputChange(layer, attr, spinbox.value(), fn);
		}, this);

		return elem;
	},

	/**
	 * Update the value stored in a widget element.
	 * @method
	 * @static
	 * @private
	 * @param {object} element
	   Widget element.
	 * @param {*} value
	   New value.
	 */
	_updateInput:	function (elem, value) {
		if (elem.spinbox) {
			elem.spinbox.value(value);
		} else if (elem.flip) {
			elem.flip.value(value);
		}
	},

	/**
	 * Compute a step for the spinbox widget from the provided min and max
	   values.
	 * @method
	 * @static
	 * @private
	 * @param {number} min
	   Minimum value.
 	 * @param {number} max
	   Maximum value.
	 * @returns {number} The computed step value.
	 */
	_spinboxStep: function (min, max) {
		const	step = parseFloat((Math.abs(max === min ? max : max - min) *
			         0.001).toPrecision(1));

		return step === 0.0 ? 1.0 : step;
	},

	/**
	 * Action performed on a layer attribute when a widget value is modified.
	 * @method
	 * @static
	 * @private
	 * @param {VTileLayer} layer
	   Layer affected by the update.
	 * @param {string} attr
	   Name of the (numerical) layer attribute to be updated.
	 * @param {*} value
	   New value.
	 * @param {UI~layerCallback} [fn]
	   Optional additional callback function.
	 */
	_onInputChange:	function (
		layer,
		attr,
		value,
		fn=undefined
	) {

		const	attrarr = attr.split(/\[|\]/);
		if (attrarr[1]) {
			layer.visio[attrarr[0]][parseInt(attrarr[1], 10)] = value;
		}	else {
			layer.visio[attrarr[0]] = value;
		}
		if (fn) {
			fn(layer);
		}
		layer.redraw();
	},

	/**
	 * Update the control list of layers.
	 * @method
	 * @static
	 * @private
	 * @returns {object} This (control).
	 */
	_updateLayerList: function () {
		if (!this._dialog) {
			return this;
		}

		if (this._layerList) {
			DomUtil.empty(this._layerList);
		} else {
			this._layerList = DomUtil.create(
				'div',
				'visiomatic-control' + '-layerlist',
				this._dialog
			);
		}

		for (var i in this._layers) {
			this._addLayerItem(this._layers[i]);
		}

		return this;
	},

	/**
	 * Add control item element for the provided layer parent object.
	 * @method
	 * @static
	 * @private
	 * @param {object} obj - Layer parent object.
	 * @returns {object} The control item element.
	 */
	_addLayerItem: function (obj) {
		const	_this = this,
			layerItem = DomUtil.create('div', 'visiomatic-control-layer'),
			inputdiv = DomUtil.create(
				'div',
				'visiomatic-control-layerswitch',
				layerItem
			);

		if (obj.layer.notReady) {
			DomUtil.create('div', 'visiomatic-control-activity', inputdiv);
		} else {
			const	checked = this._map.hasLayer(obj.layer),
				newInput = document.createElement('input');

			newInput.type = 'checkbox';
			newInput.className = 'visiomatic-control-selector';
			newInput.defaultChecked = checked;
			newInput.layerId = Util.stamp(obj.layer);
			DomEvent.on(newInput, 'click', function () {
				const inputs = this._layerList.getElementsByTagName('input'),
					inputsLen = inputs.length;

				this._handlingClick = true;

				for (i = 0; i < inputsLen; i++) {
					var	input = inputs[i];

					if (!('layerId' in input)) {
						continue;
					}
					var	obj = this._layers[input.layerId];
					if (input.checked && !this._map.hasLayer(obj.layer)) {
						obj.layer.addTo(this._map);
					} else if (!input.checked && this._map.hasLayer(obj.layer)) {
						this._map.removeLayer(obj.layer);
					}
				}

				this._handlingClick = false;
			}, this);
			inputdiv.appendChild(newInput);
		}
	
		const layerName = DomUtil.create(
			'div',
			'visiomatic-control-layername',
			layerItem
		);
		layerName.innerHTML = ' ' + obj.name;
		layerName.style.textShadow = '0px 0px 5px ' + obj.layer.nameColor;

		this._addButton('visiomatic-control-trash',
			layerItem,
			undefined,
			'Delete layer',
			function () {
				_this.removeLayer(obj.layer);
				if (!obj.notReady) {
					_this._map.removeLayer(obj.layer);
				}
			}
		);

		this._layerList.appendChild(layerItem);

		return layerItem;
	},

	/**
	 * Add (overlay) layer from the present control.
	 * @method
	 * @static
	 * @param {leaflet.Layer} layer - Layer to be added.
	 * @param {string} name - Layer name.
	 * @param {number} [index] - Layer depth index.
	 * @returns {object} This (control).
	 */
	addLayer: function (layer, name, index) {
		layer.on('add remove', this._onLayerChange, this);

		const	id = Util.stamp(layer);

		this._layers[id] = {
			layer: layer,
			name: name,
			index: index
		};

		return this._updateLayerList();
	},

	/**
	 * Remove (overlay) layer from the present control.
	 * @method
	 * @static
	 * @param {leaflet.Layer} layer - Layer to be removed.
	 * @returns {object} This (control).
	 */
	removeLayer: function (layer) {
		layer.off('add remove', this._onLayerChange, this);
		layer.fire('trash', {index: this._layers[Util.stamp(layer)].index});
		layer.off('trash');

		delete this._layers[Util.stamp(layer)];
		return this._updateLayerList();
	},

	/**
	 * Trigger layer list update when an (overlay) layer is added or removed.
	 * @method
	 * @static
	 * @private
	 * @param {leaflet.LayerEvent} e - Leaflet layer event object.
	 */
	_onLayerChange: function (e) {
		if (!this._handlingClick) {
			this._updateLayerList();
		}

		const	obj = this._layers[Util.stamp(e.target)],
			type = e.type === 'add' ? 'overlayadd' : 'overlayremove';

		this._map.fire(type, obj);
	}

});

/**
 * Instantiate a VisiOmatic UI.
 * @memberof module:control/UI.js
 * @function
 * @param {VTileLayer[]} baseLayers - Array of layers
 * @param {object} [options] - Options: see {@link UI}
 * @returns {UI} VisiOmatic UI instance.
*/
export const ui = function (baseLayers, options) {
	return new UI(baseLayers, options);
};

