/**
 #	This file part of:	VisiOmatic
 * @file Provide an extra synchronized map (PiP-style).

 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU.
   Adapted from L.Control.MiniMap by Norkart
   (original copyright notice follows).
Original code Copyright (c) 2012-2015, Norkart AS
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are
permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice, this list of
      conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice, this list
      of conditions and the following disclaimer in the documentation and/or other materials
      provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
import {
	Control,
	DomEvent,
	DomUtil,
	LatLngBounds,
	Map,
	Point,
	Util,
	polygon
} from 'leaflet';


export const ExtraMap = Control.extend( /** @lends ExtraMap */ {
	options: {
		title: 'Navigation mini-map. Grab to navigate',
		position: 'topright',
		width: 150,
		height: 150,
		collapsedWidth: 24,
		collapsedHeight: 24,
		toggleDisplay: true,
		autoToggleDisplay: false,
		zoomLevelFixed: false,
		zoomLevelOffset: -5,
		zoomAnimation: false,
		/**
		 * "Rectangle" footprint options.
		 * @typedef rectangleOptions
		 * @property {string} color
		   Rectangle color.
		 * @property {number} weight
		   Rectangle line weight.
		 * @property {number} [opacity=1]
		   Rectangle line opacity.
		 * @property {number} [fillOpacity=1]
		   Rectangle fill opacity.
		 * @property {boolean} [clickable=false]
		   Is the rectangle footprint clickable?
		 */
		aimingRectOptions: {
			color:  '#FFFFFF',
			weight: 1,
			clickable: false
		},
		shadowRectOptions: {
			color: '#FDC82F',
			weight: 1,
			opacity: 0,
			fillOpacity: 0,
			clickable: false
		},
		strings: {hideText: 'Hide map', showText: 'Show map'}
	},

	/**
	 * Create an extra map display/control interface.

	 * @extends leaflet.Control
	 * @memberof module:control/ExtraMap.js
	 * @constructs
	 * @param {leaflet.Layer} layer - Layer displayed in the extra map.
	 * @param {object} [options] - Options.

	 * @param {string} [options.title='Navigation mini-map. Grab to navigate']
	   Title of the map.

	 * @param {'bottomleft'|'bottomright'|'topleft'|'topright'} [options.position='topright']
	   Position of the map.

	 * @param {number} [options.width=150]
	   Map width in screen pixels.

	 * @param {number} [options.height=150]
	   Map height in screen pixels.

	 * @param {number} [options.width=24]
	   Map width in collapsed state, in screen pixels.

	 * @param {number} [options.height=24]
	   Map height in collapsed state, in screen pixels.

	 * @param {boolean} [options.toggleDisplay=true]
	   Add a map toggle display button?

	 * @param {boolean} [options.autoToggleDisplay=false]
	   Automatically toggle the map display when hovering the map icon?

	 * @param {number|false} [options.zoomLevelFixed=false]
	   Fixed extra map zoom level. Defaults to dynamic zooming.

	 * @param {number} [options.zoomLevelOffset=-5]
	   Zoom level offset with respect to that of the main map.

	 * @param {boolean} [options.zoomAnimation=false]
	   Animate when zooming in/out (warning: adds some lag)?

	 * @param {rectangleOptions} [options.aimingRectOptions]
	   Display options for the aiming rectangle.

	 * @param {rectangleOptions} [options.shadowRectOptions]
	   Display options for the shadow rectangle.

	 * @returns {ExtraMap} Instance of an extra map display/control interface.
	 */
	initialize: function (layer, options) {
		Util.setOptions(this, options);
		// Make sure the aiming rects are non-clickable even if the user tries
		// to set them clickable (most likely by forgetting to specify them false)
		this.options.aimingRectOptions.clickable = false;
		this.options.shadowRectOptions.clickable = false;
		this._layer = layer;
	},

	/**
	 * Add the extra map display/control directly to the map and wait for
	   the layer to be ready.
	 * @param {object} map - Leaflet map the control has been added to.
	 * @returns {object} The newly created container of the control.
	 */
	onAdd: function (map) {

		this._mainMap = map;

		// Creating the container and stopping events from spilling through
		// to the main map.
		this._container = DomUtil.create('div', 'leaflet-control-extramap');
		this._container.style.width = this.options.width + 'px';
		this._container.style.height = this.options.height + 'px';
		this._container.title = this.options.title;
		DomEvent.disableClickPropagation(this._container);
		DomEvent.on(this._container, 'mousewheel', DomEvent.stopPropagation);

		this._extraMap = new Map(this._container, {
			attributionControl: false,
			zoomControl: false,
			zoomAnimation: this.options.zoomAnimation,
			autoToggleDisplay: this.options.autoToggleDisplay,
			touchZoom: !this._isZoomLevelFixed(),
			scrollWheelZoom: !this._isZoomLevelFixed(),
			doubleClickZoom: !this._isZoomLevelFixed(),
			boxZoom: !this._isZoomLevelFixed()
		});
		this._layer.addTo(this._extraMap);

		// These bools are used to prevent infinite loops of the two maps
		// notifying each other that they've moved.
		// this._mainMapMoving = false;
		// this._extraMapMoving = false;

		// Keep a record of this to prevent auto toggling when the user
		// explicitly doesn't want it.
		this._userToggledDisplay = false;
		this._minimized = false;

		if (this.options.toggleDisplay) {
			this._addToggleButton();
		}

		this._mainMap.whenReady(Util.bind(function () {
			this._extraMap.whenReady(Util.bind(function () {
				this._aimingRect = polygon(this._getAimingCoords(this._mainMap),
					this.options.aimingRectOptions).addTo(this._extraMap);
				this._shadowRect = polygon(this._getAimingCoords(this._mainMap),
					this.options.shadowRectOptions).addTo(this._extraMap);
				this._mainMap.on('moveend', this._onMainMapMoved, this);
				this._mainMap.on('move', this._onMainMapMoving, this);
				this._extraMap.on(
					'movestart',
					this._onExtraMapMoveStarted,
					this
				);
				this._extraMap.on('move', this._onExtraMapMoving, this);
				this._extraMap.on('moveend', this._onExtraMapMoved, this);
				this._extraMap.setView(
					this._mainMap.getCenter(),
					this._decideZoom(true)
				);
				this._setDisplay(this._decideMinimized());
			}, this));
		}, this));


		return this._container;
	},

	/**
	 * Remove map move event when the extra map display/control is removed.
	 * @param {leaflet.map} [map] - The parent map.
	 */
	onRemove: function (map) {
		this._mainMap.off('moveend', this._onMainMapMoved, this);
		this._mainMap.off('move', this._onMainMapMoving, this);
		this._extraMap.off('moveend', this._onExtraMapMoved, this);

		this._extraMap.removeLayer(this._layer);
	},

	/**
	 * Update content when the layer is changed.
	 * @param {leaflet.Layer} [layer] - The new layer.
	 */
	changeLayer: function (layer) {
		this._extraMap.removeLayer(this._layer);
		this._layer = layer;
		this._extraMap.addLayer(this._layer);
	},

	/**
	 * Add a display toggle button to the extra map window/icon.
	 * @private
	 */
	_addToggleButton: function () {
		this._toggleDisplayButton = this.options.toggleDisplay ? this._addButton(
			'', this.options.strings.hideText, (
				'leaflet-control-extramap-toggle-display ' +
			  'leaflet-control-extramap-toggle-display-' + this.options.position
			),
			this._container, this._toggleDisplayButtonClicked, this
		) : undefined;

		this._toggleDisplayButton.style.width = this.options.collapsedWidth + 'px';
		this._toggleDisplayButton.style.height = this.options.collapsedHeight + 'px';
	},

	/**
	 * Add a button to the extra map window/icon.
	 * @private
	 * @returns {object} Button element.
	 */
	_addButton: function (html, title, className, container, fn, context) {
		const	link = DomUtil.create('a', className, container);
		link.innerHTML = html;
		link.href = '#';
		link.title = title;

		const	stop = DomEvent.stopPropagation;

		DomEvent
			.on(link, 'click', stop)
			.on(link, 'mousedown', stop)
			.on(link, 'dblclick', stop)
			.on(link, 'click', DomEvent.preventDefault)
			.on(link, 'click', fn, context);

		return link;
	},

	/**
	 * Actions performed when the display toggle button is clicked.
	 * @private
	 */
	_toggleDisplayButtonClicked: function () {
		this._userToggledDisplay = true;
		if (!this._minimized) {
			this._minimize();
			this._toggleDisplayButton.title = this.options.strings.showText;
		} else {
			this._restore();
			this._toggleDisplayButton.title = this.options.strings.hideText;
		}
	},

	/**
	 * Toggle display of the extra map window.
	 * @private
	 * @param {boolean} minimize
	   Minimize the map?
	 */
	_setDisplay: function (minimize) {
		if (minimize !== this._minimized) {
			if (!this._minimized) {
				this._minimize();
			} else {
				this._restore();
			}
		}
	},

	/**
	 * Minimize the extra map window.
	 * @private
	 */
	_minimize: function () {
		// hide the minimap
		if (this.options.toggleDisplay) {
			this._container.style.width = this.options.collapsedWidth + 'px';
			this._container.style.height = this.options.collapsedHeight + 'px';
			this._toggleDisplayButton.className += (' minimized-' + this.options.position);
		} else {
			this._container.style.display = 'none';
		}
		this._minimized = true;
	},

	/**
	 * Restore the extra map window.
	 * @private
	 */
	_restore: function () {
		if (this.options.toggleDisplay) {
			this._container.style.width = this.options.width + 'px';
			this._container.style.height = this.options.height + 'px';
			this._toggleDisplayButton.className = this._toggleDisplayButton.className
				.replace('minimized-'  + this.options.position, '');
		} else {
			this._container.style.display = 'block';
		}
		this._minimized = false;
	},

	_getAimingCoords: function(map, center) {
		const	z = map.getZoom(),
			bounds = map.getPixelBounds();
		if (center) {
			const	pcenter = map.project(center, z),
				size = bounds.getSize(),
				delta1 = size.divideBy(2.),
				delta2 = new Point(delta1.x, -delta1.y);

			return [
				map.unproject(pcenter.add(delta1), z),
				map.unproject(pcenter.add(delta2), z),
				map.unproject(pcenter.subtract(delta1), z),
				map.unproject(pcenter.subtract(delta2), z)
			];
		} else {
			return [
				map.unproject(bounds.getBottomLeft(), z),
				map.unproject(bounds.getTopLeft(), z),
				map.unproject(bounds.getTopRight(), z),
				map.unproject(bounds.getBottomRight(), z)
			];
		}
	},

	/**
	 * Follow the main map after it has moved.
	 * @private
	 * @param {leaflet.Event} e
	   Main map ``moveend`` event.
	 */
	_onMainMapMoved: function (e) {
		if (!this._extraMapMoving) {
			this._mainMapMoving = true;
			this._extraMap.setView(
				this._mainMap.getCenter(),
				this._decideZoom(true)
			);
			this._setDisplay(this._decideMinimized());
		} else {
			this._extraMapMoving = false;
		}
		this._aimingRect.setLatLngs(this._getAimingCoords(this._mainMap));
	},

	/**
	 * Replicate the main map moves using the aiming polygon footprint.
	 * @private
	 * @param {leaflet.Event} e
	   Main map ``move`` event.
	 */
	_onMainMapMoving: function (e) {
		this._aimingRect.setLatLngs(this._getAimingCoords(this._mainMap));
	},

	/**
	 * Set up the aiming polygon footprint as the extra map starts moving.
	 * @private
	 * @param {leaflet.Event} e
	   Extra map ``movestart`` event.
	 */
	_onExtraMapMoveStarted: function (e) {
		this._lastAimingRect = this._aimingRect.getLatLngs();
	},

	/**
	 * Update the shadow polygon footprint as the extra map is moving.
	 * @private
	 * @param {leaflet.Event} e
	   Extra map ``move`` event.
	 */
	_onExtraMapMoving: function (e) {
		if (!this._mainMapMoving && this._lastAimingRect) {
			this._shadowRect.setLatLngs(
				this._getAimingCoords(this._mainMap, this._extraMap.getCenter())
			);
			this._shadowRect.setStyle({opacity: 1, fillOpacity: 0.3});
		}
	},

	/**
	 * Update the main map as the extra map has stopped moving.
	 * @private
	 * @param {leaflet.Event} e
	   Extra map ``moveend`` event.
	 */
	_onExtraMapMoved: function (e) {
		if (!this._mainMapMoving) {
			this._extraMapMoving = true;
			this._mainMap.setView(
				this._extraMap.getCenter(),
				this._decideZoom(false)
			);
			this._shadowRect.setStyle({opacity: 0, fillOpacity: 0});
		} else {
			this._mainMapMoving = false;
		}
	},

	/**
	 * Update the main map as the extra map has stopped moving.
	 * @private
	 * @param {leaflet.Event} e
	   Extra map ``moveend`` event.
	 */
	_isZoomLevelFixed: function () {
		const	zoomLevelFixed = this.options.zoomLevelFixed;
		return this._isDefined(zoomLevelFixed) && this._isInteger(zoomLevelFixed);
	},

	/**
	 * Decide the extra map zoom level depending on current conditions.
	 * @private
	 * @param {boolean} fromMaintoExtra
	   Is zooming triggered from the main map?
	 */
	_decideZoom: function (fromMaintoExtra) {
		if (!this._isZoomLevelFixed()) {
			if (fromMaintoExtra) {
				return this._mainMap.getZoom() + this.options.zoomLevelOffset;
			} else {
				const	currentDiff = this._extraMap.getZoom() -
						this._mainMap.getZoom(),
					proposedZoom = this._extraMap.getZoom() -
						this.options.zoomLevelOffset;
				var	toRet;

				if (currentDiff > this.options.zoomLevelOffset &&
				  this._mainMap.getZoom() < this._extraMap.getMinZoom() -
					this.options.zoomLevelOffset) {
					// This means the extraMap is zoomed out to the minimum
					//  zoom level and can't zoom any more.
					if (this._extraMap.getZoom() > this._lastExtraMapZoom) {
						// This means the user is trying to zoom in
						// by using the minimap, zoom the main map.
						toRet = this._mainMap.getZoom() + 1;
						// Also we cheat and zoom the minimap out again
						// to keep it visually consistent.
						this._extraMap.setZoom(this._extraMap.getZoom() - 1);
					} else {
						// Either the user is trying to zoom out past the
						// minimap's min zoom or has just panned using it, we
						// can't tell the difference. Therefore, we ignore it!
						toRet = this._mainMap.getZoom();
					}
				} else {
					// This is what happens in the majority of cases,
					// and always if you configure the min levels + offset
					// in a sane fashion.
					toRet = proposedZoom;
				}
				this._lastExtraMapZoom = this._extraMap.getZoom();
				return toRet;
			}
		} else {
			if (fromMaintoExtra) {
				return this.options.zoomLevelFixed;
			} else {
				return this._mainMap.getZoom();
			}
		}
	},

	/**
	 * Decide if the extra map must be minimized.
	 * @private
	 */
	_decideMinimized: function () {
		if (this._userToggledDisplay) {
			return this._minimized;
		}

		if (this.options.autoToggleDisplay) {
			if (this._mainMap.getBounds().contains(this._extraMap.getBounds())) {
				return true;
			}
			return false;
		}

		return this._minimized;
	},

	/**
	 * Testing for ``number`` type.
	 * @private
	 * @param {number} value - Input.
	 * @return {boolean} True if the input value is a number.
	 */
	_isInteger: function (value) {
		return typeof value === 'number';
	},

	/**
	 * Testing for ``undefined`` type.
	 * @private
	 * @param {number} value - Input.
	 * @return {boolean} True if the input value is strictly ``undefined``.
	 */
	_isDefined: function (value) {
		return typeof value !== 'undefined';
	}
});


/**
 * Instantiate an extra map display/control interface.
 * @memberof module:control/ExtraMap.js
 * @function
 * @param {object} [options] - Options: see {@link ExtraMap}
 * @returns {ExtraMap} Instance of an extra map display/control interface.
*/
export const extraMap = function (layer, options) {
	return new ExtraMap(layer, options);
};


/**
 * Deactivate extra map control.
 * @method
 * @static
 * @memberof leaflet.Map
 */
Map.mergeOptions({
	extraMapControl: false
});


/**
 * Add a hook to maps for extra map control.
 * @method
 * @static
 * @memberof leaflet.Map
 */
Map.addInitHook(function () {
	if (this.options.extraMapControl) {
		this.extraMapControl = (new ExtraMap()).addTo(this);
	}
});


