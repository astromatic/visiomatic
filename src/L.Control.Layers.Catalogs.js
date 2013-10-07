/*
# L.Control.Layers.Catalogs Manage catalog queries and display
#
#	This file part of:	Leaflet-IVV
#
#	Copyright: (C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		03/10/2013
*/

L.Catalog = {
	_csvToGeoJSON: function (str) {
		// Check to see if the delimiter is defined. If not, then default to comma.
		var badreg = new RegExp('#|--|^$'),
		 lines = str.split('\n'),
		 array = [],
		 geo = {type: 'FeatureCollection', features: []};

		for (i in lines) {
			var line = lines[i];
			if (badreg.test(line) == false) {
				var feature = {
					type: 'Feature',
					id: '',
					properties: {
						mags: []
					},
					geometry: {
						type: 'Point',
						coordinates: [0.0,0.0]
					},
				},
				geometry = feature.geometry,
				properties = feature.properties;

				cell = line.split(';');
				feature.id = cell[0];
				geometry.coordinates[0] = parseFloat(cell[1]);
				geometry.coordinates[1] = parseFloat(cell[2]);
				var mags = cell.slice(3);
				for (j in mags) {
					properties.mags.push(parseFloat(mags[j]));
				}
				geo.features.push(feature);
			}
		}
		return geo;
	},
};

L.Catalog.TwoMASS = L.extend({}, L.Catalog, {
	name: '2MASS point sources',
	attribution: '2MASS All-Sky Catalog of Point Sources (Cutri et al., 2003)',
	color: 'red',
	maglim: 17.0,
	service: 'CDS',
	uri: '/viz-bin/asu-tsv?&-mime=csv&-source=II/246&-out=2MASS,RAJ2000,DEJ2000,Jmag,Hmag,Kmag&-out.meta=&-c={ra}%2b{dec},eq=J2000&-c.bd={dra},{ddec}',
	toGeoJSON: L.Catalog._csvToGeoJSON,
	properties: ['Jmag','Hmag','Kmag'],
	objuri: 'http://vizier.u-strasbg.fr/viz-bin/VizieR-5?-source=II/246&-c={ra}%2b{dec},eq=J2000&-c.rs=0.01'
});

L.Catalog.SDSS = L.extend({}, L.Catalog, {
	name: 'SDSS release 9',
	attribution: 'SDSS Photometric Catalog, Release 9 (Adelman-McCarthy et al., 2012)',
	color: 'green',
	maglim: 25.0,
	service: 'CDS',
	uri: '/viz-bin/asu-tsv?&-mime=csv&-source=V/139&-out=SDSS9,RAJ2000,DEJ2000,umag,gmag,rmag,imag,zmag&-out.meta=&-c={ra},{dec}&-c.bd={dra},{ddec}',
	toGeoJSON: L.Catalog._csvToGeoJSON,
	properties: ['umag','gmag','rmag','imag','zmag'],
	objuri: 'http://vizier.u-strasbg.fr/viz-bin/VizieR-5?-source=V/139/sdss9&-c={ra}%2b{dec},eq=J2000&-c.rs=0.01'
});

L.Control.Layers.Catalogs = L.Control.Layers.extend({
	options: {
		title: 'overlay menu',
		collapsed: true,
		position: 'topright',
		newoverlay: {
			title: 'Overlay menu',
			collapsed: true
		}
	},

	_initLayout: function () {
	L.Control.Layers.prototype._initLayout.call(this);

	var newoverlay = this._newoverlay = L.DomUtil.create('div', 'leaflet-control-newoverlay', this._form);
		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		newoverlay.setAttribute('aria-haspopup', true);

		if (!L.Browser.touch) {
			L.DomEvent.disableClickPropagation(newoverlay);
			L.DomEvent.on(newoverlay, 'mousewheel', L.DomEvent.stopPropagation);
		} else {
			L.DomEvent.on(newoverlay, 'click', L.DomEvent.stopPropagation);
		}

		this._newoverlaydialog = L.DomUtil.create('div', newoverlay.className + '-dialog', newoverlay);
		if (this.options.newoverlay.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent
				    .on(newoverlay, 'mouseover', this._newoverlayexpand, this)
				    .on(newoverlay, 'mouseout', this._newoverlaycollapse, this);
			}

			var toggle = this._newoverlaytoggle = L.DomUtil.create('a', newoverlay.className + '-toggle', newoverlay);
			toggle.href = '#';
			toggle.innerHTML = '...';
			toggle.title = this.options.newoverlay.title;

			if (L.Browser.touch) {
				L.DomEvent
			    .on(toggle, 'click', L.DomEvent.stop);
			}
			L.DomEvent.on(toggle, 'click', this._newoverlayexpand, this);

			this._map.on('click', this._newoverlaycollapse, this);
			// TODO keyboard accessibility
		} else {
			this._newoverlayexpand();
		}

		this._initDialog();
	},

	_initDialog: function () {
		var _this = this,
			overdialog = this._newoverlaydialog,
			className = this._newoverlay.className;

		var	button = document.createElement('input');
		button.className = 'leaflet-newoverlay-2mass leaflet-control-bar';
		button.type = 'button';
		overdialog.appendChild(button);
		L.DomEvent.on(button, 'click', function () {
			_this.getCatalog(L.Catalog.TwoMASS);
		}, this);

		var	button = document.createElement('input');
		button.className = 'leaflet-newoverlay-sdss leaflet-control-bar';
		button.type = 'button';
		overdialog.appendChild(button);
		L.DomEvent.on(button, 'click', function () {
			_this.getCatalog(L.Catalog.SDSS);
		}, this);
	},

	_newoverlayexpand: function () {
		L.DomUtil.addClass(this._newoverlay, 'leaflet-control-newoverlay-expanded');
	},

	_newoverlaycollapse: function () {
		this._newoverlay.className = this._newoverlay.className.replace(' leaflet-control-newoverlay-expanded', '');
	},

	getCatalog: function (catalog) {
		var _this = this,
		center = this._map.getCenter(),
		 bounds = this._map.getBounds(),
		 lngfac = Math.abs(Math.cos(center.lat))*L.LatLng.DEG_TO_RAD,
		 dlng = Math.abs(bounds.getWest() - bounds.getEast()),
		 dlat = Math.abs(bounds.getNorth() - bounds.getSouth());

		if (dlat > 1.0) {
		  dlat = 1.0;
		} else if (dlat < 0.0001) {
		  dlat = 0.0001;
		}
		if (lngfac > 0.0) {
			if (dlng*lngfac > 1.0) {
			  dlng = 1.0 / lngfac;
			} else if (dlng*lngfac > 1.0) {
			  dlng = 1.0 / lngfac;
			}
		}

		L.IIPUtils.requestURI(
			L.Util.template(catalog.uri, L.extend({
				ra: center.lng.toFixed(6),
				dec: center.lat.toFixed(6),
				dra: dlng.toFixed(4),
				ddec: dlat.toFixed(4)
			})), 'getting ' + catalog.service + ' data', function (context, httpRequest) {
				_this._loadCatalog(catalog, context, httpRequest);
			}, this, true);
	},

	_loadCatalog: function (catalog, _this, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
console.log(catalog);
				var response = httpRequest.responseText,
				 geo = catalog.toGeoJSON(response),
				 geocatalog = L.geoJson(geo, {
					onEachFeature: function (feature, layer) {
						if (feature.properties && feature.properties.mags) {
							layer.bindPopup(_this._popup(feature, catalog));
    				}
					},
					pointToLayer: function (feature, latlng) {
						return L.circleMarker(latlng,
							{radius: feature.properties.mags[0]?
							 8 + catalog.maglim - feature.properties.mags[0] : 8});
					},
					style: function(feature) {
						return {color: catalog.color};
					}
				}).addTo(_this._map);
			_this.addOverlay(geo, catalog.name);
			} else {
				alert('There was a problem with the request to ' + catalog.service + '.');
			}
		}
	},

	_popup: function (feature, catalog) {
		var str = '<div>';
		if (catalog.objuri) {
			str += 'ID: <a href=\"' +  L.Util.template(catalog.objuri, L.extend({
				ra: feature.geometry.coordinates[0].toFixed(6),
				dec: feature.geometry.coordinates[1].toFixed(6)
			})) + '\" target=\"_blank\">' + feature.id + '</a></div>';
		} else {
			str += 'ID: ' + feature.id + '</div>';
		}
		for	(var i in catalog.properties) {
			str += '<div>' + catalog.properties[i] + ': ' + feature.properties.mags[i].toString() + '</div>';
		}
		return str;
	}

});

L.control.layers.catalogs = function (layers, options) {
	return new L.Control.Layers.Catalogs(layers, options);
};

