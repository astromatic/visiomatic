/*
# SpinBox implements a number spinbox with adaptive step increment
# Adapted from JTSage's spinbox (original attribution below), with all the
# jQuery and jQuery Mobile stuff removed.
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2015 Emmanuel Bertin - IAP/CNRS/UPMC
#
#	Last modified: 13/11/2015
/*
 * jQuery Mobile Framework : plugin to provide number spinbox.
 * Copyright (c) JTSage
 * CC 3.0 Attribution.  May be relicensed without permission/notification.
 * https://github.com/jtsage/jquery-mobile-spinbox
 */

L.SpinBox = L.Evented.extend({
	options: {
		// All widget options
		dmin: undefined,
		dmax: undefined,
		step: undefined,
		initValue: undefined,
		repButton: true,
		clickEvent: 'click',
		instantUpdate: false,
		title: 'Enter value',
		className: 'leaflet-spinbox'
	},

	initialize: function (parent, options) {
		options = L.setOptions(this, options);
		var _this = this,
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
			wrap = this._wrap = L.DomUtil.create('div', options.className, parent),
			input = this._input = L.DomUtil.create('input', options.className + '-input', wrap),
			down = this._down = L.DomUtil.create('div', options.className + '-down', wrap),
			up = this._up = L.DomUtil.create('div', options.className + '-up', wrap);

		input.type = 'number';
		input.step = 0.1;	// Tells input that decimal numbers are valid
		L.DomEvent
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

		L.DomEvent.on(this._input, 'change', function () {
			this.fire('change');
		}, this);

		if (options.repButton === false) {
			L.DomEvent.on(down, options.clickEvent, function (e) {
				e.preventDefault();
				this._offset(e.currentTarget, -1);
			}, this);
			L.DomEvent.on(up, options.clickEvent, function (e) {
				e.preventDefault();
				this._offset(e.currentTarget, 1);
			}, this);
		} else {
			L.DomEvent.on(down, drag.startEvent, function (e) {
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
			L.DomEvent.on(up, drag.startEvent, function (e) {
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
			L.DomEvent.on(down, drag.stopEvent, function (e) {
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
			L.DomEvent.on(up, drag.stopEvent, function (e) {
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

	value: function (val) {
		if (val === undefined) {
			return parseFloat(this._input.value);
		}
		else {
			this._input.value = val;
			return this;
		}
	},

	step: function (val) {
		if (val === undefined) {
			return this.options.step;
		}
		else {
			this.options.step = val;
			return this;
		}
	},

	disable: function () {
		// Disable the element
		var cname = 'disabled';

		this._input.disabled = true;
		this._input.blur();
		L.DomUtil.addClass(this._wrap, cname);
		L.DomUtil.addClass(this._down, cname);
		L.DomUtil.addClass(this._up, cname);
		this.options.disabled = true;
	},

	enable: function () {
		// Enable the element
		var cname = 'disabled';

		this._input.disabled = false;
		L.DomUtil.removeClass(this._wrap, cname);
		L.DomUtil.removeClass(this._down, cname);
		L.DomUtil.removeClass(this._up, cname);
		this.options.disabled = false;
	},

	_sboxRun: function () {
		var	_this = this,
				timer = 150,
				options = this.options,
				drag = this._drag;

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

	_prec: function (step) {
		var dprec = -0.4342944 * Math.log(step);
		return dprec > 0.0 ? Math.ceil(dprec) : 0;
	},

	_offset: function (obj, direction) {
		var tmp,
				options = this.options,
				input = this._input,
				drag = this._drag;

		if (!this.disabled) {
			if (direction < 1) {
				tmp = (parseFloat(input.value) - drag.step).toFixed(drag.prec);
				if (tmp >= options.dmin) {
					input.value = tmp;
					if (options.instantUpdate === true) {
						this.fire('change');
					}
				}
			} else {
				tmp = (parseFloat(input.value) + drag.step).toFixed(drag.prec);
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

L.spinbox = function (parent, options) {
	return new L.SpinBox(parent, options);
};
