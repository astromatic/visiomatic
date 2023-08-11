/**
 #	This file part of:	VisiOmatic
 * @file Add a VisiOmatic logo to the map.

 * @copyright (c) 2013-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/
import {Control, Map} from 'leaflet';


/**
 * Remove this ugly Pipe sign.
 * @memberof leaflet.Control.Attribution
 * @mixin
*/
Control.Attribution.include({
	_update: function () {
		if (!this._map) { return; }

		const	attribs = [];

		for (var i in this._attributions) {
			if (this._attributions[i]) {
				attribs.push(i);
			}
		}

		const	prefixAndAttribs = [];

		if (this.options.prefix) {
			prefixAndAttribs.push(this.options.prefix);
		}
		if (attribs.length) {
			prefixAndAttribs.push(attribs.join(', '));
		}

		this._container.innerHTML = prefixAndAttribs.join(' &#169; ');
	}
});

/**
 * Add a hook to set the attribution prefix to a series of clickable logos.
 * @method
 * @static
 * @memberof leaflet.Map
 */
Map.addInitHook(function () {
	if (this.options.visiomaticLogo !== false &&
	 this.options.attributionControl) {
		this.attributionControl.setPrefix(
			'<a id="logo-visiomatic" class="leaflet-control-attribution-logo "' +
			 'href="http://visiomatic.org" target="_blank">&nbsp;</a>'
		);
	}
});

