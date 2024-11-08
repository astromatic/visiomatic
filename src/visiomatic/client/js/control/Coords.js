/**
 #	This file part of:	VisiOmatic
 * @file Coordinate display/control interface
 * @requires util/VUtil.js

 * @copyright (c) 2015-2024 CNRS/IAP/CFHT/SorbonneU/CEA/AIM/UParisSaclay
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
 */

import {
	Control,
	DomEvent,
	DomUtil,
	Map,
	Util
} from 'leaflet';

import {CelSys} from '../crs';
import {VUtil} from '../util'


export const Coords = Control.extend( /** @lends Coords */ {
	options: {
		title: 'Center coordinates. Click to edit',
		position: 'topright',
		/**
		 * Coordinate settings.
		 * @typedef coordinate
		 * @property {'world'|'pixel'} type
		   Coordinate type.
		 * @property {string} label
		   Coordinate name.
		 * @property {'deg'|'HMS'|''} units
		   Coordinate units.
		 * @property {'equatorial'|'ecliptic'|'galactic'|'supergalactic'} celsyscode
		   Coordinate system.
		 * @default
		 */
		coordinates: [
			{
				type: 'world',
				label: 'RA, Dec',
				units: 'HMS',
				celsyscode: 'equatorial'
			},
			{
				type: 'world',
				label: 'ELon, ELat',
				units: 'deg',
				celsyscode: 'ecliptic'
			},
			{
				type: 'world',
				label: 'GLon, GLat',
				units: 'deg',
				celsyscode: 'galactic'
			},
			{
				type: 'pixel',
				label: 'x, y',
				units: ''
			}
		],
		centerQueryKey: 'center',
		fovQueryKey: 'fov',
		sesameURL: 'https://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame'
	},

	/**
	 * Create a new coordinate display/control interface.

	 * @name Coords
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

	 * @param {string} [options.centerQueryKey='center']
	   Web query key for map centering.

	 * @param {string} [options.fovQueryKey='fov']
	   Web query key for setting the Field of View.

	 * @param {string} [options.sesameURL='https://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame']
	   URL for Sesame queries.

	 * @returns {Coords} Instance of a coordinate display/control interface.
	 */
	// Initialize() is inherited from the parent class

	/**
	 * Add the coordinate display/control box directly to the map and wait for
	   a new layer to be ready.
	 * @memberof control/Coords
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
	 * @private
	 */
	_initDialog: function () {
		const	_this = this,
			wcs = this._map.options.crs,
			projections = wcs.projections,
			coordinates = this.options.coordinates,
			className = 'leaflet-control-coords',
			dialog = this._wcsdialog;

		// Manage multiple extensions
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
		for (var c in coordinates) {
			var	coord = coordinates[c];

			if (!wcs.pixelFlag && coord.celsyscode != 'equatorial') {
				coord.celsys = new CelSys(coord.celsyscode);
			}
			coordOpt[c] = document.createElement('option');
			coordOpt[c].text = coord.label;
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
			),
			clipboardicon = DomUtil.create(
				'div',
				className + '-clipboard-icon',
				clipboardbutton
			);
		clipboardbutton.title = 'Copy to clipboard';
		DomEvent.on(clipboardbutton, 'click', function () {
			const	stateObj = {},
				latlng = map.getCenter();
			let	url = location.href;

			VUtil.flashElement(this._wcsinput);
			url = VUtil.updateURL(url, this.options.centerQueryKey,
			  wcs.latLngToHMSDMS(latlng));
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
	 * @param {leaflet.map} [map] - The parent map.
	 */
	onRemove: function (map) {
		map.off('drag', this._onDrag);
	},

	/**
	 * Update coordinates when the map is being dragged.
	 * @private
	 * @param {leaflet.LayerEvent} e - Leaflet layer event object.
	 */
	_onDrag: function (e) {
		const	wcs = this._map.options.crs,
			coordinate = this.options.coordinates[this._currentCoord];
		let	extindex = -1;
		let	pnt = wcs.untransform(
			this._map._getCenterLayerPoint().add(
				this._map.getPixelOrigin()
			),
			this._map._zoom
		);
		if (wcs.projections) {
			extindex = wcs.multiPntToIndex(pnt);
			this._wcsext.options[extindex].selected = true; 
			pnt = wcs.projections[extindex]._multiToPix(pnt);
		}

		if (coordinate.type == 'pixel') {
			const	prec = (wcs.nzoom - this._map._zoom) > 0 ? 0 : 2;
			this._wcsinput.value = pnt.x.toFixed(prec) + ' , ' +
				pnt.y.toFixed(prec);
		} else {
			let	latlng = extindex >= 0 ?
				wcs.projections[extindex].unproject(pnt) :
				this._map.getCenter();
			if (wcs.pixelFlag) {
				const	prec = (wcs.nzoom - this._map._zoom) > 0 ? 0 : 2;
				this._wcsinput.value = latlng.lng.toFixed(prec) + ' , ' +
					latlng.lat.toFixed(prec);
			} else {
				if (coordinate.celsys) {
					latlng = coordinate.celsys.fromEq(latlng);
				}
				switch (coordinate.units) {
				case 'HMS':
					this._wcsinput.value = wcs.latLngToHMSDMS(latlng);
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
		}
	},

	/**
	 * Move map to a given source or coordinate position.
	 * @param {string} str - Source name or coordinates.
	 */
	panTo: function (str) {
		const	wcs = this._map.options.crs,
			coordinate = this.options.coordinates[this._currentCoord];
		let	latlng = wcs.parseCoords(str);

		if (latlng) {
			if (coordinate.celsys) {
				latlng = coordinate.celsys.toEq(latlng);
			}
			this._map.panTo(latlng);
		} else {
			// If not, ask Sesame@CDS!
			VUtil.requestURL(this.options.sesameURL + '/-oI/A?' + str,
			 'getting coordinates for ' + str, this._getCoordinates, this, 10);
		}
	},

	/**
	 * Move map to the sky coordinates resolved by Sesame service. 
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
					latlng = self._map.options.crs.parseCoords(str);

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
 * Instantiate a coordinate display/control .
 * @function
 * @param {object} [options] - Options: see {@link Coords}.
 * @returns {Coords} Instance of a coordinate display/control interface.
*/
export const coords = function (options) {
	return new Coords(options);
};


/**
 * Deactivate regular mouse position control.
 * @method
 * @static
 * @memberof leaflet.Map
 */
Map.mergeOptions({
	positionControl: false
});


/**
 * Add a hook to maps for coordinate display.
 * @method
 * @static
 * @memberof leaflet.Map
 */
Map.addInitHook(function () {
	if (this.options.positionControl) {
		this.positionControl = new Coords(this.options.positionControl);
		this.addControl(this.positionControl);
	}
});

