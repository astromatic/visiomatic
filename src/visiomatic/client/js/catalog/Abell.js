/**
 #	This file part of:	VisiOmatic
 * @file Abell catalog.
 * @module catalog/Abell
 * @requires catalog/Catalog
 *
 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/
import {extend} from 'leaflet';

import {Catalog} from './Catalog';


/**
 * @namespace Abell
 * @summary Abell catalog.
 * @extends module:catalog/Catalog~Catalog
*/
export const Abell = extend({}, Catalog, {
	service: 'Vizier@CDS',
	name: 'Abell clusters',
	className: 'logo-catalog-vizier',
	attribution: 'Rich Clusters of Galaxies (Abell et al. 1989) ',
	color: 'orange',
	maglim: 30.0,
	regionType: 'box',
	url: Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=VII/110A&' +
	 '-out=ACO,_RAJ2000,_DEJ2000,m10,Rich,Dclass&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=m10',
	properties: ['m<sub>10</sub>', 'Richness', 'D<sub>class</sub>'],
	units: ['', '', ''],
	objurl: Catalog.vizierURL + '/VizieR-5?-source=VII/110A&-c={ra},{dec},eq=J2000&-c.rs=0.2'
});

