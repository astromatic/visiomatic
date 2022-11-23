/*
# L.Control.IIP.snapshot offers several options to take snapshots of the current image/field
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#	                         Chiara Marmo    - Paris-Saclay
*/
import L from 'leaflet';

if (typeof require !== 'undefined') {
	var $ = require('jquery'),
		html2canvas = require('html2canvas');
}

L.Control.IIP.Snapshot = L.Control.IIP.extend({
	options: {
		title: 'Field snapshot',
		collapsed: true,
		position: 'topleft'
	},

	initialize: function (options) {
		L.setOptions(this, options);

		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipsnapshot';
		this._sideClass = 'snapshot';
	},

	_initDialog: function () {
		var _this = this,
			className = this._className,
			layer = this._layer,
			map = this._map;

		// Image snapshot
		var	line = this._addDialogLine('Snap:', this._dialog),
			elem = this._addDialogElement(line),
			items = ['Screen pixels', 'Native pixels'];

		this._snapType = 0;
		this._snapSelect =  this._createSelectMenu(
			this._className + '-select',
			elem,
			items,
			undefined,
			this._snapType,
			function () {
				this._snapType = parseInt(this._snapSelect.selectedIndex - 1, 10);
			},
			'Select snapshot resolution'
		);

		var	hiddenlink = document.createElement('a'),
			button = this._createButton(className + '-button', elem, 'snapshot',
			  function (event) {
				var	latlng = map.getCenter(),
					bounds = map.getPixelBounds(),
					z = map.getZoom(),
					zfac;

				if (z > layer.iipMaxZoom) {
					zfac = Math.pow(2, z - layer.iipMaxZoom);
					z = layer.iipMaxZoom;
				} else {
					zfac = 1;
				}

				var	sizex = layer.iipImageSize[z].x * zfac,
					sizey = layer.iipImageSize[z].y * zfac,
					dx = (bounds.max.x - bounds.min.x),
					dy = (bounds.max.y - bounds.min.y);

				hiddenlink.href = layer.getTileUrl({x: 1, y: 1}
				  ).replace(/JTL\=\d+\,\d+/g,
				  'RGN=' + bounds.min.x / sizex + ',' +
				  bounds.min.y / sizey + ',' +
				  dx / sizex + ',' + dy / sizey +
				  '&WID=' + (this._snapType === 0 ?
				    Math.floor(dx / zfac) :
				    Math.floor(dx / zfac / layer.wcs.scale(z))) + '&CVT=jpeg');
				hiddenlink.download = layer._title + '_' +
				  L.IIPUtils.latLngToHMSDMS(latlng).replace(/[\s\:\.]/g, '') +
				  '.jpg';
				hiddenlink.click();
			}, 'Take a snapshot of the displayed image');

		document.body.appendChild(hiddenlink);

		line = this._addDialogLine('Print:', this._dialog);
		elem = this._addDialogElement(line);
		button = this._createButton(className + '-button', elem, 'print',
			function (event) {
				var	control = document.querySelector('#map > .leaflet-control-container');
				control.style.display = 'none';
				window.print();
				control.style.display = 'unset';
			}, 'Print current map');
	}

});

L.control.iip.snapshot = function (options) {
	return new L.Control.IIP.Snapshot(options);
};

