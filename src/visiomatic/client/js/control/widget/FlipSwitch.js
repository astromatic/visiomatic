/*
# 	Add a number spinbox with adaptive step increment
# 	Adapted from Proto.io On/Off FlipSwitch designed by Anna Mitsinga:
# 	https://proto.io/freebies/onoff/
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2015-2023 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU
#
*/
import {
	Evented,
	DomEvent,
	DomUtil,
	Util
} from 'leaflet';


export const FlipSwitch = Evented.extend({
	options: {
		// All widget options
		checked: false,
		title: 'Click to switch',
		className: 'leaflet-flipswitch',
	},

	initialize: function (parent, options) {
		options = Util.setOptions(this, options);
		var	_this = this,
			className = options.className,
			button = DomUtil.create('div', className, parent),
			input = this._input = L.DomUtil.create('input', className, button),
			label = DomUtil.create('label', className, button);

		input.type = 'checkbox';
		input.name = options.className;
		input.checked = options.checked;
		label.htmlFor = input.id = options.id;
		if (options.title) {
			label.title = options.title;
		}

		DomUtil.create('span', className + '-inner', label);
		DomUtil.create('span', className + '-button', label);

		DomEvent
			.disableClickPropagation(button)
			.disableScrollPropagation(button);
		DomEvent.on(input, 'change', function () {
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

export const flipSwitch = function (parent, options) {
	return new FlipSwitch(parent, options);
};

