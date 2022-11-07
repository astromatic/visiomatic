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
			 'href="http://visiomatic.org">&nbsp;</a>'
		);
	}
});


