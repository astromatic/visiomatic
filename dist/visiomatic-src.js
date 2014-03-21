/*
Copyright:    (C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
                       Chiara Marmo - IDES/Paris-Sud,
                       Ruven Pillay - C2RMF/CNRS
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are
permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice, this list of
      conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice, this list
      of conditions and the following disclaimer in the documentation and/or other materials
      provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*
# FileTree parses directory trees serverside.
# Adapted from the jQuery File Tree Plugin (original copyright notice reproduced
# below).
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 11/02/2014
// Originally authored by Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 24 March 2008
//
// Usage: $('.fileTreeDemo').fileTree( options, callback )
//
// Options:  root           - root folder to display; default = /
//           script         - location of the serverside AJAX file to use; default = jqueryFileTree.php
//           folderEvent    - event to trigger expand/collapse; default = click
//           expandSpeed    - default = 500 (ms); use -1 for no animation
//           collapseSpeed  - default = 500 (ms); use -1 for no animation
//           expandEasing   - easing function to use on expand (optional)
//           collapseEasing - easing function to use on collapse (optional)
//           multiFolder    - whether or not to limit the browser to one subfolder at a time
//           loadMessage    - Message to display while initial tree loads (can be HTML)
//
// TERMS OF USE
// 
// This plugin is dual-licensed under the GNU General Public License and the MIT License and
// is copyright 2008 A Beautiful Site, LLC. 
//
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery-browser');
}

$.extend($.fn, {
	fileTree: function (options, file) {
		// Default options
		if (options.root === undefined) {options.root = '/'; }
		if (options.script === undefined) {options.script			= 'dist/filetree.php'; }
		if (options.folderEvent === undefined) {options.folderEvent = 'click'; }
		if (options.expandSpeed === undefined) {options.expandSpeed = 500; }
		if (options.collapseSpeed === undefined) {options.collapseSpeed = 500; }
		if (options.expandEasing === undefined) {options.expandEasing = null; }
		if (options.collapseEasing === undefined) {options.collapseEasing = null; }
		if (options.multiFolder === undefined) {options.multiFolder = true; }
		if (options.loadMessage === undefined) {options.loadMessage	= 'Loading...'; }

		$(this).each(function () {

			function showTree(element, dir) {
				$(element).addClass('wait');
				$('.filetree.start').remove();
				$.post(options.script, { dir: dir }, function (data) {
					$(element).find('.start').html('');
					$(element).removeClass('wait').append(data);
					if (options.root === dir) {
						$(element).find('UL:hidden').show();
					} else {
						$(element).find('UL:hidden').slideDown({
							duration: options.expandSpeed,
							easing: options.expandEasing
						});
					}
					bindTree(element);
				});
			}

			function bindTree(element) {
				$(element).find('LI A').on(options.folderEvent, function () {
					if ($(this).parent().hasClass('directory')) {
						if ($(this).parent().hasClass('collapsed')) {
							// Expand
							if (!options.multiFolder) {
								$(this).parent().parent().find('UL').slideUp({
									duration: options.collapseSpeed,
									easing: options.collapseEasing
								});
								$(this).parent().parent().find('LI.directory')
								  .removeClass('expanded')
								  .addClass('collapsed');
							}
							$(this).parent().find('UL').remove(); // cleanup
							showTree($(this).parent(), encodeURI($(this).attr('rel').match(/.*\//)));
							$(this).parent().removeClass('collapsed').addClass('expanded');
						} else {
							// Collapse
							$(this).parent().find('UL').slideUp({
								duration: options.collapseSpeed,
								easing: options.collapseEasing
							});
							$(this).parent().removeClass('expanded').addClass('collapsed');
						}
					} else {
						file($(this).attr('rel'));
					}
					return false;
				});
				// Prevent A from triggering the # on non-click events
				if (options.folderEvent.toLowerCase !== 'click') {
					$(element).find('LI A').on('click', function () {return false; });
				}
			}
			// Loading message
			$(this).html('<ul class="filetree start"><li class="wait">' + options.loadMessage + '<li></ul>');
			// Get the initial file list
			showTree($(this), encodeURI(options.root));
		});
	}
});



/*
# L.IIPUtils contains general utility methods
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#	                    Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 10/02/2014
*/
L.IIPUtils = {
// Definitions for RegExp
	REG_PDEC: '(\\d+\\.\\d*)',
	REG_FLOAT: '([-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?)',

// Ajax call to server
	requestURI: function (uri, purpose, action, context) {
		var	httpRequest;

		if (window.XMLHttpRequest) { // Mozilla, Safari, ...
			httpRequest = new XMLHttpRequest();
		} else if (window.ActiveXObject) { // IE
			try {
				httpRequest = new ActiveXObject('Msxml2.XMLHTTP');
			}
			catch (e) {
				try {
					httpRequest = new ActiveXObject('Microsoft.XMLHTTP');
				}
				catch (e) {}
			}
		}
		if (!httpRequest) {
			alert('Giving up: Cannot create an XMLHTTP instance for ' + purpose);
			return false;
		}
		httpRequest.open('GET', uri);
		httpRequest.onreadystatechange = function () {
			action(context, httpRequest);
		};
		httpRequest.send();
	},

// Return the distance between two world coords latLng1 and latLng2 in degrees
	distance: function (latlng1, latlng2) {
		var d2r = Math.PI / 180.0,
		 lat1 = latlng1.lat * d2r,
		 lat2 = latlng2.lat * d2r,
		 dLat = lat2 - lat1,
		 dLon = (latlng2.lng - latlng1.lng) * d2r,
		 sin1 = Math.sin(dLat / 2),
		 sin2 = Math.sin(dLon / 2);

		var a = sin1 * sin1 + sin2 * sin2 * Math.cos(lat1) * Math.cos(lat2);

		return Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 360.0 / Math.PI;
	}

};



/*
# L.Projection.WCS computes a list of FITS WCS (World Coordinate System)
# (de-)projections (see http://www.atnf.csiro.au/people/mcalabre/WCS/)
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 10/02/2014
*/

L.Projection.WCS = L.Class.extend({

	bounds: L.bounds([0.0, -90.0], [360.0, 90.0]),

	// (phi,theta) [rad] -> RA, Dec [deg] for zenithal projections.
	_phiThetaToRADec: function (phiTheta) {
		var	projparam = this.projparam,
		    deg = Math.PI / 180.0,
			  rad = 180.0 / Math.PI,
			  t = phiTheta.lat * deg,
			  ct = Math.cos(t),
			  st = Math.sin(t),
			  dp = projparam.celpole.lat * deg,
			  cdp = Math.cos(dp),
			  sdp = Math.sin(dp),
			  dphi = (phiTheta.lng - projparam.natpole.lng) * deg,
			  cdphi = Math.cos(dphi),
			  asinarg = st * sdp + ct * cdp * cdphi;
		if (asinarg > 1.0) {
			asinarg = 1.0;
		} else if (asinarg < -1.0) {
			asinarg = -1.0;
		}
		return new L.LatLng(Math.asin(asinarg) * rad,
		 projparam.celpole.lng + Math.atan2(- ct * Math.sin(dphi),
		  st * cdp  - ct * sdp * cdphi) * rad);
	},

	// (RA, Dec) [deg] -> (phi,theta) [rad] for zenithal projections.
	_raDecToPhiTheta: function (raDec) {
		var	projparam = this.projparam,
		    deg = Math.PI / 180.0,
			  rad = 180.0 / Math.PI,
			  da = (raDec.lng - projparam.celpole.lng) * deg,
			  cda = Math.cos(da),
			  sda = Math.sin(da),
			  d = raDec.lat * deg,
			  cd = Math.cos(d),
			  sd = Math.sin(d),
			  dp = projparam.celpole.lat * deg,
			  cdp = Math.cos(dp),
			  sdp = Math.sin(dp),
			  asinarg = sd * sdp + cd * cdp * cda;
		if (asinarg > 1.0) {
			asinarg = 1.0;
		} else if (asinarg < -1.0) {
			asinarg = -1.0;
		}
		return new L.LatLng(Math.asin(asinarg) * rad,
		 projparam.natpole.lng + Math.atan2(- cd * sda,
		    sd * cdp  - cd * sdp * cda) * rad);
	},

	// Convert from pixel to reduced coordinates.
	_pixToRed: function (pix) {
		var	projparam = this.projparam,
		    cd = projparam.cd,
		    red = pix.subtract(projparam.crpix);
		return new L.Point(red.x * cd[0][0] + red.y * cd[0][1],
			red.x * cd[1][0] + red.y * cd[1][1]);
	},

	// Convert from reduced to pixel coordinates.
	_redToPix: function (red) {
		var projparam = this.projparam,
		    cdinv = projparam.cdinv;
		return new L.point(red.x * cdinv[0][0] + red.y * cdinv[0][1],
		 red.x * cdinv[1][0] + red.y * cdinv[1][1]).add(projparam.crpix);
	},

	// Compute the CD matrix invert.
	_invertCD: function (cd) {
		var detinv = 1.0 / (cd[0][0] * cd[1][1] - cd[0][1] * cd[1][0]);
		return [[cd[1][1] * detinv, -cd[0][1] * detinv],
		 [-cd[1][0] * detinv, cd[0][0] * detinv]];
	}
});

L.Projection.WCS.PIX = L.Projection.WCS.extend({
	code: 'PIX',

	paraminit: function (projparam) {
		this.projparam = projparam;
		projparam.cdinv = this._invertCD(projparam.cd);
		projparam.natfid = new L.LatLng(0.0, 90.0);
		projparam.celpole = projparam.crval;
	},

	project: function (latlng) {
		return new L.Point(latlng.lng, latlng.lat);
	},

	unproject: function (point) {
		return new L.LatLng(point.y, point.x);
	},

	bounds: L.bounds([-0.5, -0.5], [0.5, 0.5])
});

L.Projection.WCS.zenithal = L.Projection.WCS.extend({

	paraminit: function (projparam) {
		this.projparam = projparam;
		projparam.cdinv = this._invertCD(projparam.cd);
		projparam.natfid = new L.LatLng(0.0, 90.0);
		projparam.celpole = projparam.crval;
	},

	project: function (latlng) { // LatLng [deg] -> Point
		var phiTheta = this._raDecToPhiTheta(latlng);
		phiTheta.lat = this._thetaToR(phiTheta.lat);
		return this._redToPix(this._phiRToRed(phiTheta));
	},

	unproject: function (point) { // Point -> LatLng [deg]		
		var  phiTheta = this._redToPhiR(this._pixToRed(point));
		phiTheta.lat = this._rToTheta(phiTheta.lat);
		return this._phiThetaToRADec(phiTheta);
	},

	// (x, y) ["deg"] -> \phi, r [deg] for zenithal projections.
	_redToPhiR: function (red) {
		return new L.LatLng(Math.sqrt(red.x * red.x + red.y * red.y),
		 Math.atan2(red.x, - red.y) * 180.0 / Math.PI);
	},

	// \phi, r [deg] -> (x, y) ["deg"] for zenithal projections.
	_phiRToRed: function (phiR) {
		var	deg = Math.PI / 180.0,
			p = phiR.lng * deg;
		return new L.Point(phiR.lat * Math.sin(p), - phiR.lat * Math.cos(p));
	}
});

L.Projection.WCS.TAN = L.Projection.WCS.zenithal.extend({
	code: 'TAN',

	_rToTheta: function (r) {
		return Math.atan2(180.0, Math.PI * r) * 180.0 / Math.PI;
	},

	_thetaToR: function (theta) {
		return 180.0 / Math.PI * Math.tan((90.0 - theta) * Math.PI / 180.0);
	}
});

L.Projection.WCS.ZEA = L.Projection.WCS.zenithal.extend({
	code: 'ZEA',

	_rToTheta: function (r) {
		var rr = Math.PI * r / 360.0;
		if (Math.abs(rr) < 1.0) {
			return 90.0 - 2.0 * Math.asin(rr) * 180.0 / Math.PI;
		} else {
			return 90.0;
		}
	},

	_thetaToR: function (theta) {
		return 360.0 / Math.PI * Math.sin((90.0 - theta) * Math.PI / 360.0);
	}

});


/*
# L.WCS emulates the FITS WCS (World Coordinate System) popular among
# the astronomical community (see http://www.atnf.csiro.au/people/mcalabre/WCS/)
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 15/02/2014
*/

L.CRS.WCS = L.extend({}, L.CRS, {
	code: 'WCS',

	options: {
		ctype: {x: 'PIXEL', y: 'PIXEL'},
		naxis: [256, 256],
		nzoom: 9,
		crpix: [129, 129],
		crval: [0.0, 0.0],							// (\delta_0, \phi_0)
		cd: [[1.0, 0.0], [0.0, 1.0]],
		natpole: [90.0, 180.0],					// (\theta_p, \phi_p)
		tileSize: [256, 256],
	},

	initialize: function (hdr, options) {
		options = L.setOptions(this, options);

		this.tileSize = L.point(options.tileSize);
		this.nzoom = options.nzoom;
		this.ctype = {x: options.ctype.x, y: options.ctype.y};
		this.naxis = L.point(options.naxis, true);

		this.projparam = new this.paraminit(options);
		if (hdr) {
			this._readWCS(hdr);
		}

		switch (this.ctype.x.substr(5, 3)) {
		case 'ZEA':
			this.projection = new L.Projection.WCS.ZEA();
			this.pixelFlag = false;
			break;
		case 'TAN':
			this.projection = new L.Projection.WCS.TAN();
			this.pixelFlag = false;
			break;
		default:
			this.projection = new L.Projection.WCS.PIX();
			this.pixelFlag = true;
			break;
		}
		this.transformation = new L.Transformation(1, -0.5, -1, this.naxis.y + 0.5);
		this.projection.paraminit(this.projparam);
		this.code += ':' + this.projection.code;
	},

	paraminit: function (options) {
		this.crval = L.latLng(options.crval);
		this.crpix = L.point(options.crpix);
		this.cd = [[options.cd[0][0], options.cd[0][1]],
		           [options.cd[1][0], options.cd[1][1]]];
		this.natpole = L.latLng(options.natpole);
		this.celpole = L.latLng(options.celpole);
		this.natfid = L.latLng(options.natfid);
	},

	// converts pixel coords to geo coords
	pointToLatLng: function (point, zoom) {
		var scale = this.scale(zoom),
		    untransformedPoint = this.transformation.untransform(point, scale);
		return this.projection.unproject(untransformedPoint);
	},

	scale: function (zoom) {
		return Math.pow(2, zoom - this.nzoom + 1);
	},

	_readWCS: function (hdr) {
		var key = this._readFITSKey,
		    projparam = this.projparam,
		    v;
		if ((v = key('CTYPE1', hdr))) { this.ctype.x = v; }
		if ((v = key('CTYPE2', hdr))) { this.ctype.y = v; }
		if ((v = key('NAXIS1', hdr))) { this.naxis.x = parseInt(v, 10); }
		if ((v = key('NAXIS2', hdr))) { this.naxis.y = parseInt(v, 10); }
		if ((v = key('CRPIX1', hdr))) { projparam.crpix.x = parseFloat(v, 10); }
		if ((v = key('CRPIX2', hdr))) { projparam.crpix.y = parseFloat(v, 10); }
		if ((v = key('CRVAL1', hdr))) { projparam.crval.lng = parseFloat(v, 10); }
		if ((v = key('CRVAL2', hdr))) { projparam.crval.lat = parseFloat(v, 10); }
		if ((v = key('CD1_1', hdr))) { projparam.cd[0][0] = parseFloat(v, 10); }
		if ((v = key('CD1_2', hdr))) { projparam.cd[0][1] = parseFloat(v, 10); }
		if ((v = key('CD2_1', hdr))) { projparam.cd[1][0] = parseFloat(v, 10); }
		if ((v = key('CD2_2', hdr))) { projparam.cd[1][1] = parseFloat(v, 10); }
	},

	_readFITSKey: function (keyword, str) {
		var key = keyword.trim().toUpperCase().substr(0, 8),
			nspace = 8 - key.length,
			keyreg = new RegExp(key + '\\ {' + nspace.toString() +
			 '}=\\ *(?:\'(\\S*)\\ *\'|([-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?))'),
			match = keyreg.exec(str);
		if (!match) {
			return null;
		} else if (match[1]) {
			return match[1];
		} else {
			return match[2];
		}
	}

});

L.CRS.WCS = L.Class.extend(L.CRS.WCS);

L.CRS.wcs = function (options) {
	return new L.CRS.WCS(options);
};


/*
# L.TileLayer.IIP adds support for IIP layers to Leaflet
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	VisiOmatic
#
#	Copyright:		(C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                        Chiara Marmo - IDES/Paris-Sud,
#                        Ruven Pillay - C2RMF/CNRS
#
#	Last modified:		17/02/2014
*/

L.TileLayer.IIP = L.TileLayer.extend({
	options: {
		title: '',
		minZoom: 0,
		maxZoom: null,
		maxNativeZoom: 18,
		contrast: 1.0,
		gamma: 1.0,
		cMap: 'grey',
		invertCMap: false,
		quality: 90
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

	iipdefault: {
		contrast: 1,
		gamma: 1,
		cMap: 'grey',
		invertCMap: false,
		minValue: [],
		maxValue: [],
		quality: 90
	},

	initialize: function (url, options) {
		options = L.setOptions(this, options);

		// detecting retina displays, adjusting tileSize and zoom levels
		if (options.detectRetina && L.Browser.retina && options.maxZoom > 0) {

			options.tileSize = Math.floor(options.tileSize / 2);
			options.zoomOffset++;

			options.minZoom = Math.max(0, options.minZoom);
			options.maxZoom--;
		}

		this._url = url.replace(/\&.*$/g, '');

		if (typeof options.subdomains === 'string') {
			options.subdomains = options.subdomains.split('');
		}

		this.iipTileSize = {x: 256, y: 256};
		this.iipImageSize = [];
		this.iipImageSize[0] = this.iipTileSize;
		this.iipGridSize = [];
		this.iipGridSize[0] = {x: 1, y: 1};
		this.iipBPP = 8;
		this.iipMinZoom = this.options.minZoom;
		this.iipMaxZoom = this.options.maxZoom;
		this.iipContrast = this.options.contrast;
		this.iipGamma = this.options.gamma;
		this.iipCMap = this.options.cMap;
		this.iipInvertCMap = this.options.invertCMap;
		this.iipMinValue = [];
		this.iipMinValue[0] = 0.0;
		this.iipMaxValue = [];
		this.iipMaxValue[0] = 255.0;
		this.iipQuality = this.options.quality;

		this._title = options.title.length > 0 ? options.title :
		                this._url.match(/^.*\/(.*)\..*$/)[1];
		this.getIIPMetaData(this._url);
		return this;
	},

	getIIPMetaData: function (url) {
		L.IIPUtils.requestURI(url +
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

				// Find the lowest and highest zoom levels
				matches = layer._readIIPKey(response, 'Resolution-number', '(\\d+)');
				layer.iipMaxZoom = parseInt(matches[1], 10) - 1;
				layer.iipMinZoom = 0;
				if (layer.iipMinZoom > layer.options.minZoom) {
					layer.options.minZoom = layer.iipMinZoom;
				}
				if (!layer.options.maxZoom) {
					layer.options.maxZoom = layer.iipMaxZoom + 6;
				}
				layer.options.maxNativeZoom = layer.iipMaxZoom;

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
				for (z = layer.iipMaxZoom; z <= layer.options.maxZoom; z++) {
					layer.iipGridSize[z] = layer.iipGridSize[layer.iipMaxZoom];
				}

				// Set pixel bpp
				matches = layer._readIIPKey(response, 'Bits-per-channel', '(\\d+)');
				layer.iipBPP = parseInt(matches[1], 10);
				// Only 32bit data are likely to be linearly quantized
				layer.iipGamma = layer.iipBPP >= 32 ? 2.2 : 1.0;

				// Pre-computed Min and max pixel values
				matches = layer._readIIPKey(response, 'Min-Max-sample-values',
				 '\\s*(.*)');
				var str = matches[1].split(/\s+/),
				    nfloat = (str.length / 2),
				    mmn = 0;
				for (var n = 0; n < nfloat; n++) {
					layer.iipdefault.minValue[n] = layer.iipMinValue[n] =
					 parseFloat(str[mmn++]);
				}
				for (n = 0; n < nfloat; n++) {
					layer.iipdefault.maxValue[n] = layer.iipMaxValue[n] =
					 parseFloat(str[mmn++]);
				}
				if (layer.options.bounds) {
					layer.options.bounds = L.latLngBounds(layer.options.bounds);
				}
				layer.wcs = new L.CRS.WCS(response, {
					nzoom: layer.iipMaxZoom + 1,
					tileSize: layer.iipTileSize,
					// Center on image if WCS is in pixels
					crval: L.latLng((maxsize.y + 1.0) / 2.0, (maxsize.x + 1.0) / 2.0)
				});
				layer.iipMetaReady = true;
				layer.fire('metaload');
			} else {
				alert('There was a problem with the IIP metadata request.');
			}
		}
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
		var center,
		    zoom,
		    newcrs = this.wcs,
				curcrs = map.options.crs,
				prevcrs = map._prevcrs;

		if (map._loaded) {
			curcrs._prevLatLng = map.getCenter();
			curcrs._prevZoom = map.getZoom();
		}
		// Go to previous layers' coordinates if applicable
		if (prevcrs && newcrs !== curcrs && map._loaded &&
		    newcrs.pixelFlag === curcrs.pixelFlag) {
			center = curcrs._prevLatLng;
			zoom = curcrs._prevZoom;
		// Else go back to previous recorded position for the new layer
		} else if (newcrs._prevLatLng) {
			center = newcrs._prevLatLng;
			zoom = newcrs._prevZoom;
		}
		else {
			center = map.options.center ? map.options.center : newcrs.projparam.crval;
			zoom = 1;
		}

		map._prevcrs = map.options.crs = newcrs;
		map.setView(center, zoom, {reset: true, animate: false});
		L.TileLayer.prototype.addTo.call(this, map);
	},

	_resetWrap: function () {
		var map = this._map,
		    crs = map.options.crs;

		if (crs.infinite) { return; }

		var tileSize = this._getTileSize();

		if (crs.wrapLng) {
			this._wrapLng = [
				Math.floor(map.project([0, crs.wrapLng[0]]).x / tileSize.x),
				Math.ceil(map.project([0, crs.wrapLng[1]]).x / tileSize.x)
			];
		}

		if (crs.wrapLat) {
			this._wrapLat = [
				Math.floor(map.project([crs.wrapLat[0], 0]).y / tileSize.y),
				Math.ceil(map.project([crs.wrapLat[1], 0]).y / tileSize.y)
			];
		}
	},

	_getTileSizeFac: function () {
		var	map = this._map,
			zoom = map.getZoom(),
			zoomN = this.options.maxNativeZoom;
		return (zoomN && zoom > zoomN) ?
				Math.round(map.getZoomScale(zoom) / map.getZoomScale(zoomN)) : 1;
	},

	_getTileSize: function () {
		var zoomfac = this._getTileSizeFac();
		return {x: this.iipTileSize.x * zoomfac, y: this.iipTileSize.y * zoomfac};
	},

	_isValidTile: function (coords) {
		var z = this._getZoomForUrl();
		if (coords.x < 0 || coords.x >= this.iipGridSize[z].x ||
			coords.y < 0 || coords.y >= this.iipGridSize[z].y) {
			return false;
		}
		var crs = this._map.options.crs;

		if (!crs.infinite) {
			// don't load tile if it's out of bounds and not wrapped
			var bounds = this._tileNumBounds;
			if ((!crs.wrapLng && (coords.x < bounds.min.x || coords.x > bounds.max.x)) ||
			    (!crs.wrapLat && (coords.y < bounds.min.y || coords.y > bounds.max.y))) { return false; }
		}

		if (!this.options.bounds) { return true; }

		// don't load tile if it doesn't intersect the bounds in options
		var tileBounds = this._tileCoordsToBounds(coords);
		return L.latLngBounds(this.options.bounds).intersects(tileBounds);
	},

	_update: function () {

		if (!this._map) { return; }

		var map = this._map,
			bounds = map.getPixelBounds(),
			zoom = map.getZoom(),
		  tileSize = this._getTileSize();

		if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
			return;
		}

		var tileBounds = L.bounds(
			this._vecDiv(bounds.min.clone(), tileSize)._floor(),
			this._vecDiv(bounds.max.clone(), tileSize)._floor()
		);

		this._addTiles(tileBounds);

		if (this.options.unloadInvisibleTiles) {
			this._removeOtherTiles(tileBounds);
		}
	},

	_vecDiv: function (coords, vec) {
		coords.x /= vec.x;
		coords.y /= vec.y;
		return coords;
	},

	_vecMul: function (coords, vec) {
		coords.x *= vec.x;
		coords.y *= vec.y;
		return coords;
	},

	_getTilePos: function (coords) {
		return this._vecMul(coords.clone(),
		 this._getTileSize()).subtract(this._map.getPixelOrigin());
	},

	getTileUrl: function (coords) {
		var str = this._url,
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
		if (this.iipMinValue[0] !== this.iipdefault.minValue[0] ||
		 this.iipMaxValue[0] !== this.iipdefault.maxValue[0]) {
			str += '&MINMAX=1,' + this.iipMinValue[0].toString() + ',' +
				this.iipMaxValue[0].toString();
		}
		if (this.iipQuality !== this.iipdefault.quality) {
			str += '&QLT=' + this.iipQuality.toString();
		}
		return str + '&JTL=' + (z - this.iipMinZoom).toString() + ',' +
		 (coords.x + this.iipGridSize[z].x * coords.y).toString();
	},

	_initTile: function (tile) {
		L.DomUtil.addClass(tile, 'leaflet-tile');

		// Force pixels to be visible at high zoom factos whenever possible
		if (this._getTileSizeFac() > 1) {
			var tileSize = this._getTileSize();
			if (L.Browser.ie) {
				tile.style.msInterpolationMode = 'nearest-neighbor';
			} else if (L.Browser.chrome) {
				tile.style.imageRendering = '-webkit-optimize-speed';
			} else {
				tile.style.imageRendering = '-moz-crisp-edges';
			}
			tile.style.width = tileSize.x + 'px';
			tile.style.height = tileSize.y + 'px';
		}
		tile.onselectstart = L.Util.falseFn;
		tile.onmousemove = L.Util.falseFn;

		// update opacity on tiles in IE7-8 because of filter inheritance problems
		if (L.Browser.ielt9 && this.options.opacity < 1) {
			L.DomUtil.setOpacity(tile, this.options.opacity);
		}

		// without this hack, tiles disappear after zoom on Chrome for Android
		// https://github.com/Leaflet/Leaflet/issues/2078
		if (L.Browser.mobileWebkit3d) {
			tile.style.WebkitBackfaceVisibility = 'hidden';
		}
	}

});

L.tileLayer.iip = function (url, options) {
	return new L.TileLayer.IIP(url, options);
};


/*
# L.Catalogs contains specific catalog settings and conversion tools.
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 10/02/2014
*/

L.Catalog = {
	nmax: 10000,	// Sets the maximum number of sources per query
	_csvToGeoJSON: function (str) {
		// Check to see if the delimiter is defined. If not, then default to comma.
		var badreg = new RegExp('#|--|^$'),
		 lines = str.split('\n'),
		 geo = {type: 'FeatureCollection', features: []};

		for (var i in lines) {
			var line = lines[i];
			if (badreg.test(line) === false) {
				var feature = {
					type: 'Feature',
					id: '',
					properties: {
						mags: []
					},
					geometry: {
						type: 'Point',
						coordinates: [0.0, 0.0]
					},
				},
				geometry = feature.geometry,
				properties = feature.properties;

				var cell = line.split(';');
				feature.id = cell[0];
				geometry.coordinates[0] = parseFloat(cell[1]);
				geometry.coordinates[1] = parseFloat(cell[2]);
				var mags = cell.slice(3),
				    mag;
				for (var j in mags) {
					mag = parseFloat(mags[j]);
					properties.mags.push(isNaN(mag) ? '--' : mag);
				}
				geo.features.push(feature);
			}
		}
		return geo;
	},

	_popup: function (feature) {
		var str = '<div>';
		if (this.objuri) {
			str += 'ID: <a href=\"' +  L.Util.template(this.objuri, L.extend({
				ra: feature.geometry.coordinates[0].toFixed(6),
				dec: feature.geometry.coordinates[1].toFixed(6)
			})) + '\" target=\"_blank\">' + feature.id + '</a></div>';
		} else {
			str += 'ID: ' + feature.id + '</div>';
		}
		str += '<TABLE style="margin:auto;">' +
		       '<TBODY style="vertical-align:top;text-align:left;">';
		for	(var i in this.properties) {
			str += '<TR><TD>' + this.properties[i] + ':</TD>' +
			       '<TD>' + feature.properties.mags[i].toString() + ' ' +
			       this.units[i] + '</TD></TR>';
		}
		str += '</TBODY></TABLE>';
		return str;
	}

};

L.Catalog.TwoMASS = L.extend({}, L.Catalog, {
	name: '2MASS',
	attribution: '2MASS All-Sky Catalog of Point Sources (Cutri et al., 2003)',
	color: 'red',
	maglim: 17.0,
	service: 'CDS',
	uri: '/viz-bin/asu-tsv?&-mime=csv&-source=II/246&' +
	 '-out=2MASS,RAJ2000,DEJ2000,Jmag,Hmag,Kmag&-out.meta=&' +
	 '-c={ra},{dec},eq=J2000&-c.bd={dra},{ddec}&-sort=_Kmagr&-out.max={nmax}',
	toGeoJSON: L.Catalog._csvToGeoJSON,
	properties: ['J', 'H', 'K'],
	units: ['', '', ''],
	objuri: 'http://vizier.u-strasbg.fr/viz-bin/VizieR-5?-source=II/246&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

L.Catalog.SDSS = L.extend({}, L.Catalog, {
	name: 'SDSS release 9',
	attribution: 'SDSS Photometric Catalog, Release 9 (Adelman-McCarthy et al., 2012)',
	color: 'yellow',
	maglim: 25.0,
	service: 'CDS',
	uri: '/viz-bin/asu-tsv?&-mime=csv&-source=V/139&' +
	 '-out=SDSS9,RAJ2000,DEJ2000,umag,gmag,rmag,imag,zmag&-out.meta=&' +
	 '-c={ra},{dec}&-c.bd={dra},{ddec}&-sort=imag&-out.max={nmax}',
	toGeoJSON: L.Catalog._csvToGeoJSON,
	properties: ['u', 'g', 'r', 'i', 'z'],
	units: ['', '', '', '', ''],
	objuri: 'http://vizier.u-strasbg.fr/viz-bin/VizieR-5?-source=V/139/sdss9&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

L.Catalog.PPMXL = L.extend({}, L.Catalog, {
	name: 'PPMXL',
	attribution: 'PPM-Extended, positions and proper motions by Roeser et al. 2008',
	color: 'green',
	maglim: 20.0,
	service: 'CDS',
	uri: '/viz-bin/asu-tsv?&-mime=csv&-source=I/317&' +
	 '-out=PPMXL,RAJ2000,DEJ2000,Jmag,Hmag,Kmag,b1mag,b2mag,r1mag,r2mag,imag,pmRA,pmDE&-out.meta=&' +
	 '-c={ra},{dec}&-c.bd={dra},{ddec}&-sort=_r&-out.max={nmax}',
	toGeoJSON: L.Catalog._csvToGeoJSON,
	properties: ['J', 'H', 'K', 'b<sub>1</sub>', 'b<sub>2</sub>', 'r<sub>1</sub>',
	             'r<sub>2</sub>', 'i',
	             '&#956;<sub>&#593;</sub> cos &#948;', '&#956;<sub>&#948;</sub>'],
	units: ['', '', '', '', '', '', '', '', 'mas/yr', 'mas/yr'],
	objuri: 'http://vizier.u-strasbg.fr/viz-bin/VizieR-5?-source=I/317&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

L.Catalog.Abell = L.extend({}, L.Catalog, {
	name: 'Abell clusters',
	attribution: 'Rich Clusters of Galaxies (Abell et al. 1989) ',
	color: 'orange',
	maglim: 30.0,
	service: 'CDS',
	uri: '/viz-bin/asu-tsv?&-mime=csv&-source=VII/110A&' +
	 '-out=ACO,_RAJ2000,_DEJ2000,m10,Rich,Dclass&-out.meta=&' +
	 '-c={ra},{dec}&-c.bd={dra},{ddec}&-sort=m10&-out.max={nmax}',
	toGeoJSON: L.Catalog._csvToGeoJSON,
	properties: ['m<sub>10</sub>', 'Richness', 'D<sub>class</sub>'],
	units: ['', '', ''],
	objuri: 'http://vizier.u-strasbg.fr/viz-bin/VizieR-5?-source=VII/110A&-c={ra},{dec},eq=J2000&-c.rs=0.2'
});




/*
# L.Control.WCS Manage coordinate display and input
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 16/03/2014
*/
L.Control.WCS = L.Control.extend({
	options: {
		position: 'bottomleft',
		units: 'HMS'
	},

	onAdd: function (map) {
		// Create coordinate input/display box
		var input = this._wcsinput = L.DomUtil.create('input', 'leaflet-control-wcs');
		L.DomEvent.disableClickPropagation(input);
		input.type = 'text';
		// Speech recognition on WebKit engine
		if ('webkitSpeechRecognition' in window) {
			input.setAttribute('x-webkit-speech', 'x-webkit-speech');
		}

		map.on('drag zoomend', this._onDrag, this);
		L.DomEvent.on(input, 'change', this._onInputChange, this);

		return this._wcsinput;
	},

	onRemove: function (map) {
		map.off('drag', this._onDrag);
	},

	_onDrag: function (e) {
		var latlng = this._map.getCenter();
		if (this._map.options.crs && this._map.options.crs.pixelFlag) {
			this._wcsinput.value = latlng.lng.toFixed(0) + ' , ' + latlng.lat.toFixed(0);
		} else {
			switch (this.options.units) {
			case 'HMS':
				this._wcsinput.value = this._latLngToHMSDMS(latlng);
				break;
			case 'deg':
				this._wcsinput.value = latlng.lng.toFixed(5) + ' , ' + latlng.lat.toFixed(5);
				break;
			default:
				this._wcsinput.value = latlng.lng.toFixed(1) + ' , ' + latlng.lat.toFixed(1);
				break;
			}
		}
	},

	// Convert degrees to HMSDMS (DMS code from the Leaflet-Coordinates plug-in)
	_latLngToHMSDMS : function (latlng) {
		var lng = (latlng.lng + 360.0) / 360.0;
		lng = (lng - Math.floor(lng)) * 24.0;
		var h = Math.floor(lng),
		 mf = (lng - h) * 60.0,
		 m = Math.floor(mf),
		 sf = (mf - m) * 60.0;
		if (sf >= 60.0) {
			m++;
			sf = 0.0;
		}
		if (m === 60) {
			h++;
			m = 0;
		}
		var str = h.toString() + ':' + (m < 10 ? '0' : '') + m.toString() +
		 ':' + (sf < 10.0 ? '0' : '') + sf.toFixed(3),
		 lat = Math.abs(latlng.lat),
		 sgn = latlng.lat < 0.0 ? '-' : '+',
		 d = Math.floor(lat);
		mf = (lat - d) * 60.0;
		m = Math.floor(mf);
		sf = (mf - m) * 60.0;
		if (sf >= 60.0) {
			m++;
			sf = 0.0;
		}
		if (m === 60) {
			h++;
			m = 0;
		}
		return str + ' ' + sgn + (d < 10 ? '0' : '') + d.toString() + ':' +
		 (m < 10 ? '0' : '') + m.toString() + ':' +
		 (sf < 10.0 ? '0' : '') + sf.toFixed(2);
	},

	_onInputChange: function (e) {
		var re = /^(\d+\.?\d*)\s*,\s*\+?(-?\d+\.?\d*)/g,
		 str = this._wcsinput.value,
		 result = re.exec(str);
		if (result && result.length >= 3) {
		// If in degrees, pan directly
			this._map.panTo({lat: Number(result[2]), lng: Number(result[1])});
		} else {
		// If not, ask Sesame@CDS!
			L.IIPUtils.requestURI('/cgi-bin/nph-sesame/-oI?' + str,
			 'getting coordinates for ' + str, this._getCoordinates, this, true);
		}
	},

	_getCoordinates: function (_this, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var re = /J\s(\d+\.?\d*)\s*,?\s*\+?(-?\d+\.?\d*)/g,
				 str = httpRequest.responseText,
				 result = re.exec(str);
				if (result && result.length >= 3) {
					_this._map.panTo({lat: Number(result[2]), lng: Number(result[1])});
					_this._onDrag();
				} else {
					alert(str + ': Unknown location');
				}
			} else {
				alert('There was a problem with the request to the Sesame service at CDS');
			}
		}
	}
});

L.Map.mergeOptions({
    positionControl: false
});

L.Map.addInitHook(function () {
    if (this.options.positionControl) {
        this.positionControl = new L.Control.MousePosition();
        this.addControl(this.positionControl);
    }
});

L.control.wcs = function (options) {
    return new L.Control.WCS(options);
};


/*
# L.Control.Scale.WCS adds degree and pixel units to the standard L.Control.Scale
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 10/02/2014
*/

L.Control.Scale.WCS = L.Control.Scale.extend({
	options: {
		position: 'bottomleft',
		maxWidth: 128,
		metric: false,
		imperial: false,
		degrees: true,
		pixels: true,
		custom: false,
		customScale: 1.0,
		customUnits: '',
		planetRadius: 6378137.0,
		updateWhenIdle: false
	},

	_addScales: function (options, className, container) {
		if (options.metric) {
			this._mScale = L.DomUtil.create('div', className, container);
		}
		if (options.imperial) {
			this._iScale = L.DomUtil.create('div', className, container);
		}
		if (options.degrees) {
			this._dScale = L.DomUtil.create('div', className, container);
		}
		if (options.pixels) {
			this._pScale = L.DomUtil.create('div', className, container);
		}
		if (options.custom) {
			this._cScale = L.DomUtil.create('div', className, container);
		}

		this.angular = options.metric || options.imperial || options.degrees;
	},

	_update: function () {
		var options = this.options,
		    map = this._map,
		    crs = map.options.crs;

		if (options.pixels && crs.options && crs.options.nzoom) {
			var pixelScale = Math.pow(2.0, crs.options.nzoom - 1 - map.getZoom());
			this._updatePixels(pixelScale * options.maxWidth);
		}

		if (options.custom && crs.options && crs.options.nzoom) {
			var customScale = Math.pow(2.0,
			      crs.options.nzoom - 1 - map.getZoom()) * options.customScale;
			this._updateCustom(customScale * options.maxWidth, options.customUnits);
		}

		if (this.angular) {
			var center = map.getCenter(),
			    cosLat = Math.cos(center.lat * Math.PI / 180),
			    dist = Math.sqrt(this._jacobian(center)) * cosLat,
			    maxDegrees = dist * options.maxWidth;

			if (options.metric) {
				this._updateMetric(maxDegrees * Math.PI / 180.0 * options.planetRadius);
			}
			if (options.imperial) {
				this._updateImperial(maxDegrees * Math.PI / 180.0 * options.planetRadius);
			}
			if (options.degrees) {
				this._updateDegrees(maxDegrees);
			}
		}
	},

// Return the Jacobian determinant of the astrometric transformation at latLng
	_jacobian: function (latlng) {
		var map = this._map,
		    p0 = map.project(latlng),
		    latlngdx = map.unproject(p0.add([10.0, 0.0])),
		    latlngdy = map.unproject(p0.add([0.0, 10.0]));
		return 0.01 * Math.abs((latlngdx.lng - latlng.lng) *
		                        (latlngdy.lat - latlng.lat) -
		                       (latlngdy.lng - latlng.lng) *
		                        (latlngdx.lat - latlng.lat));
	},

	_updateCustom: function (maxCust, units) {
		var scale = this._cScale;

		if (maxCust > 1.0e9) {
			var maxGCust = maxCust * 1.0e-9,
			gCust = this._getRoundNum(maxGCust);
			this._updateScale(scale, gCust + ' G' + units, gCust / maxGCust);
		} else if (maxCust > 1.0e6) {
			var maxMCust = maxCust * 1.0e-6,
			mCust = this._getRoundNum(maxMCust);
			this._updateScale(scale, mCust + ' M' + units, mCust / maxMCust);
		} else if (maxCust > 1.0e3) {
			var maxKCust = maxCust * 1.0e-3,
			kCust = this._getRoundNum(maxKCust);
			this._updateScale(scale, kCust + ' k' + units, kCust / maxKCust);
		} else {
			var cust = this._getRoundNum(maxCust);
			this._updateScale(scale, cust + ' ' + units, cust / maxCust);
		}
	},

	_updatePixels: function (maxPix) {
		var scale = this._pScale;

		if (maxPix > 1.0e6) {
			var maxMPix = maxPix * 1.0e-6,
			mPix = this._getRoundNum(maxMPix);
			this._updateScale(scale, mPix + ' Mpx', mPix / maxMPix);
		} else if (maxPix > 1.0e3) {
			var maxKPix = maxPix * 1.0e-3,
			kPix = this._getRoundNum(maxKPix);
			this._updateScale(scale, kPix + ' kpx', kPix / maxKPix);
		} else {
			var pix = this._getRoundNum(maxPix);
			this._updateScale(scale, pix + ' px', pix / maxPix);
		}
	},

	_updateDegrees: function (maxDegrees) {
		var maxSeconds = maxDegrees * 3600.0,
		    scale = this._dScale;

		if (maxSeconds < 1.0) {
			var maxMas = maxSeconds * 1000.0,
			mas = this._getRoundNum(maxMas);
			this._updateScale(scale, mas + ' mas', mas / maxMas);
		} else if (maxSeconds < 60.0) {
			var seconds = this._getRoundNum(maxSeconds);
			this._updateScale(scale, seconds + ' &#34;', seconds / maxSeconds);
		} else if (maxSeconds < 3600.0) {
			var maxMinutes = maxDegrees * 60.0,
			    minutes = this._getRoundNum(maxMinutes);
			this._updateScale(scale, minutes + ' &#39;', minutes / maxMinutes);
		} else {
			var degrees = this._getRoundNum(maxDegrees);
			this._updateScale(scale, degrees + ' &#176;', degrees / maxDegrees);
		}
	}

});

L.control.scale.wcs = function (options) {
	return new L.Control.Scale.WCS(options);
};



/*
# L.Control.Reticle adds a reticle at the center of the map container
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		10/02/2014
*/
L.Control.Reticle = L.Control.extend({
	options: {
		position: 'bottomleft'
	},

	onAdd: function (map) {
		// Create central reticle
		var reticle = this._reticle = L.DomUtil.create('div', 'leaflet-reticle', this._map._controlContainer),
			style = reticle.style;
		style.position = 'absolute';
		style.left = '50%';
		style.bottom = '50%';
		style.textAlign = 'center';
		style.verticalAlign = 'middle';
		style.pointerEvents = 'none';
		reticle.innerHTML = '';

		var container = this._container = L.DomUtil.create('div', 'leaflet-dummy');

		return container;
	},

	onRemove: function (map) {
		this._reticle.parentNode.removeChild(this._reticle);
	}

});

L.control.reticle = function (options) {
    return new L.Control.Reticle(options);
};


/*
# L.Control.IIP adjusts the rendering of an IIP layer
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 21/03/2014
*/
L.Control.IIP = L.Control.extend({
	options: {
		title: 'a control related to IIPImage',
		collapsed: true,
		position: 'topleft'
	},

	initialize: function (baseLayers,  options) {
		L.setOptions(this, options);
		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipimage';
		this._layers = baseLayers;
	},

	onAdd: function (map) {
		var className = this._className,
		 id = this._id,
		 container = this._container = L.DomUtil.create('div', className + ' leaflet-bar');
		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		L.DomEvent
				.disableClickPropagation(container)
				.disableScrollPropagation(container);

		this._dialog = L.DomUtil.create('div', className + '-dialog', container);
		if (this.options.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent
					.on(container, 'mouseover', this._expand, this)
					.on(container, 'mouseout', this._collapse, this);
			}

			var toggle = this._toggle = L.DomUtil.create('a', className + '-toggle leaflet-bar', container);
			toggle.href = '#';
			toggle.id = id + '-toggle';
			toggle.title = this.options.title;

			if (L.Browser.touch) {
				L.DomEvent
				    .on(toggle, 'click', L.DomEvent.stop)
				    .on(toggle, 'click', this._expand, this);
			}
			else {
				L.DomEvent.on(toggle, 'focus', this._expand, this);
			}

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility
		} else {
			this._expand();
		}

//		this._checkIIP();
		this._map.on('layeradd', this._checkIIP, this);

		return	this._container;
	},

	_checkIIP: function (e) {
		var layer = e.layer;

		// Exit if not an IIP layer
		if (!layer || !layer.iipdefault) {
			return;
		}
		this._layer = layer;
		if (this._reloadFlag) {
			layer.once('load', this._resetDialog, this);
		} else {
			this._initDialog();
			this._reloadFlag = true;
		}
	},

	_initDialog: function () {
/*
		var className = this._className,
			container = this._container,
			dialog = this._dialog,
			toggle = this._toggle,
			layer = this._layer;
		dialog.innerHTML = '';
*/
    // Setup the rest of the dialog window here
	},

	_resetDialog: function () {
		this._dialog.innerHTML = '';
		this._initDialog();
	},

	_addDialogLine: function (label) {
		var elem = L.DomUtil.create('div', this._className + '-element', this._dialog),
		 text = L.DomUtil.create('span', this._className + '-label', elem);
		text.innerHTML = label;
		return elem;
	},

	_expand: function () {
		L.DomUtil.addClass(this._container, this._className + '-expanded');
	},

	_collapse: function () {
		this._container.className = this._container.className.replace(' ' + this._className + '-expanded', '');
	},

  /**
* Get currently active base layer on the map
* @return {Object} l where l.name - layer name on the control,
* l.layer is L.TileLayer, l.overlay is overlay layer.
*/
	getActiveBaseLayer: function () {
		return this._activeBaseLayer;
	},

  /**
* Get currently active overlay layers on the map
* @return {{layerId: l}} where layerId is <code>L.stamp(l.layer)</code>
* and l @see #getActiveBaseLayer jsdoc.
*/

	_findActiveBaseLayer: function () {
		var layers = this._layers;
		this._prelayer = undefined;
		for (var layername in layers) {
			var layer = layers[layername];
			if (!layer.overlay) {
				if (!layer._map) {
					this._prelayer = layer;
				} else if (this._map.hasLayer(layer) && layer.iipdefault) {
					return layer;
				}
			}
		}
		return undefined;
	},

	_onInputChange:	function (layer, pname, value) {
		var pnamearr = pname.split(/\[|\]/);
		if (pnamearr[1]) {
			layer[pnamearr[0]][parseInt(pnamearr[1], 10)] = value;
		}	else {
			layer[pnamearr[0]] = value;
		}
		layer.redraw();
	}

});

L.control.iip = function (baseLayers, options) {
	return new L.Control.IIP(baseLayers, options);
};



/*
# L.Control.IIP.image adjusts the rendering of an IIP layer
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	VisiOmatic
#
#	Copyright:		(C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#				                 Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		16/03/2014
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery-browser');
}

L.Control.IIP.Image = L.Control.IIP.extend({
	options: {
		title: 'Image adjustment',
		collapsed: true,
		cmap: 'grey',
		position: 'topleft',
	},

	initialize: function (baseLayers, options) {
		L.setOptions(this, options);
		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipimage';
		this._layers = baseLayers;
	},

	_initDialog: function () {
		var _this = this,
			className = this._className,
			layer = this._layer,
			cmaps = ['grey', 'jet', 'cold', 'hot'],
			elem;

		// Colour lookup table (Colour maps)
		elem = this._addDialogLine('LUT:');
		var	invbutton =  L.DomUtil.create('input', 'leaflet-cmap-inv', elem);
		invbutton.id = 'leaflet-invertcmap';
		invbutton.type = 'button';

		var cmapinput = L.DomUtil.create('span', className + '-cmaps', elem);
		var cbutton = [];
		for (var i in cmaps) {
			cbutton[i] = document.createElement('input');
			cbutton[i].className = 'leaflet-cmap-' + cmaps[i];
			cbutton[i].type = 'button';
			cbutton[i].name = 'button';
			cbutton[i].cmap = cmaps[i];
			cmapinput.appendChild(cbutton[i]);
			if (cmaps[i] === this.options.cmap) {
				cbutton[i].checked = 'checked';
			}
		}

		$('.' + className + '-cmaps').buttonset();
		$('.' + className + '-cmaps :button').click(function (e) {
			_this._onInputChange(layer, 'iipCMap', this.cmap);
		});
		$('#leaflet-invertcmap').button();
		L.DomEvent.on(invbutton, 'click', function () {
			_this._onInputChange(layer, 'iipInvertCMap', !layer.iipInvertCMap);
			var style = layer.iipInvertCMap ? 'scaleY(-1.0)' : 'none';
			for (var i in cmaps) {
				if (L.Browser.ie) {
					cbutton[i].style.msTransform = style;
				} else if (L.Browser.webkit) {
					cbutton[i].style.webkitTransform = style;
				} else {
					cbutton[i].style.transform = style;
				}
			}
		}, this);

		// Min and max pixel values
		var step = ((layer.iipMaxValue[0] - layer.iipMinValue[0]) / 100.0).toPrecision(1);

		// Min
		this._addNumericalInput(layer, 'Min:', 'iipMinValue[0]',
		 'leaflet-minvalue', layer.iipMinValue[0], step);

		// Max
		this._addNumericalInput(layer, 'Max:', 'iipMaxValue[0]',
		 'leaflet-maxvalue', layer.iipMaxValue[0], step);

		// Gamma
		this._addNumericalInput(layer, 'Gamma:', 'iipGamma',
		 'leaflet-gammavalue', layer.iipGamma, 0.05, 0.5, 5.0);

		// Contrast
		this._addNumericalInput(layer, 'Contrast:', 'iipContrast',
		 'leaflet-contrastvalue', layer.iipContrast, 0.05, 0.0, 10.0);

		// JPEG quality
		this._addNumericalInput(layer, 'JPEG quality:', 'iipQuality',
		 'leaflet-qualvalue', layer.iipQuality, 1, 0, 100);
	},

	_addNumericalInput:	function (layer, label, attr, id, initValue, step,
	 min, max) {
		var _this = this,
		    elem = this._addDialogLine(label),
		    input = L.DomUtil.create('input', '', elem);
		input.id = id;
		input.type = 'number';
		input.value = initValue;
		input.size = 5;
		$('#' + input.id).spinner({
			start: function (event, ui) {
				$('#' + input.id).blur();	// Avoid keyboard popup on touch devices
			},
			stop: function (event, ui) {
				_this._onInputChange(layer, attr, input.value);
				$('#' + input.id).blur();	// Avoid keyboard popup on touch devices
			},
			icons: { down: 'icon-minus', up: 'icon-plus' },
			step: step,
			min: min,
			max: max,
		});
		return elem;
	}

});

L.control.iip.image = function (baseLayers, options) {
	return new L.Control.IIP.Image(baseLayers, options);
};



/*
# L.Control.Layers.Overlay manages new overlays such as catalogs and plots
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 21/03/2014
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery-browser');
}

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
		elem = this._addDialogLine('<a id="logo-cds" ' +
		 'href="http://cds.u-strasbg.fr">&nbsp;</a> catalog:');
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
		L.DomEvent.on(profbutton, 'click', this._profileClick, this);
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

	_profileClick: function (e) {
		var map = this._map,
		    point = map.getCenter(),
		    line = this._profileLine;

		if (!line) {
			line = this._profileLine = L.polyline([point, point]);
			line.addTo(map);
			map.on('drag', this._updateLine, this);
		} else {
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
			    point2 = map.project(path[1], zoom);

			L.IIPUtils.requestURI(this._layer._url.replace(/\&.*$/g, '') +
			'&PFL=' + zoom.toString() + ':' + point1.x.toFixed(0) + ',' +
			 point1.y.toFixed(0) + '-' + point2.x.toFixed(0) + ',' +
			 point2.y.toFixed(0),
			'getting IIP layer profile',
			this._plotProfile, line);
		}
	},

	_updateLine: function (e) {
		this._profileLine.spliceLatLngs(1, 1, this._map.getCenter());
		this._profileLine.redraw();
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



/*
# L.Control.Layers.IIP adds new features to the standard L.Control.Layers
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 04/03/2014
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery-browser');
}

L.Control.Layers.IIP = L.Control.Layers.extend({
	options: {
		title: 'overlay menu',
		collapsed: true,
		position: 'topright',
		autoZIndex: true,
		fileMenu: false,
		fileURL: '/fcgi-bin/iipsrv.fcgi?FIF=',
		fileRoot: '',
		fileTreeScript: 'visiomatic/dist/filetree.php',
		fileProcessScript: 'visiomatic/dist/processfits.php'
	},

	onAdd: function (map) {
		map._layerControl = this;
		this._initLayout();
		this._update();

//		map
//		    .on('layeradd', this._onLayerChange, this)
//		    .on('layerremove', this._onLayerChange, this);

		return this._container;
	},

	_initLayout: function () {
		var className = 'leaflet-control-layers',
		    container = this._container = L.DomUtil.create('div', className);

		// makes this work on IE touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		if (!L.Browser.touch) {
			L.DomEvent
				.disableClickPropagation(container)
				.disableScrollPropagation(container);
		} else {
			L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
		}

		var form = this._form = L.DomUtil.create('form', className + '-list');

		if (this.options.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent.on(container, {
					mouseover: this._expand,
				    mouseout: this._collapse
				}, this);
			}

			var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
			link.href = '#';
			link.title = 'Layers';

			if (L.Browser.touch) {
				L.DomEvent
				    .on(link, 'click', L.DomEvent.stop)
				    .on(link, 'click', this._expand, this);
			} else {
				L.DomEvent.on(link, 'focus', this._expand, this);
			}

			// work around for Firefox Android issue https://github.com/Leaflet/Leaflet/issues/2033
			L.DomEvent.on(form, 'click', function () {
				setTimeout(L.bind(this._onInputClick, this), 0);
			}, this);

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility
		} else {
			this._expand();
		}

		this._baseLayersList = L.DomUtil.create('div', className + '-base', form);

		if (this.options.fileMenu) {
			var addbutton = this._addButton = L.DomUtil.create('input', className + '-add', form);
			addbutton.type = 'button';
			addbutton.value = 'Add...';
			L.DomEvent.on(addbutton, 'click', this._openFileMenu, this);
		}

		this._separator = L.DomUtil.create('div', className + '-separator', form);
		this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);

		container.appendChild(form);
	},

	_addItem: function (obj) {
		var _this = this,
		 item = L.DomUtil.create('div', 'leaflet-control-layers-item'),
		 inputdiv = L.DomUtil.create('div', 'leaflet-control-layers-select', item);

		if (obj.layer.notReady) {
			L.DomUtil.create('div', 'leaflet-control-activity', inputdiv);
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
			inputdiv.appendChild(input);
		}
		
		var name = L.DomUtil.create('div', 'leaflet-control-layers-name', item);
		name.innerHTML = ' ' + obj.name;

		var trashbutton = L.DomUtil.create('input', 'leaflet-control-layers-trash', item);
		trashbutton.type = 'button';
		L.DomEvent.on(trashbutton, 'click', function () {
			_this.removeLayer(obj.layer);
			if (!obj.notReady) {
				_this._map.removeLayer(obj.layer);
			}
		}, this);

		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
		container.appendChild(item);

		return item;
	},

	_onInputClick: function () {
		var i, input, obj,
		    inputs = this._form.getElementsByTagName('input'),
		    inputsLen = inputs.length;

		this._handlingClick = true;

		for (i = 0; i < inputsLen; i++) {
			input = inputs[i];
			if (!('layerId' in input)) {
				continue;
			}
			obj = this._layers[input.layerId];
			if (input.checked && !this._map.hasLayer(obj.layer)) {
				obj.layer.addTo(this._map);
			} else if (!input.checked && this._map.hasLayer(obj.layer)) {
				this._map.removeLayer(obj.layer);
			}
		}

		this._handlingClick = false;
	},

	_addDialogLine: function (label, dialog) {
		var elem = L.DomUtil.create('div', this._className + '-element', dialog),
		 text = L.DomUtil.create('span', this._className + '-label', elem);
		text.innerHTML = label;
		return elem;
	},

	_openFileMenu: function () {
		var _this = this,
		    fileMenu = L.DomUtil.create('div', 'leaflet-control-filemenu',
		                 this._map._controlContainer);
		fileMenu.title = 'Open file';
		this._addButton.disabled = true;
		L.DomEvent
				.disableClickPropagation(fileMenu)
				.disableScrollPropagation(fileMenu);

		$('.leaflet-control-filemenu').dialog({
			appendTo: 'body',
			close: function (event, ui) {
				L.DomUtil.remove(fileMenu);
				_this._addButton.disabled = false;
			},
			show: {
				effect: 'clip',
				duration: 250
			},
			hide: {
				effect: 'clip',
				duration: 250
			},
			height: 200
		});
		var fileTree = L.DomUtil.create('div', 'leaflet-control-filetree',
		                 fileMenu);
		fileTree.id = 'leaflet-filetree';

		$(document).ready(function () {
			$('#leaflet-filetree').fileTree({
				root: _this.options.fileRoot,
				script: _this.options.fileTreeScript
			},
			function (fitsname) {
				var layercontrol = _this._map._layerControl,
				    redname = fitsname.replace(/(^.*\/|\..*$)/g, ''),
				    templayer;
				if (layercontrol) {
					templayer = new L.LayerGroup(null);

					templayer.notReady = true;
					layercontrol.addBaseLayer(templayer, 'converting ' + redname + '...');
					if (layercontrol.options.collapsed) {
						layercontrol._expand();
					}
				}
				$.post(_this.options.fileProcessScript, {
					fitsname: fitsname
				}, function (ptifname) {
					ptifname = ptifname.trim();
					var layer = L.tileLayer.iip(_this.options.fileURL + ptifname, {title: redname});
					if (layer.iipMetaReady) {
						_this._updateBaseLayer(templayer, layer);
					} else {
						layer.once('metaload', function () {
							_this._updateBaseLayer(templayer, layer);
						});
					}
				});
			});
		});
	},

	_updateBaseLayer: function (templayer, layer) {
		var map = this._map,
		    layercontrol = map._layerControl;
		layercontrol.removeLayer(templayer);
		map.eachLayer(map.removeLayer);
		layer.addTo(map);
		layercontrol.addBaseLayer(layer, layer._title);
		map.fire('baselayerchange');
		if (layercontrol.options.collapsed) {
			layercontrol._collapse();
		}
	}
});

L.control.layers.iip = function (baselayers, overlays, options) {
	return new L.Control.Layers.IIP(baselayers, overlays, options);
};



/*
# L.Control.FullScreen adds a full screen toggle button to the map.
# Adapted from the leaflet.fullscreen plugin by Bruno Bergot (fixed jake errors)
# (original copyright notice reproduced below).
#
#	This file part of:	VisiOmatic
#
#	Copyright:		(C) 2013-2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                             Chiara Marmo - IDES/Paris-Sud,
#                             Ruven Pillay - C2RMF/CNRS
#
#	Last modified: 10/02/2014

original code Copyright (c) 2013, Bruno Bergot
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are
permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice, this list of
      conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice, this list
      of conditions and the following disclaimer in the documentation and/or other materials
      provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

if (typeof require !== 'undefined') {
	var jQuery = require('jquery-browser');
}


(function () {

	L.Control.FullScreen = L.Control.extend({
		options: {
			position: 'topleft',
			title: 'Full Screen',
			forceSeparateButton: false
		},
	
		onAdd: function (map) {
			var className = 'leaflet-control-zoom-fullscreen', container;
		
			if (map.zoomControl && !this.options.forceSeparateButton) {
				container = map.zoomControl._container;
			} else {
				container = L.DomUtil.create('div', 'leaflet-bar');
			}
		
			this._createButton(this.options.title, className, container, this.toogleFullScreen, map);

			return container;
		},
	
		_createButton: function (title, className, container, fn, context) {
			var link = L.DomUtil.create('a', className, container);
			link.href = '#';
			link.title = title;

			L.DomEvent
				.addListener(link, 'click', L.DomEvent.stopPropagation)
				.addListener(link, 'click', L.DomEvent.preventDefault)
				.addListener(link, 'click', fn, context);

			L.DomEvent
				.addListener(container, fullScreenApi.fullScreenEventName, L.DomEvent.stopPropagation)
				.addListener(container, fullScreenApi.fullScreenEventName, L.DomEvent.preventDefault)
				.addListener(container, fullScreenApi.fullScreenEventName, this._handleEscKey, context);

			L.DomEvent
				.addListener(document, fullScreenApi.fullScreenEventName, L.DomEvent.stopPropagation)
				.addListener(document, fullScreenApi.fullScreenEventName, L.DomEvent.preventDefault)
				.addListener(document, fullScreenApi.fullScreenEventName, this._handleEscKey, context);

			return link;
		},

		toogleFullScreen: function () {
			this._exitFired = false;
			var container = this._container;
			if (this._isFullscreen) {
				if (fullScreenApi.supportsFullScreen) {
					fullScreenApi.cancelFullScreen(container);
				} else {
					L.DomUtil.removeClass(container, 'leaflet-pseudo-fullscreen');
				}
				this.invalidateSize();
				this.fire('exitFullscreen');
				this._exitFired = true;
				this._isFullscreen = false;
			} else {
				if (fullScreenApi.supportsFullScreen) {
					fullScreenApi.requestFullScreen(container);
				} else {
					L.DomUtil.addClass(container, 'leaflet-pseudo-fullscreen');
				}
				this.invalidateSize();
				this.fire('enterFullscreen');
				this._isFullscreen = true;
			}
		},
	
		_handleEscKey: function () {
			if (!fullScreenApi.isFullScreen(this) && !this._exitFired) {
				this.fire('exitFullscreen');
				this._exitFired = true;
				this._isFullscreen = false;
			}
		}
	});

	L.Map.addInitHook(function () {
		if (this.options.fullscreenControl) {
			this.fullscreenControl = L.control.fullscreen(this.options.fullscreenControlOptions);
			this.addControl(this.fullscreenControl);
		}
	});

	L.control.fullscreen = function (options) {
		return new L.Control.FullScreen(options);
	};

/* 
Native FullScreen JavaScript API
-------------
Assumes Mozilla naming conventions instead of W3C for now

source : http://johndyer.name/native-fullscreen-javascript-api-plus-jquery-plugin/

*/

	var fullScreenApi = {
			supportsFullScreen: false,
			isFullScreen: function () { return false; },
			requestFullScreen: function () {},
			cancelFullScreen: function () {},
			fullScreenEventName: '',
			prefix: ''
		},
		browserPrefixes = 'webkit moz o ms khtml'.split(' ');
	
	// check for native support
	if (typeof document.exitFullscreen !== 'undefined') {
		fullScreenApi.supportsFullScreen = true;
	} else {
		// check for fullscreen support by vendor prefix
		for (var i = 0, il = browserPrefixes.length; i < il; i++) {
			fullScreenApi.prefix = browserPrefixes[i];
			if (typeof document[fullScreenApi.prefix + 'CancelFullScreen'] !== 'undefined') {
				fullScreenApi.supportsFullScreen = true;
				break;
			}
		}
	}
	
	// update methods to do something useful
	if (fullScreenApi.supportsFullScreen) {
		fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
		fullScreenApi.isFullScreen = function () {
			switch (this.prefix) {
			case '':
				return document.fullScreen;
			case 'webkit':
				return document.webkitIsFullScreen;
			default:
				return document[this.prefix + 'FullScreen'];
			}
		};
		fullScreenApi.requestFullScreen = function (el) {
			return (this.prefix === '') ? el.requestFullscreen() : el[this.prefix + 'RequestFullScreen']();
		};
		fullScreenApi.cancelFullScreen = function (el) {
			return (this.prefix === '') ? document.exitFullscreen() : document[this.prefix + 'CancelFullScreen']();
		};
	}

	// jQuery plugin
	if (typeof jQuery !== 'undefined') {
		jQuery.fn.requestFullScreen = function () {
			return this.each(function () {
				var el = jQuery(this);
				if (fullScreenApi.supportsFullScreen) {
					fullScreenApi.requestFullScreen(el);
				}
			});
		};
	}

	// export api
	window.fullScreenApi = fullScreenApi;
})();


/*
# L.Control.ExtraMap adds support for extra synchronized maps 
# (Picture-in-Picture style). Adapted from L.Control.MiniMap by Norkart
# (original copyright notice reproduced below).
#
#	This file part of:	VisiOmatic
#	Copyright:		(C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                        Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 11/02/2014

Original code Copyright (c) 2012, Norkart AS
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are
permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice, this list of
      conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice, this list
      of conditions and the following disclaimer in the documentation and/or other materials
      provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
L.Control.ExtraMap = L.Control.extend({
	options: {
		position: 'bottomright',
		toggleDisplay: true,
		zoomLevelOffset: -5,
		zoomLevelFixed: false,
		zoomAnimation: false,
		autoToggleDisplay: false,
		width: 150,
		height: 150,
		aimingRectOptions: {color: '#ff7800', weight: 1, clickable: false,
		                    renderer: L.Canvas.instance},
		shadowRectOptions: {color: '#000000', weight: 1, clickable: false,
		                    opacity: 0, fillOpacity: 0}
	},
	
	hideText: 'Hide map',
	showText: 'Show map',
	
	//layer is the map layer to be shown in the extramap
	initialize: function (layer, options) {
		L.Util.setOptions(this, options);
		//Make sure the aiming rects are non-clickable even if the user tries
		// to set them clickable (most likely by forgetting to specify them false)
		this.options.aimingRectOptions.clickable = false;
		this.options.shadowRectOptions.clickable = false;
		this._layer = layer;
	},
	
	onAdd: function (map) {

		this._mainMap = map;

		//Creating the container and stopping events from spilling through to the main map.
		this._container = L.DomUtil.create('div', 'leaflet-control-extramap');
		this._container.style.width = this.options.width + 'px';
		this._container.style.height = this.options.height + 'px';
		L.DomEvent.disableClickPropagation(this._container);
		L.DomEvent.on(this._container, 'mousewheel', L.DomEvent.stopPropagation);


		this._extraMap = new L.Map(this._container,
		{
			attributionControl: false,
			zoomControl: false,
			zoomAnimation: this.options.zoomAnimation,
			autoToggleDisplay: this.options.autoToggleDisplay,
			touchZoom: !this.options.zoomLevelFixed,
			scrollWheelZoom: !this.options.zoomLevelFixed,
			doubleClickZoom: !this.options.zoomLevelFixed,
			boxZoom: !this.options.zoomLevelFixed,
		});

		this._layer.addTo(this._extraMap);

		//These bools are used to prevent infinite loops of the two maps notifying each other that they've moved.
//		this._mainMapMoving = false;
//		this._extraMapMoving = false;

		//Keep a record of this to prevent auto toggling when the user explicitly doesn't want it.
		this._userToggledDisplay = false;
		this._minimized = false;

		if (this.options.toggleDisplay) {
			this._addToggleButton();
		}

		this._layer.once('metaload', function () {
			this._mainMap.whenReady(L.Util.bind(function () {
				this._extraMap.whenReady(L.Util.bind(function () {
					var latlngs = this._getMapLatLngBounds(this._mainMap);
					this._aimingRect = L.polygon(latlngs,
					 this.options.aimingRectOptions).addTo(this._extraMap);
					this._shadowRect = L.polygon(latlngs,
					 this.options.shadowRectOptions).addTo(this._extraMap);
					this._mainMap.on('moveend', this._onMainMapMoved, this);
					this._mainMap.on('move', this._onMainMapMoving, this);
					this._extraMap.on('movestart', this._onExtraMapMoveStarted, this);
					this._extraMap.on('move', this._onExtraMapMoving, this);
					this._extraMap.on('moveend', this._onExtraMapMoved, this);
					this._extraMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
					this._setDisplay(this._decideMinimized());
				}, this));
			}, this));
		}, this);

		return this._container;
	},

	addTo: function (map) {
		L.Control.prototype.addTo.call(this, map);
		return this;
	},

	onRemove: function (map) {
		this._mainMap.off('moveend', this._onMainMapMoved, this);
		this._mainMap.off('move', this._onMainMapMoving, this);
		this._extraMap.off('moveend', this._onExtraMapMoved, this);

		this._extraMap.removeLayer(this._layer);
	},

	_getMapLatLngBounds: function (map) {
		var bounds = map.getPixelBounds(),
		 bmin = bounds.min,
		 bmax = bounds.max;
		return [map.unproject([bmin.x, bmin.y]), map.unproject([bmax.x, bmin.y]),
		 map.unproject([bmax.x, bmax.y]), map.unproject([bmin.x, bmax.y])];
	},


	_addToggleButton: function () {
		this._toggleDisplayButton = this.options.toggleDisplay ?
			this._createButton('', this.hideText,
			 'leaflet-control-extramap-toggle-display', this._container,
			 this._toggleDisplayButtonClicked, this)
		: undefined;
	},

	_createButton: function (html, title, className, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.innerHTML = html;
		link.href = '#';
		link.title = title;

		var stop = L.DomEvent.stopPropagation;

		L.DomEvent
			.on(link, 'click', stop)
			.on(link, 'mousedown', stop)
			.on(link, 'dblclick', stop)
			.on(link, 'click', L.DomEvent.preventDefault)
			.on(link, 'click', fn, context);

		return link;
	},

	_toggleDisplayButtonClicked: function () {
		this._userToggledDisplay = true;
		if (!this._minimized) {
			this._minimize();
			this._toggleDisplayButton.title = this.showText;
		}
		else {
			this._restore();
			this._toggleDisplayButton.title = this.hideText;
		}
	},

	_setDisplay: function (minimize) {
		if (minimize !== this._minimized) {
			if (!this._minimized) {
				this._minimize();
			}
			else {
				this._restore();
			}
		}
	},

	_minimize: function () {
		// hide the extramap
		if (this.options.toggleDisplay) {
			this._container.style.width = '19px';
			this._container.style.height = '19px';
			this._toggleDisplayButton.className += ' minimized';
		}
		else {
			this._container.style.display = 'none';
		}
		this._minimized = true;
	},

	_restore: function () {
		if (this.options.toggleDisplay) {
			this._container.style.width = this.options.width + 'px';
			this._container.style.height = this.options.height + 'px';
			this._toggleDisplayButton.className = this._toggleDisplayButton.className
					.replace(/(?:^|\s)minimized(?!\S)/g, '');
		}
		else {
			this._container.style.display = 'block';
		}
		this._minimized = false;
	},

	_onMainMapMoved: function (e) {
		if (!this._extraMapMoving) {
			this._mainMapMoving = true;
			this._extraMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
			this._setDisplay(this._decideMinimized());
		} else {
			this._extraMapMoving = false;
		}
		this._aimingRect.setLatLngs(this._getMapLatLngBounds(this._mainMap));
	},

	_onMainMapMoving: function (e) {
		this._aimingRect.setLatLngs(this._getMapLatLngBounds(this._mainMap));
	},

	_onExtraMapMoveStarted: function (e) {
		this._lastAimingRectPosition = this._aimingRect.getLatLngs();
	},

	_onExtraMapMoving: function (e) {
		if (!this._mainMapMoving && this._lastAimingRectPosition) {
			this._shadowRect.setLatLngs(this._lastAimingRectPosition);
			this._shadowRect.setStyle({opacity: 0, fillOpacity: 0.0});
		}
	},

	_onExtraMapMoved: function (e) {
		if (!this._mainMapMoving) {
			this._extraMapMoving = true;
			this._mainMap.setView(this._extraMap.getCenter(), this._decideZoom(false));
			this._shadowRect.setStyle({opacity: 0, fillOpacity: 0});
		} else {
			this._mainMapMoving = false;
		}
	},

	_decideZoom: function (fromMaintoExtra) {
		if (!this.options.zoomLevelFixed) {
			if (fromMaintoExtra) {
				return this._mainMap.getZoom() + this.options.zoomLevelOffset;
			} else {
				var currentDiff = this._extraMap.getZoom() - this._mainMap.getZoom();
				var proposedZoom = this._extraMap.getZoom() - this.options.zoomLevelOffset;
				var toRet;
                                
				if (currentDiff > this.options.zoomLevelOffset &&
				    this._mainMap.getZoom() < (this._extraMap.getMinZoom() -
					                             this.options.zoomLevelOffset)) {
					//This means the miniMap is zoomed out to the minimum zoom level and can't zoom any more.
					if (this._extraMap.getZoom() > this._lastExtraMapZoom) {
						// This means the user is trying to zoom in by using the minimap,
						// zoom the main map.
						toRet = this._mainMap.getZoom() + 1;
						// Also we cheat and zoom the minimap out again to keep it
						// visually consistent.
						this._extraMap.setZoom(this._extraMap.getZoom() - 1);
					} else {
						//Either the user is trying to zoom out past the mini map's min
						// zoom or has just panned using it, we can't tell the difference.
						// Therefore, we ignore it!
						toRet = this._mainMap.getZoom();
					}
				} else {
					// This is what happens in the majority of cases, and always if you
					// configure the min levels + offset in a sane fashion.
					toRet = proposedZoom;
				}
				this._lastExtraMapZoom = this._extraMap.getZoom();
				return toRet;
			}
		} else {
			if (fromMaintoExtra) {
				return this.options.zoomLevelFixed;
			} else {
				return this._mainMap.getZoom();
			}
		}
	},

	_decideMinimized: function () {
		if (this._userToggledDisplay) {
			return this._minimized;
		}

		if (this.options.autoToggleDisplay) {
			if (this._mainMap.getBounds().contains(this._extraMap.getBounds())) {
				return true;
			}
			return false;
		}

		return this._minimized;
	}
});

L.Map.mergeOptions({
	extraMapControl: false
});

L.Map.addInitHook(function () {
	if (this.options.extraMapControl) {
		this.extraMapControl = (new L.Control.ExtraMap()).addTo(this);
	}
});

L.control.extramap = function (options) {
	return new L.Control.ExtraMap(options);
};


/*
# L.Control.Attribution.Logos adds a VisiOmatic logo to the map.
#
#  This file part of: VisiOmatic
#
#  Copyright:         (C) 2013-2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                                   Chiara Marmo - IDES/Paris-Sud,
#
#  Last modified: 07/03/2014
*/

// Remove this ugly Pipe sign
L.Control.Attribution.include({
	_update: function () {
		if (!this._map) { return; }

		var attribs = [];

		for (var i in this._attributions) {
			if (this._attributions[i]) {
				attribs.push(i);
			}
		}

		var prefixAndAttribs = [];

		if (this.options.prefix) {
			prefixAndAttribs.push(this.options.prefix);
		}
		if (attribs.length) {
			prefixAndAttribs.push(attribs.join(', '));
		}

		this._container.innerHTML = prefixAndAttribs.join(' &#169; ');
	}
});

// Set Attribution prefix to a series of clickable logos
L.Map.addInitHook(function () {
	if (this.options.visiomaticLogo !== false &&
	 this.options.attributionControl) {
		this.attributionControl.setPrefix(
			'<a id="logo-visiomatic" class="leaflet-control-attribution-logo"' +
			 'href="http://visiomatic.org">&nbsp;</a>' +
			 '<a id="logo-iipimage" class="leaflet-control-attribution-logo"' +
			 'href="http://iipimage.sourceforge.net">&nbsp;</a>' +
			 '<a id="logo-leaflet" class="leaflet-control-attribution-logo"' +
			 'href="http://leafletjs.com">&nbsp;</a>'
		);
	}
});




