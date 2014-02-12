/*
# L.IIPUtils contains general utility methods
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#	                    Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 10/02/2014
*/
L.IIPUtils = {
// Definitions for RegExp
	REG_PDEC: '(\\d+\\.\\d*)',
	REG_FLOAT: '([-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?)',

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

// Return the distance between two world coords latLng1 and latLng2 in degrees
	distance: function (latlng1, latlng2) {
		var d2r = Math.PI / 180.0,
		 lat1 = latlng1.lat * d2r,
		 lat2 = latlng2.lat * d2r,
		 dLat = lat2 - lat1,
		 dLon = (latlng2.lng - latlng1.lng) * d2r,
		 sin1 = Math.sin(dLat / 2),
		 sin2 = Math.sin(dLon / 2);

		var a = sin1 * sin1 + sin2 * sin2 * Math.cos(lat1) * Math.cos(lat2);

		return Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 360.0 / Math.PI;
	}

};

