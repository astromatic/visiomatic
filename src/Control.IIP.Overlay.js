/*
# L.Control.Layers.Overlay manages new overlays such as catalogs and plots
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 10/02/2014
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery-browser');
}

L.Draw.Line = L.Draw.Polyline.extend({

	_onClick: function (e) {
		L.Draw.Polyline.prototype._onClick.call(this, e);
		if (this._markers.length === 2) {
			this._finishShape();
		}
	},

	_getMeasurementString: function () {
		var currentLatLng = this._currentLatLng,
		 previousLatLng = this._markers[this._markers.length - 1].getLatLng(),
		 distance, distanceStr, unit;

		// calculate the distance from the last fixed point to the mouse position
		distance = this._measurementRunningTotal + L.IIPUtils.distance(currentLatLng, previousLatLng);

		if (distance >= 1.0) {
			unit = '&#176;';
		} else {
			distance *= 60.0;
			if (distance >= 1.0) {
				unit = '&#39;';
			} else {
				distance *= 60.0;
				unit = '&#34;';
			}
		}
		distanceStr = distance.toFixed(2) + unit;

		return distanceStr;
	}

});

L.Control.IIP.Overlay = L.Control.IIP.extend({
	options: {
		title: 'overlay menu',
		collapsed: true,
		position: 'topleft',
	},

	initialize: function (baseLayers, options) {
		L.setOptions(this, options);
		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipoverlay';
		this._layers = baseLayers;
	},

	_initDialog: function () {
		var className = this._className,
		    catalogs = [L.Catalog.TwoMASS, L.Catalog.SDSS, L.Catalog.PPMXL,
		                L.Catalog.Abell],
		    elem;

		// CDS catalog overlay
		elem = this._addDialogLine('CDS Catalog:');
		var catcolpick = L.DomUtil.create('input', className + '-catalogs', elem);
		catcolpick.id = 'leaflet-catalog-colorpicker';
		catcolpick.type = 'text';
		catcolpick.value = 'yellow';
		$(document).ready(function () {
			$('#' + catcolpick.id).spectrum({
				showInput: true,
				clickoutFiresChange: true,
				move: function (color) {
					catcolpick.value = color.toHexString();
				}
			});
		});

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

		// Fix issue with collapsing dialog after selecting a catalog
		if (!L.Browser.android && this.options.collapsed) {
			L.DomEvent.on(catselect, 'mousedown', function () {
				L.DomEvent.off(this._container, 'mouseout', this._collapse, this);
				this.collapsedOff = true;
			}, this);

			L.DomEvent.on(this._container, 'mouseover', function () {
				if (this.collapsedOff) {
					L.DomEvent.on(this._container, 'mouseout', this._collapse, this);
					this.collapsedOff = false;
				}
			}, this);
		}

		var catbutton = L.DomUtil.create('input', className + '-catalogs', elem);
		catbutton.type = 'button';
		catbutton.value = 'Go';
		L.DomEvent.on(catbutton, 'click', function () {
			var	index = catselect.selectedIndex - 1;	// Ignore dummy 'Choose catalog' entry
			if (index >= 0) {
				var catalog = catalogs[index];
				catalog.color = catcolpick.value;
				catselect.selectedIndex = 0;
				this._getCatalog(catalog);
			}
		}, this);

		// Profile overlay
		elem = this._addDialogLine('Profile:');
		var profcolpick = L.DomUtil.create('input', className + '-profile', elem);
		profcolpick.id = 'leaflet-profile-colorpicker';
		profcolpick.type = 'text';
		profcolpick.value = 'magenta';
		$(document).ready(function () {
			$('#' + profcolpick.id).spectrum({
				showInput: true,
				clickoutFiresChange: true,
				move: function (color) {
					profcolpick.value = color.toHexString();
				}
			});
		});

		var profbutton = L.DomUtil.create('input', className + '-profile', elem);
		profbutton.type = 'button';
		profbutton.value = 'Go';
		L.DomEvent.on(profbutton, 'click', this.getProfile, this);
	},

	_resetDialog: function () {
	// Do nothing: no need to reset with layer changes
	},

	_getCatalog: function (catalog) {
		var _this = this,
		center = this._map.getCenter(),
		 bounds = this._map.getBounds(),
		 lngfac = Math.abs(Math.cos(center.lat)) * Math.PI / 180.0,
		 dlng = Math.abs(bounds.getWest() - bounds.getEast()),
		 dlat = Math.abs(bounds.getNorth() - bounds.getSouth());

		if (dlat < 0.0001) {
			dlat = 0.0001;
		}
		if (lngfac > 0.0 && dlng * lngfac < 0.0001) {
			dlng = 0.0001 / lngfac;
		}

		var templayer = new L.LayerGroup(null),
		 layercontrol = this._map._layerControl;
		templayer.notReady = true;
		if (layercontrol) {
			layercontrol.addOverlay(templayer, catalog.name);
			if (layercontrol.options.collapsed) {
				layercontrol._expand();
			}
		}
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

	_loadCatalog: function (catalog, templayer, _this, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var response = httpRequest.responseText,
				 geo = catalog.toGeoJSON(response),
				 geocatalog = L.geoJson(geo, {
					onEachFeature: function (feature, layer) {
						if (feature.properties && feature.properties.mags) {
							layer.bindPopup(catalog._popup(feature));
						}
					},
					pointToLayer: function (feature, latlng) {
						return L.circleMarker(latlng, {
							radius: feature.properties.mags[0] ?
							 8 + catalog.maglim - feature.properties.mags[0] : 8
						});
					},
					style: function (feature) {
						return {color: catalog.color, weight: 2};
					}
				});
				geocatalog.addTo(_this._map);
				var layercontrol = _this._map._layerControl;
				if (layercontrol) {
					layercontrol.removeLayer(templayer);
					layercontrol.addOverlay(geocatalog, catalog.name +
						' (' + geo.features.length.toString() + ' entries)');
					if (layercontrol.options.collapsed) {
						layercontrol._collapse();
					}
				}
			} else {
				alert('There was a problem with the request to ' + catalog.service + '.');
			}
		}
	},

	getProfile: function (e) {
		L.drawLocal.draw.handlers.polyline.tooltip.cont = 'Click to end drawing line.';
		var drawline = new L.Draw.Line(this._map, {shapeOptions: {weight: 7}}),
		 _this = this;
		this._map.on('draw:created', function (e) {
			var layer = e.layer,
			 popdiv = document.createElement('div');
			layer.addTo(_this._map);
			drawline.removeHooks();
			popdiv.id = 'leaflet-profile-plot';
			var activity = document.createElement('div');
			activity.className = 'leaflet-control-activity';
			popdiv.appendChild(activity);
			layer.bindPopup(popdiv,
			 {minWidth: 16, maxWidth: 1024, closeOnClick: false}).openPopup();
			var zoom = _this._map.options.crs.options.nzoom - 1,
			 point1 = _this._map.project(layer._latlngs[0], zoom),
			 point2 = _this._map.project(layer._latlngs[1], zoom);
			L.IIPUtils.requestURI(_this._layer._url.replace(/\&.*$/g, '') +
			'&PFL=' + zoom.toString() + ':' + point1.x.toFixed(0) + ',' +
			 point1.y.toFixed(0) + '-' + point2.x.toFixed(0) + ',' +
			 point2.y.toFixed(0),
			'getting IIP layer profile',
			_this._plotProfile, layer);
		});
		drawline.addHooks();
	},

	_plotProfile: function (layer, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var json = JSON.parse(httpRequest.responseText),
				    yprof = json.profile,
				    layercontrol = layer._map._layerControl,
						popdiv = document.getElementById('leaflet-profile-plot');

				if (layercontrol) {
					layercontrol.addOverlay(layer, 'Image profile');
				}
				$(document).ready(function () {
					$.jqplot('leaflet-profile-plot', [yprof], {
						title: 'Image profile',
						axes: {
							xaxis: {
								label: 'position along line',
								labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
								pad: 1.0
							},
							yaxis: {
								label: 'pixel values',
								labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
								pad: 1.0
							}
						},
						cursor: {
							show: true,
							zoom: true
						},
						seriesDefaults: {
							lineWidth: 2.0,
							showMarker: false
						}
					});
				});

				popdiv.removeChild(popdiv.childNodes[0]);

				layer._popup.update();	// TODO: avoid private method
			}
		}
	}

});

L.control.iip.overlay = function (options) {
	return new L.Control.IIP.Overlay(options);
};

