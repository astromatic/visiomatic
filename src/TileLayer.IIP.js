/*
# L.TileLayer.IIP adds support for IIP layers to Leaflet
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	VisiOmatic
#
#	Copyright:		(C) 2014-2017 IAP/CNRS/UPMC, IDES/Paris-Sud and C2RMF/CNRS
#
#	Last modified:		28/08/2017
*/

L.TileLayer.IIP = L.TileLayer.extend({
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
		credentials: false
		/*
		pane: 'tilePane',
		opacity: 1,
		attribution: <String>,
		maxNativeZoom: <Number>,
		zIndex: <Number>,
		bounds: <LatLngBounds>
		unloadInvisibleTiles: L.Browser.mobile,
		updateWhenIdle: L.Browser.mobile,
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

		options = L.setOptions(this, options);

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

		this.iipTileSize = {x: 256, y: 256};
		this.iipImageSize = [];
		this.iipImageSize[0] = this.iipTileSize;
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
		this.getIIPMetaData(this._url);

		// for https://github.com/Leaflet/Leaflet/issues/137
		if (!L.Browser.android) {
			this.on('tileunload', this._onTileRemove);
		}
		return this;
	},

	getIIPMetaData: function (url) {
		L.IIPUtils.requestURL(url +
			'&obj=IIP,1.0&obj=max-size&obj=tile-size' +
			'&obj=resolution-number&obj=bits-per-channel' +
			'&obj=min-max-sample-values&obj=subject',
			'getting IIP metadata',
			this._parseMetadata, this);
	},

	_parseMetadata: function (layer, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var response = httpRequest.responseText,
				 matches = layer._readIIPKey(response, 'IIP', L.IIPUtils.REG_PDEC);
				if (!matches) {
					alert('Error: Unexpected response from IIP server ' +
					 layer._url.replace(/\?.*$/g, ''));
				}
				var options = layer.options,
				    iipdefault = layer.iipdefault;

				matches = layer._readIIPKey(response, 'Max-size', '(\\d+)\\s+(\\d+)');
				var maxsize = {
					x: parseInt(matches[1], 10),
					y: parseInt(matches[2], 10)
				};
				matches = layer._readIIPKey(response, 'Tile-size', '(\\d+)\\s+(\\d+)');
				layer.iipTileSize = {
					x: parseInt(matches[1], 10),
					y: parseInt(matches[2], 10)
				};

				options.tileSize = layer.iipTileSize.x;

				// Find the lowest and highest zoom levels
				matches = layer._readIIPKey(response, 'Resolution-number', '(\\d+)');
				layer.iipMaxZoom = parseInt(matches[1], 10) - 1;
				if (layer.iipMinZoom > options.minZoom) {
					options.minZoom = layer.iipMinZoom;
				}
				if (!options.maxZoom) {
					options.maxZoom = layer.iipMaxZoom + 6;
				}
				options.maxNativeZoom = layer.iipMaxZoom;

				// Set grid sizes
				for (var z = 0; z <= layer.iipMaxZoom; z++) {
					layer.iipImageSize[z] = {
						x: Math.floor(maxsize.x / Math.pow(2, layer.iipMaxZoom - z)),
						y: Math.floor(maxsize.y / Math.pow(2, layer.iipMaxZoom - z))
					};
					layer.iipGridSize[z] = {
						x: Math.ceil(layer.iipImageSize[z].x / layer.iipTileSize.x),
						y: Math.ceil(layer.iipImageSize[z].y / layer.iipTileSize.y)
					};
				}
				// (Virtual) grid sizes for extra zooming
				for (z = layer.iipMaxZoom; z <= options.maxZoom; z++) {
					layer.iipGridSize[z] = layer.iipGridSize[layer.iipMaxZoom];
				}

				// Set pixel bpp
				matches = layer._readIIPKey(response, 'Bits-per-channel', '(\\d+)');
				layer.iipBPP = parseInt(matches[1], 10);
				// Only 32bit data are likely to be linearly quantized
				if (layer.iipGamma === layer.iipdefault.gamma) {
					layer.iipGamma = layer.iipBPP >= 32 ? 2.2 : 1.0;
				}

				// Pre-computed min and max pixel values, as well as number of channels
				matches = layer._readIIPKey(response, 'Min-Max-sample-values',
				 '\\s*(.*)');
				var str = matches[1].split(/\s+/),
				    nchannel = layer.iipNChannel = (str.length / 2),
				    mmc = 0;
				for (var c = 0; c < nchannel; c++) {
					iipdefault.minValue[c] = parseFloat(str[mmc++]);
					iipdefault.maxValue[c] = parseFloat(str[mmc++]);
				}

				// Override min and max pixel values based on user provided options
				var minmax = options.minMaxValues;
				if (minmax.length) {
					for (c = 0; c < nchannel; c++) {
						if (minmax[c] !== undefined && minmax[c].length) {
							layer.iipMinValue[c] = minmax[c][0];
							layer.iipMaxValue[c] = minmax[c][1];
						} else {
							layer.iipMinValue[c] = iipdefault.minValue[c];
							layer.iipMaxValue[c] = iipdefault.maxValue[c];
						}
					}
				} else {
					for (c = 0; c < nchannel; c++) {
						layer.iipMinValue[c] = iipdefault.minValue[c];
						layer.iipMaxValue[c] = iipdefault.maxValue[c];
					}
				}

				// Default channel
				layer.iipChannel = options.defaultChannel;

				// Channel labels
				var inlabels = options.channelLabels,
				    ninlabel = inlabels.length,
				    labels = layer.iipChannelLabels,
				    inunits = options.channelUnits,
				    ninunits = inunits.length,
				    units = layer.iipChannelUnits,
						key = L.IIPUtils.readFITSKey,
						numstr, value;

				for (c = 0; c < nchannel; c++) {
					if (c < ninlabel) {
						labels[c] = inlabels[c];
					} else {
						numstr = (c + 1).toString();
						value = key('CHAN' +
						  (c < 9 ? '000' : (c < 99 ? '00' : (c < 999 ? '0' : ''))) + numstr,
						  response);
						labels[c] = value ? value : 'Channel #' + numstr;
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
				var cc = 0,
				    mix = layer.iipMix,
						omix = options.channelColors,
						rgb = layer.iipRGB,
						re = new RegExp(options.channelLabelMatch),
						nchanon = 0,
						channelflags = layer.iipChannelFlags;

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
						rgb[c] = L.rgb(omix[c][0], omix[c][1], omix[c][2]);
					} else {
						rgb[c] = L.rgb(0.0, 0.0, 0.0);
					}
					if (omix.length === 0 && channelflags[c] && cc < nchanon) {
						rgb[c] = L.rgb(iipdefault.channelColors[nchanon][cc++]);
					}
					// Compute the current row of the mixing matrix
					layer.rgbToMix(c);
				}

				if (options.bounds) {
					options.bounds = L.latLngBounds(options.bounds);
				}
				layer.wcs = options.crs ? options.crs : new L.CRS.WCS(response, {
					nativeCelsys: layer.options.nativeCelsys,
					nzoom: layer.iipMaxZoom + 1,
					tileSize: layer.iipTileSize
				});
				layer.iipMetaReady = true;
				layer.fire('metaload');
			} else {
				alert('There was a problem with the IIP metadata request.');
			}
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
			this.once('metaload', function () {
				this._addToMap(map);
			}, this);
		}
		return this;
	},

	_addToMap: function (map) {
		var zoom,
		    newcrs = this.wcs,
				curcrs = map.options.crs,
				prevcrs = map._prevcrs,
				maploadedflag = map._loaded,
				// Default center coordinates
				center = map.options.center ? map.options.center : newcrs.projparam.crval;

		if (maploadedflag) {
			curcrs._prevLatLng = map.getCenter();
			curcrs._prevZoom = map.getZoom();
		}

		map._prevcrs = map.options.crs = newcrs;
		L.TileLayer.prototype.addTo.call(this, map);

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
		} else {
			// Default center coordinates and zoom
			if (this.options.center) {
				var	latlng = newcrs.parseCoords(this.options.center);

				if (latlng) {
					if (this.options.fov) {
						zoom = newcrs.fovToZoom(map, this.options.fov, latlng);
					}
					map.setView(latlng, zoom, {reset: true, animate: false});
				} else {
					// If not, ask Sesame@CDS!
					L.IIPUtils.requestURL(
						'http://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame/-oI/A?' +
						  this.options.center,
						'getting coordinates for ' + this.options.center,
						function (_this, httpRequest) {
							if (httpRequest.readyState === 4) {
								if (httpRequest.status === 200) {
									var str = httpRequest.responseText,
										latlng = newcrs.parseCoords(str, true);

									if (latlng) {
										if (_this.options.fov) {
											zoom = newcrs.fovToZoom(map, _this.options.fov, latlng);
										}
										map.setView(latlng, zoom, {reset: true, animate: false});
									} else {
										map.setView(center, zoom, {reset: true, animate: false});
										alert(str + ': Unknown location');
									}
								} else {
									map.setView(center, zoom, {reset: true, animate: false});
									alert('There was a problem with the request to the Sesame service at CDS');
								}
							}
						}, this, 10
					);
				}
			} else {
				map.setView(center, zoom, {reset: true, animate: false});
			}
		}
	},

	_getTileSizeFac: function () {
		var	map = this._map,
			zoom = this._tileZoom,
			zoomN = this.options.maxNativeZoom;
		return (zoomN && zoom > zoomN) ?
				Math.round(map.getZoomScale(zoom) / map.getZoomScale(zoomN)) : 1;
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
		return L.latLngBounds(this.options.bounds).intersects(tileBounds);
	},

	createTile: function (coords, done) {
		var	tile = L.TileLayer.prototype.createTile.call(this, coords, done);

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

		str += '&CTW=';

		if (this.iipMode === 'color') {
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
			var	cc = this.iipChannel;

			if (cc >= nchannel) { cc = 0; }
			if (cc < nchannel) { nchannel = cc + 1; }
			for (n = 0; n < 3; n++) {
				if (n) { str += ';'; }
				str += (cc === 0 ? '1' : '0');
				for (m = 1; m < nchannel; m++) {
					str += ',' + (cc === m ? '1' : '0');
				}
			}
		}

		if (this.iipQuality !== this.iipdefault.quality) {
			str += '&QLT=' + this.iipQuality.toString();
		}
		return str + '&JTL=' + z.toString() + ',' +
		 (coords.x + this.iipGridSize[z].x * coords.y).toString();
	},

	_initTile: function (tile) {
		L.DomUtil.addClass(tile, 'leaflet-tile');
		var	tileSizeFac = this._getTileSizeFac();

		// Force pixels to be visible at high zoom factos whenever possible
		if (tileSizeFac > 1) {
			if (L.Browser.ie) {
				tile.style.msInterpolationMode = 'nearest-neighbor';
			} else if (L.Browser.chrome) {
				tile.style.imageRendering = 'pixelated';
			} else if (L.Browser.gecko) {
				tile.style.imageRendering = '-moz-crisp-edges';
			} else {
				tile.style.imageRendering = '-webkit-optimize-contrast';
			}
		}

		// Compute tile size (IIP tile size can be less at image borders)
		var	coords = tile.coords,
			z = this._getZoomForUrl();

		if (z > this.iipMaxZoom) { z = this.iipMaxZoom; }
		var sizeX = coords.x + 1 === this.iipGridSize[z].x ?
			    this.iipImageSize[z].x % this.iipTileSize.x : this.iipTileSize.x,
			  sizeY = coords.y + 1 === this.iipGridSize[z].y ?
			    this.iipImageSize[z].y % this.iipTileSize.y : this.iipTileSize.y;

		if (sizeX === 0) {
			sizeX = this.iipTileSize.x;
		}
		if (sizeY === 0) {
			sizeY = this.iipTileSize.y;
		}

		sizeX *= tileSizeFac;
		sizeY *= tileSizeFac;
/*
		// Add an extra 1/2 pixel as an ugly fix to the tile gap pb in some browsers
		if (L.Browser.chrome || L.Browser.safari) {
			sizeX += 0.5;
			sizeY += 0.5;
		}
*/
		tile.style.width = sizeX  + 'px';
		tile.style.height = sizeY + 'px';

		tile.onselectstart = L.Util.falseFn;
		tile.onmousemove = L.Util.falseFn;

		// update opacity on tiles in IE7-8 because of filter inheritance problems
		if (L.Browser.ielt9 && this.options.opacity < 1) {
			L.DomUtil.setOpacity(tile, this.options.opacity);
		}

		// without this hack, tiles disappear after zoom on Chrome for Android
		// https://github.com/Leaflet/Leaflet/issues/2078
		if (L.Browser.android && !L.Browser.android23) {
			tile.style.WebkitBackfaceVisibility = 'hidden';
		}
	}

});

L.tileLayer.iip = function (url, options) {
	return new L.TileLayer.IIP(url, options);
};
