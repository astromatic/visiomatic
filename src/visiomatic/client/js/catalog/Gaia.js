/*
#	Gaia catalogs.
#
#	This file part of:       VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU
*/
import {extend} from 'leaflet';

import {Catalog} from './Catalog';


export const Gaia_DR1 = extend({}, Catalog, {
	service: 'Vizier@CDS',
	name: 'Gaia DR1',
	className: 'logo-catalog-vizier',
	attribution: 'First Gaia Data Release (2016)',
	color: 'green',
	maglim: 21.0,
	regionType: 'box',
	url: Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=I/337/gaia&' +
	 '-out=Source,RA_ICRS,DE_ICRS,<Gmag>,pmRA,pmDE&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=<Gmag>',
	properties: ['G', '&#956;<sub>&#593;</sub> cos &#948;', '&#956;<sub>&#948;</sub>'],
	units: ['', 'mas/yr', 'mas/yr'],
	objurl: Catalog.vizierURL + '/VizieR-5?-source=I/337/gaia&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

export const Gaia_DR2 = extend({}, Catalog, {
	service: 'Vizier@CDS',
	name: 'Gaia DR2',
	className: 'logo-catalog-vizier',
	attribution: 'Second Gaia Data Release (2018)',
	color: 'green',
	maglim: 21.0,
	regionType: 'box',
	url: Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=I/345/gaia2&' +
	 '-out=Source,RA_ICRS,DE_ICRS,Gmag,BPmag,RPmag,pmRA,pmDE&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=Gmag',
	properties: ['G', 'B<sub>P</sub>', 'R<sub>P</sub>',
	 '&#956;<sub>&#593;</sub> cos &#948;', '&#956;<sub>&#948;</sub>'],
	units: ['', '', '', 'mas/yr', 'mas/yr'],
	objurl: Catalog.vizierURL + '/VizieR-5?-source=I/345/gaia2&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

export const Gaia_DR3 = extend({}, Catalog, {
	service: 'Vizier@CDS',
	name: 'Gaia DR3',
	className: 'logo-catalog-vizier',
	attribution: 'Third Gaia Data Release (2022)',
	color: 'green',
	maglim: 21.0,
	regionType: 'box',
	url: Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=I/355/gaiadr3&' +
	 '-out=Source,RA_ICRS,DE_ICRS,Gmag,BPmag,RPmag,pmRA,pmDE&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=Gmag',
	properties: ['G', 'B<sub>P</sub>', 'R<sub>P</sub>',
	 '&#956;<sub>&#593;</sub> cos &#948;', '&#956;<sub>&#948;</sub>'],
	units: ['', '', '', 'mas/yr', 'mas/yr'],
	objurl: Catalog.vizierURL + '/VizieR-5?-source=I/355/gaiadr3&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

