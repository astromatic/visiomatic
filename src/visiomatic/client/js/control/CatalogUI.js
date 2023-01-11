/**
 #	This file part of:	VisiOmatic
 * @file User Interface for catalog queries and catalog overlays.

 * @requires util/VUtil
 * @requires control/UI.js
 * @requires catalog/Gaia.js
 * @requires catalog/TwoMASS.js
 * @requires catalog/SDSS.js
 * @requires catalog/PanSTARRS1js

 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/
import {
	DomEvent,
	DomUtil,
	LayerGroup,
	Util,
	geoJson,
	point
} from 'leaflet';

import {VUtil} from '../util';
import {UI} from './UI';
import {Gaia_DR3, TwoMASS, SDSS, PanSTARRS1} from '../catalog';


export const CatalogUI = UI.extend( /** @lends CatalogUI */ {

	/**
	   Default array of catalogs.
	 * @type {Catalog[]}
	 * @default
	 */
	defaultCatalogs: [
		Gaia_DR3,
		TwoMASS,
		SDSS,
		PanSTARRS1
	],

	options: {
		title: 'Catalog overlays',
		nativeCelsys: true,
		color: '#FFFF00',
		timeOut: 30,	// seconds
		authenticate: false, // Force authentication
		collapsed: true,
		position: 'topleft'
	},

	/**
	 * VisiOmatic dialog for catalog queries and catalog overlays.
	 * @extends UI
	 * @memberof module:control/CatalogUI.js
	 * @constructs
	 * @param {Catalog[]} catalogs - Array of catalogs
	 * @param {object} [options] - Options.

	 * @param {string} [options.title='Catalog overlay']
	   Title of the dialog window or panel.

	 * @param {boolean} [options.nativeCelSys=false]
	   Use native coordinates (e.g., galactic coordinates) instead of
	   equatorial coordinates?

	 * @param {string} [options.color='#FFFF00']
	   Default catalog overlay color

	 * @param {number} [options.timeOut=30]
	   Time out delay for catalog queries, in seconds.

	 * @param {boolean} [options.authenticate=false]
	   Force authentification for querying catalogs?

	 * @see {@link UI} for additional control options.

	 * @returns {CatalogUI} VisiOmatic CatalogUI instance.
	 */
	initialize: function (catalogs, options) {
		Util.setOptions(this, options);
		this._className = 'visiomatic-control';
		this._id = 'visiomatic-catalog';
		this._layers = {};
		this._handlingClick = false;
		this._sideClass = 'catalog';
		this._catalogs = catalogs ? catalogs : this.defaultCatalogs;
	},

	/**
	 * Initialize the catalog query dialog.
	 * @method
	 * @static
	 * @private
	 */
	_initDialog: function () {
		const	className = this._className,
			catalogs = this._catalogs,
			box = this._addDialogBox(),
			line = this._addDialogLine('', box),
			elem = this._addDialogElement(line),
			colpick = this._addColorPicker(
				className + '-color',
				elem,
				'catalog',
				this.options.color,
				'visiomaticCatalog',
				'Click to set catalog color'
			);

		const	catselect = this._addSelectMenu(
			this._className + '-select',
			elem,
			catalogs.map(
				function (catalog) {
					return catalog.name;
				}
			),
			undefined,
			-1,
			'Select Catalog',
			function () {
				let	className = catalogs[catselect.selectedIndex - 1].className;
				if (className === undefined) {
					className = '';
				}
				DomUtil.setClass(
					catselect,
					this._className + '-select ' + className
				);
				return;
			}
		);

		DomEvent.on(catselect, 'change keyup', function () {
			const	catalog = catalogs[catselect.selectedIndex - 1];

			catselect.title = catalog.attribution + ' from ' + catalog.service;
		}, this);

		const	elem2 = this._addDialogElement(line);

		this._addButton(
			className + '-button',
			elem2,
			'catalog',
			'Query catalog',
			function () {
				// Ignore dummy 'Choose catalog' entry
				const	index = catselect.selectedIndex - 1;
				if (index >= 0) {
					const	catalog = catalogs[index];
					catalog.color = colpick.value;
					catselect.selectedIndex = 0;
					catselect.title = 'Select Catalog';
					DomUtil.setClass(catselect, this._className + '-select ');
					this._getCatalog(catalog, this.options.timeOut);
				}
			}
		);
	},

	/**
	 * Reset the catalog query dialog.
	 * @method
	 * @static
	 * @private
	 */
	_resetDialog: function () {
	// Do nothing: no need to reset with layer changes
	},

	/**
	 * Query catalog.
	 * @method
	 * @static
	 * @private
	 * @param {Catalog} catalog
	   Catalog.
	 * @param {number} [timeout]
	   Query time out delay, in seconds. Defaults to no time out.
	 */
	_getCatalog: function (catalog, timeout) {
		const	_this = this,
		    map = this._map,
			wcs = map.options.crs,
			sysflag = wcs.forceNativeCelsys && !this.options.nativeCelsys,
		    center = sysflag ? wcs.celsysToEq(map.getCenter()) : map.getCenter(),
		    b = map.getPixelBounds(),
		    z = map.getZoom(),
		    templayer = new LayerGroup(null);

		// Add a temporary "dummy" layer to activate a spinner sign
		templayer.notReady = true;
		this.addLayer(templayer, catalog.name);

		if (catalog.authenticate) {
			this.options.authenticate = catalog.authenticate;
		} else {
			this.options.authenticate = false;
		}

		// Compute the search cone
		const	lngfac = Math.abs(Math.cos(center.lat * Math.PI / 180.0)),
			  c = sysflag ?
				   [wcs.celsysToEq(map.unproject(b.min, z)),
			      wcs.celsysToEq(map.unproject(point(b.min.x, b.max.y), z)),
			      wcs.celsysToEq(map.unproject(b.max, z)),
			      wcs.celsysToEq(map.unproject(point(b.max.x, b.min.y), z))] :
			                    [map.unproject(b.min, z),
			                     map.unproject(point(b.min.x, b.max.y), z),
			                     map.unproject(b.max, z),
			                     map.unproject(point(b.max.x, b.min.y), z)];
		var	  sys;

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
			let	dlng = (Math.max(wcs._deltaLng(c[0], center),
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

			VUtil.requestURL(
				Util.template(catalog.url, Util.extend({
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
					_this._loadCatalog(
						catalog,
						templayer,
						context,
						httpRequest
					);
				},
				this,
				timeout
			);
		} else {
			// Regular cone search
			const	dr = Math.max(wcs.distance(c[0], center),
				                wcs.distance(c[0], center),
				                wcs.distance(c[0], center),
				                wcs.distance(c[0], center));
			VUtil.requestURL(
				Util.template(catalog.url, Util.extend({
					sys: sys,
					lng: center.lng.toFixed(6),
					lat: center.lat.toFixed(6),
					dr: dr.toFixed(4),
					drm: (dr * 60.0).toFixed(4),
					nmax: catalog.nmax + 1
				})),
				'querying ' + catalog.service + ' data',
				function (context, httpRequest) {
					_this._loadCatalog(
						catalog,
						templayer,
						context,
						httpRequest
					);
				},
				this,
				this.options.timeOut
			);
		}
	},

	/**
	 * Load catalog data.
	 * @method
	 * @static
	 * @private
	 * @param {Catalog} catalog
	   Catalog.
	 * @param {leaflet.Layer} templayer
	   "Dummy" layer to activate a spinner sign.
	 * @param {object} context
	   This (control object).
	 * @param {object} httpRequest
	   HTTP request
	 */
	_loadCatalog: function (catalog, templayer, context, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				const	wcs = context._map.options.crs,
					response = httpRequest.responseText,
					geo = catalog.toGeoJSON(response),
					geocatalog = geoJson(geo, {
						onEachFeature: function (feature, layer) {
							if (feature.properties && feature.properties.items) {
								layer.bindPopup(catalog.popup(feature));
							}
						},
						coordsToLatLng: function (coords) {
							if (wcs.forceNativeCelsys) {
								const	latLng = wcs.eqToCelsys(
									L.latLng(coords[1], coords[0])
								);
								return new L.LatLng(
									latLng.lat,
									latLng.lng,
									coords[2]
								);
							} else {
								return new L.LatLng(
									coords[1],
									coords[0],
									coords[2]
								);
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
					});
				let	excessflag = false;
				geocatalog.nameColor = catalog.color;
				geocatalog.addTo(context._map);
				this.removeLayer(templayer);
				if (geo.features.length > catalog.nmax) {
					geo.features.pop();
					excessflag = true;
				}
				this.addLayer(geocatalog, catalog.name +
				  ' (' + geo.features.length.toString() +
				  (excessflag ? '+ entries)' : ' entries)'));
				if (excessflag) {
					alert(
						'Selected area is too large: ' + catalog.name +
						' sample has been truncated to the brightest ' +
						catalog.nmax + ' sources.'
					);
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

/**
 * Instantiate a VisiOmatic dialog for catalog queries and catalog overlays.
 * @function
 * @param {Catalog[]} catalogs - Array of catalogs
 * @param {object} [options] - Options: see {@link CatalogUI}
 * @returns {CatalogUI} Instance of a VisiOmatic catalog interface.
 */
export const catalogUI = function (catalogs, options) {
	return new CatalogUI(catalogs, options);
};

