/*
# L.IIPUtils contains general utility methods
#
#	This file part of:	Leaflet-IVV
#
#	Copyright: (C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#	                    Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		11/11/2013
*/
L.IIPUtils = {
// Ajax call to server
	requestURI: function (uri, purpose, action, context) {
		var	httpRequest;

		if (window.XMLHttpRequest) { // Mozilla, Safari, ...
			httpRequest = new XMLHttpRequest();
		} else if (window.ActiveXObject) { // IE
			try {
				httpRequest = new ActiveXObject('Msxml2.XMLHTTP');
			}
			catch (e) {
				try {
					httpRequest = new ActiveXObject('Microsoft.XMLHTTP');
				}
				catch (e) {}
			}
		}
		if (!httpRequest) {
			alert('Giving up: Cannot create an XMLHTTP instance for ' + purpose);
			return false;
		}
		httpRequest.open('GET', uri);
		httpRequest.onreadystatechange = function () {
			action(context, httpRequest);
		};
		httpRequest.send();
	},

// Distance between two world coordinates p1 and p2 in degrees
	distance: function (p1, p2) {

		var d2r = L.LatLng.DEG_TO_RAD,
		 lat1 = p1.lat * d2r,
		 lat2 = p2.lat * d2r,
		 dLat = lat2 - lat1,
		 dLon = (p2.lng - p1.lng) * d2r,
		 sin1 = Math.sin(dLat / 2),
		 sin2 = Math.sin(dLon / 2);

		var a = sin1 * sin1 + sin2 * sin2 * Math.cos(lat1) * Math.cos(lat2);

		return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * L.LatLng.RAD_TO_DEG;
	},

};

