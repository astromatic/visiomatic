/*
# L.Control.FullScreen adds a full screen toggle button to the map.
# Adapted from the leaflet.fullscreen plugin by Bruno Bergot (fixed jake errors)
# (original copyright notice reproduced below).
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2013-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#	                         Chiara Marmo    - Paris-Saclay

Original code Copyright (c) 2013, Bruno Bergot
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
import L from 'leaflet';

if (typeof require !== 'undefined') {
	var jQuery = require('jquery-browser');
}


(function () {

	L.Control.FullScreen = L.Control.extend({
		options: {
			position: 'topleft',
			title: 'Toggle full screen mode',
			forceSeparateButton: false
		},
	
		onAdd: function (map) {
			var className = 'leaflet-control-zoom-fullscreen', container;
		
			if (map.zoomControl && !this.options.forceSeparateButton) {
				container = map.zoomControl._container;
			} else {
				container = L.DomUtil.create('div', 'leaflet-bar');
			}
		
			this._createButton(this.options.title, className, container, this.toogleFullScreen, map);

			return container;
		},
	
		_createButton: function (title, className, container, fn, context) {
			var link = L.DomUtil.create('a', className, container);
			link.href = '#';
			link.title = title;

			L.DomEvent
				.addListener(link, 'click', L.DomEvent.stopPropagation)
				.addListener(link, 'click', L.DomEvent.preventDefault)
				.addListener(link, 'click', fn, context);

			L.DomEvent
				.addListener(container, fullScreenApi.fullScreenEventName, L.DomEvent.stopPropagation)
				.addListener(container, fullScreenApi.fullScreenEventName, L.DomEvent.preventDefault)
				.addListener(container, fullScreenApi.fullScreenEventName, this._handleEscKey, context);

			L.DomEvent
				.addListener(document, fullScreenApi.fullScreenEventName, L.DomEvent.stopPropagation)
				.addListener(document, fullScreenApi.fullScreenEventName, L.DomEvent.preventDefault)
				.addListener(document, fullScreenApi.fullScreenEventName, this._handleEscKey, context);

			return link;
		},

		toogleFullScreen: function () {
			this._exitFired = false;
			var container = this._container;
			if (this._isFullscreen) {
				if (fullScreenApi.supportsFullScreen) {
					fullScreenApi.cancelFullScreen(container);
				} else {
					L.DomUtil.removeClass(container, 'leaflet-pseudo-fullscreen');
				}
				this.invalidateSize();
				this.fire('exitFullscreen');
				this._exitFired = true;
				this._isFullscreen = false;
			} else {
				if (fullScreenApi.supportsFullScreen) {
					fullScreenApi.requestFullScreen(container);
				} else {
					L.DomUtil.addClass(container, 'leaflet-pseudo-fullscreen');
				}
				this.invalidateSize();
				this.fire('enterFullscreen');
				this._isFullscreen = true;
			}
		},
	
		_handleEscKey: function () {
			if (!fullScreenApi.isFullScreen(this) && !this._exitFired) {
				this.fire('exitFullscreen');
				this._exitFired = true;
				this._isFullscreen = false;
			}
		}
	});

	L.Map.addInitHook(function () {
		if (this.options.fullscreenControl) {
			this.fullscreenControl = L.control.fullscreen(this.options.fullscreenControlOptions);
			this.addControl(this.fullscreenControl);
		}
	});

	L.control.fullscreen = function (options) {
		return new L.Control.FullScreen(options);
	};

/* 
Native FullScreen JavaScript API
-------------
Assumes Mozilla naming conventions instead of W3C for now

source : http://johndyer.name/native-fullscreen-javascript-api-plus-jquery-plugin/

*/

	var fullScreenApi = {
			supportsFullScreen: false,
			isFullScreen: function () { return false; },
			requestFullScreen: function () {},
			cancelFullScreen: function () {},
			fullScreenEventName: '',
			prefix: ''
		},
		browserPrefixes = 'webkit moz o ms khtml'.split(' ');
	
	// check for native support
	if (typeof document.exitFullscreen !== 'undefined') {
		fullScreenApi.supportsFullScreen = true;
	} else {
		// check for fullscreen support by vendor prefix
		for (var i = 0, il = browserPrefixes.length; i < il; i++) {
			fullScreenApi.prefix = browserPrefixes[i];
			if (typeof document[fullScreenApi.prefix + 'CancelFullScreen'] !== 'undefined') {
				fullScreenApi.supportsFullScreen = true;
				break;
			}
		}
	}
	
	// update methods to do something useful
	if (fullScreenApi.supportsFullScreen) {
		fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
		fullScreenApi.isFullScreen = function () {
			switch (this.prefix) {
			case '':
				return document.fullScreen;
			case 'webkit':
				return document.webkitIsFullScreen;
			default:
				return document[this.prefix + 'FullScreen'];
			}
		};
		fullScreenApi.requestFullScreen = function (el) {
			return (this.prefix === '') ? el.requestFullscreen() : el[this.prefix + 'RequestFullScreen']();
		};
		fullScreenApi.cancelFullScreen = function (el) {
			return (this.prefix === '') ? document.exitFullscreen() : document[this.prefix + 'CancelFullScreen']();
		};
	}

	// jQuery plugin
	if (typeof jQuery !== 'undefined') {
		jQuery.fn.requestFullScreen = function () {
			return this.each(function () {
				var el = jQuery(this);
				if (fullScreenApi.supportsFullScreen) {
					fullScreenApi.requestFullScreen(el);
				}
			});
		};
	}

	// export api
	window.fullScreenApi = fullScreenApi;
})();
