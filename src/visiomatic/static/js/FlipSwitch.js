/*
# SpinBox implements a number spinbox with adaptive step increment
# Adapted from Proto.io On/Off FlipSwitch designed by Anna Mitsinga:
# https://proto.io/freebies/onoff/
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2015-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU
#
*/
import L from 'leaflet';

L.FlipSwitch = L.Evented.extend({
	options: {
		// All widget options
		checked: false,
		title: 'Click to switch',
		className: 'leaflet-flipswitch',
		id: 'leaflet-flipswitch'
	},

	initialize: function (parent, options) {
		options = L.setOptions(this, options);
		var _this = this,
			  className = options.className,
			  button = L.DomUtil.create('div', className, parent),
				input = this._input = L.DomUtil.create('input', className, button),
				label = L.DomUtil.create('label', className, button);

		input.type = 'checkbox';
		input.name = options.className;
		input.checked = options.checked;
		label.htmlFor = input.id = options.id;
		if (options.title) {
			label.title = options.title;
		}

		L.DomUtil.create('span', className + '-inner', label);
		L.DomUtil.create('span', className + '-button', label);

		L.DomEvent
				.disableClickPropagation(button)
				.disableScrollPropagation(button);
		L.DomEvent.on(input, 'change', function () {
			this.fire('change');
		}, this);

		return button;
	},

	value: function (val) {
		if (val === undefined) {
			return this._input.checked;
		}
		else {
			this._input.checked = val ? true : false;
			return this;
		}
	}

});

L.flipswitch = function (parent, options) {
	return new L.FlipSwitch(parent, options);
};
