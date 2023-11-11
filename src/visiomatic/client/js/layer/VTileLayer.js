/**
 #	This file part of:	VisiOmatic
 * @file Support for VisiOmatic layers in Leaflet
 * @requires util/VUtil.js
 * @requires util/RGB.js
 * @requires crs/WCS.js

 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
 */
import {
	Browser,
	DomUtil,
	TileLayer,
	Util,
	latLngBounds
} from 'leaflet';

import {VUtil} from '../util';
import {rgb as rgbin} from '../util';
import {WCS} from '../crs';

export const VTileLayer = TileLayer.extend( /** @lends VTileLayer */ {
	options: {
		title: null,
		crs: null,
		nativeCelSys: false,
		center: null,
		fov: null,
		minZoom: 0,
		maxZoom: null,
		maxNativeZoom: 18,
		noWrap: true,
		contrast: null,
		colorSat: null,
		gamma: null,
		cMap: 'grey',
		invertCMap: false,
		quality: null,
		mixingMode: 'color',
		channelColors: [],
		channelLabels: [],
		channelLabelMatch: '.*',
		channelUnits: [],
		minMaxValues: [],
		defaultChannel: 0,
		sesameURL: 'https://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame',
		credentials: null

		/*
		pane: 'tilePane',
		opacity: 1,
		attribution: <String>,
		zIndex: <Number>,
		bounds: <LatLngBounds>
		unloadInvisibleTiles: L.Browser.mobile,
		updateWhenIdle: Browser.mobile,
		updateInterval: 150,
		tms: <Boolean>,
		zoomReverse: <Number>,
		detectRetina: <Number>,
		*/
	},

	/**
	   Default _server_ rendering parameters (to shorten tile query strings).
	 * @type {object}
	 * @property {number} contrast
	   Default contrast factor.
	 * @property {number} gamma
	   Default display gamma.
	 * @property {string} cMap
	   Default colormap.
	 * @property {boolean} invertCMap
	   Default colormap inversion switch.
	 * @property {number[]} minValue
	   Default lower clipping limits for channels.
	 * @property {number[]} maxValue
	   Default upper clipping limits for channels.
	 * @property {RGB[]} channelColors
	   Default color mixing matrix.
	 * @property {number} quality
	   Default JPEG encoding quality.
	 */
	visioDefault: {
		contrast: 1.,
		gamma: 2.2,
		cMap: 'grey',
		invertCMap: false,
		minValue: [],
		maxValue: [],
		channelColors: [
			[''],
			['#FFFFFF'],
			['#00BAFF', '#FFBA00'],
			['#0000FF', '#00BA00', '#FF0000'],
			['#0000E0', '#00BA88', '#88BA00', '#E00000'],
			['#0000CA', '#007BA8', '#00CA00', '#A87B00', '#CA0000'],
			['#0000BA', '#00719B', '#009B71', '#719B00', '#9B7100', '#BA0000']
		],
		quality: 90
	},


	/**
	 * Create a layer with tiled image data queried from a VisiOmatic server.

	 * @extends leaflet.TileLayer
	 * @memberof module:layer/VTileLayer.js
	 
	 * @constructs
	 * @param {string} url - URL of the tile server
	 * @param {object} [options] - Options.

	 * @param {?string} [options.title=null]
	   Layer title. Defaults to the basename of the tile URL with extension removed.

	 * @param {?(leaflet.CRS|WCS)} [options.crs=null]
	   Coordinate Reference or World Coordinate System: extracted from the data
	   header if available or raw pixel coordinates otherwise.

	 * @param {boolean} [options.nativeCelSys=false]
	   True if native coordinates (e.g., galactic coordinates) are to be used
	   instead of equatorial coordinates.

	 * @param {?string} [options.center=null]
	   World coordinates (either in RA,Dec decimal form or in
	   ``hh:mm:ss.s±dd:mm:ss.s`` sexagesimal  format), or any
	   [Sesame]{@link http://cds.u-strasbg.fr/cgi-bin/Sesame}-compliant identifier
	   defining the initial centering of the map upon layer initialization.
	   Sexagesimal coordinates and identifier strings are sent to the
	   Sesame resolver service for conversion to decimal coordinates. Assume x,y
	   pixel coordinates if WCS information is missing. Defaults to image center.

	 * @param {?number} [options.fov=null]
	   Field of View (FoV) covered by the map upon later initialization, in world
	   coordinates (degrees, or pixel coordinates if WCS information is missing).
	   Defaults to the full FoV.
 
	 * @param {number} [options.minZoom=0]
	   Minimum zoom factor.

	 * @param {?number} [options.maxZoom=null]
	   Maximum zoom factor.

	 * @param {number} [options.maxNativeZoom=18]
	   Maximum native zoom factor (including resampling).

	 * @param {boolean} [options.noWrap=true]
	   Deactivate layer wrapping.

	 * @param {number} [options.contrast=1.0]
	   Contrast factor.

	 * @param {number} [options.colorSat=1.0]
	   Color saturation for multi-channel data (0.0: B&W, >1.0: enhance).

	 * @param {number} [options.gamma=2.2]
	   Display gamma.

	 * @param {string} [options.cMap='grey']
	   Colormap for single channels or channel combinations. Valid colormaps are
	   ``'grey'``, ``'jet'``, ``'cold'`` and ``'hot'``.

	 * @param {boolean} [options.invertCMap=false]
	   Invert Colormap or color mix (like a negative).

	 * @param {number} [options.quality=90]
	   JPEG encoding quality in percent.

	 * @param {string} [options.mixingMode='color']
	   Channel mixing mode. Valid modes are ``'mono'`` (single-channel) and
	   ``'color'``.

	 * @param {RGB[]} [options.channelColors=[]]
	   RGB contribution of each channel to the mixing matrix. Defaults to
	   ``rgb(0.,0.,1.), rgb(0.,1.,0.), rgb(1.,0.,0.), rgb(0.,0.,0.), ...]``

	 * @param {string[]} [options.channelLabels=[]]
	   Channel labels. Defaults to ``['Channel #1', 'Channel #2', ...]``.

	 * @param {string} [options.channelLabelMatch='.*']
	   Regular expression matching the labels of channels that are given a color by
	   default.

	 * @param {string[]} [options.channelUnits=[]]
	   Channel units. Defaults to ``['ADUs','ADUs',...]``.

	 * @param {number[][]} [options.minMaxValues=[]]
	   Pairs of lower, higher clipping limits for every channel. Defaults to values
	   extracted from the data header if available or
	   ``[[0.,255.], [0.,255.], ...]`` otherwise.

	 * @param {number} [options.quality=0]
	   Default active channel index in mono-channel mode.

	 * @param {string} [options.sesameURL='https://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame']
	   URL of the [Sesame]{@link http://cds.u-strasbg.fr/cgi-bin/Sesame} resolver
	   service.

	 * @param {?string} [options.credentials=null]
	   For future use.

	 * @returns {VTileLayer} VisiOmatic TileLayer instance.
 
	 * @example
	  * const map = L.map('map'),
	 *       url = '/tiles?FIF=example.fits',
	 *       layer = new VTileLayer(url, {cmap: 'jet'}); 
	 * layer.addTo(map);
	 */
	initialize: function (url, options) {
		this.type = 'tilelayer';
		this._url = url.replace(/\&.*$/g, '');

		options = Util.setOptions(this, options);

		// detecting retina displays, adjusting tileSize and zoom levels
		if (options.detectRetina && L.Browser.retina && options.maxZoom > 0) {

			options.tileSize = Math.floor(options.tileSize / 2);
			options.zoomOffset++;

			options.minZoom = Math.max(0, options.minZoom);
			options.maxZoom--;
		}

		if (typeof options.subdomains === 'string') {
			options.subdomains = options.subdomains.split('');
		}

		this.tileSize = {x: 256, y: 256};
		/**
		 * VisiOmatic-specific TileLayer properties.
		 * @type {object}
		 * @instance
    	 * @property {number[][]} imageSize
    	   Image sizes at every resolution.
    	 * @property {object[]} gridSize
    	   Grid sizes at every resolution.
    	 * @property {number} bpp
    	   Image depth in bits per pixel.
    	 * @property {string} mixingMode
    	   Current color mixing mode (``'mono'`` or ``'color'``).
    	 * @property {number} channel
    	   Current image channel index.
    	 * @property {number} nChannel
    	   Number of image channels.
    	 * @property {number} minZoom
    	   Minimum zoom factor (tile resolution).
    	 * @property {number} maxZoom
    	   Maximum zoom factor (tile resolution).
    	 * @property {number} contrast
    	   Current image contrast factor.
    	 * @property {number} colorSat
    	   Current image color saturation.
    	 * @property {number} gamma
    	   Current image display gamma.
    	 * @property {string} cMap
		   Current color map.
    	 * @property {boolean} invertCMap
		   Current colormap inversion switch status.
    	 * @property {number[]} minValue
    	   Current lower clipping limit for every channel.
    	 * @property {number[]} maxValue
    	   Current upper clipping limit for every channel.
    	 * @property {number[][]} mix
    	   Current color mixing matrix.
    	 * @property {RGB[]} rgb
    	   Current color mixing matrix as RGB mixes.
    	 * @property {string[]} channelLabels
    	   Label for every image channel.
    	 * @property {boolean[]} channelFlags
    	   Display activation flag for every channel.
    	 * @property {string[]} channelUnits
    	   Pixel value unit for every image channel.
    	 * @property {number} quality
    	   Current JPEG encoding quality in %.
    	 */
		this.visio = {
			imageSize: [[this.tileSize]],
			gridSize: [{x: 1, y: 1}],
			bpp: 8,
			mixingMode: options.mixingMode,		// 'mono' or 'color'
			channel: 0,
			nChannel: 1,
			minZoom: options.minZoom,
			maxZoom: options.maxZoom,
			contrast: options.contrast,
			colorSat: options.colorSat,
			gamma: options.gamma,
			cMap: options.cMap,
			invertCMap: options.invertCMap,
			minValue: [0.],
			maxValue: [255.],
			mix: [[]],
			rgb: [],
			channelLabels: [],
			channelFlags: [],
			channelUnits: [],
			quality: options.quality
		}
		this._title = options.title ? options.title :
		                this._url.match(/^.*\/(.*)\..*$/)[1];
		this.getMetaData(this._url);

		// for https://github.com/Leaflet/Leaflet/issues/137
		if (!Browser.android) {
			this.on('tileunload', this._onTileRemove);
		}
		return this;
	},

	/**
	 * Get metadata describing the tiled image at the provided URL.
	 * @async
	 * @param {string} url - The full tile URL.
	 * @fires metaload
	 */
	getMetaData: async function (url) {
		const res = await fetch(url + '&INFO', {method: 'GET'});
		const meta = await res.json();
		if (res.status == 200 && meta['type'] == 'visiomatic') {
			const	options = this.options,
				visio = this.visio,
				visioDefault = this.visioDefault,
				maxsize = {x: meta.full_size[0], y: meta.full_size[1]};

			this.tileSize = {x: meta.tile_size[0], y: meta.tile_size[1]};
			options.tileSize = this.tileSize.x;

			visio.maxZoom = meta.tile_levels - 1;
			if (visio.minZoom > options.minZoom) {
				options.minZoom = visio.minZoom;
			}
			if (!options.maxZoom) {
				options.maxZoom = visio.maxZoom + 6;
			}
			if (options.maxNativeZoom > visio.maxZoom) {
				options.maxNativeZoom = visio.maxZoom;
			}
			// Set grid sizes
			for (let z = 0; z <= visio.maxZoom; z++) {
				visio.imageSize[z] = {
					x: Math.floor(maxsize.x / Math.pow(2, visio.maxZoom - z)),
					y: Math.floor(maxsize.y / Math.pow(2, visio.maxZoom - z))
				};
				visio.gridSize[z] = {
					x: Math.ceil(visio.imageSize[z].x / this.tileSize.x),
					y: Math.ceil(visio.imageSize[z].y / this.tileSize.y)
				};
			}

			// (Virtual) grid sizes for extra zooming
			for (let z = visio.maxZoom; z <= options.maxZoom; z++) {
				visio.gridSize[z] = visio.gridSize[visio.maxZoom];
			}

			// Set pixel bpp
			visio.bpp = meta.bits_per_channel;

			// Number of channels
			nchannel = visio.nChannel = meta.channels;

			// Default contrast
			if (meta.contrast) {
				visioDefault.contrast = meta.contrast;
			}
			if (!visio.contrast) {
				visio.contrast = visioDefault.contrast;
			}

			// Default color saturation
			if (meta.colorSat) {
				visioDefault.colorSat = meta.colorSat;
			}
			if (!visio.colorSat) {
				visio.colorSat = visioDefault.colorSat;
			}

			// Default display gamma
			if (meta.gamma) {
				visioDefault.gamma = meta.gamma;
			}
			if (!visio.gamma) {
				visio.gamma = visioDefault.gamma;
			}

			// Default compression quality
			if (meta.quality) {
				visioDefault.quality = meta.quality;
			}
			if (!visio.quality) {
				visio.quality = visioDefault.quality;
			}

			// Images
			images = meta.images;
			
			// Min and max pixel values
			for (let c = 0; c < nchannel; c++) {
				visioDefault.minValue[c] = images[0].min_max[c][0];
				visioDefault.maxValue[c] = images[0].min_max[c][1];
			}

			// Override min and max pixel values based on user provided options
			const minmax = options.minMaxValues;
			if (minmax.length) {
				for (let c = 0; c < nchannel; c++) {
					if (minmax[c] !== undefined && minmax[c].length) {
						visio.minValue[c] = minmax[c][0];
						visio.maxValue[c] = minmax[c][1];
					} else {
						visio.minValue[c] = visioDefault.minValue[c];
						visio.maxValue[c] = visioDefault.maxValue[c];
					}
				}
			} else {
				for (let c = 0; c < nchannel; c++) {
					visio.minValue[c] = visioDefault.minValue[c];
					visio.maxValue[c] = visioDefault.maxValue[c];
				}
			}

			// Default channel
			visio.channel = options.defaultChannel;

			// Channel labels
			const inlabels = options.channelLabels,
			    ninlabel = inlabels.length,
			    labels = visio.channelLabels,
			    inunits = options.channelUnits,
			    ninunits = inunits.length,
			    units = visio.channelUnits,
				key = VUtil.readFITSKey;

			let label = 'Channel';
			if (nchannel === 1 && (filter = images[0].header['FILTER'])) {
				label = filter;
			}
			for (let c = 0; c < nchannel; c++) {
				if (c < ninlabel) {
					labels[c] = inlabels[c];
				} else {
					labels[c] = nchannel > 1 ? 'Channel #' + (c + 1).toString()
						: filter;
				}
			}

			// Copy those units that have been provided
			for (const c in inunits) {
				units[c] = inunits[c];
			}
			// Fill out units that are not provided with a default string
			for (let c = ninunits; c < nchannel; c++) {
				units[c] = 'ADUs';
			}

			// Initialize mixing matrix depending on arguments and the number of channels
			const	mix = visio.mix,
				colors = options.channelColors,
				rgb = visio.rgb,
				re = new RegExp(options.channelLabelMatch),
				channelflags = visio.channelFlags;

			let	cc = 0,
				nchanon = 0;

			for (var c = 0; c < nchannel; c++) {
				channelflags[c] = re.test(labels[c]);
				if (channelflags[c]) {
					nchanon++;
				}
			}
			if (nchanon >= visioDefault.channelColors.length) {
				nchanon = visioDefault.channelColors.length - 1;
			}

			if (colors.length) {
				// Dispatch input colors
				for (const c in colors) {
					// Copy RGB triplet
					rgb[c] = rgbin(colors[c][0], colors[c][1], colors[c][2]);
					mix[c] = [];
					this.rgbToMix(c);
				}
			} else {
				// Dispatch default colors
				rgb[0] = rgbin(visioDefault.channelColors[3][0]);
				rgb[Math.floor(nchannel / 2)] = rgbin(visioDefault.channelColors[3][1]);
				rgb[nchannel -1] = rgbin(visioDefault.channelColors[3][2]);
				/*
				for (const c = 0; c < nchannel; c++) {
					if (channelflags[c] && cc < nchanon) {
						rgb[c] = rgbin(visioDefault.channelColors[nchanon][cc++]);
						// Compute the current row of the mixing matrix
						mix[c] = [];
						this.rgbToMix(c);
					}
				*/
			}

			if (options.bounds) {
				options.bounds = latLngBounds(options.bounds);
			}
			this.wcs = options.crs ? options.crs : new WCS(
				meta.header,
				meta.images,
				{
					nativeCelSys: this.options.nativeCelSys,
					nzoom: visio.maxZoom + 1,
				}
			);
			visio.metaReady = true;
			/**
			 * Fired when the image metadata have been loaded.
			 * @event metaload
			 * @memberof VTileLayer
			 */
			this.fire('metaload');
		} else {
			alert(
				'VisiOmatic metadata query error: ' + meta.detail[0].msg + '.'
			);
		}
	},

	/**
	 * Get color for the given channel.
	 * @param {number} channel - Input channel.
	 * @return {string} color string.
	 */
	getChannelColor: function(channel) {
		const	rgb = this.visio.rgb
		return channel in rgb ? this.visio.rgb[channel].toStr() : '';
	},

	/**
	 * Update the color mixing matrix with the RGB contribution of a given
	   channel.
	 * @param {number} channel - Input channel.
	 * @param {RGB | false} rgb - RGB color. False deletes the channel.
	 */
	rgbToMix: function (channel, rgb) {
		const	visio = this.visio;
		if (rgb) {
			visio.rgb[channel] = rgb.clone();
		} else if (rgb == false) {
			delete visio.rgb[channel];
			delete visio.mix[channel];
			return;
		} else {
			rgb = visio.rgb[channel];
		}

		const	cr = this._gammaCorr(rgb.r),
			cg = this._gammaCorr(rgb.g),
			cb = this._gammaCorr(rgb.b),
			lum = (cr + cg + cb) / 3.0,
			alpha = visio.colorSat / 3.0;

		visio.mix[channel] = [];
		visio.mix[channel][0] = lum + alpha * (2.0 * cr - cg - cb);
		visio.mix[channel][1] = lum + alpha * (2.0 * cg - cr - cb);
		visio.mix[channel][2] = lum + alpha * (2.0 * cb - cr - cg);

		return;
	},

	/**
	 * @summary
	   Switch the layer to ``'mono'`` mode for the current channel.
	   @desc
	   The current channel index defines the color mixing matrix elements in
	   ``'mono'`` mode
	 */
	updateMono: function () {
		this.visio.mode = 'mono';
	},

	/**
	 * @summary
	   Update the color mixing matrix using the current color and
	   saturation settings.
	   @desc
	   RGB colors and saturation settings define mixing matrix elements in
	   ``'color'`` mode
	 */
	updateMix: function () {
		const	visio = this.visio;

		visio.mode = 'color';
		for (const c in visio.rgb) {
			this.rgbToMix(c);
		}
	},

	/**
	 * Apply gamma expansion to the provided input value.
	 * @private
	 * @param {number} val - Input value.
	 * @return {number} gamma-compressed value.
	 */
	_gammaCorr: function (val) {
		return val > 0.0 ? Math.pow(val, this.visio.gamma) : 0.0;
	},

	/**
	 * Decode the input string as a 'keyword:value' pair.
	 * @private
	 * @deprecated since version 3.0
	 * @param {string} str - Input string.
	 * @param {string} keyword - Input keyword.
	 * @param {string} regexp - Regular expression for decoding the value.
	 * @return {*} Decoded output.
	 */
	_readVisioKey: function (str, keyword, regexp) {
		const reg = new RegExp(keyword + ':' + regexp);
		return reg.exec(str);
	},

	/**
	 * Update layer attribute and redraw layer content.
	 * @private
	 * @param {string} attr
	   Name of the (numerical) layer attribute to be updated.
	 * @param {*} value
	   New value.
	 * @param {UI~layerCallback} [fn]
	   Optional additional callback function.
	 */
	_setAttr:	function (
		attr,
		value,
		fn=undefined
	) {

		const	attrarr = attr.split(/\[|\]/);
		if (attrarr[1]) {
			this.visio[attrarr[0]][parseInt(attrarr[1], 10)] = value;
		}	else {
			this.visio[attrarr[0]] = value;
		}
		if (fn) {
			fn(this);
		}
		this.redraw();
	},

	/**
	 * Add the layer to the map.
	 * @override
	 * @param {object} map - Leaflet map to add the layer to.
	 * @listens metaload
	 */
	addTo: function (map) {
		if (this.visio.metaReady) {
			// VisioMatic data are ready so we can go
			this._addToMap(map);
		}
		else {
			// Wait for metadata request to complete
			this._loadActivity = DomUtil.create(
				'div',
				'visiomatic-layer-activity',
				map._controlContainer
			);
			this.once('metaload', function () {
				this._addToMap(map);
				map._controlContainer.removeChild(this._loadActivity);
			}, this);
		}
		return this;
	},

	/**
	 * Executed once the layer to be added to the map is ready.
	 * @override
	 * @private
	 * @param {object} map - Leaflet map to add the layer to.
	 */
	_addToMap: function (map) {
		const	newcrs = this.wcs,
			curcrs = map.options.crs,
			prevcrs = map._prevcrs,
			maploadedflag = map._loaded;
		var	zoom,
			center;

		if (maploadedflag) {
			curcrs._prevLatLng = map.getCenter();
			curcrs._prevZoom = map.getZoom();
		}

		map._prevcrs = map.options.crs = newcrs;
		TileLayer.prototype.addTo.call(this, map);

		// Go to previous layers' coordinates if applicable
		if (prevcrs && newcrs !== curcrs && maploadedflag &&
		    newcrs.pixelFlag === curcrs.pixelFlag) {
			center = curcrs._prevLatLng;
			zoom = curcrs._prevZoom;
			const	prevpixscale = prevcrs.pixelScale(zoom, center),
				newpixscale = newcrs.pixelScale(zoom, center);
			if (prevpixscale > 1e-20 && newpixscale > 1e-20) {
				zoom += Math.round(Math.LOG2E *
				  Math.log(newpixscale / prevpixscale));
			}
		// Else go back to previous recorded position for the new layer
		} else if (newcrs._prevLatLng) {
			center = newcrs._prevLatLng;
			zoom = newcrs._prevZoom;
		} else if (this.options.center) {
			// Default center coordinates and zoom
			const	latlng = (typeof this.options.center === 'string') ?
				newcrs.parseCoords(decodeURI(this.options.center)) :
				this.options.center;
			if (latlng) {
				if (this.options.fov) {
					zoom = newcrs.fovToZoom(map, this.options.fov, latlng);
				}
				map.setView(latlng, zoom, {reset: true, animate: false});
			} else {
				// If not, ask Sesame@CDS!
				VUtil.requestURL(
					this.options.sesameURL + '/-oI/A?' + this.options.center,
					'getting coordinates for ' + this.options.center,
					function (_this, httpRequest) {
						if (httpRequest.readyState === 4) {
							if (httpRequest.status === 200) {
								const	str = httpRequest.responseText,
									newLatlng = newcrs.parseCoords(str);
								if (newLatlng) {
									if (_this.options.fov) {
										zoom = newcrs.fovToZoom(
											map,
											_this.options.fov,
											newLatlng
										);
									}
									map.setView(
										newLatlng,
										zoom,
										{reset: true, animate: false}
									);
								} else {
									map.setView(
										newcrs.crval,
										zoom,
										{reset: true, animate: false}
									);
									alert(str + ': Unknown location');
								}
							} else {
								map.setView(
									newcrs.crval,
									zoom,
									{reset: true, animate: false}
								);
								alert('Error with Sesame query at CDS');
							}
						}
					}, this, 10
				);
			}
		} else {
			map.setView(
				newcrs.centerLatLng,
				zoom,
				{reset: true, animate: false}
			);
		}
	},

	/**
	 * Tell if a tile at the given coordinates should be loaded.
	 * @override
	 * @private
	 * @param {point} coords - Tile coordinates.
	 * @return {boolean} ``true`` if tile should be loaded, ``false`` otherwise.
	 */
	_isValidTile: function (coords) {
		const	crs = this._map.options.crs;

		if (!crs.infinite) {
			// don't load tile if it's out of bounds and not wrapped
			const bounds = this._globalTileRange;
			if ((!crs.wrapLng && (coords.x < bounds.min.x ||
				coords.x > bounds.max.x)) ||
				(!crs.wrapLat && (coords.y < bounds.min.y ||
				coords.y > bounds.max.y))) {
				return false;
			}
		}

		// don't load tile if it's out of the tile grid
		const	z = this._getZoomForUrl(),
			wcoords = coords.clone();
		this._wrapCoords(wcoords);
		if (wcoords.x < 0 || wcoords.x >= this.visio.gridSize[z].x ||
			wcoords.y < 0 || wcoords.y >= this.visio.gridSize[z].y) {
			return false;
		}

		if (!this.options.bounds) { return true; }

		// don't load tile if it doesn't intersect the bounds in options
		return latLngBounds(this.options.bounds).intersects(
			this._tileCoordsToBounds(coords)
		);
	},

	/**
	 * Create a tile at the given coordinates.
	 * @override
	 * @param {point} coords
	   Tile coordinates.
	 * @param {boolean} done
	   Callback function called when the tile has been loaded.
	 * @return {object} The new tile.
	 */
	createTile: function (coords, done) {
		const	tile = TileLayer.prototype.createTile.call(this, coords, done);

		tile.coords = coords;

		return tile;
	},

	/**
	 * Generate a tile URL from its coordinates
	 * @override
	 * @param {point} coords - Tile coordinates.
	 * @return {string} The tile URL.
	 */
	getTileUrl: function (coords) {
		const	visio = this.visio,
			visioDefault = this.visioDefault,
			z = this._getZoomForUrl();
		let	str = this._url;


		if (visio.cMap !== visioDefault.cMap) {
			str += '&CMP=' + visio.cMap;
		}
		if (visio.invertCMap !== visioDefault.invertCMap) {
			str += '&INV';
		}
		if (visio.contrast !== visioDefault.contrast) {
			str += '&CNT=' + visio.contrast.toString();
		}
		if (visio.gamma !== visioDefault.gamma) {
			str += '&GAM=' + (1.0 / visio.gamma).toFixed(4);
		}

		const nchannel = visio.nChannel,
		    mix = visio.mix;

		if (visio.mode === 'color') {
			for (let c = 0; c < visio.nChannel; c++) {
				if (visio.minValue[c] !== visioDefault.minValue[c] ||
				   visio.maxValue[c] !== visioDefault.maxValue[c]) {
					str += '&MINMAX=' + (c + 1).toString() + ':' +
					   visio.minValue[c].toString() + ',' +
					   visio.maxValue[c].toString();
				}
			}
			for (const m in mix) {
				str += '&MIX=' + (parseInt(m, 10) + 1).toString() + ':';
				for (let n = 0; n < 3; n++) {
					if (n) { str += ','; }
					str += mix[m][n].toFixed(3);
				}
			}
		} else {
			const	chan = visio.channel;

			let	chanp1 = chan + 1;

			if (chanp1 > nchannel) {
				chanp1 = 1;
			}
			str += '&CHAN=' + chanp1.toString();
			if (visio.minValue[chan] !== visioDefault.minValue[chan] ||
				visio.maxValue[chan] !== visioDefault.maxValue[chan]) {
				str += '&MINMAX=' + chanp1.toString() + ':' +
					visio.minValue[chan].toString() + ',' +
					visio.maxValue[chan].toString();
			}
		}

		if (visio.quality !== visioDefault.quality) {
			str += '&QLT=' + visio.quality.toString();
		}
		return str + '&JTL=' + z.toString() + ',' +
		 (coords.x + visio.gridSize[z].x * coords.y).toString();
	},

	/**
	 * Initialize a tile.
	 * @override
	 * @private
	 * @param {object} tile - The tile.
	 */
	_initTile: function (tile) {
		DomUtil.addClass(tile, 'leaflet-tile');

		// Force pixels to be visible at high zoom factos whenever possible
		if (this._tileZoom >= this.options.maxNativeZoom) {
			tile.style.imageRendering = 'pixelated';
		}

		tile.onselectstart = Util.falseFn;
		tile.onmousemove = Util.falseFn;

		// update opacity on tiles in IE7-8 because of filter inheritance problems
		if (Browser.ielt9 && this.options.opacity < 1) {
			DomUtil.setOpacity(tile, this.options.opacity);
		}

		// without this hack, tiles disappear after zoom on Chrome for Android
		// https://github.com/Leaflet/Leaflet/issues/2078
		if (Browser.android && !Browser.android23) {
			tile.style.WebkitBackfaceVisibility = 'hidden';
		}
	},

	/**
	 * Replace a tile.
	 * @see {@link https://github.com/Leaflet/Leaflet/issues/6659}
	 * @private
	 * @param {object} tile - The tile.
	 * @param {string} url - The tile URL.
	 */
	_refreshTileUrl: function(tile, url) {
		// Use an image in background so that we only replace the actual tile,
		// once image is loaded in cache!
		const	img = new Image();
		img.onload = function() {
			L.Util.requestAnimFrame(function() {
				tile.el.src = url;
			});
		};
		img.src = url;
	},

	/**
	 * Redraw a tile without flickering.
	 * @see {@link https://github.com/Leaflet/Leaflet/issues/6659}
	 * @override
	 */
	redraw: function() {
		// Prevent _tileOnLoad/_tileReady re-triggering a opacity animation
		const	wasAnimated = this._map._fadeAnimated;
		this._map._fadeAnimated = false;

		for (var key in this._tiles) {
			tile = this._tiles[key];
			if (tile.current && tile.active) {
				const	oldsrc = tile.el.src,
					newsrc = this.getTileUrl(tile.coords);

				if (oldsrc != newsrc) {
					// L.DomEvent.off(tile, 'load', this._tileOnLoad);
					// ... this doesnt work!
					this._refreshTileUrl(tile, newsrc);
				}
			}
		}

		if (wasAnimated) {
			setTimeout(function() { map._fadeAnimated = wasAnimated; }, 5000);
		}
	}


});

/**
 * Instantiate a VisiOmatic tile layer.
 * @function
 * @param {string} url - URL of the tile server.
 * @param {object} [options] - Options: see {@link VTileLayer}.
 * @returns {VTileLayer} VisiOmatic TileLayer instance.
*/
export const vTileLayer = function (url, options) {
	return new VTileLayer(url, options);
};

