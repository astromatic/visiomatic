/*
# L.Control.IIP adjusts the rendering of an IIP layer
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 10/02/2014
*/
L.Control.IIP = L.Control.extend({
	options: {
		title: 'a control related to IIPImage',
		collapsed: true,
		position: 'topleft'
	},

	initialize: function (baseLayers,  options) {
		L.setOptions(this, options);
		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipimage';
		this._layers = baseLayers;
	},

	onAdd: function (map) {
		var className = this._className,
		 id = this._id,
		 container = this._container = L.DomUtil.create('div', className + ' leaflet-bar');
		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		L.DomEvent
				.disableClickPropagation(container)
				.disableScrollPropagation(container);

		this._dialog = L.DomUtil.create('div', className + '-dialog', container);
		if (this.options.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent
					.on(container, 'mouseover', this._expand, this)
					.on(container, 'mouseout', this._collapse, this);
			}

			var toggle = this._toggle = L.DomUtil.create('a', className + '-toggle leaflet-bar', container);
			toggle.href = '#';
			toggle.id = id + '-toggle';
			toggle.title = this.options.title;

			if (L.Browser.touch) {
				L.DomEvent
				    .on(toggle, 'click', L.DomEvent.stop)
				    .on(toggle, 'click', this._expand, this);
			}
			else {
				L.DomEvent.on(toggle, 'focus', this._expand, this);
			}

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility
		} else {
			this._expand();
		}

		this._checkIIP();
		this._map.on('baselayerchange', this._checkIIP, this);

		return	this._container;
	},

	_checkIIP: function () {
		var layer = this._layer = this._findActiveBaseLayer();
		if (layer) {
			if (this._reloadFlag) {
				layer.once('load', this._resetDialog, this);
			} else {
				this._initDialog();
				this._reloadFlag = true;
			}
		} else if (this._prelayer) {
			// Layer metadata are not ready yet: listen for 'metaload' event
			this._prelayer.once('metaload', this._checkIIP, this);
		}
	},

	_initDialog: function () {
/*
		var className = this._className,
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

	_addDialogLine: function (label) {
		var elem = L.DomUtil.create('div', this._className + '-element', this._dialog),
		 text = L.DomUtil.create('span', this._className + '-label', elem);
		text.innerHTML = label;
		return elem;
	},

	_expand: function () {
		L.DomUtil.addClass(this._container, this._className + '-expanded');
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

	_onInputChange:	function (layer, pname, value) {
		var pnamearr = pname.split(/\[|\]/);
		if (pnamearr[1]) {
			layer[pnamearr[0]][parseInt(pnamearr[1], 10)] = value;
		}	else {
			layer[pnamearr[0]] = value;
		}
		layer.redraw();
	}

});

L.control.iip = function (baseLayers, options) {
	return new L.Control.IIP(baseLayers, options);
};

