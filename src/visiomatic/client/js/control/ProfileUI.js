/**
 #	This file part of:	VisiOmatic
 * @file User Interface for plotting image profiles and spectra.

 * @requires util/VUtil
 * @requires control/UI.js

 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/
import jQuery from 'jquery';
window.$ = window.jQuery = jQuery;
import 'jqplot-exported';

import {
	DomUtil,
	Util,
	circleMarker,
	polyline
} from 'leaflet';

import {VUtil} from '../util';
import {UI} from './UI';


export const ProfileUI = UI.extend( /** @lends ProfileUI */ {

	options: {
		title: 'Profile overlays',
		collapsed: true,
		position: 'topleft',
		profile: true,
		profileColor: '#FF00FF',
		spectrum: true,
		spectrumColor: '#A000FF'
	},

	/**
	 * VisiOmatic dialog for plotting image profiles and spectra.
	 * @extends UI
	 * @memberof module:control/ProfileUI.js
	 * @constructs
	 * @param {object} [options] - Options.

	 * @param {string} [options.title='Profile overlays']
	   Title of the dialog window or panel.

	 * @param {boolean} [options.profile=True]
	   Include Profile plotting dialog?

	 * @param {string} [options.profileColor='#FF00FF']
	   Default profile overlay color

	 * @param {boolean} [options.spectrum=True]
	   Include spectrum plotting dialog?

	 * @param {string} [options.spectrumColor='A000FF']
	   Default spectrumoverlay color

	 * @see {@link UI} for additional control options.

	 * @returns {ProfileUI} Instance of a VisiOmatic profile and spectrum
	   plotting user interface.
	 */
	initialize: function (options) {
		Util.setOptions(this, options);
		this._className = 'visiomatic-control';
		this._id = 'visiomatic-profile';
		this._layers = {};
		this._sideClass = 'profile';
		this._handlingClick = false;
	},

	/**
	 * Initialize the catalog query dialog.
	 * @method
	 * @static
	 * @private
	 */
	_initDialog: function () {
		const _this = this,
			options = this.options,
			className = this._className,
			box = this._addDialogBox();

		if (options.profile) {
			const	line = this._addDialogLine('Profile:', box),
				elem = this._addDialogElement(line),
				linecolpick = this._addColorPicker(
					className + '-color',
					elem,
					'profile',
					options.profileColor,
					'visiomaticProfile',
					'Click to set line color'
				);

			// Create start profile line button
			this._addButton(
				className + '-button',
				elem,
				'start',
				'Start drawing a profile line',
				function () {
					if (this._currProfileLine) {
						this._updateLine();
					} else {
						const	map = _this._map,
							point = map.getCenter(),
							line = this._currProfileLine = polyline(
								[point, point],
								{
									color: linecolpick.value,
									weight: 7,
									opacity: 0.5
								}
							);
						line.nameColor = linecolpick.value;
						line.addTo(map);
						map.on('drag', this._updateLine, this);
					}
				}
			);

			// Create end profile line button
			this._addButton(
				className + '-button',
				elem,
				'end',
				'End line and plot',
				this._profileEnd
			);
		}

		if (options.spectrum) {
			// Create Spectrum dialog line
			const	line = this._addDialogLine('Spectrum:', box),
				elem = this._addDialogElement(line);

			// Create Spectrum color picker
			const	speccolpick = this._addColorPicker(
				className + '-color',
				elem,
				'spectrum',
				options.spectrumColor,
				'visiomaticSpectra',
				'Click to set marker color'
			);

			// Create Spectrum button
			this._addButton(
				className + '-button',
				elem,
				'spectrum',
				'Plot a spectrum at the current map position',
				function () {
					const map = _this._map,
						latLng = map.getCenter(),
						zoom = map.options.crs.options.nzoom - 1,
						point = map.project(latLng, zoom).floor().add([0.5, 0.5]),
						rLatLng = map.unproject(point, zoom),
						marker = this._spectrumMarker = circleMarker(rLatLng, {
							color: speccolpick.value,
							radius: 6,
							title: 'Spectrum'
						}).addTo(map),
						popdiv = DomUtil.create(
							'div',
							this._className + '-popup'
						),
						activity = DomUtil.create(
							'div',
							this._className + '-activity',
							popdiv
						);

					popdiv.id = 'leaflet-spectrum-plot';
					marker.bindPopup(
						popdiv,
						{
							minWidth: 16,
							maxWidth: 1024,
							closeOnClick: false
						}
					).openPopup();
					VUtil.requestURL(
						this._layer._url.replace(/\&.*$/g, '') +
							'&PFL=' + zoom.toString() + ':' +
							(point.x - 0.5).toFixed(0) + ',' +
							(point.y - 0.5).toFixed(0) + '-' +
							(point.x - 0.5).toFixed(0) + ',' +
							(point.y - 0.5).toFixed(0),
						'getting layer spectrum',
						this._plotSpectrum,
						this
					);
				}
			);
		}
	},

	/**
	 * Update plotted line parameters.
	 * @method
	 * @static
	 * @private
	 * @param {event} e
	   Triggering event (e.g., ``'drag'``).
	 */
	_updateLine: function (e) {
		const	map = this._map,
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

	/**
	 * End interactive profile line definition and do the profile query. 
	 * @method
	 * @static
	 * @private
	 */
	_profileEnd: function () {
		const	map = this._map,
			point = map.getCenter(),
			line = this._profileLine = this._currProfileLine;

		map.off('drag', this._updateLine, this);
		this._currProfileLine = undefined;

		const	popdiv = DomUtil.create('div', this._className + '-popup'),
			activity = DomUtil.create(
				'div',
				this._className + '-activity',
				popdiv
			);

		popdiv.id = 'leaflet-profile-plot';
		line.bindPopup(popdiv,
			 {minWidth: 16, maxWidth: 1024, closeOnClick: false}).openPopup();
		const	zoom = map.options.crs.options.nzoom - 1,
			path = line.getLatLngs(),
			point1 = map.project(path[0], zoom),
			point2 = map.project(path[1], zoom);

		if (point2.x < point1.x) {
			const x = point2.x;
			point2.x = point1.x;
			point1.x = x;
		}
		if (point2.y < point1.y) {
			const y = point2.y;
			point2.y = point1.y;
			point1.y = y;
		}

		VUtil.requestURL(
			this._layer._url.replace(/\&.*$/g, '') +
				'&PFL=' + zoom.toString() + ':' +
				(point1.x - 0.5).toFixed(0) + ',' +
				(point1.y - 0.5).toFixed(0) + '-' +
				(point2.x - 0.5).toFixed(0) + ',' +
				(point2.y - 0.5).toFixed(0),
			'getting layer profile',
			this._plotProfile,
			this
		);
	},

	/**
	 * Compute distance and set up measurement string.
	 * @method
	 * @static
	 * @private
	 * @returns {string} Measurement string.
	 */
	_getMeasurementString: function () {
		const	currentLatLng = this._currentLatLng,
			previousLatLng = this._markers[this._markers.length - 1].getLatLng();
		var	unit;

		// calculate the distance from the last fixed point to the mouse position
		let distance = this._measurementRunningTotal + VUtil.distance(
			currentLatLng,
			previousLatLng
		);

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
		const	distanceStr = distance.toFixed(2) + unit;

		return distanceStr;
	},

	/**
	 * Load and plot image profile data.
	 * @method
	 * @static
	 * @private
	 * @param {object} self
	   Calling control object (``this``).
	 * @param {object} httpRequest
	   HTTP request.
	 */
	_plotProfile: function (self, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				const	json = JSON.parse(httpRequest.responseText),
					rawprof = json.profile,
					layer = self._layer,
					visio = layer.visio,
					line = self._profileLine,
					popdiv = document.getElementById('leaflet-profile-plot'),
					prof = [],
					series = [];
				var	title, ylabel;

				self.addLayer(line, 'Image profile');

				if (visio.mode === 'mono') {
					prof.push(self._extractProfile(
						layer,
						rawprof,
						visio.channel
					));
					series.push({
						color: 'black',
					});
					title = 'Image profile for ' +
						visio.channelLabels[visio.channel];
					ylabel = 'Pixel value in ' +
						visio.channelUnits[visio.channel];
				} else {
					const rgb = visio.rgb;
					for (let c = 0; c < visio.nChannel; c++) {
						if (rgb[c].isOn()) {
							prof.push(self._extractProfile(layer, rawprof, c));
							series.push({
								color: rgb[c].toStr(),
								label: visio.channelLabels[c]
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
							show: (visio.mode !== 'mono'),
							location: 'ne',
						},
						highlighter: {
							show: true,
							sizeAdjust: 2,
							tooltipLocation: 'n',
							tooltipAxes: 'y',
							tooltipFormatString: '%.6g ' +
								visio.channelUnits[visio.channel],
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

				popdiv.removeChild(
					popdiv.childNodes[0]
				);						// Remove activity spinner

				line._popup.update();	// TODO: avoid private method
			}
		}
	},

	/**
	 * Extract the image profile in a given channel from the multichannel
	   profiles of a given VisiOmatic layer.
	 * @method
	 * @static
	 * @private
	 * @param {VTileLayer} layer
	   VisiOmatic layer.
	 * @param {number[]} rawprof
	   Input "raw" (multiplexed) image profiles.
	 * @param {number} channel
	   Image channel.
	 * @returns {number[]} Extracted image profile.
	 */
	_extractProfile: function (layer, rawprof, channel) {
		const	nchan = layer.visio.nChannel,
			npix = rawprof.length / nchan,
			prof = [];

		for (let i = 0; i < npix; i++) {
			prof.push(rawprof[i * nchan + channel]);
		}

		return prof;
	},

	/**
	 * Load and plot spectrum data.
	 * @method
	 * @static
	 * @private
	 * @param {object} self
	   Calling control object (``this``).
	 * @param {object} httpRequest
	   HTTP request.
	 */
	_plotSpectrum: function (self, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				const	json = JSON.parse(httpRequest.responseText),
					rawprof = json.profile,
					layer = self._layer,
					visio = layer.visio,
					marker = self._spectrumMarker,
					popdiv = document.getElementById('leaflet-spectrum-plot'),
					spec = [],
					series = [],
					title = 'Image Spectrum',
					ylabel = 'Average pixel value';

				self.addLayer(marker, 'Image spectrum');

				for (let c = 0; c < visio.nChannel; c++) {
					spec.push([
						visio.channelLabels[c],
						self._extractAverage(layer, rawprof, c)
					]);
				}
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
							tooltipFormatString: '%.6g ' +
								visio.channelUnits[visio.channel],
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

				popdiv.removeChild(
					popdiv.childNodes[0]
				);						// Remove activity spinner

				marker._popup.update();	// TODO: avoid private method
			}
		}
	},

	/**
	 * Extract the average pixel value in a given channel from the multichannel
	   profiles of a given VisiOmatic layer.
	 * @method
	 * @static
	 * @private
	 * @param {VTileLayer} layer
	   VisiOmatic layer.
	 * @param {number[]} rawprof
	   Input "raw" (multiplexed) image profiles.
	 * @param {number} channel
	   Image channel.
	 * @returns {number} Average value.
	 */
	_extractAverage: function (layer, rawprof, channel) {
		const	nchan = layer.visio.nChannel,
			npix = rawprof.length / nchan;
		let	val = 0.0;

		if (npix === 0) {
			return 0.0;
		}

		for (let i = 0; i < npix; i++) {
			val += rawprof[i * nchan + channel];
		}

		return val / npix;
	}

});

/**
 * Instantiate a VisiOmatic dialog for plotting image profiles and spectra.
 * @function
 * @param {object} [options] - Options: see {@link ProfileUI}
 * @returns {ProfileUI} Instance of a VisiOmatic profile and spectrum
   plotting user interface.
 */
export const profileUI = function (options) {
	return new ProfileUI(options);
};

