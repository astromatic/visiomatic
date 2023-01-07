/**
 #	This file part of:	VisiOmatic
 * @file AllWISE catalog.

 * @requires catalog/Catalog.js
 *
 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/
import {extend} from 'leaflet';

import {Catalog} from './Catalog';


/**
 * @namespace AllWISE
 * @summary AllWISE catalog.
 * @extends module:catalog/Catalog.js~Catalog
*/
export const AllWISE = extend({}, Catalog, {
	service: 'Vizier@CDS',
	name: 'AllWISE',
	className: 'logo-catalog-vizier',
	attribution: 'AllWISE Data Release (Cutri et al. 2013)',
	color: 'red',
	maglim: 18.0,
	regionType: 'box',
	url: Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=II/328/allwise&' +
	 '-out=AllWISE,_RAJ2000,_DEJ2000,W1mag,W2mag,W3mag,W4mag&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=W1mag',
	properties: ['W1<sub>mag</sub> (3.4µm)', 'W2<sub>mag</sub> (4.6µm)',
	  'W3<sub>mag</sub> (12µm)', 'W4<sub>mag</sub> (22µm)'],
	units: ['', '', '', ''],
	objurl: Catalog.vizierURL + '/VizieR-5?-source=II/328/allwise&-c={ra},{dec},eq=J2000&-c.rs=0.2'
});

