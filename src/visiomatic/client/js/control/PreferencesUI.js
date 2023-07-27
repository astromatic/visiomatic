/**
 #	This file part of:	VisiOmatic
 * @file User Interface for managing preferences

 * @requires util/VUtil.js
 * @requires control/UI.js

 * @copyright (c) 2015-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/
import {DomUtil, Util} from 'leaflet';

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
			line = this._addDialogLine('Theme:', this._dialog),
			elem = this._addDialogElement(line),
			prefix = 'visiomatic-theme-';

		// Build theme class names from list in the CSS variable in themes.css.
		this._themeList = getComputedStyle(document.documentElement)
			.getPropertyValue('--visiomatic-theme-names').split(/\s+/);
		this._themeClassList = this._themeList.map(
			theme => prefix + theme.toLowerCase()
		);

		// Get and apply default theme from CSS variable in themes.css.
		this._defaultTheme = getComputedStyle(document.documentElement)
			.getPropertyValue('--visiomatic-theme-default');
		this._themeIndex = this._themeList.findIndex(
			theme => theme === this._defaultTheme
		);
		DomUtil.addClass(
			_this._map._container,
			_this._themeClassList[this._themeIndex]
		);

		this._themeSelect = this._addSelectMenu(
			this._className + '-select',
			elem,
			this._themeList,
			undefined,
			this._themeIndex,
			'Select theme',
			() => {
				const	index = parseInt(
					_this._themeSelect.selectedIndex - 1,
					10
				);				
				// Remove pre-existing theme
				DomUtil.removeClass(
					_this._map._container,
					_this._themeClassList[_this._themeIndex]
				);
				DomUtil.addClass(
					_this._map._container,
					_this._themeClassList[index]
				);
				this._themeIndex = index;
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

