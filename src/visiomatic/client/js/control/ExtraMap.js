/*
#	Add extra synchronized map.
#	(Picture-in-Picture style). Adapted from L.Control.MiniMap by Norkart
#	(original copyright notice reproduced below).
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#	                         Chiara Marmo    - Paris-Saclay

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
	Util,
	rectangle
} from 'leaflet';


export const ExtraMap = Control.extend({
	options: {
		position: 'topright',
		title: 'Navigation mini-map. Grab to navigate',
		toggleDisplay: true,
		zoomLevelFixed: false,
		zoomLevelOffset: -5,
		zoomAnimation: false,
		autoToggleDisplay: false,
		width: 150,
		height: 150,
		collapsedWidth: 24,
		collapsedHeight: 24,
		aimingRectOptions: {
			color:  '#FFFFFF',
			weight: 1,
			clickable: false
		},
		shadowRectOptions: {
			color: '#FDC82F',
			weight: 1,
			clickable: false,
			opacity: 0,
			fillOpacity: 0
		},
		strings: {hideText: 'Hide map', showText: 'Show map'}
	},

	// Layer is the map layer to be shown in the minimap
	initialize: function (layer, options) {
		Util.setOptions(this, options);
		// Make sure the aiming rects are non-clickable even if the user tries to set
		// them clickable (most likely by forgetting to specify them false)
		this.options.aimingRectOptions.clickable = false;
		this.options.shadowRectOptions.clickable = false;
		this._layer = layer;
	},

	onAdd: function (map) {

		this._mainMap = map;

		// Creating the container and stopping events from spilling through to the main map.
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

		// These bools are used to prevent infinite loops of the two maps notifying
		// each other that they've moved.
		// this._mainMapMoving = false;
		// this._extraMapMoving = false;

		// Keep a record of this to prevent auto toggling when the user explicitly doesn't want it.
		this._userToggledDisplay = false;
		this._minimized = false;

		if (this.options.toggleDisplay) {
			this._addToggleButton();
		}

		this._mainMap.whenReady(Util.bind(function () {
			this._extraMap.whenReady(Util.bind(function () {
				this._aimingRect = rectangle(this._mainMap.getBounds(),
					this.options.aimingRectOptions).addTo(this._extraMap);
				this._shadowRect = rectangle(this._mainMap.getBounds(),
					this.options.shadowRectOptions).addTo(this._extraMap);
				this._mainMap.on('moveend', this._onMainMapMoved, this);
				this._mainMap.on('move', this._onMainMapMoving, this);
				this._extraMap.on('movestart', this._onExtraMapMoveStarted, this);
				this._extraMap.on('move', this._onExtraMapMoving, this);
				this._extraMap.on('moveend', this._onExtraMapMoved, this);
				this._extraMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
				this._setDisplay(this._decideMinimized());
			}, this));
		}, this));


		return this._container;
	},

	addTo: function (map) {
		Control.prototype.addTo.call(this, map);
		return this;
	},

	onRemove: function (map) {
		this._mainMap.off('moveend', this._onMainMapMoved, this);
		this._mainMap.off('move', this._onMainMapMoving, this);
		this._extraMap.off('moveend', this._onExtraMapMoved, this);

		this._extraMap.removeLayer(this._layer);
	},

	changeLayer: function (layer) {
		this._extraMap.removeLayer(this._layer);
		this._layer = layer;
		this._extraMap.addLayer(this._layer);
	},

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

	_addButton: function (html, title, className, container, fn, context) {
		var link = DomUtil.create('a', className, container);
		link.innerHTML = html;
		link.href = '#';
		link.title = title;

		var stop = DomEvent.stopPropagation;

		DomEvent
			.on(link, 'click', stop)
			.on(link, 'mousedown', stop)
			.on(link, 'dblclick', stop)
			.on(link, 'click', DomEvent.preventDefault)
			.on(link, 'click', fn, context);

		return link;
	},

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

	_setDisplay: function (minimize) {
		if (minimize !== this._minimized) {
			if (!this._minimized) {
				this._minimize();
			} else {
				this._restore();
			}
		}
	},

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

	_onMainMapMoved: function (e) {
		if (!this._extraMapMoving) {
			this._mainMapMoving = true;
			this._extraMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
			this._setDisplay(this._decideMinimized());
		} else {
			this._extraMapMoving = false;
		}
		this._aimingRect.setBounds(this._mainMap.getBounds());
	},

	_onMainMapMoving: function (e) {
		this._aimingRect.setBounds(this._mainMap.getBounds());
	},

	_onExtraMapMoveStarted: function (e) {
		var lastAimingRect = this._aimingRect.getBounds();
		var sw = this._extraMap.latLngToContainerPoint(lastAimingRect.getSouthWest());
		var ne = this._extraMap.latLngToContainerPoint(lastAimingRect.getNorthEast());
		this._lastAimingRectPosition = {sw: sw, ne: ne};
	},

	_onExtraMapMoving: function (e) {
		if (!this._mainMapMoving && this._lastAimingRectPosition) {
			this._shadowRect.setBounds(new LatLngBounds(
				this._extraMap.containerPointToLatLng(this._lastAimingRectPosition.sw),
				this._extraMap.containerPointToLatLng(this._lastAimingRectPosition.ne)
			));
			this._shadowRect.setStyle({opacity: 1, fillOpacity: 0.3});
		}
	},

	_onExtraMapMoved: function (e) {
		if (!this._mainMapMoving) {
			this._extraMapMoving = true;
			this._mainMap.setView(this._extraMap.getCenter(), this._decideZoom(false));
			this._shadowRect.setStyle({opacity: 0, fillOpacity: 0});
		} else {
			this._mainMapMoving = false;
		}
	},

	_isZoomLevelFixed: function () {
		var zoomLevelFixed = this.options.zoomLevelFixed;
		return this._isDefined(zoomLevelFixed) && this._isInteger(zoomLevelFixed);
	},

	_decideZoom: function (fromMaintoExtra) {
		if (!this._isZoomLevelFixed()) {
			if (fromMaintoExtra) {
				return this._mainMap.getZoom() + this.options.zoomLevelOffset;
			} else {
				var currentDiff = this._extraMap.getZoom() - this._mainMap.getZoom();
				var proposedZoom = this._extraMap.getZoom() - this.options.zoomLevelOffset;
				var toRet;

				if (currentDiff > this.options.zoomLevelOffset &&
				  this._mainMap.getZoom() < this._extraMap.getMinZoom() - this.options.zoomLevelOffset) {
					// This means the extraMap is zoomed out to the minimum zoom level and
					// can't zoom any more.
					if (this._extraMap.getZoom() > this._lastExtraMapZoom) {
						// This means the user is trying to zoom in by using the minimap, zoom the main map.
						toRet = this._mainMap.getZoom() + 1;
						// Also we cheat and zoom the minimap out again to keep it visually consistent.
						this._extraMap.setZoom(this._extraMap.getZoom() - 1);
					} else {
						// Either the user is trying to zoom out past the minimap's min zoom or
						// has just panned using it, we can't tell the difference. Therefore, we ignore it!
						toRet = this._mainMap.getZoom();
					}
				} else {
					// This is what happens in the majority of cases, and always if you
					// configure the min levels + offset in a sane fashion.
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

	_isInteger: function (value) {
		return typeof value === 'number';
	},

	_isDefined: function (value) {
		return typeof value !== 'undefined';
	}
});

Map.mergeOptions({
	extraMapControl: false
});

Map.addInitHook(function () {
	if (this.options.extraMapControl) {
		this.extraMapControl = (new Control.ExtraMap()).addTo(this);
	}
});

export const extraMap = function (layer, options) {
	return new ExtraMap(layer, options);
};
