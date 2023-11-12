/**
 #	This file part of:	VisiOmatic
 * @file User Interface for region and Point of Interest (PoI) overlays.

 * @requires util/VUtil.js
 * @requires control/UI.js

 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/
import {
	DomEvent,
	LatLng,
	LayerGroup,
	Util,
	geoJson,
	latLng,
	marker
} from 'leaflet';

import {VUtil} from '../util';
import {UI} from './UI';


// Callback definitions
/**
 * Callback for custom drawing of a GeoJSON point feature.
 * @callback RegionUI~drawCallback
 * @param {object} feature - GeoJSON feature.
 * @param {LatLng} latlng - World coordinates of the point.
 */

export const RegionUI = UI.extend( /** @lends RegionUI */ {

	options: {
		title: 'Region overlays',
		nativeCelSys: true,
		color: '#00FFFF',
		timeOut: 30,	// seconds
		collapsed: true,
		position: 'topleft'
	},

	/**
	 * Region object.
	 * @typedef region
	 * @property {string} url
	   URL for accessing the GeoJSON data.
	 * @property {string} name
	   Name of the region (as it will appear in the selection menu of the
	   interface).
	 * @property {string} [description]
	   Description of the region (as it will appear in a popup marker on the
	   overlay).
	 * @property {number} index
	   Position in the selection menu.
	 * @property {RGB} [color]
	   Default color of the region (as it will appear on the overlay).
	 * @property {boolean} load
	   Is the region loaded yet?
	 * @property {RegionUI~drawCallback} [drawPoint]
	   Callback function for custom drawing of a GeoJSON point feature.
	 */

	/**
	 * Create a VisiOmatic dialog for overlaying region and Point of Interest
	   (PoI).
	 * @extends UI
	 * @memberof module:control/RegionUI.js
	 * @constructs
	 * @param {region[]} [regions] - Regions to overlay.
	 * @param {object} [options] - Options.

	 * @param {string} [options.title='Region overlays']
	   Title of the dialog window or panel.

	 * @param {boolean} [options.nativeCelSys=false]
	   Use native coordinates (e.g., galactic coordinates) instead of
	   equatorial coordinates?

	 * @param {string} [options.color='#00FFFF']
	   Default region overlay color.

	 * @see {@link UI} for additional control options.

	 * @returns {ProfileUI} Instance of a VisiOmatic profile and spectrum
	   plotting user interface.
	 */
	initialize: function (regions, options) {
		// Regions is an array of {url, name [, description]} objects
		Util.setOptions(this, options);
		this._className = 'visiomatic-control';
		this._id = 'visiomatic-region';
		this._layers = {};
		this._handlingClick = false;
		this._sideClass = 'region';
		this._regions =	regions && regions[0] ? regions : [];
	},

	/**
	 * Initialize the region overlay dialog.
	 * @private
	 */
	_initDialog: function () {
		const	className = this._className,
			regions = this._regions,
			box = this._addDialogBox(),
			line = this._addDialogLine('Regions:', box),
			elem = this._addDialogElement(line),
			colpick = this._addColorPicker(
				className + '-color',
				elem,
				'region',
				this.options.color,
				'visiomaticRegion',
				title='Click to set region color'
			);

		const	select = this._regionSelect = this._addSelectMenu(
			this._className + '-select',
			elem,
			regions.map(function (o) { return o.name; }),
			regions.map(function (o) { return (o.load ? true : false); }),
			-1,
			'Select region'
		);

		this._addButton(className + '-button',
			this._addDialogElement(line),
			'region',
			'Display region',
			function () {
				// Ignore 'Choose region' entry
				const	index = select.selectedIndex - 1;
				if (index >= 0) {
					const	region = this._regions[index];
					region.color = colpick.value;
					select.selectedIndex = 0;
					select.opt[index].disabled = true;
					this._getRegion(region, this.options.timeOut);
				}
			}
		);

		// Load regions that have the 'load' option set.
		for (var index = 0; index < regions.length; index++) {
			var	region = regions[index];
			region.index = index;
			if (region.load === true) {
				if (!region.color) {
					region.color = this.options.color;
				}
				this._getRegion(regions[index], this.options.timeOut);
			}
		}
	},

	/**
	 * Reset the region query dialog (do nothing actually).
	 * @private
	 */
	_resetDialog: function () {
	// Do nothing: no need to reset with layer changes
	},

	/**
	 * Query a region.
	 * @private
	 * @param {region} region
	   Region.
	 * @param {number} [timeout]
	   Query time out delay, in seconds. Defaults to no time out.
	 */
	_getRegion: function (region, timeout) {
		const	_this = this,
			map = this._map,
			wcs = map.options.crs,
			sysflag = !wcs.equatorialFlag && !this.options.nativeCelSys,
		    templayer = new LayerGroup(null);

		// Add a temporary "dummy" layer to activate a spinner sign
		templayer.notReady = true;
		this.addLayer(templayer, region.name);

		VUtil.requestURL(region.url, 'loading ' + region.name + ' data',
			function (context, httpRequest) {
				_this._loadRegion(region, templayer, context, httpRequest);
			}, this, this.options.timeOut);
	},

	/**
	 * Load region data and display the overlay layer.
	 * @private
	 * @param {region} region
	   Region.
	 * @param {leaflet.Layer} templayer
	   "Dummy" layer to activate a spinner sign.
	 * @param {object} self
	   Calling control object (``this``).
	 * @param {object} httpRequest
	   HTTP request.
	 */
	_loadRegion: function (region, templayer, _this, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				const	wcs = _this._map.options.crs,
					response = httpRequest.responseText,
					geoRegion = geoJson(
						JSON.parse(response), {
							onEachFeature: function (feature, layer) {
								if (feature.properties && feature.properties.description) {
									layer.bindPopup(feature.properties.description);
								} else if (region.description) {
									layer.bindPopup(region.description);
								}
							},
							coordsToLatLng: function (coords) {
								if (wcs.equatorialFlag) {
									return new LatLng(coords[1], coords[0], coords[2]);
								} else {
									const	latLng = wcs.eqToCelSys(
										latLng(coords[1], coords[0])
									);
									return new LatLng(
										latLng.lat,
										latLng.lng,
										coords[2]
									);
								}
							},
							style: function (feature) {
								return {color: region.color, weight: 2};
							},
							pointToLayer: function (feature, latlng) {
								return region.drawPoint ?
									region.drawPoint(feature, latlng) : marker(latlng);
							}
						}
					);
				geoRegion.nameColor = region.color;
				geoRegion.addTo(_this._map);
				_this.removeLayer(templayer);
				_this.addLayer(geoRegion, region.name, region.index);
				DomEvent.on(geoRegion, 'trash', function (e) {
					if (e.index || e.index === 0) {
						_this._regionSelect.opt[e.index].disabled = false;
					}
				}, _this);
			} else {
				if (httpRequest.status !== 0) {
					alert('Error ' + httpRequest.status + ' while downloading ' +
					  region.url + '.');
				}
				_this.removeLayer(templayer);
				_this._regionSelect.opt[region.index].disabled = false;
			}
		}
	}

});

/**
 * Instantiate a VisiOmatic dialog for region overlays.
 * @function
 * @param {region[]} [regions] - Regions to overlay.
 * @param {object} [options] - Options.
 * @returns {RegionUI} Instance of a VisiOmatic region interface.
 */
export const regionUI = function (regions, options) {
	return new RegionUI(regions, options);
};

