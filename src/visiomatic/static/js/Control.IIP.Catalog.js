/*
# L.Control.IIP.Catalog manages catalog overlays
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#	                         Chiara Marmo    - Paris-Saclay
*/
import L from 'leaflet';

if (typeof require !== 'undefined') {
	var $ = require('jquery');
}

L.Control.IIP.Catalog = L.Control.IIP.extend({

	defaultCatalogs: [
		L.Catalog.GAIA_DR2,
		L.Catalog['2MASS'],
		L.Catalog.SDSS,
		L.Catalog.PPMXL,
		L.Catalog.Abell
	],

	options: {
		title: 'Catalog overlays',
		collapsed: true,
		position: 'topleft',
		nativeCelsys: true,
		color: '#FFFF00',
		timeOut: 30,	// seconds
		authenticate: false // string define a method used to authenticate
	},

	initialize: function (catalogs, options) {
		L.setOptions(this, options);
		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipcatalog';
		this._layers = {};
		this._handlingClick = false;
		this._sideClass = 'catalog';
		this._catalogs = catalogs ? catalogs : this.defaultCatalogs;
	},

	_initDialog: function () {
		var	className = this._className,
			catalogs = this._catalogs,
			box = this._addDialogBox(),
			// CDS catalog overlay
			line = this._addDialogLine('', box),
			elem = this._addDialogElement(line),
			colpick = this._createColorPicker(
				className + '-color',
				elem,
				'catalog',
			  this.options.color,
				false,
				'iipCatalog',
				'Click to set catalog color'
			);

		var catselect = this._createSelectMenu(
			this._className + '-select',
			elem,
			catalogs.map(function (catalog) { return catalog.name; }),
			undefined,
			-1,
			function () {
				var className = catalogs[catselect.selectedIndex - 1].className;
				if (className === undefined) {
					className = '';
				}
				L.DomUtil.setClass(catselect, this._className + '-select ' + className);
				return;
			},
			'Select Catalog'
		);

		L.DomEvent.on(catselect, 'change keyup', function () {
			var catalog = catalogs[catselect.selectedIndex - 1];
			catselect.title = catalog.attribution + ' from ' + catalog.service;
		}, this);

		elem = this._addDialogElement(line);

		this._createButton(className + '-button', elem, 'catalog', function () {
			var	index = catselect.selectedIndex - 1;	// Ignore dummy 'Choose catalog' entry
			if (index >= 0) {
				var catalog = catalogs[index];
				catalog.color = colpick.value;
				catselect.selectedIndex = 0;
				catselect.title = 'Select Catalog';
				L.DomUtil.setClass(catselect, this._className + '-select ');
				this._getCatalog(catalog, this.options.timeOut);
			}
		}, 'Query catalog');
	},

	_resetDialog: function () {
	// Do nothing: no need to reset with layer changes
	},

	_getCatalog: function (catalog, timeout) {
		var _this = this,
		    map = this._map,
				wcs = map.options.crs,
				sysflag = wcs.forceNativeCelsys && !this.options.nativeCelsys,
		    center = sysflag ? wcs.celsysToEq(map.getCenter()) : map.getCenter(),
		    b = map.getPixelBounds(),
		    z = map.getZoom(),
		    templayer = new L.LayerGroup(null);

		// Add a temporary "dummy" layer to activate a spinner sign
		templayer.notReady = true;
		this.addLayer(templayer, catalog.name);

		if (catalog.authenticate) {
			this.options.authenticate = catalog.authenticate;
		} else {
			this.options.authenticate = false;
		}

		// Compute the search cone
		var lngfac = Math.abs(Math.cos(center.lat * Math.PI / 180.0)),
			  c = sysflag ?
				   [wcs.celsysToEq(map.unproject(b.min, z)),
			      wcs.celsysToEq(map.unproject(L.point(b.min.x, b.max.y), z)),
			      wcs.celsysToEq(map.unproject(b.max, z)),
			      wcs.celsysToEq(map.unproject(L.point(b.max.x, b.min.y), z))] :
			                    [map.unproject(b.min, z),
			                     map.unproject(L.point(b.min.x, b.max.y), z),
			                     map.unproject(b.max, z),
			                     map.unproject(L.point(b.max.x, b.min.y), z)],
			  sys;
		if (wcs.forceNativeCelsys && this.options.nativeCelsys) {
			switch (wcs.celsyscode) {
			case 'ecliptic':
				sys = 'E2000.0';
				break;
			case 'galactic':
				sys = 'G';
				break;
			case 'supergalactic':
				sys = 'S';
				break;
			default:
				sys = 'J2000.0';
				break;
			}
		} else {
			sys = 'J2000.0';
		}

		if (catalog.regionType === 'box') {
			// CDS box search
			var	dlng = (Math.max(wcs._deltaLng(c[0], center),
				                   wcs._deltaLng(c[1], center),
				                   wcs._deltaLng(c[2], center),
				                   wcs._deltaLng(c[3], center)) -
			            Math.min(wcs._deltaLng(c[0], center),
				                   wcs._deltaLng(c[1], center),
				                   wcs._deltaLng(c[2], center),
				                   wcs._deltaLng(c[3], center))) * lngfac,
		       dlat = Math.max(c[0].lat, c[1].lat, c[2].lat, c[3].lat) -
		              Math.min(c[0].lat, c[1].lat, c[2].lat, c[3].lat);
			if (dlat < 0.0001) {
				dlat = 0.0001;
			}
			if (dlng < 0.0001) {
				dlng = 0.0001;
			}

			L.IIPUtils.requestURL(
				L.Util.template(catalog.url, L.extend({
					sys: sys,
					lng: center.lng.toFixed(6),
					lat: center.lat.toFixed(6),
					dlng: dlng.toFixed(4),
					dlat: dlat.toFixed(4),
					nmax: catalog.nmax + 1,
					maglim: catalog.maglim
				})),
				'getting ' + catalog.service + ' data',
				function (context, httpRequest) {
					_this._loadCatalog(catalog, templayer, context, httpRequest);
				},
				this,
				timeout
			);
		} else {
			// Regular cone search
			var	dr = Math.max(wcs.distance(c[0], center),
				                wcs.distance(c[0], center),
				                wcs.distance(c[0], center),
				                wcs.distance(c[0], center));
			L.IIPUtils.requestURL(
				L.Util.template(catalog.url, L.extend({
					sys: sys,
					lng: center.lng.toFixed(6),
					lat: center.lat.toFixed(6),
					dr: dr.toFixed(4),
					drm: (dr * 60.0).toFixed(4),
					nmax: catalog.nmax + 1
				})), 'querying ' + catalog.service + ' data', function (context, httpRequest) {
					_this._loadCatalog(catalog, templayer, context, httpRequest);
				}, this, this.options.timeOut);
		}
	},

	_loadCatalog: function (catalog, templayer, _this, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var wcs = _this._map.options.crs,
				 response = httpRequest.responseText,
				 geo = catalog.toGeoJSON(response),
				 geocatalog = L.geoJson(geo, {
					onEachFeature: function (feature, layer) {
						if (feature.properties && feature.properties.items) {
							layer.bindPopup(catalog.popup(feature));
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
					filter: function (feature) {
						return catalog.filter(feature);
					},
					pointToLayer: function (feature, latlng) {
						return catalog.draw(feature, latlng);
					},
					style: function (feature) {
						return {color: catalog.color, weight: 2};
					}
				}),
				 excessflag;
				geocatalog.nameColor = catalog.color;
				geocatalog.addTo(_this._map);
				this.removeLayer(templayer);
				if (geo.features.length > catalog.nmax) {
					geo.features.pop();
					excessflag = true;
				}
				this.addLayer(geocatalog, catalog.name +
				  ' (' + geo.features.length.toString() +
				  (excessflag ? '+ entries)' : ' entries)'));
				if (excessflag) {
					alert('Selected area is too large: ' + catalog.name +
					  ' sample has been truncated to the brightest ' + catalog.nmax + ' sources.');
				}
			} else {
				if (httpRequest.status !== 0) {
					alert('Error ' + httpRequest.status + ' while querying ' +
					  catalog.service + '.');
				}
				this.removeLayer(templayer);
			}
		}
	}

});

L.control.iip.catalog = function (catalogs, options) {
	return new L.Control.IIP.Catalog(catalogs, options);
};

