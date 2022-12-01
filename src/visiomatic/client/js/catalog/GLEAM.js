/*
#	GLEAM catalog.
#
#	This file part of:       VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU
*/
import {extend} from 'leaflet';

import {Catalog} from './Catalog';
import {ellipse} from '../vector';


export const GLEAM = extend({}, Catalog, {
	service: 'Vizier@CDS',
	name: 'GLEAM',
	className: 'logo-catalog-vizier',
	attribution: 'GaLactic and Extragalactic All-sky Murchison Wide Field Array (GLEAM)' +
	    ' low-frequency extragalactic catalogue (Hurley-Walker et al. 2017)',
	color: 'blue',
	maglim: 30.0,
	regionType: 'box',
	url: Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=VIII/100/gleamegc&' +
	 '-out=GLEAM,RAJ2000,DEJ2000,Fintwide,awide,bwide,pawide&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=-Fintwide',
	properties: ['F<sub>int</sub>(170-231MHz)', 'Major axis FWHM', 'Minor axis FWHM', 'Position angle'],
	units: ['Jy', '&#8243;', '&#8243;', '&#176;'],
	objurl: Catalog.vizierURL + '/VizieR-5?-source=-source=VIII/100/gleamegc&-c={ra},{dec},eq=J2000&-c.rs=0.2',
	draw: function (feature, latlng) {
		return ellipse(latlng, {
			majAxis: feature.properties.items[1] / 3600.0,
			minAxis: feature.properties.items[2] / 3600.0,
			posAngle: feature.properties.items[3] === '--' ? 0.0 : feature.properties.items[3]
		});
	}
});

