/*
#	2MASS catalog.
#
#	This file part of:       VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU
*/
import {extend} from 'leaflet';

import {Catalog} from './Catalog';


export const TwoMASS = extend({}, Catalog, {
	service: 'Vizier@CDS',
	name: '2MASS',
	className: 'logo-catalog-vizier',
	attribution: '2MASS All-Sky Catalog of Point Sources (Cutri et al. 2003)',
	color: 'red',
	maglim: 17.0,
	regionType: 'box',
	url: Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=II/246&' +
	 '-out=2MASS,RAJ2000,DEJ2000,Jmag,Hmag,Kmag&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&' +
	 '-out.max={nmax}&-sort=Jmag',
	properties: ['J', 'H', 'K'],
	units: ['', '', ''],
	objurl: Catalog.vizierURL + '/VizieR-5?-source=II/246&-c={ra},{dec},eq=J2000&-c.rs=0.1'
});

