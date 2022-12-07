/*
#	PanSTARRS1 catalog.
#
#	This file part of:       VisiOmatic
#
#	Copyright: (C) 2014-2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU
*/
import {extend} from 'leaflet'
import {Catalog} from './Catalog'


export const PanSTARRS1 = extend({}, Catalog, {
	service: 'Vizier@CDS',
	name: 'PanSTARRS 1',
	className: 'logo-catalog-vizier',
	attribution: 'Pan-STARRS release 1 (PS1) Survey (Chambers et al. 2016)',
	color: 'yellow',
	maglim: 24.0,
	regionType: 'box',
	url: Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=II/349&' +
	 '-out=objID,RAJ2000,DEJ2000,gKmag,rKmag,iKmag,zKmag,yKmag&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=rmag',
	properties: ['g', 'r', 'i', 'z', 'y'],
	units: ['', '', '', '', ''],
	objurl: Catalog.vizierURL + '/VizieR-5?-source=II/349/ps1&-c={ra},{dec},eq=J2000&-c.rs=0.1'
});

