/*
#	Base for VisiOmatic UI Classes.
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#	                         Chiara Marmo    - Paris-Saclay
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


export const UI = Control.extend({
	options: {
		title: 'a control related to VisiOmatic',
		collapsed: true,
		position: 'topleft'
	},

	initialize: function (baseLayers,  options) {
		Util.setOptions(this, options);
		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipimage';
		this._layers = baseLayers;
	},

	// addTo can be used to add the regular leaflet controls or to the sidebar
	addTo: function (dest) {
		if (dest._sidebar) {
			this._sidebar = dest;
			// dest is a sidebar class instance
			this._map = dest._map;
			this._dialog = DomUtil.create('div', this._className + '-dialog');
			dest.addTab(this._id, this._className, this.options.title, this._dialog,
			   this._sideClass);
			this._map.on('layeradd', this._checkIIP, this);
			return dest;
		} else {
			return Control.prototype.addTo.call(this, dest);
		}
	},

	onAdd: function (map) {
		var	className = this._className,
			id = this._id,
			container = this._container = DomUtil.create('div', className + ' leaflet-bar');

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

			var toggle = this._toggle = DomUtil.create('a', className + '-toggle leaflet-bar', container);
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

		//	this._checkIIP();
		this._map.on('layeradd', this._checkIIP, this);

		return	this._container;
	},

	_checkIIP: function (e) {
		var layer = e.layer;

		// Exit if not an IIP layer
		if (!layer || !layer.iipdefault) {
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

	_initDialog: function () {
		/*
		var	className = this._className,
			container = this._container,
			dialog = this._dialog,
			toggle = this._toggle,
			layer = this._layer;
		dialog.innerHTML = '';
		*/
		// Setup the rest of the dialog window here
	},

	_resetDialog: function () {
		this._dialog.innerHTML = '';
		this._initDialog();
	},

	_addDialogBox: function (id) {
		var box = DomUtil.create('div', this._className + '-box', this._dialog);
		if (id) {
			box.id = id;
		}
		return box;
	},

	_addDialogLine: function (label, dialogBox) {
		var line = DomUtil.create('div', this._className + '-line', dialogBox),
		 text = DomUtil.create('div', this._className + '-label', line);
		text.innerHTML = label;
		return line;
	},

	_addDialogElement: function (line) {
		return DomUtil.create('div', this._className + '-element', line);
	},

	_expand: function () {
		DomUtil.addClass(this._container, this._className + '-expanded');
	},

	_collapse: function () {
		this._container.className = this._container.className.replace(' ' + this._className + '-expanded', '');
	},

	/**
	* Get currently active base layer on the map
	* @return {Object} l where l.name - layer name on the control,
	* l.layer is L.TileLayer, l.overlay is overlay layer.
	*/
	getActiveBaseLayer: function () {
		return this._activeBaseLayer;
	},

	/**
	* Get currently active overlay layers on the map
	* @return {{layerId: l}} where layerId is <code>L.stamp(l.layer)</code>
	* and l @see #getActiveBaseLayer jsdoc.
	*/

	_findActiveBaseLayer: function () {
		var layers = this._layers;
		this._prelayer = undefined;
		for (var layername in layers) {
			var layer = layers[layername];
			if (!layer.overlay) {
				if (!layer._map) {
					this._prelayer = layer;
				} else if (this._map.hasLayer(layer) && layer.iipdefault) {
					return layer;
				}
			}
		}
		return undefined;
	},

	_createButton: function (className, parent, subClassName, fn, title) {
		var button = DomUtil.create('a', className, parent);
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

	_createRadioButton: function (className, parent, value, checked, fn, title) {
		var button = DomUtil.create('input', className, parent);

		button.type = 'radio';
		button.name = className;
		button.value = value;
		button.checked = checked;
		if (fn) {
			DomEvent.on(button, 'click touch', function () {
				fn(value);
			}, this);
		}

		var label =  DomUtil.create('label', className, parent);

		label.htmlFor = button.id = className + '-' + value;
		if (title) {
			label.title = title;
		}
		return button;
	},

	_createSelectMenu: function (className, parent, items, disabled, selected, fn, title) {
		// Wrapper around the select element for better positioning and sizing
		var	div =  DomUtil.create('div', className, parent),
			select = DomUtil.create('select', className, div),
			choose = document.createElement('option'),
			opt = select.opt = [],
			index;

		choose.text = 'choose';
		choose.disabled = true;
		if (!selected || selected < 0) {
			choose.selected = true;
		}
		select.add(choose, null);
		for (var i in items) {
			index = parseInt(i, 10);
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


	_createColorPicker: function (className, parent, subClassName, defaultColor,
	    fn, storageKey, title) {
		var _this = this,
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


	_addSwitchInput:	function (layer, box, label, attr, title, id, checked) {
		var line = this._addDialogLine(label, box),
			elem = this._addDialogElement(line),
			flip = elem.flip = new FlipSwitch(elem, {
				checked: checked,
				id: id,
				title: title
			});

		flip.on('change', function () {
			this._onInputChange(layer, attr, flip.value());
		}, this);

		return elem;
	},

	_addNumericalInput:	function (layer, box, label, attr, title, id, initValue,
	  step, min, max, func) {
		var line = this._addDialogLine(label, box),
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
			this._onInputChange(layer, attr, spinbox.value(), func);
		}, this);

		return elem;
	},

	_updateInput:	function (elem, value) {
		if (elem.spinbox) {
			elem.spinbox.value(value);
		} else if (elem.flip) {
			elem.flip.value(value);
		}
	},

	_spinboxStep: function (min, max) {
		var step = parseFloat((Math.abs(max === min ? max : max - min) *
			         0.001).toPrecision(1));

		return step === 0.0 ? 1.0 : step;
	},

	_onInputChange:	function (layer, pname, value, func) {

		var pnamearr = pname.split(/\[|\]/);
		if (pnamearr[1]) {
			layer[pnamearr[0]][parseInt(pnamearr[1], 10)] = value;
		}	else {
			layer[pnamearr[0]] = value;
		}
		if (func) {
			func(layer);
		}
		layer.redraw();
	},

	_updateLayerList: function () {
		if (!this._dialog) {
			return this;
		}

		if (this._layerList) {
			DomUtil.empty(this._layerList);
		} else {
			this._layerList = DomUtil.create('div', 'leaflet-control-iip' + '-layerlist',
			  this._dialog);
		}

		for (var i in this._layers) {
			this._addLayerItem(this._layers[i]);
		}

		return this;
	},

	_addLayerItem: function (obj) {
		var _this = this,
		 layerItem = DomUtil.create('div', 'leaflet-control-iip-layer'),
		 inputdiv = DomUtil.create('div', 'leaflet-control-iip-layerswitch', layerItem);

		if (obj.layer.notReady) {
			DomUtil.create('div', 'leaflet-control-iip-activity', inputdiv);
		} else {
			var input,
			    checked = this._map.hasLayer(obj.layer);
			input = document.createElement('input');
			input.type = 'checkbox';
			input.className = 'leaflet-control-iip-selector';
			input.defaultChecked = checked;
			input.layerId = Util.stamp(obj.layer);
			DomEvent.on(input, 'click', function () {
				var i, input, obj,
			      inputs = this._layerList.getElementsByTagName('input'),
				    inputsLen = inputs.length;

				this._handlingClick = true;

				for (i = 0; i < inputsLen; i++) {
					input = inputs[i];
					if (!('layerId' in input)) {
						continue;
					}
					obj = this._layers[input.layerId];
					if (input.checked && !this._map.hasLayer(obj.layer)) {
						obj.layer.addTo(this._map);
					} else if (!input.checked && this._map.hasLayer(obj.layer)) {
						this._map.removeLayer(obj.layer);
					}
				}

				this._handlingClick = false;
			}, this);
			inputdiv.appendChild(input);
		}
	
		var name = DomUtil.create('div', 'leaflet-control-iip-layername', layerItem);
		name.innerHTML = ' ' + obj.name;
		name.style.textShadow = '0px 0px 5px ' + obj.layer.nameColor;

		this._createButton('leaflet-control-iip-trash',
			layerItem,
			undefined,
			function () {
				_this.removeLayer(obj.layer);
				if (!obj.notReady) {
					_this._map.removeLayer(obj.layer);
				}
			},
			'Delete layer'
		);

		this._layerList.appendChild(layerItem);

		return layerItem;
	},

	addLayer: function (layer, name, index) {
		layer.on('add remove', this._onLayerChange, this);

		var id = Util.stamp(layer);

		this._layers[id] = {
			layer: layer,
			name: name,
			index: index
		};

		return this._updateLayerList();
	},

	removeLayer: function (layer) {
		layer.off('add remove', this._onLayerChange, this);
		layer.fire('trash', {index: this._layers[Util.stamp(layer)].index});
		layer.off('trash');

		delete this._layers[Util.stamp(layer)];
		return this._updateLayerList();
	},

	_onLayerChange: function (e) {
		if (!this._handlingClick) {
			this._updateLayerList();
		}

		var obj = this._layers[Util.stamp(e.target)],
		    type = e.type === 'add' ? 'overlayadd' : 'overlayremove';

		this._map.fire(type, obj);
	}

});

export const ui = function (baseLayers, options) {
	return new UI(baseLayers, options);
};

