/*
# L.Control.IIP.Plot manages plots related to IIP layers
# (see http://iipimage.sourceforge.net/documentation/protocol/)
#
#	This file part of:	Leaflet-IVV
#
#	Copyright: (C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#	                    Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		19/11/2013
*/

if (typeof require !== 'undefined') {
	var d3 = require('d3');
}

L.Draw.Line = L.Draw.Polyline.extend({

	_onClick: function (e) {
		L.Draw.Polyline.prototype._onClick.call(this, e);
		if (this._markers.length === 2) {
			this._finishShape();
		}
	},

	_getMeasurementString: function () {
		var currentLatLng = this._currentLatLng,
		 previousLatLng = this._markers[this._markers.length - 1].getLatLng(),
		 distance, distanceStr, unit;

		// calculate the distance from the last fixed point to the mouse position
		distance = this._measurementRunningTotal + L.IIPUtils.distance(currentLatLng, previousLatLng);

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
		title: 'Image plots',
		collapsed: true,
		position: 'topleft',
	},

	initialize: function (baseLayers,  options) {
		L.setOptions(this, options);
		this._className = 'leaflet-control-iip';
		this._id = 'leaflet-iipplot';
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
			var layer = e.layer,
			 popdiv = document.createElement('div');
			layer.addTo(_this._map);
			drawline.removeHooks();
			popdiv.id = 'leaflet-profile-plot';
			var activity = document.createElement('div');
			activity.className = 'leaflet-control-activity';
			popdiv.appendChild(activity);
			layer.bindPopup(popdiv,
			 {minWidth: 16, maxWidth: 1024}).openPopup();
			var zoom = _this._map.options.crs.options.nzoom - 1,
			 point1 = _this._map.project(layer._latlngs[0], zoom),
			 point2 = _this._map.project(layer._latlngs[1], zoom);
			L.IIPUtils.requestURI(_this._layer._url.replace(/\&.*$/g, '') +
			'&PFL=' + zoom.toString() + ':' + point1.x.toFixed(0) + ',' +
			 point1.y.toFixed(0) + '-' + point2.x.toFixed(0) + ',' +
			 point2.y.toFixed(0),
			'getting IIP layer profile',
			_this._plotProfile, layer);
		});
		drawline.addHooks();
	},

	_plotProfile: function (layer, httpRequest) {
		if (httpRequest.readyState === 4) {
			if (httpRequest.status === 200) {
				var json = JSON.parse(httpRequest.responseText),
				 yprof = json.profile,
				 xprof = d3.range(yprof.length),
				 prof = d3.zip(xprof, yprof);

				var popdiv = document.getElementById('leaflet-profile-plot'),
				 style = popdiv.style;
				popdiv.removeChild(popdiv.childNodes[0]);
				var layercontrol = layer._map._catalogLayerControl;
				if (layercontrol) {
					layercontrol.addOverlay(layer, 'Image profile');
				}
				style.left = '20%';
				style.bottom = '20%';
				style.width = 640;
				style.height = 480;
				style.backgroundColor = 'white';

				var margin = {top: 20, right: 10, bottom: 30, left: 50},
				 width = 640 - margin.left - margin.right,
				 height = 480 - margin.top - margin.bottom,
				 sx = d3.scale.linear().range([0, width]),
				 sy = d3.scale.linear().range([height, 0]),
				 xAxis = d3.svg.axis().scale(sx).orient('bottom'),
				 yAxis = d3.svg.axis().scale(sy).orient('left'),
				 line = d3.svg.line()
					.x(function (d, i) { return sx(xprof[i]); })
					.y(function (d) { return sy(d); }),
				 svg = d3.select('#leaflet-profile-plot').append('svg')
					.attr('width', width + margin.left + margin.right)
					.attr('height', height + margin.top + margin.bottom)
					.append('g')
					.attr('transform',
						'translate(' + margin.left + ',' + margin.top + ')');
				sx.domain(d3.extent(xprof));
				sy.domain(d3.extent(yprof));
				svg.append('g')
					.attr('class', 'x axis')
					.attr('transform', 'translate(0,' + height + ')')
					.call(xAxis)
					.append('text')
					.text('Pixels');

				svg.append('g')
					.attr('class', 'y axis')
					.call(yAxis)
					.append('text')
					.attr('transform', 'rotate(-90)')
					.attr('y', 6)
					.attr('dy', '.71em')
					.style('text-anchor', 'end')
					.text('Pixel value (ADU)');

				svg.append('path')
					.datum(yprof)
					.attr('class', 'line')
					.attr('d', line);
				layer._popup.update();	// TODO: avoid private method
			}
		}
	}
});

L.control.iip.plot = function (baseLayers, options) {
	return new L.Control.IIP.Plot(baseLayers, options);
};


