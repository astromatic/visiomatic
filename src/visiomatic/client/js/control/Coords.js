/**
 #	This file part of:	VisiOmatic
 * @file Responsive sidebar.
 * @requires util/VUtil.js

 * @copyright (c) 2015-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
 */

import {
	Control,
	DomEvent,
	DomUtil,
	Map,
	Util
} from 'leaflet';

import {VUtil} from '../util'


export const Coords = Control.extend( /** @lends Coords */ {
	options: {
		title: 'Center coordinates. Click to change',
		position: 'topright',
		/**
		 * Coordinates settings.
		 * @typedef coordinate
		 * @property {string} label
		   Coordinate name.
		 * @property {'deg'|'HMS'} units
		   Coordinate units.
		 * @property {boolean} [nativeCelSys=false]
		   Use native coordinates (e.g., galactic coordinates) instead of
		   equatorial coordinates?
		 * @default
		 */
		coordinates: [{
			label: 'RA, Dec',
			units: 'HMS',
			nativeCelsys: false
		}],
		centerQueryKey: 'center',
		fovQueryKey: 'fov',
		sesameURL: 'https://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame'
	},

	/**
	 * Create a new coordinate display/control interface.

	 * @extends leaflet.Control
	 * @memberof module:control/Coords.js
	 * @constructs
	 * @param {object} [options] - Options.

	 * @param {string} [options.title='Center coordinates. Click to change']
	   Title of the control.

	 * @param {'bottomleft'|'bottomright'|'topleft'|'topright'} [options.position='topright']
	   Position of the coordinate display.

	 * @param {coordinate[]} [options.coordinates]
	   Coordinate settings for every instance of coordinates.

	 * @returns {Coords} Instance of a coordinate display/control interface.
	 */
	initialize: function (options) {
		Util.setOptions(this, options);
	},

	/**
	 * Add the coordinate display/control box directly to the map and wait for
	   a new layer to be ready.
	 * @memberof control/Coords
	 * @method
	 * @static
	 * @param {object} map - Leaflet map the control has been added to.
	 * @returns {object} The newly created container of the control.
	 */
	onAdd: function (map) {
		const	_this = this,
			className = 'leaflet-control-coords';

		this._wcsdialog =  DomUtil.create('div', className + '-dialog');
		this._map.on('layeradd', this._checkVisiomatic, this);
		return	this._wcsdialog;
	},

	/**
	 * Check that the layer being loaded is a VisiOmatic layer.
	 * @method
	 * @static
	 * @private
	 * @param {leaflet.LayerEvent} e - Leaflet layer event object.
	 */
	_checkVisiomatic: function (e) {
		const	layer = e.layer;

		// Exit if not a VisiOmatic layer
		if (!layer || !layer.visioDefault) {
			return;
		}
		this._layer = layer;
		if (this._reloadFlag) {
			layer.once('load', this._resetDialog, this);
		} else {
			this._initDialog();
			this._reloadFlag = true;
		}
	},

	/**
	 * Initialize the coordinate display/control dialog.
	 * @method
	 * @static
	 * @private
	 */
	_initDialog: function () {
		const	_this = this,
			wcs = this._map.options.crs,
			projections = wcs.projections,
			coords = this.options.coordinates,
			className = 'leaflet-control-coords',
			dialog = this._wcsdialog;

		if ((projections)) {
			const	extSelect = this._wcsext = DomUtil.create(
					'select',
					className + '-ext',
					dialog
				),
				extOpt = [];

			DomEvent.disableClickPropagation(extSelect);
			extSelect.id = 'leaflet-ext-select';
			extSelect.title = 'Switch detector';
			for (var p in projections) {
				extOpt[p] = document.createElement('option');
				extOpt[p].text = projections[p].name;
				var	extIndex = parseInt(p, 10);
				extOpt[p].value = extIndex;
				if (extIndex === 0) {
					extOpt[p].selected = true;
				}
				extSelect.add(extOpt[p], null);
			}
			DomEvent.on(extSelect, 'change', function (e) {
				const	map = _this._map,
					wcs = map.options.crs;

				map.panTo(wcs.unproject(
					wcs.projections[extSelect.value].centerPnt));
			});
		}

		const	coordSelect = DomUtil.create(
				'select',
				className + '-select',
				dialog
			),
			coordOpt = [];

		DomEvent.disableClickPropagation(coordSelect);
		this._currentCoord = 0;
		coordSelect.id = 'leaflet-coord-select';
		coordSelect.title = 'Switch coordinate system';
		for (var c in coords) {
			coordOpt[c] = document.createElement('option');
			coordOpt[c].text = coords[c].label;
			var	coordIndex = parseInt(c, 10);
			coordOpt[c].value = coordIndex;
			if (coordIndex === 0) {
				coordOpt[c].selected = true;
			}
			coordSelect.add(coordOpt[c], null);
		}

		DomEvent.on(coordSelect, 'change', function (e) {
			_this._currentCoord = coordSelect.value;
			_this._onDrag();
		});

		// Remove widget rounded corner if not first from left
		if ((projections)) {
			coordSelect.style['border-radius'] = '0px';
		}

		const input = this._wcsinput = DomUtil.create(
			'input',
			className + '-input',
			dialog
		);

		DomEvent.disableClickPropagation(input);
		input.type = 'text';
		input.title = this.options.title;

		// Speech recognition on WebKit engine
		if ('webkitSpeechRecognition' in window) {
			input.setAttribute('x-webkit-speech', 'x-webkit-speech');
		}

		map.on('move zoomend', this._onDrag, this);
		DomEvent.on(input, 'focus', function () {
			this.setSelectionRange(0, this.value.length);
		}, input);
		DomEvent.on(input, 'change', function () {
			this.panTo(this._wcsinput.value);
		}, this);

		const	clipboardbutton = DomUtil.create(
			'div',
			className + '-clipboard',
			dialog
		);
		clipboardbutton.title = 'Copy to clipboard';
		DomEvent.on(clipboardbutton, 'click', function () {
			const	stateObj = {},
				latlng = map.getCenter();
			let	url = location.href;

			VUtil.flashElement(this._wcsinput);
			url = VUtil.updateURL(url, this.options.centerQueryKey,
			  VUtil.latLngToHMSDMS(latlng));
			url = VUtil.updateURL(url, this.options.fovQueryKey,
			  wcs.zoomToFov(map, map.getZoom(), latlng).toPrecision(4));
			history.pushState(stateObj, '', url);
			VUtil.copyToClipboard(url);
		}, this);
		// Pretend there was a drag event to update coordinate display
		this._onDrag();
	},

	/**
	 * Remove map dragging event when the coordinate display/control is removed.
	 * @method
	 * @static
	 * @param {leaflet.map} [map] - The parent map.
	 */
	onRemove: function (map) {
		map.off('drag', this._onDrag);
	},

	/**
	 * Update coordinates when the map is being dragged.
	 * @method
	 * @static
	 * @private
	 * @param {leaflet.LayerEvent} e - Leaflet layer event object.
	 */
	_onDrag: function (e) {
		const	wcs = this._map.options.crs,
			coord = this.options.coordinates[this._currentCoord];
		let	latlng = this._map.getCenter();
			
		if (wcs.projections) {
			this._wcsext.options[wcs.multiLatLngToIndex(latlng)].selected = true; 
		}
		if (wcs.pixelFlag) {
			this._wcsinput.value = latlng.lng.toFixed(0) + ' , ' +
				latlng.lat.toFixed(0);
		} else {
			if (!coord.nativeCelsys && wcs.forceNativeCelsys) {
				latlng = wcs.celsysToEq(latlng);
			} else if (coord.nativeCelsys && wcs.forceNativeCelsys === false) {
				latlng = wcs.eqToCelsys(latlng);
			}
			switch (coord.units) {
			case 'HMS':
				this._wcsinput.value = VUtil.latLngToHMSDMS(latlng);
				break;
			case 'deg':
				this._wcsinput.value = latlng.lng.toFixed(5) + ' , ' +
					latlng.lat.toFixed(5);
				break;
			default:
				this._wcsinput.value = latlng.lng.toFixed(1) + ' , ' +
					latlng.lat.toFixed(1);
				break;
			}
		}
	},

	/**
	 * Move map to a given source or coordinate position.
	 * @method
	 * @static
	 * @param {string} str - Source name or coordinates.
	 */
	panTo: function (str) {
		const	wcs = this._map.options.crs,
			coord = this.options.coordinates[this._currentCoord];
		let	latlng = wcs.parseCoords(str);

		if (latlng) {
			if (wcs.pixelFlag) {
				this._map.panTo(latlng);
			} else {
				if (!coord.nativeCelsys && wcs.forceNativeCelsys) {
					latlng = wcs.eqToCelsys(latlng);
				} else if (coord.nativeCelsys && wcs.forceNativeCelsys === false) {
					latlng = wcs.celsysToEq(latlng);
				}
				this._map.panTo(latlng);
			}
		} else {
			// If not, ask Sesame@CDS!
			VUtil.requestURL(this.options.sesameURL + '/-oI/A?' + str,
			 'getting coordinates for ' + str, this._getCoordinates, this, 10);
		}
	},

	/**
	 * Move map to the sky coordinates resolved by Sesame service. 
	 * @method
	 * @static
	 * @private
	 * @param {object} self
	   Calling control object (``this``).
	 * @param {object} httpRequest
	   HTTP request.
	 */
	_getCoordinates: function (self, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				const	str = httpRequest.responseText,
					latlng = _self._map.options.crs.parseCoords(str);

				if (latlng) {
					self._map.panTo(latlng);
					self._onDrag();
				} else {
					alert(str + ': Unknown location');
				}
			} else {
				alert('There was a problem with the request to the Sesame service at CDS');
			}
		}
	}
});

/**
 * Deactivate mouse position control.
 * @method
 * @static
 * @memberof leaflet.Map
 */
Map.mergeOptions({
	positionControl: false
});

/**
 * Add a hook to maps for mouse position control.
 * @method
 * @static
 * @memberof leaflet.Map
 */
Map.addInitHook(function () {
	if (this.options.positionControl) {
		this.positionControl = new Control.MousePosition();
		this.addControl(this.positionControl);
	}
});

/**
 * Instantiate a coordinate display/control .
 * @function
 * @param {object} [options] - Options: see {@link Coords}.
 * @returns {Coords} Instance of a coordinate display/control interface.
*/
export const coords = function (options) {
	return new Coords(options);
};
