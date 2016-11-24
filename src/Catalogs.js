/*
# L.Catalogs contains specific catalog settings and conversion tools.
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2014 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified: 10/02/2014
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
						mags: []
					},
					geometry: {
						type: 'Point',
						coordinates: [0.0, 0.0]
					}
				},
				geometry = feature.geometry,
				properties = feature.properties;

				var cell = line.split(';');
				feature.id = cell[0];
				geometry.coordinates[0] = parseFloat(cell[1]);
				geometry.coordinates[1] = parseFloat(cell[2]);
				var mags = cell.slice(3),
				    mag;
				for (var j in mags) {
					mag = parseFloat(mags[j]);
					properties.mags.push(isNaN(mag) ? '--' : mag);
				}
				geo.features.push(feature);
			}
		}
		return geo;
	},

	_popup: function (feature) {
		var str = '<div>';
		if (this.objuri) {
			str += 'ID: <a href=\"' +  L.Util.template(this.objuri, L.extend({
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
			       '<TD>' + feature.properties.mags[i].toString() + ' ' +
			       this.units[i] + '</TD></TR>';
		}
		str += '</TBODY></TABLE>';
		return str;
	}

};

L.Catalog.TwoMASS = L.extend({}, L.Catalog, {
	name: '2MASS',
	attribution: '2MASS All-Sky Catalog of Point Sources (Cutri et al., 2003)',
	color: 'red',
	maglim: 17.0,
	service: 'CDS',
	uri: '/viz-bin/asu-tsv?&-mime=csv&-source=II/246&' +
	 '-out=2MASS,RAJ2000,DEJ2000,Jmag,Hmag,Kmag&-out.meta=&' +
	 '-c={ra},{dec},eq=J2000&-c.bd={dra},{ddec}&-sort=_Kmagr&-out.max={nmax}',
	toGeoJSON: L.Catalog._csvToGeoJSON,
	properties: ['J', 'H', 'K'],
	units: ['', '', ''],
	objuri: 'http://vizier.u-strasbg.fr/viz-bin/VizieR-5?-source=II/246&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

L.Catalog.SDSS = L.extend({}, L.Catalog, {
	name: 'SDSS release 9',
	attribution: 'SDSS Photometric Catalog, Release 9 (Adelman-McCarthy et al., 2012)',
	color: 'yellow',
	maglim: 25.0,
	service: 'CDS',
	uri: '/viz-bin/asu-tsv?&-mime=csv&-source=V/139&' +
	 '-out=SDSS9,RAJ2000,DEJ2000,umag,gmag,rmag,imag,zmag&-out.meta=&' +
	 '-c={ra},{dec}&-c.bd={dra},{ddec}&-sort=imag&-out.max={nmax}',
	toGeoJSON: L.Catalog._csvToGeoJSON,
	properties: ['u', 'g', 'r', 'i', 'z'],
	units: ['', '', '', '', ''],
	objuri: 'http://vizier.u-strasbg.fr/viz-bin/VizieR-5?-source=V/139/sdss9&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

L.Catalog.PPMXL = L.extend({}, L.Catalog, {
	name: 'PPMXL',
	attribution: 'PPM-Extended, positions and proper motions by Roeser et al. 2008',
	color: 'green',
	maglim: 20.0,
	service: 'CDS',
	uri: '/viz-bin/asu-tsv?&-mime=csv&-source=I/317&' +
	 '-out=PPMXL,RAJ2000,DEJ2000,Jmag,Hmag,Kmag,b1mag,b2mag,r1mag,r2mag,imag,pmRA,pmDE&-out.meta=&' +
	 '-c={ra},{dec}&-c.bd={dra},{ddec}&-sort=_r&-out.max={nmax}',
	toGeoJSON: L.Catalog._csvToGeoJSON,
	properties: ['J', 'H', 'K', 'b<sub>1</sub>', 'b<sub>2</sub>', 'r<sub>1</sub>',
	             'r<sub>2</sub>', 'i',
	             '&#956;<sub>&#593;</sub> cos &#948;', '&#956;<sub>&#948;</sub>'],
	units: ['', '', '', '', '', '', '', '', 'mas/yr', 'mas/yr'],
	objuri: 'http://vizier.u-strasbg.fr/viz-bin/VizieR-5?-source=I/317&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

L.Catalog.Abell = L.extend({}, L.Catalog, {
	name: 'Abell clusters',
	attribution: 'Rich Clusters of Galaxies (Abell et al. 1989) ',
	color: 'orange',
	maglim: 30.0,
	service: 'CDS',
	uri: '/viz-bin/asu-tsv?&-mime=csv&-source=VII/110A&' +
	 '-out=ACO,_RAJ2000,_DEJ2000,m10,Rich,Dclass&-out.meta=&' +
	 '-c={ra},{dec}&-c.bd={dra},{ddec}&-sort=m10&-out.max={nmax}',
	toGeoJSON: L.Catalog._csvToGeoJSON,
	properties: ['m<sub>10</sub>', 'Richness', 'D<sub>class</sub>'],
	units: ['', '', ''],
	objuri: 'http://vizier.u-strasbg.fr/viz-bin/VizieR-5?-source=VII/110A&-c={ra},{dec},eq=J2000&-c.rs=0.2'
});


