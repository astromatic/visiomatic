/*
# L.WCS emulates the FITS WCS (World Coordinate System) popular among
# the astronomical community (see http://www.atnf.csiro.au/people/mcalabre/WCS/)
#
#	This file part of:	Leaflet-IVV
#
#	Copyright: (C) 2013-2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                          Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 13/01/2014
*/

L.CRS.WCS = L.extend({}, L.CRS, {
	code: 'WCS',

	options: {
		ctype: {x: 'RA--TAN', y: 'DEC--TAN'},
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
		this.projection = options.projection;
		this.ctype = options.ctype;
		this.naxis = L.point(options.naxis, true);

		this.projparam = new this.paraminit(options);
		if (hdr) {
			this._readWCS(hdr);
		}

		switch (this.ctype.x.substr(5, 3)) {
		case 'ZEA':
			this.projection = new L.Projection.WCS.ZEA();
			break;
		case 'TAN':
			this.projection = new L.Projection.WCS.TAN();
			break;
		default:
			this.projection = new L.Projection.WCS.TAN();
			break;
		}
		this.transformation = new L.Transformation(1, -0.5, -1, this.naxis.y + 0.5);
		this.projection.paraminit(this.projparam);
		this.code += ':' + this.projection.code;
	},

	paraminit: function (options) {
		this.crpix = L.point(options.crpix);
		this.crval = L.latLng(options.crval);
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
