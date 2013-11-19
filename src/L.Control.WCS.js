/*
# L.Control.WCS Manage coordinate display and input
#
#	This file part of:	Leaflet-IVV
#
#	Copyright: (C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		19/11/2013
*/
L.Control.WCS = L.Control.extend({
	options: {
		position: 'bottomleft',
		units: 'HMS'
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

		// Create coordinate input/display box
		var input = this._wcsinput = L.DomUtil.create('input', 'leaflet-control-wcs');
		L.DomEvent.disableClickPropagation(input);
		input.type = 'text';
		// Speech recognition on WebKit engine
		if ('webkitSpeechRecognition' in window) {
			input.setAttribute('x-webkit-speech', 'x-webkit-speech');
		}

		map.on('drag', this._onDrag, this);
		L.DomEvent.on(input, 'change', this._onInputChange, this);

		return this._wcsinput;
	},

	onRemove: function (map) {
		map.off('drag', this._onDrag);
	},

	_onDrag: function (e) {
		var latlng = this._map.getCenter();
		if (this.options.units === 'HMS') {
			this._wcsinput.value = this._latLngToHMSDMS(latlng);
		} else {
			this._wcsinput.value = latlng.lng.toFixed(5) + ' , ' + latlng.lat.toFixed(5);
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
		var re = /^(\d+\.?\d*)\s*,?\s*\+?(-?\d+\.?\d*)/g,
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
					_this._wcsinput.value = result[0];
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
