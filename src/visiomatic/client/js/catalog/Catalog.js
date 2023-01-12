/**
 #	This file part of:	VisiOmatic
 * @file Catalog settings and conversion tools.
 *
 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/
import {Class, Util, circleMarker, extend} from 'leaflet';

// Callback definitions
/**
 * Callback for drawing catalog objects.
 * @callback Catalog~drawCallback
 * @param {object} feature - Feature property of the source.
 * @param {leaflet.LatLng} latlng - World coordinates of the source.
 * @return {leaflet.Path} Path.
 */

export const Catalog = Class.extend( /** @lends Catalog */ {
	options: {
		name: 'A catalog',
		attribution: '',
		color: 'yellow',
		magLim: 20.0,
		properties: ['mag'],
		propertyMask: [],
		units: [''],
		regionType: 'box',
		service: 'Vizier@CDS',
		className: 'logo-catalog-vizier',
		serviceURL: 'https://vizier.unistra.fr/viz-bin',
		catalogURL: '/',
		objectURL: '/',
		authenticate: 'false',
		nmax: 10000,
		draw: undefined
	},

	/**
	 * Catalog base class.
	 * @extends leaflet.Class
	 * @memberof module:catalog/Catalog.js
	 * @constructs
	 * @param {object} [options] - Options.

	 * @param {string} [options.name='A catalog']
	   Catalog name.

	 * @param {string} [options.attribution='']
	   Reference or copyright.

	 * @param {RGB} [options.color='yellow']
	   Default display color.

	 * @param {number} [options.magLim=20.0]
	   Reference magnitude limit (for scaling symbols).

	 * @param {string[]} [options.properties=['mag']]
	   Names of catalog object properties.
	 * @param {string[]} [options.propertyMask]
	   Property display mask: only properties with propertyMask element set to
	   ``true`` are displayed. Defaults to all properties being displayed.

	 * @param {string[]} [options.units=['']]
	   Property units.

	 * @param {'box'|'cone'} [options.regionType='box']
	   Geometry of the query region.

	 * @param {string} [options.service='Vizier@CDS']
	   Name of the catalog web service.

	 * @param {string} [options.className='logo-catalog-vizier'],
	   Class name for the catalog or service logo.

	 * @param {string} [options.serviceURL='https://vizier.unistra.fr/viz-bin']
	   Root web service query URL.

	 * @param {string} [options.catalogURL='/']
	   _Relative_ catalog query URL.

	 * @param {string} [options.objectURL='/']
	   _Relative_ object query URL.

	 * @param {boolean} [options.authenticate=false]
	   Catalog requires authentication?

	 * @param {number} [options.nmax=10000]
	   Maximum number of sources per query.

	 * @param {Catalog~drawCallback} [options.draw]
	   Callback function called for drawing object. Defaults to a circle marker.

	 * @returns {Catalog} Instance of a catalog.
	 */
	initialize: function (options) {
		Util.setOptions(this, options);
		Object.assign(this, this.options);
		if (this.objectURL) {
			this.objURL = this.serviceURL + this.objectURL;
		}		
	},

	/**
	 * Convert CSV data to [GeoJSON]{@link https://geojson.org/}.

	 * @method
	 * @static
	 * @private
	 * @param {string} str - CSV data.
	 * @return {object} GeoJSON object.
	 */
	_csvToGeoJSON: function (str) {
		// Check to see if the delimiter is defined. If not, then default to comma.
		var badreg = new RegExp('#|--|objName|string|^$'),
		 lines = str.split('\n'),
		 geo = {type: 'FeatureCollection', features: []};

		for (var i in lines) {
			var line = lines[i];
			if (badreg.test(line) === false) {
				var feature = {
						type: 'Feature',
						id: '',
						properties: {
							items: []
						},
						geometry: {
							type: 'Point',
							coordinates: [0.0, 0.0]
						}
					},
					geometry = feature.geometry,
					properties = feature.properties;

				var cell = line.split(/[,;\t]/);
				feature.id = cell[0];
				geometry.coordinates[0] = parseFloat(cell[1]);
				geometry.coordinates[1] = parseFloat(cell[2]);
				var items = cell.slice(3),
				    item;
				for (var j in items) {
					properties.items.push(this.readProperty(items[j]));
				}
				geo.features.push(feature);
			}
		}
		return geo;
	},

	/**
	 * Read number in a cell from a
	   [Vizier]{@link https://vizier.cds.unistra.fr/} ASCII output.
	 * @method
	 * @static
	 * @param {string} item - Cell content.
	 * @return {number} Value in the cell.
	 */
	readProperty: function (item) {
		var	fitem = parseFloat(item);
		return isNaN(fitem) ? '--' : fitem;
	},

	/**
	 * @summary Convert CSV data to [GeoJSON]{@link https://geojson.org/}.

	 * @desc Wrapper around private method
	   [_csvToGeoJSON]{@link Catalog._csvToGeoJSON}.

	 * @method
	 * @static
	 * @overrides
	 * @param {string} str - CSV data.
	 * @return {object} GeoJSON object.
	 */
	toGeoJSON: function (str) {
		return this._csvToGeoJSON(str);
	},

	popup: function (feature) {
		var str = '<div>';
		if (this.objURL) {
			str += 'ID: <a href=\"' + Util.template(this.objURL, extend({
				ra: feature.geometry.coordinates[0].toFixed(6),
				dec: feature.geometry.coordinates[1].toFixed(6)
			})) + '\" target=\"_blank\">' + feature.id + '</a></div>';
		} else {
			str += 'ID: ' + feature.id + '</div>';
		}
		str += '<TABLE style="margin:auto;">' +
		       '<TBODY style="vertical-align:top;text-align:left;">';
		for (var i in this.properties) {
			if (this.propertyMask === undefined ||
				this.propertyMask[i] === true) {
				str += '<TR><TD>' + this.properties[i] + ':</TD>' +
				       '<TD>' + feature.properties.items[i].toString() + ' ';
				if (this.units[i]) {
					str += this.units[i];
				}
				str += '</TD></TR>';
			}
		}
		str += '</TBODY></TABLE>';
		return str;

	},

	/**
	 * Draw a circle at the current catalog source world coordinates.

	 * @method
	 * @static
	 * @overrides
	 * @param {object} feature - Feature property of the source.
	 * @param {leaflet.LatLng} latlng - World coordinates of the source.
	 * @return {leaflet.circleMarker} Circle marker.
	 */
	draw: function (feature, latlng) {
		var refmag = feature.properties.items[this.magindex ? this.magindex : 0];
		return circleMarker(latlng, {
			radius: refmag ? this.maglim + 5 - refmag : 8
		});
	},

	/**
	 * Filter out a source based on its feature property.

	 * @method
	 * @static
	 * @overrides
	 * @param {object} feature - Feature property of the source.
	 * @return {boolean} ``false`` if filtered out, ``true`` otherwise.
	 */
	filter: function (feature) {
		return true;
	}

});

