/**
 #	This file part of:	VisiOmatic
 * @file Miscellaneous utilities

 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
 */
import {
	DomUtil,
	latLng
} from 'leaflet';


export const VUtil = {
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

		// Send Credrentials
		if ((context) && (context.options.credentials)) {
			httpRequest.withCredentials = true;

		}

		// if request catalog need authenticate
		if ((context) && (context.options.authenticate === 'csrftoken')) {
			httpRequest.setRequestHeader('X-CSRFToken', this.getCookie('csrftoken'));
		}

		if ((action)) {
			httpRequest.onreadystatechange = function () {
				action(context, httpRequest);
			};
		}
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
		DomUtil.addClass(elem, 'leaflet-control-flash');
		setTimeout(function () {
			DomUtil.removeClass(elem, 'leaflet-control-flash');
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
	},

	// Convert degrees to HMSDMS (DMS code from the Leaflet-Coordinates plug-in)
	latLngToHMSDMS : function (latlng) {
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
		var str = (h < 10 ? '0' : '') + h.toString() + ':' + (m < 10 ? '0' : '') + m.toString() +
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

	// Convert HMSDMS to degrees
	hmsDMSToLatLng: function (str) {
		var result;

		result = /^\s*(\d+)[h:](\d+)[m':](\d+\.?\d*)[s"]?\s*,?\s*([-+]?)(\d+)[d°:](\d+)[m':](\d+\.?\d*)[s"]?/g.exec(str);
		if (result && result.length >= 8) {
			var	sgn = Number(result[4] + '1');

			return latLng(sgn *
			    (Number(result[5]) + Number(result[6]) / 60.0 + Number(result[7]) / 3600.0),
			    Number(result[1]) * 15.0 + Number(result[2]) / 4.0 + Number(result[3]) / 240.0);
		} else {
			return undefined;
		}
	},


	// returns the value of a specified cookie (from http://www.w3schools.com/js/js_cookies.asp)
	getCookie: function (cname) {
	    var name = cname + '=';
	    var ca = document.cookie.split(';');
	    for (var i = 0; i < ca.length; i++) {
	        var c = ca[i];
	        while (c.charAt(0) === ' ') {
	            c = c.substring(1);
	        }
	        if (c.indexOf(name) === 0) {
	            return c.substring(name.length, c.length);
	        }
	    }
	    return '';
	}

};

