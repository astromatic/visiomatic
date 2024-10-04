/**
 #	This file part of:	VisiOmatic
 * @file Catch browser tab or window closure event.

 * @copyright (c) 2024 CFHT/CNRS/SorbonneU/CEA/UParisSaclay
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/

/**
 * Catch browser tab or window closure event to trigger server kill
 * @memberof @memberof module:control/exit.js
*/

import {DomEvent} from 'leaflet';

export const installExit = function (url) {
	DomEvent.on(window, 'beforeunload', (e) => {
		e.preventDefault();
		e.returnValue = '';
		fetch(url + 'kill', {method: 'GET'});
	});
};

