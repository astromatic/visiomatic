/*
#	UI for new overlays such as catalogs and plots
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#	                         Chiara Marmo    - Paris-Saclay
*/
import jQuery from 'jquery';
window.$ = window.jQuery = jQuery;

//if (typeof require !== 'undefined') {
//	var jQuery = require('jquery');
//}

import {
	Browser,
	DomEvent,
	DomUtil,
	LayerGroup,
	Util,
	geoJson,
	circleMarker,
	point,
	polyline
} from 'leaflet';

import {VUtil} from '../util';
import {UI} from './UI';
import {Gaia_DR2, TwoMASS, SDSS, PPMXL, Abell}  from '../catalog';


export const OverlayUI = UI.extend({
	options: {
		title: 'overlay menu',
		collapsed: true,
		position: 'topleft',
	},

	initialize: function (baseLayers, options) {
		Util.setOptions(this, options);
		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipoverlay';
		this._layers = baseLayers;
	},

	_initDialog: function () {
		var className = this._className,
		    catalogs = [GAIA_DR2, TwoMASS, SDSS, PPMXL, Abell],
		    elem;

		// CDS catalog overlay
		elem = this._addDialogLine('<a id="logo-cds" ' +
		 'href="http://cds.u-strasbg.fr">&nbsp;</a> catalog:');
		var catcolpick = DomUtil.create('input', className + '-catalogs', elem);
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

		var catselect = DomUtil.create('select', className + '-catalogs', elem);
		var opt = document.createElement('option');
		opt.text = 'Choose catalog:';
		opt.disabled = true;
		opt.selected = true;
		catselect.add(opt, null);
		for (var c in catalogs) {
			opt = document.createElement('option');
			opt.text = catalogs[c].name;
			catselect.add(opt, null);
		}

		// Fix issue with collapsing dialog after selecting a catalog
		if (!Browser.android && this.options.collapsed) {
			DomEvent.on(catselect, 'mousedown', function () {
				DomEvent.off(this._container, 'mouseout', this._collapse, this);
				this.collapsedOff = true;
			}, this);

			DomEvent.on(this._container, 'mouseover', function () {
				if (this.collapsedOff) {
					DomEvent.on(this._container, 'mouseout', this._collapse, this);
					this.collapsedOff = false;
				}
			}, this);
		}

		var catbutton = DomUtil.create('input', className + '-catalogs', elem);
		catbutton.type = 'button';
		catbutton.value = 'Go';
		DomEvent.on(catbutton, 'click', function () {
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
		var profcolpick = DomUtil.create('input', className + '-profile', elem);
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

		var profbutton1 = DomUtil.create('input', className + '-profile-start', elem);
		profbutton1.type = 'button';
		profbutton1.value = 'Start';
		DomEvent.on(profbutton1, 'click', function () {
			if (this._profileLine) {
				this._profileLine.spliceLatLngs(0, 1, this._map.getCenter());
				this._profileLine.redraw();
			} else {
				var map = this._map,
				 point = map.getCenter(),
				 line = this._profileLine = polyline([point, point], {
					color: profcolpick.value,
					weight: 7,
					opacity: 0.5
				});
				line.nameColor = profcolpick.value;
				line.addTo(map);
				map.on('drag', this._updateLine, this);
			}
		}, this);
		var profbutton2 = DomUtil.create('input', className + '-profile-end', elem);
		profbutton2.type = 'button';
		profbutton2.value = 'End';
		DomEvent.on(profbutton2, 'click', this._profileEnd, this);
	},

	_resetDialog: function () {
	// Do nothing: no need to reset with layer changes
	},

	_getCatalog: function (catalog) {
		var _this = this,
		    map = this._map,
		    center = map.getCenter(),
		    b = map.getPixelBounds(),
		    z = map.getZoom(),
		    lngfac = Math.abs(Math.cos(center.lat)) * Math.PI / 180.0,
		    c = [map.unproject(b.min, z),
				     map.unproject(point(b.min.x, b.max.y), z),
				     map.unproject(b.max, z),
				     map.unproject(point(b.max.x, b.min.y), z)],
		    dlng = Math.max(c[0].lng, c[1].lng, c[2].lng, c[3].lng) -
		       Math.min(c[0].lng, c[1].lng, c[2].lng, c[3].lng),
		    dlat = Math.max(c[0].lat, c[1].lat, c[2].lat, c[3].lat) -
		       Math.min(c[0].lat, c[1].lat, c[2].lat, c[3].lat);
		if (dlat < 0.0001) {
			dlat = 0.0001;
		}
		if (lngfac > 0.0 && dlng * lngfac < 0.0001) {
			dlng = 0.0001 / lngfac;
		}

		var templayer = new LayerGroup(null),
		 layercontrol = map._layerControl;
		templayer.notReady = true;
		if (layercontrol) {
			layercontrol.addOverlay(templayer, catalog.name);
			if (layercontrol.options.collapsed) {
				layercontrol._expand();
			}
		}
		VUtil.requestURI(
			Util.template(catalog.uri, Util.extend({
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
				 geocatalog = geoJson(geo, {
					onEachFeature: function (feature, layer) {
						if (feature.properties && feature.properties.mags) {
							layer.bindPopup(catalog._popup(feature));
						}
					},
					pointToLayer: function (feature, latlng) {
						return circleMarker(latlng, {
							radius: feature.properties.mags[0] ?
							 8 + catalog.maglim - feature.properties.mags[0] : 8
						});
					},
					style: function (feature) {
						return {color: catalog.color, weight: 2};
					}
				});
				geocatalog.nameColor = catalog.color;
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

	_updateLine: function (e) {
		var map = this._map,
		 latLng = map.getCenter(),
		 maxzoom = map.options.crs.options.nzoom - 1,
		 line = this._profileLine,
		 path = line.getLatLngs(),
		 point1 = map.project(path[0], maxzoom),
		 point2 = map.project(map.getCenter(), maxzoom);
		if (Math.abs(point1.x - point2.x) > Math.abs(point1.y - point2.y)) {
			point2.y = point1.y;
		} else {
			point2.x = point1.x;
		}

		this._profileLine.spliceLatLngs(1, 1, map.unproject(point2, maxzoom));
		this._profileLine.redraw();
	},

	_profileEnd: function (e) {
		var map = this._map,
		    point = map.getCenter(),
		    line = this._profileLine;

		map.off('drag', this._updateLine, this);
		this._profileLine = undefined;

		var popdiv = document.createElement('div'),
		    activity = document.createElement('div');

		popdiv.id = 'leaflet-profile-plot';
		activity.className = 'leaflet-control-activity';
		popdiv.appendChild(activity);
		line.bindPopup(popdiv,
			 {minWidth: 16, maxWidth: 1024, closeOnClick: false}).openPopup();
		var zoom = map.options.crs.options.nzoom - 1,
			  path = line.getLatLngs(),
			  point1 = map.project(path[0], zoom),
			  point2 = map.project(path[1], zoom),
				x, y;

		if (point2.x < point1.x) {
			x = point2.x;
			point2.x = point1.x;
			point1.x = x;
		}
		if (point2.y < point1.y) {
			y = point2.y;
			point2.y = point1.y;
			point1.y = y;
		}

		VUtil.requestURI(this._layer._url.replace(/\&.*$/g, '') +
			'&PFL=' + zoom.toString() + ':' + point1.x.toFixed(0) + ',' +
			 point1.y.toFixed(0) + '-' + point2.x.toFixed(0) + ',' +
			 point2.y.toFixed(0),
			'getting IIP layer profile',
			this._plotProfile, line);
	},

	_getMeasurementString: function () {
		var currentLatLng = this._currentLatLng,
		 previousLatLng = this._markers[this._markers.length - 1].getLatLng(),
		 distance, distanceStr, unit;

		// calculate the distance from the last fixed point to the mouse position
		distance = this._measurementRunningTotal + VUtil.distance(currentLatLng, previousLatLng);

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

export const overlayUI = function (options) {
	return new OverlayUI(options);
};

