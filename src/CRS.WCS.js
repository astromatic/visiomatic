/*
# L.WCS emulates the FITS WCS (World Coordinate System) popular among
# the astronomical community (see http://www.atnf.csiro.au/people/mcalabre/WCS/)
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 05/10/2014
*/

L.CRS.WCS = L.extend({}, L.CRS, {
	code: 'WCS',

	options: {
		ctype: {x: 'PIXEL', y: 'PIXEL'},
		naxis: [256, 256],
		nzoom: 9,
		crpix: [129, 129],
		crval: [0.0, 0.0],										// (\delta_0, \alpha_0)
//	cpole: (equal to crval by default)		// (\delta_p, \alpha_p)
		cd: [[1.0, 0.0], [0.0, 1.0]],
		natrval: [90.0, 0.0],										// (\theta_0. \phi_0)
		natpole: [90.0, 999.0],								// (\theta_p, \phi_p)
		tileSize: [256, 256],
		pv: [[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
		     [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]]
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
			this.infinite = true;
			break;
		case 'TAN':
			this.projection = new L.Projection.WCS.TAN();
			this.pixelFlag = false;
			this.infinite = true;
			break;
		case 'COE':
			this.projection = new L.Projection.WCS.COE();
			this.pixelFlag = false;
			this.infinite = true;
			break;
		default:
			this.projection = new L.Projection.WCS.PIX();
			this.pixelFlag = true;
			this.infinite = false;
			this.wrapLng = [0.5, this.naxis.x - 0.5];
			this.wrapLat = [this.naxis.y - 0.5, 0.5];
			break;
		}
		this.transformation = new L.Transformation(1, -0.5, -1, this.naxis.y + 0.5);
		this.projection.paraminit(this.projparam);
		this.code += ':' + this.projection.code;
	},

	paraminit: function (options) {
		this.naxis = L.point(options.naxis);
		this.crval = L.latLng(options.crval);
		this.cpole = L.latLng(options.crval);
		this.crpix = L.point(options.crpix);
		this.cd = [[options.cd[0][0], options.cd[0][1]],
		           [options.cd[1][0], options.cd[1][1]]];
		this.natrval = L.latLng(options.natrval);
		this.natpole = L.latLng(options.natpole);
		this.pv = [];
		this.pv[0] = options.pv[0].slice();
		this.pv[1] = options.pv[1].slice();
	},

	scale: function (zoom) {
		return Math.pow(2, zoom - this.nzoom + 1);
	},

	// return the pixel scale in degrees
	pixelScale: function (zoom, latlng) {
		var p0 = this.projection.project(latlng),
		    latlngdx = this.projection.unproject(p0.add([10.0, 0.0])),
		    latlngdy = this.projection.unproject(p0.add([0.0, 10.0]));

		return 0.1 * Math.sqrt(Math.abs((
		                       latlngdx.lng - latlng.lng) *
		                       (latlngdy.lat - latlng.lat) -
		                       (latlngdy.lng - latlng.lng) *
		                       (latlngdx.lat - latlng.lat))) *
		                       Math.cos(latlng.lat * Math.PI / 180.0) /
		                       this.scale(zoom);
	},

	_readWCS: function (hdr) {
		var key = this._readFITSKey,
		    projparam = this.projparam,
		    v;
		if ((v = key('CTYPE1', hdr))) { this.ctype.x = v; }
		if ((v = key('CTYPE2', hdr))) { this.ctype.y = v; }
		if ((v = key('NAXIS1', hdr))) { projparam.naxis.x = this.naxis.x = parseInt(v, 10); }
		if ((v = key('NAXIS2', hdr))) { projparam.naxis.y = this.naxis.y = parseInt(v, 10); }
		if ((v = key('CRPIX1', hdr))) { projparam.crpix.x = parseFloat(v, 10); }
		if ((v = key('CRPIX2', hdr))) { projparam.crpix.y = parseFloat(v, 10); }
		if ((v = key('CRVAL1', hdr))) { projparam.crval.lng = parseFloat(v, 10); }
		if ((v = key('CRVAL2', hdr))) { projparam.crval.lat = parseFloat(v, 10); }
		if ((v = key('LONPOLE', hdr))) { projparam.natpole.lng = parseFloat(v, 10); }
		if ((v = key('LATPOLE', hdr))) { projparam.natpol.lat = parseFloat(v, 10); }
		if ((v = key('CD1_1', hdr))) { projparam.cd[0][0] = parseFloat(v, 10); }
		if ((v = key('CD1_2', hdr))) { projparam.cd[0][1] = parseFloat(v, 10); }
		if ((v = key('CD2_1', hdr))) { projparam.cd[1][0] = parseFloat(v, 10); }
		if ((v = key('CD2_2', hdr))) { projparam.cd[1][1] = parseFloat(v, 10); }
		for (var d = 0; d < 2; d++) {
			for (var j = 0; j < 20; j++) {
				if ((v = key('PV' + (d + 1) + '_' + j, hdr))) {
					projparam.pv[d][j] = parseFloat(v, 10);
				}
			}
		}
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
