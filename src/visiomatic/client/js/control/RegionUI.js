/*
#	UI for overlays of regions or points of interest.
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#	                         Chiara Marmo    - Paris-Saclay
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


export const RegionUI = UI.extend({

	options: {
		title: 'Region overlays',
		collapsed: true,
		position: 'topleft',
		nativeCelsys: true,
		color: '#00FFFF',
		timeOut: 30	// seconds
	},

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

	_initDialog: function () {
		var	className = this._className,
			regions = this._regions,
			box = this._addDialogBox(),
			line = this._addDialogLine('Regions:', box),
			elem = this._addDialogElement(line),
			colpick = this._addColorPicker(
				className + '-color',
				elem,
				'region',
			  this.options.color,
				false,
				'visiomaticRegion',
				'Click to set region color'
			);

		var	select = this._regionSelect = this._addSelectMenu(
			this._className + '-select',
			elem,
			regions.map(function (o) { return o.name; }),
			regions.map(function (o) { return (o.load ? true : false); }),
			-1,
			undefined,
			'Select region'
		);

		elem = this._addDialogElement(line);
		this._addButton(className + '-button',
			elem,
			'region',
			function () {
				var	index = select.selectedIndex - 1;	// Ignore 'Choose region' entry
				if (index >= 0) {
					var region = this._regions[index];
					region.color = colpick.value;
					select.selectedIndex = 0;
					select.opt[index].disabled = true;
					this._getRegion(region, this.options.timeOut);
				}
			},
			'Display region'
		);

		// Load regions that have the 'load' option set.
		var region;
		for (var index = 0; index < regions.length; index++) {
			region = regions[index];
			region.index = index;
			if (region.load === true) {
				if (!region.color) {
					region.color = this.options.color;
				}
				this._getRegion(regions[index], this.options.timeOut);
			}
		}
	},

	_resetDialog: function () {
	// Do nothing: no need to reset with layer changes
	},

	_getRegion: function (region, timeout) {
		var	_this = this,
			map = this._map,
			wcs = map.options.crs,
			sysflag = wcs.forceNativeCelsys && !this.options.nativeCelsys,
		    templayer = new LayerGroup(null);

		// Add a temporary "dummy" layer to activate a spinner sign
		templayer.notReady = true;
		this.addLayer(templayer, region.name);

		VUtil.requestURL(region.url, 'loading ' + region.name + ' data',
			function (context, httpRequest) {
				_this._loadRegion(region, templayer, context, httpRequest);
			}, this, this.options.timeOut);
	},

	_loadRegion: function (region, templayer, _this, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var	wcs = _this._map.options.crs,
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
								if (wcs.forceNativeCelsys) {
									var latLng = wcs.eqToCelsys(latLng(coords[1], coords[0]));
									return new LatLng(latLng.lat, latLng.lng, coords[2]);
								} else {
									return new LatLng(coords[1], coords[0], coords[2]);
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

export const regionUI = function (regions, options) {
	return new RegionUI(regions, options);
};

