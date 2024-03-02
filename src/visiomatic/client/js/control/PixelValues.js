/**
 #	This file part of:	VisiOmatic
 * @file Coordinate display/control interface
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


export const PixelValues = Control.extend( /** @lends PixelValues */ {
	options: {
		title: 'Pixel value(s)',
		position: 'topright',
		/**
		 * Pixel value settings.
		 * @typedef valueSettings
		 * @property {'raw'|'sbmag'} type
		   Value type.
		 * @property {string} label
		   Value name.
		 * @property {'ADU'|'mag.arcsec⁻²'} units
		   Value units.
		 * @property {boolean} mag
		   Result in magnitude?
		 * @property {boolean} subtract
		   Subtract background?
		 * @default
		 */
		valueSettings: [
			{
				type: 'raw',
				label: 'Raw',
				units: '',
				mag: false,
				subtract: false
			},
			{
				type: 'sub',
				label: '-Bkg',
				units: '',
				mag: false,
				subtract: true
			},
			{
				type: 'sbmag',
				label: 'SB',
				units: 'mag.arcsec⁻²',
				mag: true,
				subtract: false
			},
			{
				type: 'sbmagsub',
				label: 'SB-Bkg',
				units: 'mag.arcsec⁻²',
				mag: true,
				subtract: true
			}
		]
	},

	/**
	 * Create a new pixel value display interface.

	 * @name PixelValues
	 * @extends leaflet.Control
	 * @memberof module:control/PixelValues.js
	 * @constructs
	 * @param {object} [options] - Options.

	 * @param {string} [options.title='Pixel value(s)']
	   Title of the control.

	 * @param {'bottomleft'|'bottomright'|'topleft'|'topright'} [options.position='topright']
	   Position of the value display.

	 * @param {valueSettings[]} [options.valueSettings]
	   Value settings for every instance of pixelValues.

	 * @param {boolean} [options.dragUpdate=true]
	   Update while dragging map?

	 * @returns {PixelValue} Instance of a pixel value display interface.
	 */
	// Initialize() is inherited from the parent class

	/**
	 * Add the coordinate display/control box directly to the map and wait for
	   a new layer to be ready.
	 * @memberof control/PixelValues
	 * @param {object} map - Leaflet map the control has been added to.
	 * @returns {object} The newly created container of the control.
	 */
	onAdd: function (map) {
		const	_this = this,
			className = 'leaflet-control-values';

		this._pixelvaluesdialog =  DomUtil.create('div', className + '-dialog');
		this._map.on('layeradd', this._checkVisiomatic, this);
		return	this._pixelvaluesdialog;
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
	 * Initialize the pixel value display dialog.
	 * @private
	 */
	_initDialog: function () {
		const	_this = this,
			wcs = this._map.options.crs,
			projections = wcs.projections,
			settings = this.options.valueSettings,
			className = 'leaflet-control-values',
			dialog = this._pixelvaluesdialog;

		const	valueSelect = DomUtil.create(
				'select',
				className + '-select',
				dialog
			),
			valueOpt = [];

		DomEvent.disableClickPropagation(valueSelect);
		this._currentSettings = settings[0];
		valueSelect.id = 'leaflet-value-select';
		valueSelect.title = 'Switch display value';
		for (var s in settings) {
			valueOpt[s] = document.createElement('option');
			valueOpt[s].text = settings[s].label;
			var	valueIndex = parseInt(s, 10);
			valueOpt[s].value = valueIndex;
			if (valueIndex === 0) {
				valueOpt[s].selected = true;
			}
			valueSelect.add(valueOpt[s], null);
		}

		DomEvent.on(valueSelect, 'change', function (e) {
			_this._currentSettings = settings[valueSelect.value];
			_this._onUpdate();
		});

		const input = this._valueinput = DomUtil.create(
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

		map.on('moveend zoomend', this._onUpdate, this);
		this._layer.on('channelupdate', this._onUpdate, this);

		// Pretend there was a map update event to update coordinate display
		this._onUpdate();
	},

	/**
	 * Remove map update event when the coordinate display/control is removed.
	 * @param {leaflet.map} [map] - The parent map.
	 */
	onRemove: function (map) {
		map.off('moveend zoomend', this._onUpdate);
		this._layer.off('channelupdate', this._onUpdate);
	},

	/**
	 * Update coordinates when the map is being dragged.
	 * @private
	 * @param {leaflet.LayerEvent} e - Leaflet layer event object.
	 */
	_onUpdate: async function (e) {
		const	wcs = this._map.options.crs;
		let	extindex = -1,
			pnt = wcs.untransform(
				this._map._getCenterLayerPoint().add(
					this._map.getPixelOrigin()
				),
				this._map._zoom
			);
		const	layer = this._layer,
			visio = layer.visio,
			channelUnit = visio.channelUnits[visio.channel],
			response = await fetch(
				layer._url + `&CHAN=${visio.channel + 1}` +
					`&VAL=${pnt.x.toFixed(0)},${pnt.y.toFixed(0)}`,
				{method: 'GET'}
			)
		if (response.status == 200) {
			const	json = await response.json();
			let	value = json.values[0];
			if (value) {
				if (this._currentSettings.subtract) {
					value -= visio.backgroundLevel[visio.channel];
				}
				if (this._currentSettings.mag) {
					value = value > 0.? -2.5 * Math.log10(value): 999.;
				}
				this._valueinput.value = value.toPrecision(6) + ' ' + (
					this._currentSettings.units ?
						this._currentSettings.units : channelUnit
				);
			} else {
				this._valueinput.value = null;
			}
		} else {
			alert('Error ' + response.status + ' while getting pixel values');
		}
	}

});


/**
 * Instantiate a pixel value display interface.
 * @function
 * @param {object} [options] - Options: see {@link Coords}.
 * @returns {PixelValues} Instance of a pixel value display interface.
*/
export const pixelValues = function (options) {
	return new PixelValues(options);
};


