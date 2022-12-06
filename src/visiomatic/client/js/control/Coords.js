/*
#	Coordinate display and input.
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#	                         Chiara Marmo    - Paris-Saclay
*/
import {
	Control,
	DomEvent,
	DomUtil,
	Map
} from 'leaflet';

import {VUtil} from '../util'

export const Coords = Control.extend({
	options: {
		position: 'topright',
		title: 'Center coordinates. Click to change',
		coordinates: [{
			label: 'RA, Dec',
			units: 'HMS',
			nativeCelsys: false
		}],
		centerQueryKey: 'center',
		fovQueryKey: 'fov',
		sesameURL: 'https://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame'
	},

	onAdd: function (map) {
		// Create coordinate input/display box
		var	_this = this,
			className = 'leaflet-control-coords';
		this._wcsdialog =  DomUtil.create('div', className + '-dialog'),

		this._map.on('layeradd', this._checkIIP, this);
		return	this._wcsdialog;
	},

	_checkIIP: function (e) {
		var layer = e.layer;

		// Exit if not an IIP layer
		if (!layer || !layer.iipdefault) {
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

	_initDialog: function () {
		var	_this = this,
			wcs = this._map.options.crs,
			coords = this.options.coordinates,
			className = 'leaflet-control-coords',
			dialog = this._wcsdialog;

		if ((projections=wcs.projections)) {
			var	extSelect = this._wcsext = DomUtil.create(
					'select',
					className + '-ext',
					dialog
				),
				extOpt = [],
				extIndex;

			DomEvent.disableClickPropagation(extSelect);
			this._currentExt = 0;
			extSelect.id = 'leaflet-ext-select';
			extSelect.title = 'Switch detector';
			for (var p in projections) {
				extOpt[p] = document.createElement('option');
				extOpt[p].text = projections[p].name;
				extIndex = parseInt(p, 10);
				extOpt[p].value = extIndex;
				if (extIndex === 0) {
					extOpt[p].selected = true;
				}
				extSelect.add(extOpt[p], null);
			}
			DomEvent.on(extSelect, 'change', function (e) {
				_this._currentExt = extSelect.value;
				_this._onDrag();
			});
		}

		var	coordSelect = DomUtil.create(
				'select',
				className + '-select',
				dialog
			),
			coordOpt = [],
			coordIndex;

		DomEvent.disableClickPropagation(coordSelect);
		this._currentCoord = 0;
		coordSelect.id = 'leaflet-coord-select';
		coordSelect.title = 'Switch coordinate system';
		for (var c in coords) {
			coordOpt[c] = document.createElement('option');
			coordOpt[c].text = coords[c].label;
			coordIndex = parseInt(c, 10);
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

		var input = this._wcsinput = DomUtil.create(
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

		var	clipboardbutton = DomUtil.create('div', className + '-clipboard', dialog);
		clipboardbutton.title = 'Copy to clipboard';
		DomEvent.on(clipboardbutton, 'click', function () {
			var stateObj = {},
				url = location.href,
				latlng = map.getCenter();
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

	onRemove: function (map) {
		map.off('drag', this._onDrag);
	},

	_onDrag: function (e) {
		var	latlng = this._map.getCenter(),
			wcs = this._map.options.crs,
			coord = this.options.coordinates[this._currentCoord];

		if (wcs.projections) {
			this._wcsext.options[wcs.multiLatLngToIndex(latlng)].selected = true; 
		}
		if (wcs.pixelFlag) {
			this._wcsinput.value = latlng.lng.toFixed(0) + ' , ' + latlng.lat.toFixed(0);
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
				this._wcsinput.value = latlng.lng.toFixed(5) + ' , ' + latlng.lat.toFixed(5);
				break;
			default:
				this._wcsinput.value = latlng.lng.toFixed(1) + ' , ' + latlng.lat.toFixed(1);
				break;
			}
		}
	},

	panTo: function (str) {
		var	wcs = this._map.options.crs,
			coord = this.options.coordinates[this._currentCoord],
			latlng = wcs.parseCoords(str);

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

	_getCoordinates: function (_this, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var str = httpRequest.responseText,
					latlng = _this._map.options.crs.parseCoords(str);

				if (latlng) {
					_this._map.panTo(latlng);
					_this._onDrag();
				} else {
					alert(str + ': Unknown location');
				}
			} else {
				alert('There was a problem with the request to the Sesame service at CDS');
			}
		}
	}
});

Map.mergeOptions({
	positionControl: false
});

Map.addInitHook(function () {
	if (this.options.positionControl) {
		this.positionControl = new Control.MousePosition();
		this.addControl(this.positionControl);
	}
});

export const coords = function (options) {
	return new Coords(options);
};
