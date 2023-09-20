/**
 #	This file part of:	VisiOmatic
 * @file Built-in catalogs.

 * @requires catalog/Catalog.js
 * @requires vector/Ellipse.js
 *
 * @copyright (c) 2023 CNRS/IAP/CFHT/SorbonneU
 * @author Emmanuel Bertin <bertin@cfht.hawaii.edu>
*/
import {extend, polyline} from 'leaflet';

import {Catalog} from './Catalog';
import {ellipse} from '../vector';

/**
 @namespace catalogs
 */

/**
 * Abell catalog.
 * @name abell
 * @type {Catalog}
 * @memberof catalogs
 */
export const abell = new Catalog({
	service: 'Vizier@CDS',
	name: 'Abell clusters',
	className: 'logo-catalog-vizier',
	attribution: 'Rich Clusters of Galaxies (Abell et al. 1989) ',
	color: 'orange',
	magLim: 30.0,
	regionType: 'box',
	catalogURL: '/asu-tsv?&-mime=csv&-source=VII/110A&' +
	 '-out=ACO,_RAJ2000,_DEJ2000,m10,Rich,Dclass&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=m10',
	properties: ['m<sub>10</sub>', 'Richness', 'D<sub>class</sub>'],
	units: ['', '', ''],
	objectURL: '/VizieR-5?-source=VII/110A&-c={ra},{dec},eq=J2000&-c.rs=0.2'
});


/**
 * AllWISE catalog.
 * @name allWISE
 * @type {Catalog}
 * @memberof catalogs
 */
export const allWISE = new Catalog({
	service: 'Vizier@CDS',
	name: 'AllWISE',
	attribution: 'AllWISE Data Release (Cutri et al. 2013)',
	color: 'red',
	magLim: 18.0,
	regionType: 'box',
	catalogURL: '/asu-tsv?&-mime=csv&-source=II/328/allwise&' +
	 '-out=AllWISE,_RAJ2000,_DEJ2000,W1mag,W2mag,W3mag,W4mag&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=W1mag',
	properties: ['W1<sub>mag</sub> (3.4µm)', 'W2<sub>mag</sub> (4.6µm)',
	  'W3<sub>mag</sub> (12µm)', 'W4<sub>mag</sub> (22µm)'],
	units: ['', '', '', ''],
	objectURL: '/VizieR-5?-source=II/328/allwise&-c={ra},{dec},eq=J2000&-c.rs=0.2'
});


/**
 * FIRST catalog.
 * @name first
 * @type {Catalog}
 * @memberof catalogs
 */
export const first = new Catalog({
	service: 'Vizier@CDS',
	name: 'FIRST',
	className: 'logo-catalog-vizier',
	attribution: 'The FIRST Survey Catalog (Helfand et al. 2015)',
	color: 'blue',
	magLim: 30.0,
	regionType: 'box',
	catalogURL: '/asu-tsv?&-mime=csv&-source=VIII/92/first14&' +
	 '-out=FIRST,_RAJ2000,_DEJ2000,Fpeak,fMaj,fMin,fPA&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=-Fpeak',
	properties: ['F<sub>peak</sub>(1.4GHz)', 'Major axis FWHM', 'Minor axis FWHM', 'Position angle'],
	units: ['mJy', '&#8243;', '&#8243;', '&#176;'],
	objectURL: '/VizieR-5?-source=VIII/92/first14&-c={ra},{dec},eq=J2000&-c.rs=0.2',
	draw: function (feature, latlng) {
		return ellipse(latlng, {
			majAxis: feature.properties.items[1] / 7200.0,
			minAxis: feature.properties.items[2] / 7200.0,
			posAngle: feature.properties.items[3] === '--' ? 0.0 : feature.properties.items[3]
		});
	}
});


/**
 * Gaia DR3 catalog.
 * @name gaiaDR3
 * @type {Catalog}
 * @memberof catalogs
 */
export const gaiaDR3 = new Catalog({
	service: 'Vizier@CDS',
	name: 'Gaia DR3',
	className: 'logo-catalog-vizier',
	attribution: 'Third Gaia Data Release (2022)',
	color: 'green',
	magLim: 21.0,
	regionType: 'box',
	catalogURL: '/asu-tsv?&-mime=csv&-source=I/355/gaiadr3&' +
	 '-out=Source,RA_ICRS,DE_ICRS,Gmag,BPmag,RPmag,pmRA,pmDE&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=Gmag',
	properties: ['G', 'B<sub>P</sub>', 'R<sub>P</sub>',
	 '&#956;<sub>&#593;</sub> cos &#948;', '&#956;<sub>&#948;</sub>'],
	units: ['', '', '', 'mas/yr', 'mas/yr'],
	objectURL: '/VizieR-5?-source=I/355/gaiadr3&-c={ra},{dec},eq=J2000&-c.rs=0.1'
});


/**
 * GALEX AIS catalog.
 * @name galexAIS
 * @type {Catalog}
 * @memberof catalogs
 */
export const galexAIS = new Catalog({
	service: 'Vizier@CDS',
	name: 'GALEX AIS',
	className: 'logo-catalog-vizier',
	attribution: 'GALEX catalogs of UV sources: All-sky Imaging Survey (Bianchi et al. 2011)',
	color: 'magenta',
	magLim: 21.0,
	regionType: 'box',
	catalogURL: '/asu-tsv?&-mime=csv&-source=II/312/ais&' +
	 '-out=objid,_RAJ2000,_DEJ2000,FUV,NUV&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=FUV',
	properties: ['FUV<sub>AB</sub>', 'NUV<sub>AB</sub>'],
	units: ['', ''],
	objectURL: '/VizieR-5?-source=II/312/ais&-c={ra},{dec},eq=J2000&-c.rs=0.2'
});


/**
 * GLEAM catalog.
 * @name gleam
 * @type {Catalog}
 * @memberof catalogs
 */
export const gleam = new Catalog({
	service: 'Vizier@CDS',
	name: 'GLEAM',
	className: 'logo-catalog-vizier',
	attribution: 'GaLactic and Extragalactic All-sky Murchison Wide Field Array (GLEAM)' +
	    ' low-frequency extragalactic catalogue (Hurley-Walker et al. 2017)',
	color: 'blue',
	magLim: 30.0,
	regionType: 'box',
	catalogURL: '/asu-tsv?&-mime=csv&-source=VIII/100/gleamegc&' +
	 '-out=GLEAM,RAJ2000,DEJ2000,Fintwide,awide,bwide,pawide&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=-Fintwide',
	properties: ['F<sub>int</sub>(170-231MHz)', 'Major axis FWHM', 'Minor axis FWHM', 'Position angle'],
	units: ['Jy', '&#8243;', '&#8243;', '&#176;'],
	objectURL: '/VizieR-5?-source=-source=VIII/100/gleamegc&-c={ra},{dec},eq=J2000&-c.rs=0.2',
	draw: function (feature, latlng) {
		return ellipse(latlng, {
			majAxis: feature.properties.items[1] / 3600.0,
			minAxis: feature.properties.items[2] / 3600.0,
			posAngle: feature.properties.items[3] === '--' ? 0.0 : feature.properties.items[3]
		});
	}
});


/**
 * NVSS catalog.
 * @name nvss
 * @type {Catalog}
 * @memberof catalogs
 */
export const nvss = new Catalog({
	service: 'Vizier@CDS',
	name: 'NVSS',
	className: 'logo-catalog-vizier',
	attribution: '1.4GHz NRAO VLA Sky Survey (NVSS) (Condon et al. 1998)',
	color: 'magenta',
	magLim: 30.0,
	regionType: 'box',
	catalogURL: '/asu-tsv?&-mime=csv&-source=VIII/65/NVSS&' +
	 '-out=NVSS,_RAJ2000,_DEJ2000,S1.4,MajAxis,MinAxis,PA&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=-S1.4',
	properties: ['S<sub>1.4GHz</sub>', 'Major axis', 'Minor axis', 'Position angle'],
	units: ['mJy', '&#8243;', '&#8243;', '&#176;'],
	objectURL: '/VizieR-5?-source=VIII/65/NVSS&-c={ra},{dec},eq=J2000&-c.rs=0.2',
	draw: function (feature, latlng) {
		return ellipse(latlng, {
			majAxis: feature.properties.items[1] / 7200.0,
			minAxis: feature.properties.items[2] / 7200.0,
			posAngle: feature.properties.items[3] === '--' ? 0.0 : feature.properties.items[3]
		});
	}
});


/**
 * PanSTARRS 1 catalog.
 * @name panstarrs1
 * @type {Catalog}
 * @memberof catalogs
 */
export const panstarrs1 = new Catalog({
	service: 'Vizier@CDS',
	name: 'PanSTARRS 1',
	className: 'logo-catalog-vizier',
	attribution: 'Pan-STARRS release 1 (PS1) Survey (Chambers et al. 2016)',
	color: 'yellow',
	magLim: 24.0,
	regionType: 'box',
	catalogURL: '/asu-tsv?&-mime=csv&-source=II/349&' +
	 '-out=objID,RAJ2000,DEJ2000,gKmag,rKmag,iKmag,zKmag,yKmag&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=rmag',
	properties: ['g', 'r', 'i', 'z', 'y'],
	units: ['', '', '', '', ''],
	objectURL: '/VizieR-5?-source=II/349/ps1&-c={ra},{dec},eq=J2000&-c.rs=0.1'
});


/**
 * PPMXL catalog.
 * @name ppmXL
 * @type {Catalog}
 * @memberof catalogs
 */
export const ppmXL = new Catalog({
	service: 'Vizier@CDS',
	name: 'PPMXL',
	className: 'logo-catalog-vizier',
	attribution: 'PPM-Extended, positions and proper motions (Roeser et al. 2008)',
	color: 'green',
	magLim: 20.0,
	regionType: 'box',
	catalogURL: '/asu-tsv?&-mime=csv&-source=I/317&' +
	 '-out=PPMXL,RAJ2000,DEJ2000,Jmag,Hmag,Kmag,b1mag,b2mag,r1mag,r2mag,imag,pmRA,pmDE&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=Jmag',
	properties: ['J', 'H', 'K', 'b<sub>1</sub>', 'b<sub>2</sub>', 'r<sub>1</sub>',
	             'r<sub>2</sub>', 'i',
	             '&#956;<sub>&#593;</sub> cos &#948;', '&#956;<sub>&#948;</sub>'],
	units: ['', '', '', '', '', '', '', '', 'mas/yr', 'mas/yr'],
	objectURL: '/VizieR-5?-source=I/317&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});


/**
 * SDSS catalog.
 * @name sdss
 * @type {Catalog}
 * @memberof catalogs
 */
export const sdss = new Catalog({
	service: 'Vizier@CDS',
	name: 'SDSS release 12',
	className: 'logo-catalog-vizier',
	attribution: 'SDSS Photometric Catalog, Release 12 (Alam et al. 2015)',
	color: 'yellow',
	magLim: 25.0,
	regionType: 'box',
	catalogURL: '/asu-tsv?&-mime=csv&-source=V/147&' +
	 '-out=SDSS12,RA_ICRS,DE_ICRS,umag,gmag,rmag,imag,zmag&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=rmag',
	properties: ['u', 'g', 'r', 'i', 'z'],
	units: ['', '', '', '', ''],
	objectURL: '/VizieR-5?-source=V/147/sdss12&-c={ra},{dec},eq=J2000&-c.rs=0.1'
});


/**
 * TGSS catalog.
 * @name tgss
 * @type {Catalog}
 * @memberof catalogs
 */
export const tgss = new Catalog({
	service: 'Vizier@CDS',
	name: 'TGSS',
	className: 'logo-catalog-vizier',
	attribution: 'The GMRT 150 MHz all-sky radio survey. TGSS ADR1 (Intema et al. 2017)',
	color: 'blue',
	magLim: 30.0,
	regionType: 'box',
	catalogURL: '/asu-tsv?&-mime=csv&-source=J/A%2bA/598/A78/table3&' +
	 '-out=TGSSADR,RAJ2000,DEJ2000,Stotal,Maj,Min,PA&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=-Stotal',
	properties: ['F<sub>peak</sub>(150MHz)', 'Major axis FWHM', 'Minor axis FWHM', 'Position angle'],
	units: ['mJy', '&#8243;', '&#8243;', '&#176;'],
	objectURL: '/VizieR-3?-source=-source=J/A%2bA/598/A78/table3&-c={ra},{dec},eq=J2000&-c.rs=0.2',
	draw: function (feature, latlng) {
		return ellipse(latlng, {
			majAxis: feature.properties.items[1] / 7200.0,
			minAxis: feature.properties.items[2] / 7200.0,
			posAngle: feature.properties.items[3] === '--' ? 0.0 : feature.properties.items[3]
		});
	}
});


/**
 * 2MASS catalog.
 * @name twomass
 * @type {Catalog}
 * @memberof catalogs
 */
export const twomass = new Catalog({
	service: 'Vizier@CDS',
	name: '2MASS',
	className: 'logo-catalog-vizier',
	attribution: '2MASS All-Sky Catalog of Point Sources (Cutri et al. 2003)',
	color: 'red',
	magLim: 17.0,
	regionType: 'box',
	catalogURL: '/asu-tsv?&-mime=csv&-source=II/246&' +
	 '-out=2MASS,RAJ2000,DEJ2000,Jmag,Hmag,Kmag&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&' +
	 '-out.max={nmax}&-sort=Jmag',
	properties: ['J', 'H', 'K'],
	units: ['', '', ''],
	objectURL: '/VizieR-5?-source=II/246&-c={ra},{dec},eq=J2000&-c.rs=0.1'
});


/**
 * unWISE catalog.
 * @name allWISE
 * @type {Catalog}
 * @memberof catalogs
 */
export const unWISE = new Catalog({
	service: 'Vizier@CDS',
	name: 'UnWISE',
	attribution: 'The band-merged unWISE Catalog (Schlafly et al. 2019)',
	color: 'red',
	magLim: 40.0,
	magScaleType: 'linear',
	regionType: 'box',
	catalogURL: '/asu-tsv?&-mime=csv&-source=II/363/unwise&' +
	 '-out=objID,_RAJ2000,_DEJ2000,FW1,FW2&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=-FW1',
	properties: ['F<sub>W1</sub> (3.4µm)', 'F<sub>W2</sub> (4.6µm)'],
	units: [
		'<a href="https://vizier.cds.unistra.fr/viz-bin/VizieR?-6N&' +
		 '-out.form=H0&//*&-5N&<&quot;Label&quot;&catid%3D2363&tabid%3D1&' +
		 'colid%3D8" target=”_blank”>nMgy (Vega)</a>',
		'<a href="https://vizier.cds.unistra.fr/viz-bin/VizieR?-6N&' +
		 '-out.form=H0&//*&-5N&<&quot;Label&quot;&catid%3D2363&tabid%3D1&' +
		 'colid%3D9" target=”_blank”>nMgy (Vega)</a>'
	],
	objectURL: '/VizieR-5?-source=II/363/unwise&-c={ra},{dec},eq=J2000&-c.rs=0.2'
});


/**
 * URAT1 catalog.
 * @name urat1
 * @type {Catalog}
 * @memberof catalogs
 */
export const urat1 = new Catalog({
	service: 'Vizier@CDS',
	name: 'URAT1',
	className: 'logo-catalog-vizier',
	attribution: 'The first U.S. Naval Observatory Astrometric Robotic Telescope Catalog (Zacharias et al. 2015)',
	color: 'yellow',
	magLim: 17.0,
	regionType: 'box',
	catalogURL: '/asu-tsv?&-mime=csv&-source=I/329&' +
	 '-out=URAT1,RAJ2000,DEJ2000,f.mag,pmRA,pmDE&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=f.mag',
	properties: ['f<sub>mag</sub>', '&#956;<sub>&#593;</sub> cos &#948;', '&#956;<sub>&#948;</sub>'],
	units: ['', 'mas/yr', 'mas/yr'],
	objectURL: '/VizieR-5?-source=I/329&-c={ra},{dec},eq=J2000&-c.rs=0.1'
});


/**
 * SkyBot database.
 * @name skybot
 * @type {Catalog}
 * @memberof catalogs
 */
export const skybot = new Catalog({
	service: 'SkyBot@IMCCE',
	name: 'SkyBot',
	className: 'logo-catalog-imcce',
	attribution: 'SkyBoT: a VO service to identify Solar System objects (Berthier et al. 2006)',
	color: 'orange',
	magLim: 30.0,
	magIndex: 1,
	regionType: 'box',
	serviceURL: 'https://vo.imcce.fr/webservices/skybot/',
	catalogURL: 'skybotconesearch_query.php?-mime=text&-from=VisiOmatic&' +
	 '-output=basic&-objFilter=111&-refsys=EQJ2000&' +
	 '-ep={jd}&-loc={observer}&-ra={lng}&-dec={lat}&-bd={dlng}x{dlat}',
	properties: ['Class', 'V', 'Position uncertainty', '&#956;<sub>&#593;</sub> cos &#948;', '&#956;<sub>&#948;</sub>', 'Geocentric distance', 'Heliocentric distance'],
	units: ['', '', '&#8243;', '&#8243;/h', '&#8243;/h', 'au', 'au'],
	objectURL: 'https://vizier.unistra.fr/viz-bin/VizieR-5?-source=B/astorb/astorb&Name==={id}',
	format: 'text',
	draw: function (feature, latlng) {
		const	prop = feature.properties.items,
			djd =  (this.jd[1] - this.jd[0]) * 24.0,
			clat = Math.abs(Math.cos(latlng.lat * Math.PI / 180.)),
			invclat = clat > 0. ? 1. / clat : 0.001,
			dlng = invclat * djd * prop[3] / 7200.,
			dlat = djd * prop[4] / 7200.;

		return polyline([
			[latlng.lat - dlat, latlng.lng - dlng],
			[latlng.lat + dlat, latlng.lng + dlng]
		]);
	},
	style: function (feature) {
		return {color: this.color, weight: 8};
	},
	toGeoJSON: function (str) {
		// Check to see if the delimiter is defined. If not, then default to comma.
		const	badreg = /#|No\s|^$/,
			sexare = /^([-+]?)(\d+)\s(\d+)\s(\d+\.?\d*)/,
			lines = str.split('\n'),
			geo = {type: 'FeatureCollection', features: []};

		for (var i in lines) {
			var line = lines[i];
			if (badreg.test(line) === false) {
				var feature = {
						type: 'Feature',
						id: '',
						properties: {
							items: []
						},
						geometry: {
							type: 'Point',
							coordinates: [0.0, 0.0]
						}
					},
					geometry = feature.geometry,
					properties = feature.properties;

				const	cell = line.split(' | ');
				feature.id = cell[1];
				ra = sexare.exec(cell[2]);
				dec = sexare.exec(cell[3]);
				geometry.coordinates = [
					Number(ra[2]) * 15.0 +
					Number(ra[3]) / 4.0 +
					Number(ra[4]) / 240.0,
					Number(dec[1] + '1') * (
						Number(dec[2]) +
						Number(dec[3]) / 60.0 +
						Number(dec[4]) / 3600.0
					)
				];
				properties.items.push(cell[4]);
				properties.items.push(this.readProperty(cell[5]));
				properties.items.push(this.readProperty(cell[6]));
				const	items = cell.slice(8);
				for (var j in items) {
					properties.items.push(this.readProperty(items[j]));
				}
				geo.features.push(feature);
			}
		}
		return geo;
	}

});

