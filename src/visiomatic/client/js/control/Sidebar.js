/**
 #	This file part of:	VisiOmatic
 * @file Responsive sidebar.

 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
 * @copyright (c) 2015-2023 CNRS/IAP/CFHT/SorbonneU.
   Adapted from the leaflet-sidebar plugin by Tobias Bieniek
   (original copyright notice follows).

The MIT License (MIT)

Copyright (c) 2013 Tobias Bieniek

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import {Browser, Control, DomEvent, DomUtil, Evented, Util} from 'leaflet';


export const Sidebar = Control.extend( /** @lends Sidebar */ {
	includes: Evented && Evented.prototype,

	options: {
		title: 'Toggle advanced menu',
		position: 'left',
		collapsed: true,
		forceSeparateButton: false
	},

	/**
	 * Create a new sidebar.

	 * @extends leaflet.Control
	 * @memberof module:control/Sidebar.js
	 * @constructs
	 * @param {object} [options] - Options.

	 * @param {string} [options.title='Toggle advanced menu']
	   Title of the panel.

	 * @param {'left'|'right'} [options.position='left']
	   Position of the sidebar.

	 * @param {boolean} [options.collapsed=true]
	   Sidebar initially in closed position?

	 * @param {boolean} [options.forceSeparateButton=false]
	   Sidebar button separate from zoom control?

	 * @returns {Sidebar} Instance of a sidebar.
	 */
	initialize: function (options) {

		Util.setOptions(this, options);

		// Create sidebar
		this._sidebar = DomUtil.create('div', 'leaflet-container sidebar');
		if (this.options.collapsed) {
			DomUtil.addClass(this._sidebar, 'collapsed');
		} else {
			DomUtil.addClass(this._sidebar, 'closed');
		}
		// Attach .sidebar-left/right class
		DomUtil.addClass(this._sidebar, 'sidebar-' + this.options.position);

		// Attach touch styling if necessary
		if (Browser.touch) {
			DomUtil.addClass(this._sidebar, 'leaflet-touch');
		}

		// Create containers for tabs and their contents (panes)
		this._tabs = DomUtil.create('div', 'sidebar-tabs', this._sidebar);
		this._tabitems = [];

		this._container = DomUtil.create('div', 'sidebar-content', this._sidebar);
		this._panes = [];
		this._closeButtons = [];
	},

	/**
	 * Add this sidebar to the specified map.
	 *
	 * @param {L.Map} map
	   Leaflet map the control is to be added to.
	 * @returns {Sidebar}
	   The sidebar (this).
	 */
	addTo: function (map) {
		const	className = 'leaflet-control-zoom-sidebar',
			parent = map._controlContainer;
		var	buttonContainer;
	
		// Create sidebar
		DomUtil.addClass(map._container, 'sidebar-map');
		parent.insertBefore(this._sidebar, parent.firstChild);
		DomEvent
			.disableClickPropagation(this._sidebar)
			.disableScrollPropagation(this._sidebar);

		this._map = map;

		// Create sidebar toggle button
		if (map.zoomControl && !this.options.forceSeparateButton) {
			buttonContainer = map.zoomControl._container;
		} else {
			buttonContainer = DomUtil.create('div', 'leaflet-bar');
		}
		
		this._toggleButton = this._addButton(this.options.title,
		  className + (this.options.collapsed ? ' collapsed' : ''), buttonContainer);

		return this;
	},

	/**
	 * Add sidebar tab list.
	 *
	 * @returns {object} Tab list element.
	 */
	addTabList: function () {
		this._tablist = DomUtil.create('ul', '', this._tabs);
		this._tablist.setAttribute('role', 'tablist');
		return this._tablist;
	},

	/**
	 * Add sidebar tab and its pane.
	 *
	 * @param {string} id
	   Element id of the tab pane (and part of the tab id).
	 * @param {string} className
	   Class name of the tab.
	 * @param {string} [title]
	   Title of the tab.
	 * @param {object} content
	   Element containing the tab content.
	 * @param {string} [sideClass] 
	   Class name of an additional element which may be opened or close in
	   parallel to the tab.
	 * @returns {object} The newly created tab pane.
	 */
	addTab: function (id, className, title, content, sideClass) {
		const	tablist = this._tablist ? this._tablist : this.addTabList(),
			item = DomUtil.create('li', '', tablist),
			button = DomUtil.create('a', className, item);

		item.setAttribute('role', 'tab');
		item._sidebar = this;
		button.href = '#' + id;
		button.id = id + '-toggle';
		button.title = title;
		DomEvent.on(button, 'click', L.DomEvent.preventDefault);
		DomEvent.on(button, 'click', this._onClick, item);
		item.sideClass = sideClass;
		this._tabitems.push(item);

		// Sidebar pane
		const	pane = DomUtil.create('div', 'sidebar-pane', this._container),
			header = DomUtil.create('h1', 'sidebar-header', pane);

		header.innerHTML = title;

		const	closeButton = DomUtil.create('div', 'sidebar-close', header),
			closeIcon = DomUtil.create('div', 'sidebar-close-icon', closeButton);
		this._closeButtons.push(closeButton);
		DomEvent.on(closeButton, 'click', this._onCloseClick, this);
		pane.id = id;
		pane.sideClass = sideClass;
		pane.appendChild(content);
		this._panes.push(pane);
		return pane;
	},

	/**
	 * Remove this sidebar from the map.
	 *
	 * @param {L.Map} map
	   Leaflet map the control had been added to.
	 * @returns {Sidebar}
	   The sidebar (this).
	 */
	removeFrom: function (map) {

		this._map = null;

		for (var i = this._tabitems.length - 1; i >= 0; i--) {
			var	child = this._tabitems[i];
			DomEvent.off(child.querySelector('a'), 'click', this._onClick);
		}

		for (var i = this._closeButtons.length - 1; i >= 0; i--) {
			var	child = this._closeButtons[i];
			DomEvent.off(child, 'click', this._onCloseClick, this);
		}

		return this;
	},

	/**
	 * Open sidebar (if necessary) and show the specified tab.
	 *
	 * @param {string} id - The id of the tab to show (without the # character)
	 * @returns {Sidebar}
	   The sidebar (this).
	 */
	open: function (id) {

		// hide old active contents and show new content
		for (var i = this._panes.length - 1; i >= 0; i--) {
			var	child = this._panes[i];
			if (child.id === id) {
				DomUtil.addClass(child, 'active');
				if (child.sideClass) {
					DomUtil.addClass(this._sidebar, child.sideClass);
				}
			} else if (DomUtil.hasClass(child, 'active')) {
				DomUtil.removeClass(child, 'active');
				if (child.sideClass) {
					DomUtil.removeClass(this._sidebar, child.sideClass);
				}
			}
		}

		// remove old active highlights and set new highlight
		for (var i = this._tabitems.length - 1; i >= 0; i--) {
			var	child = this._tabitems[i];
			if (child.querySelector('a').hash === '#' + id) {
				DomUtil.addClass(child, 'active');
			} else if (DomUtil.hasClass(child, 'active')) {
				DomUtil.removeClass(child, 'active');
			}
		}

		this.fire('content', {id: id});

		// open sidebar (if necessary)
		if (DomUtil.hasClass(this._sidebar, 'closed')) {
			this.fire('opening');
			DomUtil.removeClass(this._sidebar, 'closed');
		}

		return this;
	},

	/**
	 * Close the sidebar (if necessary).
	 *
	 * @returns {Sidebar}
	   The sidebar (this).
	 */
	close: function () {
		// remove old active highlights
		for (var i = this._tabitems.length - 1; i >= 0; i--) {
			var child = this._tabitems[i];
			if (DomUtil.hasClass(child, 'active')) {
				DomUtil.removeClass(child, 'active');
				if (child.sideClass) {
					DomUtil.removeClass(this._sidebar, child.sideClass);
				}
			}
		}

		// close sidebar
		if (!DomUtil.hasClass(this._sidebar, 'closed')) {
			this.fire('closing');
			DomUtil.addClass(this._sidebar, 'closed');
		}

		return this;
	},

	/**
	 * Collapse/Expand the sidebar.
	 */
	toggle: function () {
		this.close();
		if (DomUtil.hasClass(this._sidebar, 'collapsed')) {
			DomUtil.addClass(this._sidebar, 'closed');
			this.fire('expanding');
			DomUtil.removeClass(this._sidebar, 'collapsed');
			DomUtil.removeClass(this._toggleButton, 'collapsed');
		} else {
			DomUtil.removeClass(this._sidebar, 'closed');
			this.fire('collapsing');
			DomUtil.addClass(this._sidebar, 'collapsed');
			DomUtil.addClass(this._toggleButton, 'collapsed');
		}
	},

	/**
	 * Actions performed when clicking on the sidebar toggle button.
	 * @private
	 */
	_onClick: function () {
		if (DomUtil.hasClass(this, 'active')) {
			this._sidebar.close();
		} else if (!DomUtil.hasClass(this, 'disabled')) {
			this._sidebar.open(this.querySelector('a').hash.slice(1));
		}
	},

	/**
	 * Actions performed when clicking on the sidebar close button.
	 * @private
	 */
	_onCloseClick: function () {
		this.close();
	},

	/**
	 * Add a button
	 *
	 * @private
	 * @param {string} [title]
	   Title of the button.
	 * @param {string} className
	   Class name of the button.
	 * @param {object} container
	   Element containing the button.
	 * @returns {object} New link (button) element.
	 */
	_addButton: function (title, className, container) {
		const	link = DomUtil.create('a', className, container);
		link.href = '#';
		link.title = title;

		DomEvent
			.addListener(link, 'click', DomEvent.stopPropagation)
			.addListener(link, 'click', DomEvent.preventDefault)
			.addListener(link, 'click', this.toggle, this);

		return link;
	}

});

/**
 * Instantiate a sidebar.
 *
 * @function
 * @param {object} [options] - Options: see {@link Sidebar}
 * @returns {Sidebar} Instance of a sidebar.

 * @example
 * const sb = sidebar({position: right}).addTo(map);
 */
export const sidebar = function (map, options) {
	return new Sidebar(map, options);
};
