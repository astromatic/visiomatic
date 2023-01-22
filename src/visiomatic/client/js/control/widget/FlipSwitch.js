/**
 #	This file part of:	VisiOmatic
 * @file Provide a Flipswitch widget.

 * @copyright (c) 2015-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/
import {
	Evented,
	DomEvent,
	DomUtil,
	Util
} from 'leaflet';


export const FlipSwitch = Evented.extend( /** @lends FlipsSwitch */ {
	options: {
		title: 'Click to switch',
		checked: false,
		className: 'leaflet-flipswitch',
	},

	/**
	 * Create a new flip switch widget.

	 * @extends leaflet.Evented
	 * @memberof module:control/widget/FlipSwitch.js
	 * @constructs
	 * @override
	 * @param {object} [parent] - Parent element.
	 * @param {object} [options] - Options.

	 * @param {string} [options.title='Click to switch']
	   Title of the control.

	 * @param {boolean} [options.checked=false]
	   Switch activated at creation?

	 * @param {string} [options.className]
	   Element class name for the widget.

	 * @returns {FlipSwitch} Flip switch widget element.
	 */
	initialize: function (parent, options) {
		options = Util.setOptions(this, options);
		const	_this = this,
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

	/**
	 * Return or set the flip switch status.
	 * @param {boolean} [val]
	   If provided, set the flip switch (boolean) value to that of `val`.

	 * @returns {boolean} Flip switch status.
	 */
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

/**
 * Instantiate a flip switch widget.
 *
 * @function
 * @param {object} [parent] - Parent element.
 * @param {object} [options] - Options: see {@link FlipSwitch}
 * @returns {FlipSwitch} Flip switch widget element.

 * @example
   ...
   const elem = DomUtil.create('div', 'myelement', divParent);
   const flipElem = flipSwitch(elem, {checked: true});
 */
export const flipSwitch = function (parent, options) {
	return new FlipSwitch(parent, options);
};

