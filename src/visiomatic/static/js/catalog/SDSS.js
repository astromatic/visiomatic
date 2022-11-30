/*
#	SDSS catalog.
#
#	This file part of:       VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU
*/
import {extend} from 'leaflet';

import {Catalog} from './Catalog';


export const SDSS = extend({}, Catalog, {
	service: 'Vizier@CDS',
	name: 'SDSS release 12',
	className: 'logo-catalog-vizier',
	attribution: 'SDSS Photometric Catalog, Release 12 (Alam et al. 2015)',
	color: 'yellow',
	maglim: 25.0,
	regionType: 'box',
	url: Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=V/147&' +
	 '-out=SDSS12,RA_ICRS,DE_ICRS,umag,gmag,rmag,imag,zmag&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=rmag',
	properties: ['u', 'g', 'r', 'i', 'z'],
	units: ['', '', '', '', ''],
	objurl: Catalog.vizierURL + '/VizieR-5?-source=V/147/sdss12&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

