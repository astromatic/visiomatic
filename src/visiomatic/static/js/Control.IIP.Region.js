/*
# L.Control.IIP.Regions manages overlays of regions or points of interest
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#	                         Chiara Marmo    - Paris-Saclay
*/
import L from 'leaflet';

L.Control.IIP.Region = L.Control.IIP.extend({

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
		L.setOptions(this, options);
		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipregion';
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
			colpick = this._createColorPicker(
				className + '-color',
				elem,
				'region',
			  this.options.color,
				false,
				'iipRegion',
				'Click to set region color'
			);

		var	select = this._regionSelect = this._createSelectMenu(
				this._className + '-select',
				elem,
				regions.map(function (o) { return o.name; }),
				regions.map(function (o) { return (o.load ? true : false); }),
				-1,
				undefined,
				'Select region'
			);

		elem = this._addDialogElement(line);
		this._createButton(className + '-button',
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
		var _this = this,
		    map = this._map,
				wcs = map.options.crs,
				sysflag = wcs.forceNativeCelsys && !this.options.nativeCelsys,
		    templayer = new L.LayerGroup(null);

		// Add a temporary "dummy" layer to activate a spinner sign
		templayer.notReady = true;
		this.addLayer(templayer, region.name);

		L.IIPUtils.requestURL(region.url, 'loading ' + region.name + ' data',
			function (context, httpRequest) {
				_this._loadRegion(region, templayer, context, httpRequest);
			}, this, this.options.timeOut);
	},

	_loadRegion: function (region, templayer, _this, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var wcs = _this._map.options.crs,
				 response = httpRequest.responseText,
				 geoRegion = L.geoJson(JSON.parse(response), {
					onEachFeature: function (feature, layer) {
						if (feature.properties && feature.properties.description) {
							layer.bindPopup(feature.properties.description);
						} else if (region.description) {
							layer.bindPopup(region.description);
						}
					},
					coordsToLatLng: function (coords) {
						if (wcs.forceNativeCelsys) {
							var latLng = wcs.eqToCelsys(L.latLng(coords[1], coords[0]));
							return new L.LatLng(latLng.lat, latLng.lng, coords[2]);
						} else {
							return new L.LatLng(coords[1], coords[0], coords[2]);
						}
					},
					style: function (feature) {
						return {color: region.color, weight: 2};
					},
					pointToLayer: function (feature, latlng) {
						return region.drawPoint ?
						  region.drawPoint(feature, latlng) : L.marker(latlng);
					}
				});
				geoRegion.nameColor = region.color;
				geoRegion.addTo(_this._map);
				_this.removeLayer(templayer);
				_this.addLayer(geoRegion, region.name, region.index);
				L.DomEvent.on(geoRegion, 'trash', function (e) {
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

L.control.iip.region = function (regions, options) {
	return new L.Control.IIP.Region(regions, options);
};

