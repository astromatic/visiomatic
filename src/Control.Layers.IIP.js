/*
# L.Control.Layers.IIP adds new features to the standard L.Control.Layers
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 10/01/2014
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery-browser');
}

L.Control.Layers.IIP = L.Control.Layers.extend({
	options: {
		title: 'overlay menu',
		collapsed: true,
		position: 'topright',
		autoZIndex: true,
		fileMenu: false,
		fileURL: '/fcgi-bin/iipsrv.fcgi?FIF=',
		fileRoot: '/raid/iip/',
	},

	onAdd: function (map) {
		map._layerControl = this;
		this._initLayout();
		this._update();

//		map
//		    .on('layeradd', this._onLayerChange, this)
//		    .on('layerremove', this._onLayerChange, this);

		return this._container;
	},

	_initLayout: function () {
		var className = 'leaflet-control-layers',
		    container = this._container = L.DomUtil.create('div', className);

		// makes this work on IE touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		if (!L.Browser.touch) {
			L.DomEvent
				.disableClickPropagation(container)
				.disableScrollPropagation(container);
		} else {
			L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
		}

		var form = this._form = L.DomUtil.create('form', className + '-list');

		if (this.options.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent.on(container, {
					mouseover: this._expand,
				    mouseout: this._collapse
				}, this);
			}

			var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
			link.href = '#';
			link.title = 'Layers';

			if (L.Browser.touch) {
				L.DomEvent
				    .on(link, 'click', L.DomEvent.stop)
				    .on(link, 'click', this._expand, this);
			} else {
				L.DomEvent.on(link, 'focus', this._expand, this);
			}

			// work around for Firefox Android issue https://github.com/Leaflet/Leaflet/issues/2033
			L.DomEvent.on(form, 'click', function () {
				setTimeout(L.bind(this._onInputClick, this), 0);
			}, this);

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility
		} else {
			this._expand();
		}

		this._baseLayersList = L.DomUtil.create('div', className + '-base', form);

		if (this.options.fileMenu) {
			var addbutton = L.DomUtil.create('input', className + '-add', form);
			addbutton.type = 'button';
			addbutton.value = 'Add...';
			L.DomEvent.on(addbutton, 'click', this._openFileMenu, this);
		}

		this._separator = L.DomUtil.create('div', className + '-separator', form);
		this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);

		container.appendChild(form);
	},

	_addItem: function (obj) {
		var _this = this,
		 item = L.DomUtil.create('div', 'leaflet-control-layers-item'),
		 inputdiv = L.DomUtil.create('div', 'leaflet-control-layers-select', item);

		if (obj.layer.notReady) {
			L.DomUtil.create('div', 'leaflet-control-activity', inputdiv);
		} else {
			var input,
				checked = this._map.hasLayer(obj.layer);
			if (obj.overlay) {
				input = document.createElement('input');
				input.type = 'checkbox';
				input.className = 'leaflet-control-layers-selector';
				input.defaultChecked = checked;
			}
			else {
				input = this._createRadioElement('leaflet-base-layers', checked);
			}
			input.layerId = L.stamp(obj.layer);
			L.DomEvent.on(input, 'click', this._onInputClick, this);
			inputdiv.appendChild(input);
		}
		
		var name = L.DomUtil.create('div', 'leaflet-control-layers-name', item);
		name.innerHTML = ' ' + obj.name;

		var trashbutton = L.DomUtil.create('input', 'leaflet-control-layers-trash', item);
		trashbutton.type = 'button';
		L.DomEvent.on(trashbutton, 'click', function () {
			_this.removeLayer(obj.layer);
			if (!obj.notReady) {
				_this._map.removeLayer(obj.layer);
			}
		}, this);

		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
		container.appendChild(item);

		return item;
	},

	_onLayerChange: function (e) {
		if (!this._handlingClick) {
			this._update();
		}

		var overlay = this._layers[L.stamp(e.target)].overlay;

		var type = overlay ?
			(e.type === 'add' ? 'overlayadd' : 'overlayremove') :
			(e.type === 'add' ? 'baselayerchange' : null);

		if (type) {
			this._map.fire(type, e.target);
		}
	},

	_onInputClick: function () {
		var i, input, obj,
		    inputs = this._form.getElementsByTagName('input'),
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
	},


	_addDialogLine: function (label, dialog) {
		var elem = L.DomUtil.create('div', this._className + '-element', dialog),
		 text = L.DomUtil.create('span', this._className + '-label', elem);
		text.innerHTML = label;
		return elem;
	},

	_openFileMenu: function () {
		var _this = this,
		    fileMenu = L.DomUtil.create('div', 'leaflet-control-filemenu',
		                 this._map._controlContainer);
		L.DomEvent
				.disableClickPropagation(fileMenu)
				.disableScrollPropagation(fileMenu);
		var fileTree = L.DomUtil.create('div', 'leaflet-control-filetree',
		                 fileMenu);
		fileTree.id = 'leaflet-filetree';
		$(document).ready(function () {
			$('#leaflet-filetree').fileTree({
				root: _this.options.fileRoot,
				script: 'visiomatic/dist/filetree.php'
			},
			function (file) {
				var layercontrol = _this._map._layerControl,
				    templayer;
				if (layercontrol) {
					templayer = new L.LayerGroup(null);

					templayer.notReady = true;
					layercontrol.addBaseLayer(templayer, this._title);
					if (layercontrol.options.collapsed) {
						layercontrol._expand();
					}
				}
				var layer = L.tileLayer.iip(_this.options.fileURL + file).addTo(_this._map);
				if (layercontrol) {
					if (layer.iipMetaReady) {
						layercontrol.removeLayer(templayer);
						layercontrol.addBaseLayer(layer, layer._title);
						if (layercontrol.options.collapsed) {
							layercontrol._collapse();
						}
					} else {
						layer.once('metaload', function () {
							layercontrol.removeLayer(templayer);
							layercontrol.addBaseLayer(layer, layer._title);
							if (layercontrol.options.collapsed) {
								layercontrol._collapse();
							}
						});
					}
				}
				L.DomUtil.remove(fileMenu);
			});
		});
	}

});

L.control.layers.iip = function (baselayers, overlays, options) {
	return new L.Control.Layers.IIP(baselayers, overlays, options);
};

