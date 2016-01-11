/*
# L.Control.IIP.image adjusts the basic rendering options of an IIP layer
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	VisiOmatic
#
#	Copyright:		(C) 2014,2015 Emmanuel Bertin - IAP/CNRS/UPMC,
#				                      Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		15/12/2015
*/

if (typeof require !== 'undefined') {
	var $ = require('jquery');
}

L.Control.IIP.Image = L.Control.IIP.extend({
	options: {
		title: 'Image preferences',
		collapsed: true,
		position: 'topleft'
	},

	initialize: function (options) {
		L.setOptions(this, options);

		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipimage';
		this._sideClass = 'image';
	},

	_initDialog: function () {
		var _this = this,
			className = this._className,
			layer = this._layer,
			elem;

		// Invert
		this._addSwitchInput(layer, this._dialog, 'Invert:', 'iipInvertCMap',
		  'Invert color map(s)', 'leaflet-invertCMap', layer.iipInvertCMap);

		// Contrast
		this._addNumericalInput(layer, this._dialog, 'Contrast:', 'iipContrast',
		  'Adjust Contrast. 1.0: normal.', 'leaflet-contrastValue',
		  layer.iipContrast, 0.05, 0.0, 10.0);

		// Colour saturation
		this._addNumericalInput(layer, this._dialog, 'Color Sat.:', 'iipColorSat',
		  'Adjust Color Saturation. 0: B&W, 1.0: normal.', 'leaflet-colorsatvalue',
		  layer.iipColorSat, 0.05, 0.0, 5.0, this._updateMix);

		// Gamma
		this._addNumericalInput(layer, this._dialog,  'Gamma:', 'iipGamma',
		  'Adjust Gamma correction. The standard value is 2.2.',
		  'leaflet-gammavalue', layer.iipGamma, 0.05, 0.5, 5.0);

		// JPEG quality
		this._addNumericalInput(layer, this._dialog,  'JPEG quality:', 'iipQuality',
		  'Adjust JPEG compression quality. 1: lowest, 100: highest',
		  'leaflet-qualvalue', layer.iipQuality, 1, 1, 100);
	},

	_updateMix: function (layer) {
		var nchannel = layer.iipNChannel;
		for (var c = 0; c < nchannel; c++) {
			layer.rgbToMix(c);
		}
		return;
	}

});

L.control.iip.image = function (options) {
	return new L.Control.IIP.Image(options);
};

