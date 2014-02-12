/*
# L.Control.ExtraMap adds support for extra synchronized maps 
# (Picture-in-Picture style). Adapted from L.Control.MiniMap by Norkart
# (original copyright notice reproduced below).
#
#	This file part of:	VisiOmatic
#	Copyright:		(C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                        Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 11/02/2014

Original code Copyright (c) 2012, Norkart AS
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
L.Control.ExtraMap = L.Control.extend({
	options: {
		position: 'bottomright',
		toggleDisplay: true,
		zoomLevelOffset: -5,
		zoomLevelFixed: false,
		zoomAnimation: false,
		autoToggleDisplay: false,
		width: 150,
		height: 150,
		aimingRectOptions: {color: '#ff7800', weight: 1, clickable: false,
		                    renderer: L.Canvas.instance},
		shadowRectOptions: {color: '#000000', weight: 1, clickable: false,
		                    opacity: 0, fillOpacity: 0}
	},
	
	hideText: 'Hide map',
	showText: 'Show map',
	
	//layer is the map layer to be shown in the extramap
	initialize: function (layer, options) {
		L.Util.setOptions(this, options);
		//Make sure the aiming rects are non-clickable even if the user tries
		// to set them clickable (most likely by forgetting to specify them false)
		this.options.aimingRectOptions.clickable = false;
		this.options.shadowRectOptions.clickable = false;
		this._layer = layer;
	},
	
	onAdd: function (map) {

		this._mainMap = map;

		//Creating the container and stopping events from spilling through to the main map.
		this._container = L.DomUtil.create('div', 'leaflet-control-extramap');
		this._container.style.width = this.options.width + 'px';
		this._container.style.height = this.options.height + 'px';
		L.DomEvent.disableClickPropagation(this._container);
		L.DomEvent.on(this._container, 'mousewheel', L.DomEvent.stopPropagation);


		this._extraMap = new L.Map(this._container,
		{
			attributionControl: false,
			zoomControl: false,
			zoomAnimation: this.options.zoomAnimation,
			autoToggleDisplay: this.options.autoToggleDisplay,
			touchZoom: !this.options.zoomLevelFixed,
			scrollWheelZoom: !this.options.zoomLevelFixed,
			doubleClickZoom: !this.options.zoomLevelFixed,
			boxZoom: !this.options.zoomLevelFixed,
		});

		this._layer.addTo(this._extraMap);

		//These bools are used to prevent infinite loops of the two maps notifying each other that they've moved.
//		this._mainMapMoving = false;
//		this._extraMapMoving = false;

		//Keep a record of this to prevent auto toggling when the user explicitly doesn't want it.
		this._userToggledDisplay = false;
		this._minimized = false;

		if (this.options.toggleDisplay) {
			this._addToggleButton();
		}

		this._layer.once('metaload', function () {
			this._mainMap.whenReady(L.Util.bind(function () {
				this._extraMap.whenReady(L.Util.bind(function () {
					var latlngs = this._getMapLatLngBounds(this._mainMap);
					this._aimingRect = L.polygon(latlngs,
					 this.options.aimingRectOptions).addTo(this._extraMap);
					this._shadowRect = L.polygon(latlngs,
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
		}, this);

		return this._container;
	},

	addTo: function (map) {
		L.Control.prototype.addTo.call(this, map);
		return this;
	},

	onRemove: function (map) {
		this._mainMap.off('moveend', this._onMainMapMoved, this);
		this._mainMap.off('move', this._onMainMapMoving, this);
		this._extraMap.off('moveend', this._onExtraMapMoved, this);

		this._extraMap.removeLayer(this._layer);
	},

	_getMapLatLngBounds: function (map) {
		var bounds = map.getPixelBounds(),
		 bmin = bounds.min,
		 bmax = bounds.max;
		return [map.unproject([bmin.x, bmin.y]), map.unproject([bmax.x, bmin.y]),
		 map.unproject([bmax.x, bmax.y]), map.unproject([bmin.x, bmax.y])];
	},


	_addToggleButton: function () {
		this._toggleDisplayButton = this.options.toggleDisplay ?
			this._createButton('', this.hideText,
			 'leaflet-control-extramap-toggle-display', this._container,
			 this._toggleDisplayButtonClicked, this)
		: undefined;
	},

	_createButton: function (html, title, className, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.innerHTML = html;
		link.href = '#';
		link.title = title;

		var stop = L.DomEvent.stopPropagation;

		L.DomEvent
			.on(link, 'click', stop)
			.on(link, 'mousedown', stop)
			.on(link, 'dblclick', stop)
			.on(link, 'click', L.DomEvent.preventDefault)
			.on(link, 'click', fn, context);

		return link;
	},

	_toggleDisplayButtonClicked: function () {
		this._userToggledDisplay = true;
		if (!this._minimized) {
			this._minimize();
			this._toggleDisplayButton.title = this.showText;
		}
		else {
			this._restore();
			this._toggleDisplayButton.title = this.hideText;
		}
	},

	_setDisplay: function (minimize) {
		if (minimize !== this._minimized) {
			if (!this._minimized) {
				this._minimize();
			}
			else {
				this._restore();
			}
		}
	},

	_minimize: function () {
		// hide the extramap
		if (this.options.toggleDisplay) {
			this._container.style.width = '19px';
			this._container.style.height = '19px';
			this._toggleDisplayButton.className += ' minimized';
		}
		else {
			this._container.style.display = 'none';
		}
		this._minimized = true;
	},

	_restore: function () {
		if (this.options.toggleDisplay) {
			this._container.style.width = this.options.width + 'px';
			this._container.style.height = this.options.height + 'px';
			this._toggleDisplayButton.className = this._toggleDisplayButton.className
					.replace(/(?:^|\s)minimized(?!\S)/g, '');
		}
		else {
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
		this._aimingRect.setLatLngs(this._getMapLatLngBounds(this._mainMap));
	},

	_onMainMapMoving: function (e) {
		this._aimingRect.setLatLngs(this._getMapLatLngBounds(this._mainMap));
	},

	_onExtraMapMoveStarted: function (e) {
		this._lastAimingRectPosition = this._aimingRect.getLatLngs();
	},

	_onExtraMapMoving: function (e) {
		if (!this._mainMapMoving && this._lastAimingRectPosition) {
			this._shadowRect.setLatLngs(this._lastAimingRectPosition);
			this._shadowRect.setStyle({opacity: 0, fillOpacity: 0.0});
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

	_decideZoom: function (fromMaintoExtra) {
		if (!this.options.zoomLevelFixed) {
			if (fromMaintoExtra) {
				return this._mainMap.getZoom() + this.options.zoomLevelOffset;
			} else {
				var currentDiff = this._extraMap.getZoom() - this._mainMap.getZoom();
				var proposedZoom = this._extraMap.getZoom() - this.options.zoomLevelOffset;
				var toRet;
                                
				if (currentDiff > this.options.zoomLevelOffset &&
				    this._mainMap.getZoom() < (this._extraMap.getMinZoom() -
					                             this.options.zoomLevelOffset)) {
					//This means the miniMap is zoomed out to the minimum zoom level and can't zoom any more.
					if (this._extraMap.getZoom() > this._lastExtraMapZoom) {
						// This means the user is trying to zoom in by using the minimap,
						// zoom the main map.
						toRet = this._mainMap.getZoom() + 1;
						// Also we cheat and zoom the minimap out again to keep it
						// visually consistent.
						this._extraMap.setZoom(this._extraMap.getZoom() - 1);
					} else {
						//Either the user is trying to zoom out past the mini map's min
						// zoom or has just panned using it, we can't tell the difference.
						// Therefore, we ignore it!
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
	}
});

L.Map.mergeOptions({
	extraMapControl: false
});

L.Map.addInitHook(function () {
	if (this.options.extraMapControl) {
		this.extraMapControl = (new L.Control.ExtraMap()).addTo(this);
	}
});

L.control.extramap = function (options) {
	return new L.Control.ExtraMap(options);
};
