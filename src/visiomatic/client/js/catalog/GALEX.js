/**
 #	This file part of:	VisiOmatic
 * @file GALEX catalog.

 * @requires catalog/Catalog.js
 *
 * @copyright (c) 2014-2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/
import {extend} from 'leaflet';

import {Catalog} from './Catalog';


/**
 * GALEX catalog.
 * @interface GALEX
 * @extends Catalog
*/
export const GALEX_AIS = extend({}, Catalog, {
	service: 'Vizier@CDS',
	name: 'GALEX AIS',
	className: 'logo-catalog-vizier',
	attribution: 'GALEX catalogs of UV sources: All-sky Imaging Survey (Bianchi et al. 2011)',
	color: 'magenta',
	maglim: 21.0,
	regionType: 'box',
	url: Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=II/312/ais&' +
	 '-out=objid,_RAJ2000,_DEJ2000,FUV,NUV&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=FUV',
	properties: ['FUV<sub>AB</sub>', 'NUV<sub>AB</sub>'],
	units: ['', ''],
	objurl: Catalog.vizierURL + '/VizieR-5?-source=II/312/ais&-c={ra},{dec},eq=J2000&-c.rs=0.2'
});

