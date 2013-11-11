/*
# L.Control.Layers.Catalogs Manage catalog queries and display
#
#	This file part of:	Leaflet-IVV
#
#	Copyright: (C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		11/11/2013
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery-browser');
}

L.Control.Layers.Catalogs = L.Control.Layers.extend({
	options: {
		title: 'overlay menu',
		collapsed: true,
		position: 'topright',
		newoverlay: {
			title: 'Overlay menu',
			collapsed: false
		}
	},

	getCatalog: function (catalog) {
		var _this = this,
		center = this._map.getCenter(),
		 bounds = this._map.getBounds(),
		 lngfac = Math.abs(Math.cos(center.lat)) * L.LatLng.DEG_TO_RAD,
		 dlng = Math.abs(bounds.getWest() - bounds.getEast()),
		 dlat = Math.abs(bounds.getNorth() - bounds.getSouth());

		if (dlat < 0.0001) {
			dlat = 0.0001;
		}
		if (lngfac > 0.0 && dlng * lngfac < 0.0001) {
			dlng = 0.0001 / lngfac;
		}

		var templayer = new L.LayerGroup(null);
		templayer.notReady = true;
		_this.addOverlay(templayer, catalog.name);
		L.IIPUtils.requestURI(
			L.Util.template(catalog.uri, L.extend({
				ra: center.lng.toFixed(6),
				dec: center.lat.toFixed(6),
				dra: dlng.toFixed(4),
				ddec: dlat.toFixed(4),
				nmax: catalog.nmax
			})), 'getting ' + catalog.service + ' data', function (context, httpRequest) {
				_this._loadCatalog(catalog, templayer, context, httpRequest);
			}, this, true);
	},

	_addItem: function (obj) {
		var _this = this,
			label = document.createElement('label');

		if (obj.layer.notReady) {
			var activity = document.createElement('span');
			activity.className = 'leaflet-control-activity';
			label.appendChild(activity);
		} else {
			var input,
				checked = this._map.hasLayer(obj.layer);
			if (obj.overlay) {
				input = document.createElement('input');
				input.type = 'checkbox';
				input.className = 'leaflet-control-layers-selector';
				input.defaultChecked = checked;
			}
			else {
				input = this._createRadioElement('leaflet-base-layers', checked);
			}
			input.layerId = L.stamp(obj.layer);
			L.DomEvent.on(input, 'click', this._onInputClick, this);
			label.appendChild(input);
		}
		
		var name = document.createElement('span');
		name.innerHTML = ' ' + obj.name;

		var trashbutton = document.createElement('input');
		trashbutton.type = 'button';
		trashbutton.className = 'leaflet-control-layers-trash';
		L.DomEvent.on(trashbutton, 'click', function () {
			_this.removeLayer(obj.layer);
			if (!obj.notReady) {
				_this._map.removeLayer(obj.layer);
			}
		}, this);

		label.appendChild(name);
		label.appendChild(trashbutton);

		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
		container.appendChild(label);

		return label;
	},

	_onInputClick: function () {
		var i, input, obj,
		    inputs = this._form.getElementsByTagName('input'),
		    inputsLen = inputs.length;

		this._handlingClick = true;

		for (i = 0; i < inputsLen; i++) {
			input = inputs[i];
			if (!('layerId' in input))
			  continue;
			obj = this._layers[input.layerId];
			if (input.checked && !this._map.hasLayer(obj.layer)) {
				this._map.addLayer(obj.layer);

			} else if (!input.checked && this._map.hasLayer(obj.layer)) {
				this._map.removeLayer(obj.layer);
			}
		}

		this._handlingClick = false;
	},

	_initLayout: function () {
		L.Control.Layers.prototype._initLayout.call(this);

		var newoverlay = this._newoverlay = L.DomUtil.create('div', 'leaflet-control-newoverlay', this._form);
		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		newoverlay.setAttribute('aria-haspopup', true);
		newoverlay.collapsed = this.options.newoverlay.collapsed;

		if (!L.Browser.touch) {
			L.DomEvent.disableClickPropagation(newoverlay);
			L.DomEvent.on(newoverlay, 'mousewheel', L.DomEvent.stopPropagation);
		} else {
			L.DomEvent.on(newoverlay, 'click', L.DomEvent.stopPropagation);
		}

		this._newoverlayDialog = L.DomUtil.create('div', newoverlay.className + '-dialog', newoverlay);
		if (this.options.newoverlay.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent
				    .on(newoverlay, 'mouseover', this._newoverlayExpand, this)
				    .on(newoverlay, 'mouseout', this._newoverlayCollapse, this);
			}

			var toggle = this._newoverlayToggle = L.DomUtil.create('a', newoverlay.className + '-toggle', newoverlay);
			toggle.href = '#';
			toggle.innerHTML = 'Add...';
			toggle.title = this.options.newoverlay.title;

			if (L.Browser.touch) {
				L.DomEvent
			    .on(toggle, 'click', L.DomEvent.stop);
			}
			L.DomEvent.on(toggle, 'click', this._newoverlayExpand, this);

			this._map.on('click', this._newoverlayCollapse, this);
			// TODO keyboard accessibility
		} else {
			this._newoverlayExpand();
		}

		this._initDialog();
	},

	_initDialog: function () {
		var _this = this,
			overdialog = this._newoverlayDialog,
			className = 'leaflet-control-newoverlay',
			catalogs = [L.Catalog.TwoMASS, L.Catalog.SDSS, L.Catalog.PPMXL],
			elem;

		elem = this._addDialogLine('&nbsp', overdialog);

		// CDS catalog overlay
		elem = this._addDialogLine('Add:', overdialog);
		var catselect = L.DomUtil.create('select', className + '-catalogs', elem);
		var opt = document.createElement('option');
		opt.value = null;
		opt.text = 'Choose catalog:';
		opt.disabled = true;
		opt.selected = true;
		catselect.add(opt, null); 
		for (var c in catalogs) {
			opt = document.createElement('option');
			opt.value = catalogs[c];
			opt.text = catalogs[c].name;
			catselect.add(opt, null);
		}

		var catcolpick = L.DomUtil.create('input', className + '-catalogs', elem);
		catcolpick.id = 'leaflet-catalog-colorpicker';
		catcolpick.type = 'text';
		catcolpick.value = 'yellow';
		$(document).ready(function(){ 
			$('#' + catcolpick.id).spectrum({
			showInput: true,
			clickoutFiresChange: true,
			move: function (color) {
				catcolpick.value = color.toHexString();
			}
		})});
		var catbutton = L.DomUtil.create('input', className + '-catalogs', elem);
		catbutton.type = 'button';
		catbutton.value = 'Go';
		L.DomEvent.on(catbutton, 'click', function() {
			var	index = catselect.selectedIndex-1;	// Ignore dummy 'Choose catalog' entry
			if (index >= 0 ) {
				var catalog = catalogs[index];
				catalog.color = catcolpick.value;
				catselect.selectedIndex = 0;		
				this.getCatalog(catalog);
			}
		}, this);
	},

	_addDialogLine: function (label, dialog) {
		var elem = L.DomUtil.create('div', this._className + '-element', dialog),
		 text = L.DomUtil.create('span', this._className + '-label', elem);
		text.innerHTML = label;
		return elem;
	},

	_newoverlayExpand: function () {
		L.DomUtil.addClass(this._newoverlay, 'leaflet-control-newoverlay-expanded');
		this._newoverlay.collapsed = false;
	},

	_newoverlayCollapse: function () {
		this._newoverlay.className = this._newoverlay.className.replace(' leaflet-control-newoverlay-expanded', '');
		this._newoverlay.collapsed = true;
	},

	_loadCatalog: function (catalog, templayer, _this, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var response = httpRequest.responseText,
				 geo = catalog.toGeoJSON(response),
				 geocatalog = L.geoJson(geo, {
					onEachFeature: function (feature, layer) {
						if (feature.properties && feature.properties.mags) {
							layer.bindPopup(_this._popup(feature, catalog));
						}
					},
					pointToLayer: function (feature, latlng) {
						return L.circleMarker(latlng, {
							radius: feature.properties.mags[0] ?
							 8 + catalog.maglim - feature.properties.mags[0] : 8
						});
					},
					style: function (feature) {
						return {color: catalog.color};
					}
				});
				geocatalog.addTo(_this._map);
				_this.removeLayer(templayer);
				_this.addOverlay(geocatalog, catalog.name + ' (' + geo.features.length.toString() + ' entries)');
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
	},

	_trash: function (layerItem) {
	console.log(layerItem.name);
	}

});

L.control.layers.catalogs = function (layers, options) {
	return new L.Control.Layers.Catalogs(layers, options);
};

