/**
 #	This file part of:	VisiOmatic
 * @file TGSS catalog.

 * @requires catalog/Catalog.js
 * @requires vector/Ellipse.js
 *
 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/
import {extend} from 'leaflet'

import {Catalog} from './Catalog';
import {ellipse} from '../vector';


/**
 * @namespace TGSS
 * @summary TGSS catalog.
 * @extends Catalog
*/
export const TGSS = extend({}, Catalog, {
	service: 'Vizier@CDS',
	name: 'TGSS',
	className: 'logo-catalog-vizier',
	attribution: 'The GMRT 150 MHz all-sky radio survey. TGSS ADR1 (Intema et al. 2017)',
	color: 'blue',
	maglim: 30.0,
	regionType: 'box',
	url: Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=J/A%2bA/598/A78/table3&' +
	 '-out=TGSSADR,RAJ2000,DEJ2000,Stotal,Maj,Min,PA&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=-Stotal',
	properties: ['F<sub>peak</sub>(150MHz)', 'Major axis FWHM', 'Minor axis FWHM', 'Position angle'],
	units: ['mJy', '&#8243;', '&#8243;', '&#176;'],
	objurl: Catalog.vizierURL + '/VizieR-3?-source=-source=J/A%2bA/598/A78/table3&-c={ra},{dec},eq=J2000&-c.rs=0.2',
	draw: function (feature, latlng) {
		return ellipse(latlng, {
			majAxis: feature.properties.items[1] / 7200.0,
			minAxis: feature.properties.items[2] / 7200.0,
			posAngle: feature.properties.items[3] === '--' ? 0.0 : feature.properties.items[3]
		});
	}
});

