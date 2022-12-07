/*
#	URAT catalogs.
#
#	This file part of:       VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU
*/
import {extend} from 'leaflet';

import {Catalog} from './Catalog';


export const URAT_1 = extend({}, Catalog, {
	service: 'Vizier@CDS',
	name: 'URAT1',
	className: 'logo-catalog-vizier',
	attribution: 'The first U.S. Naval Observatory Astrometric Robotic Telescope Catalog (Zacharias et al. 2015)',
	color: 'yellow',
	maglim: 17.0,
	regionType: 'box',
	url: Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=I/329&' +
	 '-out=URAT1,RAJ2000,DEJ2000,f.mag,pmRA,pmDE&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=f.mag',
	properties: ['f<sub>mag</sub>', '&#956;<sub>&#593;</sub> cos &#948;', '&#956;<sub>&#948;</sub>'],
	units: ['', 'mas/yr', 'mas/yr'],
	objurl: Catalog.vizierURL + '/VizieR-5?-source=I/329&-c={ra},{dec},eq=J2000&-c.rs=0.1'
});
