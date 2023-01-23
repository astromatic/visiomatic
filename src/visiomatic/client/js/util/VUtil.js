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

// Callback definitions
/**
 * Callback for Ajax queries.
 * @callback VUtil~queryCallback
 * @param {object} context
   Context (this).
 * @param {object} httpRequest
   XMLHttpRequest object.
 */

/**
 @namespace VUtil
 */
export const VUtil = {
	// Definitions for RegExp
	REG_PDEC: '(\\d+\\.\\d*)',
	REG_FLOAT: '([-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?)',

	/**
	 * Do an AJAX query to a server.
	 * @param {string} url
	   Server URL.
	 * @param {string} purpose
	   Purpose of the query (for error messages).
	 * @param {VUtil~queryCallback} action
	   Callback function for successful queries.
	 * @param {object} context
	   Context (this).
	 * @param {number} timeout
	   Query timeout in seconds.
	 */
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

	/**
	 * Return a dictionary of keyword/value pairs from a URL string.
	 * @see {@link https://stevenbenner.com/2010/03/javascript-regex-trick-parse-a-query-string-into-an-object}
	 * @param {string} url
	   URL.
	 * @return {Object.<string, string>}
	   Dictionary of keyword/value pairs.
	 */
	parseURL: function (url) {
		const	dict = {};
		url.replace(
			new RegExp('([^?=&]+)(=([^&]*))?', 'g'),
			function ($0, $1, $2, $3) { dict[$1] = $3; }
		);
		return dict;
	},

	/**
	 * Return a URL with a new or updated keyword/value query string.
	 * @see {@link https://stackoverflow.com/a/5999118}
	 * @param {string} url
	   Input URL.
	 * @param {string} keyword
	   keyword.
	 * @param {number|string} value
	   value.
	 * @return {string}
	   Updated URL.
	 */
	updateURL: function (url, keyword, value) {
		const	re = new RegExp('([?&])' + keyword + '=.*?(&|$)', 'i'),
			separator = url.indexOf('?') !== -1 ? '&' : '?';

		return url.match(re) ? url.replace(re, '$1' + keyword + '=' + value +
			'$2') : url + separator + keyword + '=' + value;
	},

	/**
	 * Return the domain of a given URL.
	 * @see {@link https://stackoverflow.com/a/28054735}
	 * @param {string} url
	   Input URL.
	 * @return {string}
	   URL domain.
	 */
	checkDomain: function (url) {
		if (url.indexOf('//') === 0) {
			url = location.protocol + url;
		}
		return url.toLowerCase().replace(/([a-z])?:\/\//, '$1').split('/')[0];
	},

	/**
	 * Check if a given URL is external.
	 * @see {@link https://stackoverflow.com/a/28054735}
	 * @param {string} url
	   Input URL.
	 * @return {boolean}
	   `true` if the input URL is external, `false` otherwise.
	 */
	isExternal: function (url) {
		return ((url.indexOf(':') > -1 || url.indexOf('//') > -1) &&
			this.checkDomain(location.href) !== this.checkDomain(url));
	},

	/**
	 * Return the value of the cookie with the given name.
	 * @see {@link https://www.w3schools.com/js/js_cookies.asp}
	 * @param {string} cname
	   Cookie name.
	 * @return {string}
	   Cookie string.
	 */
	getCookie: function (cname) {
		const	name = cname + '=',
			ca = document.cookie.split(';');

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
	},

	/**
	 * Copy the input string to the clipboard. 
	 * @see {@link https://stackoverflow.com/a/33928558}
	 * @param {string} text
	   Input string.
	 * @return {boolean}
	  `false` if copy failed.
	 */
	copyToClipboard: function (text) {
		if (document.queryCommandSupported &&
			document.queryCommandSupported('copy')) {
			const	textarea = document.createElement('textarea');
			textarea.textContent = text;
			// Prevent scrolling to bottom of page in MS Edge.
			textarea.style.position = 'fixed';
			document.body.appendChild(textarea);
			textarea.select();
			try {
				// Security exception may be thrown by some browsers.
				return document.execCommand('copy');
			} catch (ex) {
				console.warn('Copy to clipboard failed.', ex);
				return false;
			} finally {
				document.body.removeChild(textarea);
			}
		}
	},

	/**
	 * Add a short (<400ms) "flash" animation to an element.
	 * @param {object} elem
	   Element to be "flashed".
	 */
	flashElement: function (elem) {
		DomUtil.addClass(elem, 'leaflet-control-flash');
		setTimeout(function () {
			DomUtil.removeClass(elem, 'leaflet-control-flash');
		}, 400);

	},

	/**
	 * Read the value of a FITS header keyword.
	 * @param {string} keyword
	   Keyword.
	 * @param {string} str
	   Input string.
	 * @return {?string}
	   Keyword value string, or `null` if keyword could not be matched.
	 */
	readFITSKey: function (keyword, str) {
		const	key = keyword.trim().toUpperCase().substr(0, 8),
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
	}

};

