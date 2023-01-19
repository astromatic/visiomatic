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

	_projInit: function () {
		const	projparam = this.projparam;

		// Center on image
		if (!options.crval) {
			projparam.crval = latLng(
				(projparam.naxis.y + 1.0) / 2.0,
				(projparam.naxis.x + 1.0) / 2.0
			);
		}
		projparam._cdinv = this._invertCD(projparam.cd);
		projparam._cpole = projparam.crval;
		this.bounds = bounds(
			[0.5, this.projparam.naxis.y - 0.5],
			[this.projparam.naxis.x - 0.5, 0.5]
		);
		projparam._pixelFlag = true;
		projparam._infinite = false;
	},

	project: function (latlng) {
		return point(latlng.lng, latlng.lat);
	},

	unproject: function (point) {
		return latLng(point.y, point.x);
	}
});

