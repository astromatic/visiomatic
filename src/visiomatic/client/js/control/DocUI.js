/*
#	UI for the online documentation.
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2015-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#	                         Chiara Marmo    - Paris-Saclay
*/
import {
	DomEvent,
	DomUtil,
	Util
} from 'leaflet';

import {VUtil} from '../util'
import {UI} from './UI'


export const DocUI = UI.extend({
	options: {
		title: 'Documentation',
		collapsed: true,
		position: 'topleft',
		pdflink: undefined
	},

	initialize: function (url, options) {
		Util.setOptions(this, options);

		this._className = 'visiomatic-control';
		this._id = 'visiomatic-doc';
		this._sideClass = 'doc';
		this._url = url;
	},

	_initDialog: function () {
		var _this = this,
			className = this._className,
			layer = this._layer,
			frameBox = DomUtil.create('div',
		    this._className + '-framebox', this._dialog),
			iframe = this._iframe = DomUtil.create('iframe',
			  this._className + '-doc', frameBox);
		iframe.src = this._url;
		iframe.frameborder = 0;

		this._navHistory = [];
		this._navPos = 0;
		this._ignore = false;

		DomEvent.on(iframe, 'load hashchange', this._onloadNav, this);

		var	box = this._addDialogBox('visiomatic-doc-dialog'),
			line = this._addDialogLine('Navigate:', box),
			elem = this._addDialogElement(line);

		this._homeButton = this._addButton(
			className + '-button',
			elem,
			'home',
			'Navigate home',
			this._homeNav
		);
		this._backButton = this._addButton(
			className + '-button',
			elem,
			'back',
			'Navigate backward',
			this._backNav
		);
		this._forwardButton = this._addButton(
			className + '-button',
			elem,
			'forward',
			'Navigate forward',
			this._forwardNav
		);

		if (this.options.pdflink) {
			var pdfButton = this._addButton(
				className + '-button',
				elem,
				'pdf',
				'Download PDF version'
			);
			pdfButton.href = this.options.pdflink;
		}
	},

	// Update navigation buttons, based on http://stackoverflow.com/a/7704305
	_updateNav: function (newPos) {
		if (newPos !== this._navPos) {
			this._navPos = newPos;
			this._navIgnore = true;
			this._iframe.src = this._navHistory[this._navPos - 1];
			this._disableNav();
		}
	},

	_disableNav: function () {
		// Enable / disable back button?
		this._backButton.disabled = (this._navPos === 1);
		// Enable / disable forward button?
		this._forwardButton.disabled = (this._navPos >= this._navHistory.length);
	},

	// Navigate back in IFrame, based on http://stackoverflow.com/a/7704305
	_backNav: function () {
		if (!this._backButton.disabled) {
			this._updateNav(Math.max(1, this._navPos - 1));
		}
	},

	// Navigate forward in IFrame, based on http://stackoverflow.com/a/7704305
	_forwardNav: function () {
		if (!this._forwardButton.disabled) {
			this._updateNav(Math.min(this._navHistory.length, this._navPos + 1));
		}
	},

	// Navigate home in IFrame
	_homeNav: function () {
		if (!this._backButton.disabled) {
			this._updateNav(1);
		}
	},

	// Triggered on IFrame load, based on http://stackoverflow.com/a/7704305
	_onloadNav: function () {
		if (true) {
			// Force all external iframe links to open in new tab/window
			// from 
			var	as = this._iframe.contentDocument.getElementsByTagName('a');
			for (var i = 0; i < as.length; i++) {
				if (VUtil.isExternal(as[i].href)) {
					as[i].setAttribute('target', '_blank');
				}
			}
			this._iframeLoad1 = true;
		}

		if (!this._navIgnore) {
			var href = this._iframe.contentWindow.location.href;
			if (href !== this._navHistory[this._navPos - 1]) {
				this._navHistory.splice(this._navPos, this._navHistory.length - this._navPos);
				this._navHistory.push(href);
				this._navPos = this._navHistory.length;
				this._disableNav();
			}
		} else {
			this._navIgnore = false;
		}
	}

});

export const docUI = function (url, options) {
	return new DocUI(url, options);
};

