/*
# L.IIPUtils contains general utility methods
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014,2016 Emmanuel Bertin - IAP/CNRS/UPMC,
#	                         Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 08/09/2016
*/
L.IIPUtils = {
// Definitions for RegExp
	REG_PDEC: '(\\d+\\.\\d*)',
	REG_FLOAT: '([-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?)',

// Ajax call to server
	requestURL: function (url, purpose, action, context, timeout) {
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
		if (timeout) {
			httpRequest.timeout = timeout * 1000;	// seconds -> milliseconds
			httpRequest.ontimeout = function () {
				alert('Time out while ' + purpose);
			};
		}
		httpRequest.open('GET', url);
		httpRequest.withCredentials = true;
		httpRequest.onreadystatechange = function () {
			action(context, httpRequest);
		};
		httpRequest.send();
	},

	// Return a dictionary of name/value pairs from a URL string, from
	// http://stevenbenner.com/2010/03/javascript-regex-trick-parse-a-query-string-into-an-object/
	parseURL: function (url) {
		var dict = {};
		url.replace(
			new RegExp('([^?=&]+)(=([^&]*))?', 'g'),
			function ($0, $1, $2, $3) { dict[$1] = $3; }
		);
		return dict;
	},

	// Return a URL with an updated keyword/value queryString(from http://stackoverflow.com/a/5999118)
	updateURL: function (url, keyword, value) {
		var re = new RegExp('([?&])' + keyword + '=.*?(&|$)', 'i'),
			separator = url.indexOf('?') !== -1 ? '&' : '?';

		return url.match(re) ? url.replace(re, '$1' + keyword + '=' + value + '$2') :
		  url + separator + keyword + '=' + value;
	},

	// Return the domain of a given URL (from http://stackoverflow.com/a/28054735)
	checkDomain: function (url) {
		if (url.indexOf('//') === 0) {
			url = location.protocol + url;
		}
		return url.toLowerCase().replace(/([a-z])?:\/\//, '$1').split('/')[0];
	},

	// Check if a given URL is external (from http://stackoverflow.com/a/28054735)
	isExternal: function (url) {
		return ((url.indexOf(':') > -1 || url.indexOf('//') > -1) &&
			this.checkDomain(location.href) !== this.checkDomain(url));
	},

	// Copy string to clipboard (from http://stackoverflow.com/a/33928558)
	// Chrome 43+, Firefox 42+, Edge and Safari 10+ supported
	copyToClipboard: function (text) {
		if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
			var textarea = document.createElement('textarea');
			textarea.textContent = text;
			textarea.style.position = 'fixed';  // Prevent scrolling to bottom of page in MS Edge.
			document.body.appendChild(textarea);
			textarea.select();
			try {
				return document.execCommand('copy');  // Security exception may be thrown by some browsers.
			} catch (ex) {
				console.warn('Copy to clipboard failed.', ex);
				return false;
			} finally {
				document.body.removeChild(textarea);
			}
		}
	},

	// Add a short (<400ms) "flash" animation to an element
	flashElement: function (elem) {
		L.DomUtil.addClass(elem, 'leaflet-control-flash');
		setTimeout(function () {
			L.DomUtil.removeClass(elem, 'leaflet-control-flash');
		}, 400);

	},

	// Read content of a FITS header keyword
	readFITSKey: function (keyword, str) {
		var key = keyword.trim().toUpperCase().substr(0, 8),
			nspace = 8 - key.length,
			keyreg = new RegExp(key + (nspace > 0 ? '\\ {' + nspace.toString() + '}' : '') +
			 '=\\ *(?:\'((?:\\ *[^\'\\ ]+)*)\\ *\'|([-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?))'),
			match = keyreg.exec(str);
		if (!match) {
			return null;
		} else if (match[1]) {
			return match[1];
		} else {
			return match[2];
		}
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

