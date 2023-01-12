/**
 #	This file part of:	VisiOmatic
 * @file User Interface for taking snapshots of the current screen/image.

 * @requires util/VUtil
 * @requires control/UI.js

 * @copyright (c) 2015-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/
import {Util} from 'leaflet';

import {VUtil} from '../util';
import {UI} from './UI';


export const SnapshotUI = UI.extend( /** @lends SnapshotUI */ {
	options: {
		title: 'Snapshots',
		collapsed: true,
		position: 'topleft'
	},

	/**
	 * Create a VisiOmatic dialog for taking snapshots of the current
	 screen/image.

	 * @extends UI
	 * @memberof module:control/SnapshotUI.js
	 * @constructs
	 * @param {object} [options] - Options.

	 * @param {string} [options.title='Snapshots']
	   Title of the dialog window or panel.

	 * @see {@link UI} for additional control options.

	 * @returns {SnapshotUI} Instance of a VisiOmatic snapshot interface.
	 */
	initialize: function (options) {
		Util.setOptions(this, options);

		this._className = 'visiomatic-control';
		this._id = 'visiomatic-snapshot';
		this._sideClass = 'snapshot';
	},

	/**
	 * Initialize the snapshot dialog.
	 * @method
	 * @static
	 * @private
	 */
	_initDialog: function () {
		const _this = this,
			className = this._className,
			layer = this._layer,
			visio = layer.visio,
			map = this._map;

		// Image snapshot
		const	line = this._addDialogLine('Snap:', this._dialog),
			elem = this._addDialogElement(line),
			items = ['Screen pixels', 'Native pixels'];

		this._snapType = 0;
		this._snapSelect =  this._addSelectMenu(
			this._className + '-select',
			elem,
			items,
			undefined,
			this._snapType,
			'Select snapshot resolution',
			function () {
				this._snapType = parseInt(this._snapSelect.selectedIndex - 1, 10);
			}
		);

		const	hiddenlink = document.createElement('a');
		const	button = this._addButton(
			className + '-button',
			elem,
			'snapshot',
			'Take a snapshot of the displayed image',
			function (event) {
				const	latlng = map.getCenter(),
					bounds = map.getPixelBounds();
				let	z = map.getZoom();
				var	zfac;

				if (z > visio.maxZoom) {
					zfac = Math.pow(2, z - visio.maxZoom);
					z = visio.maxZoom;
				} else {
					zfac = 1;
				}

				const	sizex = visio.imageSize[z].x * zfac,
					sizey = visio.imageSize[z].y * zfac,
					dx = (bounds.max.x - bounds.min.x),
					dy = (bounds.max.y - bounds.min.y);

				hiddenlink.href = layer.getTileUrl(
					{x: 1, y: 1}
				).replace(
					/JTL\=\d+\,\d+/g,
					'RGN=' + bounds.min.x / sizex + ',' +
						bounds.min.y / sizey + ',' +
						dx / sizex + ',' + dy / sizey +
						'&WID=' + (this._snapType === 0 ?
						Math.floor(dx / zfac) :
						Math.floor(dx / zfac / layer.wcs.scale(z))) + '&CVT=jpeg'
				);
				hiddenlink.download = layer._title + '_' +
					VUtil.latLngToHMSDMS(latlng).replace(/[\s\:\.]/g, '') +
					'.jpg';
				hiddenlink.click();
			}
		);

		document.body.appendChild(hiddenlink);

		// Print snapshot
		const	line2 = this._addDialogLine('Print:', this._dialog);

		this._addButton(
			className + '-button',
			this._addDialogElement(line2),
			'print',
			'Print current map',
			function (event) {
				var	control = document.querySelector(
					'#map > .leaflet-control-container'
				);
				control.style.display = 'none';
				window.print();
				control.style.display = 'unset';
			}
		);
	}

});

/**
 * Instantiate a VisiOmatic dialog for taking snapshots.
 * @function
 * @param {object} [options] - Options: see {@link SnapshotUI}
 * @returns {SnapshotUI} Instance of a VisiOmatic snapshot interface.
 */
export const snapshotUI = function (options) {
	return new SnapshotUI(options);
};

