/*
#	Support for VisiOmatic layers to Leaflet
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#	                         Chiara Marmo    - Paris-Saclay
#	                         Ruven Pillay    - C2RMF/CNRS

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


export const VTileLayer = TileLayer.extend({
	options: {
		title: '',
		crs: null,
		nativeCelsys: false,
		center: false,
		fov: false,
		minZoom: 0,
		maxZoom: null,
		maxNativeZoom: 18,
		noWrap: true,
		contrast: 1.0,
		colorSat: 1.0,
		gamma: 1.0,
		cMap: 'grey',
		invertCMap: false,
		quality: 90,
		mixingMode: 'color',
		channelColors: [],
		channelLabels: [],
		channelLabelMatch: '.*',
		channelUnits: [],
		minMaxValues: [],
		defaultChannel: 0,
		credentials: false,
		sesameURL: 'https://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame'

		/*
		pane: 'tilePane',
		opacity: 1,
		attribution: <String>,
		maxNativeZoom: <Number>,
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

	// Default IIPImage rendering parameters
	iipdefault: {
		contrast: 1,
		gamma: 1,
		cMap: 'grey',
		invertCMap: false,
		minValue: [],
		maxValue: [],
		channelColors: [
			[''],
			['#FFFFFF'],
			['#00BAFF', '#FFBA00'],
			['#0000FF', '#00FF00', '#FF0000'],
			['#0000E0', '#00BA88', '#88BA00', '#E00000'],
			['#0000CA', '#007BA8', '#00CA00', '#A87B00', '#CA0000'],
			['#0000BA', '#00719B', '#009B71', '#719B00', '#9B7100', '#BA0000']
		],
		quality: 90
	},

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
		this.iipImageSize = [];
		this.iipImageSize[0] = this.tileSize;
		this.iipGridSize = [];
		this.iipGridSize[0] = {x: 1, y: 1};
		this.iipBPP = 8;
		this.iipMode = options.mixingMode;		// Image rendering mode: 'mono' or 'color'
		this.iipChannel = 0;
		this.iipNChannel = 1;
		this.iipMinZoom = options.minZoom;
		this.iipMaxZoom = options.maxZoom;
		this.iipContrast = options.contrast;
		this.iipColorSat = options.colorSat;
		this.iipGamma = options.gamma;
		this.iipCMap = options.cMap;
		this.iipInvertCMap = options.invertCMap;
		this.iipMinValue = [];
		this.iipMinValue[0] = 0.0;
		this.iipMaxValue = [];
		this.iipMaxValue[0] = 255.0;
		this.iipMix = [[]];
		this.iipRGB = [];
		this.iipChannelLabels = [];
		this.iipChannelFlags = [];
		this.iipChannelUnits = [];
		this.iipQuality = options.quality;

		this._title = options.title.length > 0 ? options.title :
		                this._url.match(/^.*\/(.*)\..*$/)[1];
		this.getMetaData(this._url);

		// for https://github.com/Leaflet/Leaflet/issues/137
		if (!Browser.android) {
			this.on('tileunload', this._onTileRemove);
		}
		return this;
	},

	getMetaData: async function (url) {
		const res = await fetch(url + '&INFO', {method: 'GET'});
		const meta = await res.json();
		if (res.status == 200 && meta['type'] == 'visiomatic') {
			var options = this.options,
				iipdefault = this.iipdefault,
				maxsize = {x: meta.full_size[0], y: meta.full_size[1]};

			this.tileSize = {x: meta.tile_size[0], y: meta.tile_size[1]};
			options.tileSize = this.tileSize.x;

			this.iipMaxZoom = meta.tile_levels - 1;
			if (this.iipMinZoom > options.minZoom) {
				options.minZoom = this.iipMinZoom;
			}
			if (!options.maxZoom) {
				options.maxZoom = this.iipMaxZoom + 6;
			}
			options.maxNativeZoom = this.iipMaxZoom;

			// Set grid sizes
			for (var z = 0; z <= this.iipMaxZoom; z++) {
				this.iipImageSize[z] = {
					x: Math.floor(maxsize.x / Math.pow(2, this.iipMaxZoom - z)),
					y: Math.floor(maxsize.y / Math.pow(2, this.iipMaxZoom - z))
				};
				this.iipGridSize[z] = {
					x: Math.ceil(this.iipImageSize[z].x / this.tileSize.x),
					y: Math.ceil(this.iipImageSize[z].y / this.tileSize.y)
				};
			}

			// (Virtual) grid sizes for extra zooming
			for (z = this.iipMaxZoom; z <= options.maxZoom; z++) {
				this.iipGridSize[z] = this.iipGridSize[this.iipMaxZoom];
			}

			// Set pixel bpp
			this.iipBPP = meta.bits_per_channel;
			// Only 32bit data are likely to be linearly quantized
			if (this.iipGamma === iipdefault.gamma) {
				this.iipGamma = this.iipBPP >= 32 ? 2.2 : 1.0;
			}

			// Number of channels
			nchannel = this.iipNChannel = meta.channels;

			// Images
			images = meta.images;
			
			// Min and max pixel values
			for (var c = 0; c < nchannel; c++) {
				iipdefault.minValue[c] = images[0].min_max[c][0];
				iipdefault.maxValue[c] = images[0].min_max[c][1];
			}

			// Override min and max pixel values based on user provided options
			var minmax = options.minMaxValues;
			if (minmax.length) {
				for (c = 0; c < nchannel; c++) {
					if (minmax[c] !== undefined && minmax[c].length) {
						this.iipMinValue[c] = minmax[c][0];
						this.iipMaxValue[c] = minmax[c][1];
					} else {
						this.iipMinValue[c] = iipdefault.minValue[c];
						this.iipMaxValue[c] = iipdefault.maxValue[c];
					}
				}
			} else {
				for (c = 0; c < nchannel; c++) {
					this.iipMinValue[c] = iipdefault.minValue[c];
					this.iipMaxValue[c] = iipdefault.maxValue[c];
				}
			}

			// Default channel
			this.iipChannel = options.defaultChannel;

			// Channel labels
			var inlabels = options.channelLabels,
			    ninlabel = inlabels.length,
			    labels = this.iipChannelLabels,
			    inunits = options.channelUnits,
			    ninunits = inunits.length,
			    units = this.iipChannelUnits,
				key = VUtil.readFITSKey,
				numstr, value;

			if (!(filter = images[0].header['FILTER'])) {
				filter = 'Channel'
			}
			for (c = 0; c < nchannel; c++) {
				if (c < ninlabel) {
					labels[c] = inlabels[c];
				} else {
					labels[c] = nchannel > 1 ? filter + ' #' + (c + 1).toString()
						: filter;
				}
			}

			// Copy those units that have been provided
			for (c = 0; c < ninunits; c++) {
				units[c] = inunits[c];
			}
			// Fill out units that are not provided with a default string
			for (c = ninunits; c < nchannel; c++) {
				units[c] = 'ADUs';
			}

			// Initialize mixing matrix depending on arguments and the number of channels
			var	cc = 0,
				mix = this.iipMix,
				omix = options.channelColors,
				rgb = this.iipRGB,
				re = new RegExp(options.channelLabelMatch),
				nchanon = 0,
				channelflags = this.iipChannelFlags;

			nchanon = 0;
			for (c = 0; c < nchannel; c++) {
				channelflags[c] = re.test(labels[c]);
				if (channelflags[c]) {
					nchanon++;
				}
			}
			if (nchanon >= iipdefault.channelColors.length) {
				nchanon = iipdefault.channelColors.length - 1;
			}

			for (c = 0; c < nchannel; c++) {
				mix[c] = [];
				var	col = 3;
				if (omix.length && omix[c] && omix[c].length === 3) {
					// Copy RGB triplet
					rgb[c] = rgbin(omix[c][0], omix[c][1], omix[c][2]);
				} else {
					rgb[c] = rgbin(0.0, 0.0, 0.0);
				}
				if (omix.length === 0 && channelflags[c] && cc < nchanon) {
					rgb[c] = rgbin(iipdefault.channelColors[nchanon][cc++]);
				}
				// Compute the current row of the mixing matrix
				this.rgbToMix(c);
			}
			if (options.bounds) {
				options.bounds = latLngBounds(options.bounds);
			}
			this.wcs = options.crs ? options.crs : new WCS(
				meta.header,
				meta.images,
				{
					nativeCelsys: this.options.nativeCelsys,
					nzoom: this.iipMaxZoom + 1,
					tileSize: this.tileSize
				}
			);
			this.iipMetaReady = true;
			this.fire('metaload');
		} else {
			alert('There was a problem with the VisiOmatic metadata request.');
		}
	},

	// Convert an RGB colour and saturation settings to mixing matrix elements
	rgbToMix: function (chan, rgb) {
		if (rgb) {
			this.iipRGB[chan] = rgb.clone();
		} else {
			rgb = this.iipRGB[chan];
		}

		var	cr = this._gammaCorr(rgb.r),
			cg = this._gammaCorr(rgb.g),
			cb = this._gammaCorr(rgb.b),
			lum = (cr + cg + cb) / 3.0,
			alpha = this.iipColorSat / 3.0;

		this.iipMix[chan][0] = lum + alpha * (2.0 * cr - cg - cb);
		this.iipMix[chan][1] = lum + alpha * (2.0 * cg - cr - cb);
		this.iipMix[chan][2] = lum + alpha * (2.0 * cb - cr - cg);

		return;
	},

	// Current channel index defines mixing matrix elements in "mono" mode
	updateMono: function () {
		this.iipMode = 'mono';
	},

	// RGB colours and saturation settings define mixing matrix elements in "color" mode
	updateMix: function () {
		var nchannel = this.iipNChannel;

		this.iipMode = 'color';
		for (var c = 0; c < nchannel; c++) {
			this.rgbToMix(c, this.iipRGB[c]);
		}
	},

	// Apply gamma correction
	_gammaCorr: function (val) {
		return val > 0.0 ? Math.pow(val, this.iipGamma) : 0.0;
	},

	_readIIPKey: function (str, keyword, regexp) {
		var reg = new RegExp(keyword + ':' + regexp);
		return reg.exec(str);
	},

	addTo: function (map) {
		if (this.iipMetaReady) {
			// IIP data are ready so we can go
			this._addToMap(map);
		}
		else {
			// Wait for metadata request to complete
			this._loadActivity = DomUtil.create(
				'div',
				'leaflet-layer-iip-activity',
				map._controlContainer
			);
			this.once('metaload', function () {
				this._addToMap(map);
				map._controlContainer.removeChild(this._loadActivity);
			}, this);
		}
		return this;
	},

	_addToMap: function (map) {
		var	zoom,
			newcrs = this.wcs,
			curcrs = map.options.crs,
			prevcrs = map._prevcrs,
			maploadedflag = map._loaded,
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
			var prevpixscale = prevcrs.pixelScale(zoom, center),
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
			var latlng = (typeof this.options.center === 'string') ?
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
					this.options.sesameURL + '/-oI/A?' +
					  this.options.center,
					'getting coordinates for ' + this.options.center,
					function (_this, httpRequest) {
						if (httpRequest.readyState === 4) {
							if (httpRequest.status === 200) {
								var str = httpRequest.responseText,
									latlng = newcrs.parseCoords(str);
								if (latlng) {
									if (_this.options.fov) {
										zoom = newcrs.fovToZoom(map, _this.options.fov, latlng);
									}
									map.setView(latlng, zoom, {reset: true, animate: false});
								} else {
									map.setView(newcrs.crval, zoom, {reset: true, animate: false});
									alert(str + ': Unknown location');
								}
							} else {
								map.setView(newcrs.crval, zoom, {reset: true, animate: false});
								alert('There was a problem with the request to the Sesame service at CDS');
							}
						}
					}, this, 10
				);
			}
		} else {
			map.setView(newcrs.crval, zoom, {reset: true, animate: false});
		}
	},

	_isValidTile: function (coords) {
		var crs = this._map.options.crs;

		if (!crs.infinite) {
			// don't load tile if it's out of bounds and not wrapped
			var bounds = this._globalTileRange;
			if ((!crs.wrapLng && (coords.x < bounds.min.x || coords.x > bounds.max.x)) ||
			    (!crs.wrapLat && (coords.y < bounds.min.y || coords.y > bounds.max.y))) { return false; }
		}

		// don't load tile if it's out of the tile grid
		var z = this._getZoomForUrl(),
		    wcoords = coords.clone();
		this._wrapCoords(wcoords);
		if (wcoords.x < 0 || wcoords.x >= this.iipGridSize[z].x ||
			wcoords.y < 0 || wcoords.y >= this.iipGridSize[z].y) {
			return false;
		}

		if (!this.options.bounds) { return true; }

		// don't load tile if it doesn't intersect the bounds in options
		var tileBounds = this._tileCoordsToBounds(coords);
		return latLngBounds(this.options.bounds).intersects(tileBounds);
	},

	createTile: function (coords, done) {
		var	tile = TileLayer.prototype.createTile.call(this, coords, done);

		tile.coords = coords;

		return tile;
	},

	getTileUrl: function (coords) {
		var	str = this._url,
			z = this._getZoomForUrl();

		if (this.iipCMap !== this.iipdefault.cMap) {
			str += '&CMP=' + this.iipCMap;
		}
		if (this.iipInvertCMap !== this.iipdefault.invertCMap) {
			str += '&INV';
		}
		if (this.iipContrast !== this.iipdefault.contrast) {
			str += '&CNT=' + this.iipContrast.toString();
		}
		if (this.iipGamma !== this.iipdefault.gamma) {
			str += '&GAM=' + (1.0 / this.iipGamma).toFixed(4);
		}
		for (var c = 0; c < this.iipNChannel; c++) {
			if (this.iipMinValue[c] !== this.iipdefault.minValue[c] ||
			   this.iipMaxValue[c] !== this.iipdefault.maxValue[c]) {
				str += '&MINMAX=' + (c + 1).toString() + ':' +
				   this.iipMinValue[c].toString() + ',' + this.iipMaxValue[c].toString();
			}
		}

		var nchannel = this.iipNChannel,
		    mix = this.iipMix,
		    m, n;

		if (this.iipMode === 'color') {
			str += '&CTW=';
			for (n = 0; n < 3; n++) {
				if (n) { str += ';'; }
				str += mix[0][n].toString();
				for (m = 1; m < nchannel; m++) {
					if (mix[m][n] !== undefined) {
						str += ',' + mix[m][n].toString();
					}
				}
			}
		} else {
			var	cc = this.iipChannel + 1;

			console.log(cc);
			if (cc > nchannel) { cc = 1; }
			str += '&CHAN=' + cc.toString();
		}

		if (this.iipQuality !== this.iipdefault.quality) {
			str += '&QLT=' + this.iipQuality.toString();
		}
		return str + '&JTL=' + z.toString() + ',' +
		 (coords.x + this.iipGridSize[z].x * coords.y).toString();
	},

	_initTile: function (tile) {
		DomUtil.addClass(tile, 'leaflet-tile');

		// Force pixels to be visible at high zoom factos whenever possible
		if (this.options.maxNativeZoom && this._tileZoom >= this.options.maxNativeZoom) {
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
	}

});

export const vTileLayer = function (url, options) {
	return new VTileLayer(url, options);
};

