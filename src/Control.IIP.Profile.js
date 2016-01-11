/*
# L.Control.IIP.Profile manages image profile diagrams
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014,2015 Emmanuel Bertin - IAP/CNRS/UPMC,
#                          Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 24/11/2015
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery');
}

L.Control.IIP.Profile = L.Control.IIP.extend({

	options: {
		title: 'Profile overlays',
		collapsed: true,
		position: 'topleft',
		profile: true,
		profileColor: '#FF00FF',
		spectrum: true,
		spectrumColor: '#A000FF'
	},

	initialize: function (options) {
		L.setOptions(this, options);
		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipprofile';
		this._layers = {};
		this._sideClass = 'profile';
		this._handlingClick = false;
	},

	_initDialog: function () {
		var _this = this,
			options = this.options,
			className = this._className,
			box = this._addDialogBox(),
			line, elem;

		if (options.profile) {
			line = this._addDialogLine('Profile:', box);
			elem = this._addDialogElement(line);
			var	linecolpick = this._createColorPicker(
				className + '-color',
				elem,
				'profile',
			  options.profileColor,
				false,
				'iipProfile',
				'Click to set line color'
				);

			// Create start profile line button
			this._createButton(className + '-button', elem, 'start', function () {
				if (this._currProfileLine) {
					this._updateLine();
				} else {
					var map = _this._map,
					 point = map.getCenter(),
					 line = this._currProfileLine = L.polyline([point, point], {
						color: linecolpick.value,
						weight: 7,
						opacity: 0.5
					});
					line.nameColor = linecolpick.value;
					line.addTo(map);
					map.on('drag', this._updateLine, this);
				}
			}, 'Start drawing a profile line');

			// Create end profile line button
			this._createButton(className + '-button', elem, 'end',
			  this._profileEnd, 'End line and plot');
		}

		if (options.spectrum) {
			// Create Spectrum dialog line
			line = this._addDialogLine('Spectrum:', box);
			elem = this._addDialogElement(line);

			// Create Spectrum color picker
			var speccolpick = this._createColorPicker(
					className + '-color',
					elem,
					'spectrum',
				  options.spectrumColor,
					false,
					'iipSpectra',
					'Click to set marker color'
				);

			// Create Spectrum button
			this._createButton(className + '-button', elem, 'spectrum', function () {
				var map = _this._map,
					latLng = map.getCenter(),
					zoom = map.options.crs.options.nzoom - 1,
				  point = map.project(latLng, zoom).round(),
					rLatLng = map.unproject(point, zoom),
					marker = this._spectrumMarker = L.circleMarker(rLatLng, {
						color: speccolpick.value,
						radius: 6,
						title: 'Spectrum'
					}).addTo(map),
					popdiv = L.DomUtil.create('div', this._className + '-popup'),
			    activity = L.DomUtil.create('div', this._className + '-activity', popdiv);

				popdiv.id = 'leaflet-spectrum-plot';
				marker.bindPopup(popdiv,
				  {minWidth: 16, maxWidth: 1024, closeOnClick: false}).openPopup();
				L.IIPUtils.requestURL(this._layer._url.replace(/\&.*$/g, '') +
				  '&PFL=' + zoom.toString() + ':' +
				  point.x.toFixed(0) + ',' + point.y.toFixed(0) + '-' +
				  point.x.toFixed(0) + ',' + point.y.toFixed(0),
				  'getting IIP layer spectrum', this._plotSpectrum, this);
			}, 'Plot a spectrum at the current map position');
		}
	},

	_updateLine: function (e) {
		var map = this._map,
		 latLng = map.getCenter(),
		 maxzoom = map.options.crs.options.nzoom - 1,
		 path = this._currProfileLine.getLatLngs(),
		 point1 = map.project(path[0], maxzoom),
		 point2 = map.project(map.getCenter(), maxzoom);
		if (Math.abs(point1.x - point2.x) > Math.abs(point1.y - point2.y)) {
			point2.y = point1.y;
		} else {
			point2.x = point1.x;
		}

		path[1] = map.unproject(point2, maxzoom);
		this._currProfileLine.redraw();
	},

	_profileEnd: function () {
		var map = this._map,
		    point = map.getCenter(),
		    line = this._profileLine = this._currProfileLine;

		map.off('drag', this._updateLine, this);
		this._currProfileLine = undefined;

		var popdiv = L.DomUtil.create('div', this._className + '-popup'),
		    activity = L.DomUtil.create('div', this._className + '-activity', popdiv);

		popdiv.id = 'leaflet-profile-plot';
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

		L.IIPUtils.requestURL(this._layer._url.replace(/\&.*$/g, '') +
			'&PFL=' + zoom.toString() + ':' + point1.x.toFixed(0) + ',' +
			 point1.y.toFixed(0) + '-' + point2.x.toFixed(0) + ',' +
			 point2.y.toFixed(0),
			'getting IIP layer profile',
			this._plotProfile, this);
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
	},

	_plotProfile: function (self, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var json = JSON.parse(httpRequest.responseText),
				    rawprof = json.profile,
						layer = self._layer,
						line = self._profileLine,
						popdiv = document.getElementById('leaflet-profile-plot'),
						prof = [],
						series = [],
						title, ylabel;

				self.addLayer(line, 'Image profile');

				if (layer.iipMode === 'mono') {
					prof.push(self._extractProfile(layer, rawprof, layer.iipChannel));
					series.push({
						color: 'black',
					});
					title = 'Image profile for ' + layer.iipChannelLabels[layer.iipChannel];
					ylabel = 'Pixel value in ' + layer.iipChannelUnits[layer.iipChannel];
				} else {
					var rgb = layer.iipRGB;
					for (var chan = 0; chan < layer.iipNChannel; chan++) {
						if (rgb[chan].isOn()) {
							prof.push(self._extractProfile(layer, rawprof, chan));
							series.push({
								color: rgb[chan].toStr(),
								label: layer.iipChannelLabels[chan]
							});
						}
					}
					title = 'Image profiles';
					ylabel = 'Pixel value';
				}

				$(document).ready(function () {
					$.jqplot.config.enablePlugins = true;
					$.jqplot('leaflet-profile-plot', prof, {
						title: title,
						grid: {
							backgroundColor: '#ddd',
							gridLineColor: '#eee'
						},
						axes: {
							xaxis: {
								label: 'position along line',
								labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
								pad: 1.0
							},
							yaxis: {
								label: ylabel,
								labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
								pad: 1.0
							}
						},
						legend: {
							show: (layer.iipMode !== 'mono'),
							location: 'ne',
						},
						highlighter: {
							show: true,
							sizeAdjust: 2,
							tooltipLocation: 'n',
							tooltipAxes: 'y',
							tooltipFormatString: '%.6g ' + layer.iipChannelUnits[layer.iipChannel],
							useAxesFormatters: false,
							bringSeriesToFront: true
						},
						cursor: {
							show: true,
							zoom: true
						},
						series: series,
						seriesDefaults: {
							lineWidth: 2.0,
							showMarker: false
						}
					});
				});

				popdiv.removeChild(popdiv.childNodes[0]);	// Remove activity spinner

				line._popup.update();	// TODO: avoid private method
			}
		}
	},

	// Extract the image profile in a given channel
	_extractProfile: function (layer, rawprof, chan) {
		var	prof = [],
			nchan = layer.iipNChannel,
			npix = rawprof.length / nchan;

		for (var i = 0; i < npix; i++) {
			prof.push(rawprof[i * nchan + chan]);
		}

		return prof;
	},

	_plotSpectrum: function (self, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var json = JSON.parse(httpRequest.responseText),
				    rawprof = json.profile,
						layer = self._layer,
						marker = self._spectrumMarker,
						popdiv = document.getElementById('leaflet-spectrum-plot'),
						spec = [],
						series = [],
						title, ylabel;
				self.addLayer(marker, 'Image spectrum');

				for (var chan = 0; chan < layer.iipNChannel; chan++) {
					spec.push([
						layer.iipChannelLabels[chan],
						self._extractAverage(layer, rawprof, chan)
					]);
				}
				title = 'Image Spectrum';
				ylabel = 'Average pixel value';
				$(document).ready(function () {
					$.jqplot.config.enablePlugins = true;
					$.jqplot('leaflet-spectrum-plot', [spec], {
						title: title,
						grid: {
							backgroundColor: '#F0F0F0',
							gridLineColor: '#F8F8F8'
						},
						axes: {
							xaxis: {
								renderer: $.jqplot.CategoryAxisRenderer,
								tickRenderer: $.jqplot.CanvasAxisTickRenderer,
								tickOptions: {
									angle: -30,
									fontSize: '6pt'
								}
							},
							yaxis: {
								label: ylabel,
								labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
							}
						},
						highlighter: {
							show: true,
							sizeAdjust: 2,
							tooltipLocation: 'n',
							tooltipAxes: 'y',
							tooltipFormatString: '%.6g ' + layer.iipChannelUnits[layer.iipChannel],
							useAxesFormatters: false
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

				popdiv.removeChild(popdiv.childNodes[0]);	// Remove activity spinner

				marker._popup.update();	// TODO: avoid private method
			}
		}
	},

	// Extract the average of a series of pixels in a given channel
	_extractAverage: function (layer, rawprof, chan) {
		var	nchan = layer.iipNChannel,
			npix = rawprof.length / nchan,
			val = 0.0;

		if (npix === 0) { return 0.0; }

		for (var i = 0; i < npix; i++) {
			val += rawprof[i * nchan + chan];
		}

		return val / npix;
	}

});

L.control.iip.profile = function (options) {
	return new L.Control.IIP.Profile(options);
};

