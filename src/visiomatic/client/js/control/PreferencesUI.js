/**
 #	This file part of:	VisiOmatic
 * @file User Interface for managing preferences

 * @requires util/VUtil.js
 * @requires control/UI.js

 * @copyright (c) 2015-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/
import {Util} from 'leaflet';

import {VUtil} from '../util';
import {UI} from './UI';


export const PreferencesUI = UI.extend( /** @lends PreferencesUI */ {
	options: {
		title: 'Preferences',
		collapsed: true,
		position: 'topleft'
	},

	/**
	 * Create a VisiOmatic dialog for managing preferences.

	 * @extends UI
	 * @memberof module:control/PreferencesUI.js
	 * @constructs
	 * @param {object} [options] - Options.

	 * @param {string} [options.title='Preferences']
	   Title of the dialog window or panel.

	 * @see {@link UI} for additional control options.

	 * @returns {PreferencesUI} Instance of a VisiOmatic preference interface.
	 */
	initialize: function (options) {
		Util.setOptions(this, options);

		this._className = 'visiomatic-control';
		this._id = 'visiomatic-preferences';
		this._sideClass = 'preferences';
	},

	/**
	 * Initialize the Preferences dialog.
	 * @method
	 * @static
	 * @private
	 */
	_initDialog: function () {
		const _this = this,
			className = this._className,
			layer = this._layer,
			visio = layer.visio,
			map = this._map;

		// Theme preferences
		const	line = this._addDialogLine('Theme:', this._dialog),
			elem = this._addDialogElement(line),
			items = ['Light', 'Dark'];

		this._themeIndex = 0;
		this._themeSelect =  this._addSelectMenu(
			this._className + '-select',
			elem,
			items,
			undefined,
			this._themeIndex,
			'Select theme',
			function () {
				this._themeIndex = parseInt(this._themeSelect.selectedIndex - 1, 10);
			}
		);
	}

});

/**
 * Instantiate a VisiOmatic dialog for managing preferences.
 * @function
 * @param {object} [options] - Options: see {@link PreferencesUI}
 * @returns {PreferencesUI} Instance of a VisiOmatic preference interface.
 */
export const preferencesUI = function (options) {
	return new PreferencesUI(options);
};

