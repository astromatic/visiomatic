/*
# L.Control.IIP.Plot manages plots related to IIP layers
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	Leaflet-IVV
#
#	Copyright: (C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#	                    Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		05/09/2013
*/

L.Draw.Line = L.Draw.Polyline.extend({
	_updateFinishHandler: function () {
		var markerCount = this._markers.length;
		// The last marker should have a click handler to close the polyline
		if (markerCount > 1) {
			this._markers[markerCount - 1].on('click', this._finishShape, this);
		}

		// Remove the old marker click handler (as only the last point should close the polyline)
		if (markerCount > 2) {
			this._markers[markerCount - 2].off('click', this._finishShape, this);
		}

		if (markerCount >= 2) {
			this._finishShape();
		}
	},

	_getMeasurementString: function () {
		var currentLatLng = this._currentLatLng,
		 previousLatLng = this._markers[this._markers.length - 1].getLatLng(),
		 distance, distanceStr, unit;

		// calculate the distance from the last fixed point to the mouse position
		distance = this._measurementRunningTotal + L.CRS.WCS.distance(currentLatLng, previousLatLng);

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
	}

});

L.Control.IIP.Plot = L.Control.IIP.extend({
	options: {
		title: 'Image adjustment',
		collapsed: true,
		position: 'topleft',
	},

	initialize: function (baseLayers,  options) {
		L.setOptions(this, options);
		this._className = 'leaflet-control-iipplot';
		this._layers = baseLayers;
	},

	_initDialog: function () {
		var className = this._className,
			dialog = this._dialog,
			layer = this._layer;
		this._profile = L.DomUtil.create('div', className + '-profile', dialog);
		var	profinput = document.createElement('input');
		profinput.className = 'leaflet-profile';
		profinput.type = 'button';
		profinput.layer = layer;
		this._profile.appendChild(profinput);
		L.DomEvent.on(profinput, 'click', this.getProfile, this);
	},

	getProfile: function (e) {
		L.drawLocal.draw.handlers.polyline.tooltip.cont = 'Click to end drawing line.';
		var drawline = new L.Draw.Line(this._map),
		 _this = this;

		this._map.on('draw:created', function (e) {
			var layer = e.layer;
			_this._map.addLayer(layer);
			drawline.removeHooks();
			console.log(layer._latlngs);
		}

		);
		drawline.addHooks();

		this._layer.requestURI(this._layer._url.replace(/\&.*$/g, '') +
			'&PFL=9:20,100-9000,2000',
			'getting IIP layer profile',
			this._parseProfile, this);
	},

	_parseProfile: function (plot, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var response = httpRequest.responseText;
			}
		}
	}
});

L.control.iip.plot = function (baseLayers, options) {
	return new L.Control.IIP.Plot(baseLayers, options);
};


