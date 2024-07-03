/**
 #	This file part of:	VisiOmatic
 * @file User Interface for taking snapshots of the current screen/image.

 * @requires util/VUtil.js
 * @requires control/UI.js

 * @copyright (c) 2015-2024 CNRS/IAP/CFHT/SorbonneU/CEA/UParisSaclay
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/
import html2canvas from 'html2canvas';

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
		const	className = this._className,
			layer = this._layer,
			visio = layer.visio,
			map = this._map;

		// Image snapshot
		const	line = this._addDialogLine('Image:', this._dialog),
			elem = this._addDialogElement(line),
			items = ['current', 'native'];

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

		// Set up a hidden link and trigger download using the HTML5 attribute.
		const	hiddenlink = document.createElement('a'),
			elem2 = this._addDialogElement(line),
			button = this._addButton(
				className + '-button',
				elem2,
				'snapimage',
				'Snap the image within the current frame',
				function (event) {
					const	latlng = map.getCenter(),
						bounds = map.getPixelBounds(),
						wcs = map.options.crs,
						z = map.getZoom(),
						binfac = Math.pow(2, visio.maxZoom - z),
						bin = binfac > 1 ? binfac : 1;
					fetch(
						layer.getTileSettingsURL() + '&RGN=' +
						(binfac * bounds.min.x).toFixed(0) + ',' +
						(binfac * bounds.min.y).toFixed(0) + ':' +
						(binfac * bounds.max.x).toFixed(0) + ',' +
						(binfac * bounds.max.y).toFixed(0) +
						'&BIN=' + (this._snapType ? 1 : bin.toFixed(0))
					).then((res) => res.status === 200 ?
						res.blob() : Promise.reject(res)
					).then((blob) => {
						hiddenlink.href = window.URL.createObjectURL(
							new Blob([blob], {type: "image/jpg"})
						);
						hiddenlink.download = visio.imageName.replace(
							/(\.fits)|(\.fit)|(\.fz)/g,
							''
						) + '_' + wcs.latLngToHMSDMS(latlng).replace(
							/[\s\:\.]/g,
							'') + '.jpg';
						hiddenlink.click();
					}).catch(async (res) => {
						const	json = await res.json();
						alert('Error ' + res.status + ': ' +
							json.detail[0].msg + '.');
					});
				}
			);

		document.body.appendChild(hiddenlink);

		// Screen snapshot
		const	line2 = this._addDialogLine('Screen:', this._dialog),
			elem3 = this._addDialogElement(line2);

		this._addButton(
			className + '-button',
			elem3,
			'printscreen',
			'Print current screen',
			function (event) {
				var	control = document.querySelector(
					'#map > .leaflet-control-container'
				);
				control.style.display = 'none';
				window.print();
				control.style.display = 'unset';
			}
		);

		// Set up a hidden link and trigger download using the HTML5 attribute
		// and an output element for the screenshot.
		const	hiddenlink2 = document.createElement('a'),
			canvasoutput = document.createElement('div');

		this._addButton(
			className + '-button',
			elem3,
			'snapscreen',
			'Snap current screen',
			function (event) {
				var	control = document.querySelector(
					'#map > .leaflet-control-container'
				);
				control.style.display = 'none';
				html2canvas(document.querySelector('#map')).then(
					function (canvas) {
						const	latlng = map.getCenter(),
							wcs = map.options.crs;
						hiddenlink2.href = canvas.toDataURL();
						hiddenlink2.download = visio.imageName.replace(
							/(\.fits)|(\.fit)|(\.fz)/g, ''
						) + '_' + wcs.latLngToHMSDMS(latlng).replace(
							/[\s\:\.]/g, '') +'.jpg';
						hiddenlink2.click();
					}
				);
				control.style.display = 'unset';
			}
		);

		document.body.appendChild(hiddenlink2);
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

