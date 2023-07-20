/**
 #	This file part of:	VisiOmatic
 * @file Provide a number spinbox with adaptive step increment.

 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
 * @copyright (c) 2015-2023 CNRS/IAP/CFHT/SorbonneU.
   Adapted from jQuery Mobile Framework plugin to provide number spinbox
   (original copyright notice follows).
   Copyright (c) JTSage
   CC 3.0 Attribution.  May be relicensed without permission/notification.
   https://github.com/jtsage/jquery-mobile-spinbox
 */
import {
	Evented,
	DomEvent,
	DomUtil,
	Util
} from 'leaflet';


export const Spinbox = Evented.extend( /** @lends Spinbox */ {
	options: {
		title: 'Enter value',
		dmin: undefined,
		dmax: undefined,
		step: undefined,
		initValue: undefined,
		repButton: true,
		clickEvent: 'click',
		instantUpdate: false,
		className: 'leaflet-spinbox'
	},

	/**
	 * Create a new spinbox widget.

	 * @extends leaflet.Evented
	 * @memberof module:control/widget/Spinbox.js
	 * @constructs
	 * @override
	 * @param {object} parent - Parent element.
	 * @param {object} [options] - Options.

	 * @param {string} [options.title='Enter value']
	   Title of the control.

	 * @param {number} [options.dmin]
	   Minimum value.

	 * @param {number} [options.dmax]
	   Maximum value.

	 * @param {number} [options.step]
	   Initial value increment between autorepeat updates.

	 * @param {number} [options.initValue]
	   Initial value.

	 * @param {boolean} [options.repButton=true]
	   Up/Down spin buttons have autorepeat?

	 * @param {boolean} [options.instantUpdate=false]
	   Return updated value at each autorepeat update?

	 * @param {string} [options.className]
	   Element class name for the widget.

	 * @returns {Spinbox} Spinbox widget element.
	 */
	initialize: function (parent, options) {
		options = Util.setOptions(this, options);
		const	_this = this,
			drag = this._drag = {
				startEvent: 'touchstart mousedown',
				stopEvent : 'touchend mouseup mouseout touchcancel',
				move      : false,
				start     : false,
				end       : false,
				pos       : false,
				target    : false,
				delta     : false,
				tmp       : false,
				cnt       : 0,
				step      : options.step,
				prec      : this._prec(options.step)
			},
			wrap = this._wrap = DomUtil.create(
				'div',
				options.className,
				parent
			),
			input = this._input = DomUtil.create(
				'input',
				options.className + '-input',
				wrap
			),
			down = this._down = DomUtil.create(
				'div',
				options.className + '-down',
				wrap
			),
			downIcon = this._downIcon = DomUtil.create(
				'div',
				options.className + '-down-icon',
				down
			),
			up = this._up = DomUtil.create(
				'div',
				options.className + '-up',
				wrap
			),
			upIcon = this._upIcon = DomUtil.create(
				'div',
				options.className + '-up-icon',
				up
			);

		input.type = 'number';
		input.step = 0.1;	// Tells input that decimal numbers are valid
		DomEvent
			.disableClickPropagation(wrap)
			.disableScrollPropagation(wrap);

		if (input.disabled === true) {
			options.disabled = true;
		}

		if (options.dmin === undefined) {
			options.dmin = - Number.MAX_VALUE;
		}
		if (options.dmax === undefined) {
			options.dmax = Number.MAX_VALUE;
		}
		if (options.step === undefined) {
			options.step = 1;
		}

		if (options.initValue === undefined) {
			options.initValue = (options.dmin + options.dmax) / 2.0;
		}

		this.value(options.initValue);

		input.title = options.title;
		down.title = 'Decrease number by ' + options.step;
		up.title = 'Increase number by ' + options.step;

		DomEvent.on(this._input, 'change', function () {
			this.fire('change');
		}, this);

		if (options.repButton === false) {
			DomEvent.on(down, options.clickEvent, function (e) {
				e.preventDefault();
				this._offset(e.currentTarget, -1);
			}, this);
			DomEvent.on(up, options.clickEvent, function (e) {
				e.preventDefault();
				this._offset(e.currentTarget, 1);
			}, this);
		} else {
			DomEvent.on(down, drag.startEvent, function (e) {
				input.blur();
				drag.move = true;
				drag.cnt = 0;
				drag.step = options.step;
				drag.prec = this._prec(drag.step);
				drag.delta = -1;
				this._offset(e.currentTarget, -1);
				if (!this.runButton) {
					drag.target = e.currentTarget;
					this.runButton = setTimeout(function () {
						_this._sboxRun();
					}, 500);
				}
			}, this);
			DomEvent.on(up, drag.startEvent, function (e) {
				input.blur();
				drag.move = true;
				drag.cnt = 0;
				drag.step = options.step;
				drag.prec = this._prec(drag.step);
				drag.delta = 1;
				this._offset(e.currentTarget, 1);
				if (!this.runButton) {
					drag.target = e.currentTarget;
					this.runButton = setTimeout(function () {
						_this._sboxRun();
					}, 500);
				}
			}, this);
			DomEvent.on(down, drag.stopEvent, function (e) {
				if (drag.move) {
					e.preventDefault();
					clearTimeout(this.runButton);
					this.runButton = false;
					drag.move = false;
					if (options.instantUpdate === false) {
						this.fire('change');
					}
				}
			}, this);
			DomEvent.on(up, drag.stopEvent, function (e) {
				if (drag.move) {
					e.preventDefault();
					clearTimeout(this.runButton);
					this.runButton = false;
					drag.move = false;
					if (options.instantUpdate === false) {
						this.fire('change');
					}
				}
			}, this);
		}
	
		if (options.disabled) {
			this.disable();
		}

		return wrap;
	},

	/**
	 * Return or set the current value of the spinbox.
	 * @param {number} [val]
	   If provided, set the spinbox value to that of `val`.

	 * @returns {number} Spinbox value.
	 */
	value: function (val) {
		if (val === undefined) {
			return parseFloat(this._input.value);
		}
		else {
			this._input.value = val;
			return this;
		}
	},

	/**
	 * Return or set the current increment value of the spinbox.
	 * @param {number} [val]
	   If provided, set the spinbox increment value to that of `val`.

	 * @returns {number} Spinbox increment value.
	 */
	step: function (val) {
		if (val === undefined) {
			return this.options.step;
		}
		else {
			this.options.step = val;
			return this;
		}
	},

	/**
	 * Disable the spinbox widget.
	 */
	disable: function () {
		// Disable the element
		const	cname = 'disabled';

		this._input.disabled = true;
		this._input.blur();
		DomUtil.addClass(this._wrap, cname);
		DomUtil.addClass(this._down, cname);
		DomUtil.addClass(this._up, cname);
		this.options.disabled = true;
	},

	/**
	 * Enable the spinbox widget.
	 */
	enable: function () {
		// Enable the element
		const	cname = 'disabled';

		this._input.disabled = false;
		DomUtil.removeClass(this._wrap, cname);
		DomUtil.removeClass(this._down, cname);
		DomUtil.removeClass(this._up, cname);
		this.options.disabled = false;
	},

	/**
	 * Run one step of the spinbox.
	 * @private
	 */
	_sboxRun: function () {
		const	_this = this,
			options = this.options,
			drag = this._drag;

		let	timer = 150;

		if (drag.cnt === 20) {
			timer = 50;
			drag.step = 10.0 * options.step;
			drag.prec = this._prec(drag.step);
		} else if (drag.cnt === 40) {
			timer = 10;
			drag.step = 100.0 * options.step;
			drag.prec = this._prec(drag.step);
		} else if (drag.cnt === 60) {
			drag.step = 1000.0 * options.step;
			drag.prec = this._prec(drag.step);
		} else if (drag.cnt === 80) {
			drag.step = 10000.0 * options.step;
			drag.prec = this._prec(drag.step);
		}
		drag.didRun = true;
		this._offset(this, drag.delta);
		drag.cnt++;
		this.runButton = setTimeout(function () {
			_this._sboxRun();
		}, timer);
	},

	/**
	 * Set spinbox value precision.
	 * @private
	 * @param {number} step
	   Increment value.

	 * @returns {number} Number of decimals.
	 */
	_prec: function (step) {
		const	dprec = -0.4342944 * Math.log(step);
		return dprec > 0.0 ? Math.ceil(dprec) : 0;
	},

	/**
	 * Increment or decrement spinbox value.
	 * @private
	 * @param {object} target
	   Element that triggered the action.
	 * @param {number} direction
	   Step direction (-1 or +1).
	 */
	_offset: function (obj, direction) {
		const	options = this.options,
			input = this._input,
			drag = this._drag;

		if (!this.disabled) {
			if (direction < 1) {
				var	tmp = (parseFloat(input.value) - drag.step).toFixed(
					drag.prec
				);
				if (tmp >= options.dmin) {
					input.value = tmp;
					if (options.instantUpdate === true) {
						this.fire('change');
					}
				}
			} else {
				var	tmp = (parseFloat(input.value) + drag.step).toFixed(
					drag.prec
				);
				if (tmp <= options.dmax) {
					input.value = tmp;
					if (options.instantUpdate === true) {
						this.fire('change');
					}
				}
			}
		}
	}
});

/**
 * Instantiate a spinbox widget.
 *
 * @function
 * @param {object} [parent] - Parent element.
 * @param {object} [options] - Options: see {@link Spinbox}
 * @returns {Spinbox} Spinbox widget element.

 * @example
   ...
   const elem = DomUtil.create('div', 'myelement', divParent);
   const spinElem = Spinbox(elem, {initValue: 42.0, step: 2.0});
 */
export const spinbox = function (parent, options) {
	return new Spinbox(parent, options);
};

