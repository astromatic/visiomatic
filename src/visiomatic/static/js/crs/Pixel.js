/*
# 	Pixel (de-)projection.
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU,
#                            Chiara Marmo    - Paris-Saclay
*/
import {bounds, latLng, point} from 'leaflet';

import {Projection} from './Projection';


export const Pixel = Projection.extend({
	code: 'PIX',

	_paramInit: function (projparam) {
		this.projparam = projparam;
		projparam.cdinv = this._invertCD(projparam.cd);
		projparam.cpole = projparam.crval;
		this.bounds = bounds([0.5, this.projparam.naxis.y - 0.5], [this.projparam.naxis.x - 0.5, 0.5]);
	},

	project: function (latlng) {
		return point(latlng.lng, latlng.lat);
	},

	unproject: function (point) {
		return latLng(point.y, point.x);
	}
});
