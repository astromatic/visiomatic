/*
#	Catalog settings and conversion tools.
#
#	This file part of:       VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#	                         Chiara Marmo    - Paris-Saclay
*/
import {circleMarker, extend} from 'leaflet';
import {template} from 'leaflet.Util';


Catalog = {
	nmax: 10000,	// Sets the maximum number of sources per query

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

	readProperty: function (item) {
		var	fitem = parseFloat(item);
		return isNaN(fitem) ? '--' : fitem;
	},

	toGeoJSON: function (str) {
		return this._csvToGeoJSON(str);
	},

	popup: function (feature) {
		var str = '<div>';
		if (this.objurl) {
			str += 'ID: <a href=\"' + template(this.objurl, extend({
				ra: feature.geometry.coordinates[0].toFixed(6),
				dec: feature.geometry.coordinates[1].toFixed(6)
			})) + '\" target=\"_blank\">' + feature.id + '</a></div>';
		} else {
			str += 'ID: ' + feature.id + '</div>';
		}
		str += '<TABLE style="margin:auto;">' +
		       '<TBODY style="vertical-align:top;text-align:left;">';
		for (var i in this.properties) {
			if (this.propertyMask === undefined || this.propertyMask[i] === true) {
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

	draw: function (feature, latlng) {
		var refmag = feature.properties.items[this.magindex ? this.magindex : 0];
		return circleMarker(latlng, {
			radius: refmag ? this.maglim + 5 - refmag : 8
		});
	},

	filter: function (feature) {
		return true;
	},

	vizierURL: 'https://vizier.unistra.fr/viz-bin',
	mastURL: 'https://archive.stsci.edu'

};

