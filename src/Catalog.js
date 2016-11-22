/*
# L.Catalog contains specific catalog settings and conversion tools.
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014-2016 Emmanuel Bertin - IAP/CNRS/UPMC,
#                          Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 12/01/2016
*/

L.Catalog = {
	nmax: 10000,	// Sets the maximum number of sources per query

	_csvToGeoJSON: function (str) {
		// Check to see if the delimiter is defined. If not, then default to comma.
		var badreg = new RegExp('#|--|^$'),
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
					},
				},
				geometry = feature.geometry,
				properties = feature.properties;

				var cell = line.split(/[,;\t]/);
				feature.id = cell[0];
				geometry.coordinates[0] = parseFloat(cell[1]);
				geometry.coordinates[1] = parseFloat(cell[2]);
				var items = cell.slice(3),
				    item;
				for (var j in items) {
					item = parseFloat(items[j]);
					properties.items.push(isNaN(item) ? '--' : item);
				}
				geo.features.push(feature);
			}
		}
		return geo;
	},

	toGeoJSON: function (str) {
		return this._csvToGeoJSON(str);
	},

	popup: function (feature) {
		var str = '<div>';
		if (this.objurl) {
			str += 'ID: <a href=\"' +  L.Util.template(this.objurl, L.extend({
				ra: feature.geometry.coordinates[0].toFixed(6),
				dec: feature.geometry.coordinates[1].toFixed(6)
			})) + '\" target=\"_blank\">' + feature.id + '</a></div>';
		} else {
			str += 'ID: ' + feature.id + '</div>';
		}
		str += '<TABLE style="margin:auto;">' +
		       '<TBODY style="vertical-align:top;text-align:left;">';
		for	(var i in this.properties) {
			str += '<TR><TD>' + this.properties[i] + ':</TD>' +
			       '<TD>' + feature.properties.items[i].toString() + ' ';
	        if (this.units[i]){
	        	str += this.units[i];
	        }
	        str += '</TD></TR>';
		}
		str += '</TBODY></TABLE>';
		return str;

	},

	draw: function (feature, latlng) {
		return L.circleMarker(latlng, {
			radius: feature.properties.items[0] ?
			  5 + 17 - feature.properties.items[0] : 8
		});
	},

	vizierURL: 'http://vizier.u-strasbg.fr/viz-bin'

};

L.Catalog['2MASS'] = L.extend({}, L.Catalog, {
	name: '2MASS',
	attribution: '2MASS All-Sky Catalog of Point Sources (Cutri et al. 2003)',
	color: 'red',
	maglim: 17.0,
	service: 'Vizier@CDS',
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=II/246&' +
	 '-out=2MASS,RAJ2000,DEJ2000,Jmag,Hmag,Kmag&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&' +
	 '-out.max={nmax}',
	properties: ['J', 'H', 'K'],
	units: ['', '', ''],
	objurl: L.Catalog.vizierURL + '/VizieR-5?-source=II/246&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

L.Catalog.SDSS = L.extend({}, L.Catalog, {
	name: 'SDSS release 9',
	attribution: 'SDSS Photometric Catalog, Release 9 (Adelman-McCarthy et al. 2012)',
	color: 'yellow',
	maglim: 25.0,
	service: 'Vizier@CDS',
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=V/139&' +
	 '-out=SDSS9,RAJ2000,DEJ2000,umag,gmag,rmag,imag,zmag&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-sort=imag&-out.max={nmax}',
	properties: ['u', 'g', 'r', 'i', 'z'],
	units: ['', '', '', '', ''],
	objurl: L.Catalog.vizierURL + '/VizieR-5?-source=V/139/sdss9&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

L.Catalog.PPMXL = L.extend({}, L.Catalog, {
	name: 'PPMXL',
	attribution: 'PPM-Extended, positions and proper motions by Roeser et al. 2008',
	color: 'green',
	maglim: 20.0,
	service: 'Vizier@CDS',
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=I/317&' +
	 '-out=PPMXL,RAJ2000,DEJ2000,Jmag,Hmag,Kmag,b1mag,b2mag,r1mag,r2mag,imag,pmRA,pmDE&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}',
	properties: ['J', 'H', 'K', 'b<sub>1</sub>', 'b<sub>2</sub>', 'r<sub>1</sub>',
	             'r<sub>2</sub>', 'i',
	             '&#956;<sub>&#593;</sub> cos &#948;', '&#956;<sub>&#948;</sub>'],
	units: ['', '', '', '', '', '', '', '', 'mas/yr', 'mas/yr'],
	objurl: L.Catalog.vizierURL + '/VizieR-5?-source=I/317&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

L.Catalog.Abell = L.extend({}, L.Catalog, {
	name: 'Abell clusters',
	attribution: 'Rich Clusters of Galaxies (Abell et al. 1989) ',
	color: 'orange',
	maglim: 30.0,
	service: 'Vizier@CDS',
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=VII/110A&' +
	 '-out=ACO,_RAJ2000,_DEJ2000,m10,Rich,Dclass&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}',
	properties: ['m<sub>10</sub>', 'Richness', 'D<sub>class</sub>'],
	units: ['', '', ''],
	objurl: L.Catalog.vizierURL + '/VizieR-5?-source=VII/110A&-c={ra},{dec},eq=J2000&-c.rs=0.2'
});

L.Catalog.NVSS = L.extend({}, L.Catalog, {
	name: 'NVSS',
	attribution: '1.4GHz NRAO VLA Sky Survey (NVSS) (Condon et al. 1998)',
	color: 'magenta',
	maglim: 30.0,
	service: 'Vizier@CDS',
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=VIII/65/NVSS&' +
	 '-out=NVSS,_RAJ2000,_DEJ2000,S1.4,MajAxis,MinAxis,PA&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}',
	properties: ['S<sub>1.4GHz</sub>', 'Major axis', 'Minor axis', 'Position angle'],
	units: ['mJy', '&#8243;', '&#8243;', '&#176;'],
	objurl: L.Catalog.vizierURL + '/VizieR-5?-source=VIII/65/NVSS&-c={ra},{dec},eq=J2000&-c.rs=0.2',
	draw: function (feature, latlng) {
		return L.ellipse(latlng, {
			majAxis: feature.properties.items[1] / 7200.0,
			minAxis: feature.properties.items[2] / 7200.0,
			posAngle: feature.properties.items[3] === '--' ? 90.0 : 90.0 - feature.properties.items[3]
		});
	}
});

L.Catalog.FIRST = L.extend({}, L.Catalog, {
	name: 'FIRST',
	attribution: 'The FIRST Survey Catalog (Helfand et al. 2015)',
	color: 'blue',
	maglim: 30.0,
	service: 'Vizier@CDS',
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=VIII/92/first14&' +
	 '-out=FIRST,_RAJ2000,_DEJ2000,Fpeak,fMaj,fMin,fPA&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}',
	properties: ['F<sub>peak</sub>(1.4GHz)', 'Major axis FWHM', 'Minor axis FWHM', 'Position angle'],
	units: ['mJy', '&#8243;', '&#8243;', '&#176;'],
	objurl: L.Catalog.vizierURL + '/VizieR-5?-source=VIII/92/first14&-c={ra},{dec},eq=J2000&-c.rs=0.2',
	draw: function (feature, latlng) {
		return L.ellipse(latlng, {
			majAxis: feature.properties.items[1] / 7200.0,
			minAxis: feature.properties.items[2] / 7200.0,
			posAngle: feature.properties.items[3] === '--' ? 90.0 : 90.0 - feature.properties.items[3]
		});
	}
});

L.Catalog.AllWISE = L.extend({}, L.Catalog, {
	name: 'AllWISE',
	attribution: 'AllWISE Data Release (Cutri et al. 2013)',
	color: 'red',
	maglim: 18.0,
	service: 'Vizier@CDS',
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=II/328/allwise&' +
	 '-out=AllWISE,_RAJ2000,_DEJ2000,W1mag,W2mag,W3mag,W4mag&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}',
	properties: ['W1<sub>mag</sub> (3.4µm)', 'W2<sub>mag</sub> (4.6µm)',
	  'W3<sub>mag</sub> (12µm)', 'W4<sub>mag</sub> (22µm)'],
	units: ['', '', '', ''],
	objurl: L.Catalog.vizierURL + '/VizieR-5?-source=II/328/allwise&-c={ra},{dec},eq=J2000&-c.rs=0.2'
});

L.Catalog.GALEX_AIS = L.extend({}, L.Catalog, {
	name: 'GALEX AIS',
	attribution: 'GALEX catalogs of UV sources: All-sky Imaging Survey (Bianchi et al. 2011)',
	color: 'magenta',
	maglim: 21.0,
	service: 'Vizier@CDS',
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=II/312/ais&' +
	 '-out=objid,_RAJ2000,_DEJ2000,FUV,NUV&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}',
	properties: ['FUV<sub>AB</sub>', 'NUV<sub>AB</sub>'],
	units: ['', ''],
	objurl: L.Catalog.vizierURL + '/VizieR-5?-source=II/312/ais&-c={ra},{dec},eq=J2000&-c.rs=0.2'
});

L.Catalog.GAIA_DR1 = L.extend({}, L.Catalog, {
	name: 'Gaia DR1',
	attribution: 'First Gaia Data Release (2016)',
	color: 'green',
	maglim: 20.0,
	service: 'Vizier@CDS',
	regionType: 'box',
	url: L.Catalog.vizierURL + '/asu-tsv?&-mime=csv&-source=I/337&' +
	 '-out=Source,RA_ICRS,DE_ICRS,<Gmag>,pmRA,pmDE&-out.meta=&' +
	 '-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}',
	properties: ['G', '&#956;<sub>&#593;</sub> cos &#948;', '&#956;<sub>&#948;</sub>'],
	units: ['', 'mas/yr', 'mas/yr'],
	objurl: L.Catalog.vizierURL + '/VizieR-5?-source=I/337&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

L.Catalog.Y3A1 = L.extend({}, L.Catalog, {
	name: 'Y3A1',
	attribution: 'Des Y3A1 COADD OBJECT SUMMARY',
	color: 'blue',
	maglim: 27.0,
	service: 'ScienceServer',
	regionType: 'box',
	authenticate: 'csrftoken',
	url: 'http://dri.com/dri/api/visiomatic/coadd_objects/' +
	'?mime=csv' +
	'&product=27' + // Esse aqui tem que sair
	'&source=Y3A1_COADD_OBJECT_SUMMARY' +
	'&columns=COADD_OBJECT_ID,RA,DEC,MAG_AUTO_G,MAG_AUTO_R,MAG_AUTO_I,MAG_AUTO_Z,MAG_AUTO_Y' +
	'&coordinate={lng},{lat}' +
	'&bounding={dlng},{dlat}' +
	'&maglim={maglim}' +
	'&limit={nmax}',
	properties: ['MAG_AUTO_G', 'MAG_AUTO_R', 'MAG_AUTO_I', 'MAG_AUTO_Z', 'MAG_AUTO_Y'],
	units: [],
	// objurl: L.Catalog.vizierURL + '/VizieR-5?-source=II/246&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});