/*
# L.Catalogs contains specific catalog settings and conversion tools.
#
#	This file part of:	Leaflet-IVV
#
#	Copyright: (C) 2013 Emmanuel Bertin - IAP/CNRS/UPMC,
#                     Chiara Marmo - IDES/Paris-Sud
#
#	Last modified:		19/11/2013
*/

L.Catalog = {
	nmax: 5000,	// Sets the maximum number of sources per query
	_csvToGeoJSON: function (str) {
		// Check to see if the delimiter is defined. If not, then default to comma.
		var badreg = new RegExp('#|--|^$'),
		 lines = str.split('\n'),
		 array = [],
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
					},
				},
				geometry = feature.geometry,
				properties = feature.properties;

				var cell = line.split(';');
				feature.id = cell[0];
				geometry.coordinates[0] = parseFloat(cell[1]);
				geometry.coordinates[1] = parseFloat(cell[2]);
				var mags = cell.slice(3);
				for (var j in mags) {
					properties.mags.push(parseFloat(mags[j]));
				}
				geo.features.push(feature);
			}
		}
		return geo;
	},
};

L.Catalog.TwoMASS = L.extend({}, L.Catalog, {
	name: '2MASS point sources',
	attribution: '2MASS All-Sky Catalog of Point Sources (Cutri et al., 2003)',
	color: 'yellow',
	maglim: 17.0,
	service: 'CDS',
	uri: '/viz-bin/asu-tsv?&-mime=csv&-source=II/246&' +
	 '-out=2MASS,RAJ2000,DEJ2000,Jmag,Hmag,Kmag&-out.meta=&' +
	 '-c={ra},{dec},eq=J2000&-c.bd={dra},{ddec}&-sort=_Kmagr&-out.max={nmax}',
	toGeoJSON: L.Catalog._csvToGeoJSON,
	properties: ['Jmag', 'Hmag', 'Kmag'],
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
	properties: ['umag', 'gmag', 'rmag', 'imag', 'zmag'],
	objuri: 'http://vizier.u-strasbg.fr/viz-bin/VizieR-5?-source=V/139/sdss9&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

L.Catalog.PPMXL = L.extend({}, L.Catalog, {
	name: 'PPMXL',
	attribution: 'PPM-Extended, positions and proper motions by Roeser et al. 2008',
	color: 'yellow',
	maglim: 20.0,
	service: 'CDS',
	uri: '/viz-bin/asu-tsv?&-mime=csv&-source=V/139&' +
	 '-out=SDSS9,RAJ2000,DEJ2000,Bmag,Vmag,Rmag,Jmag,HMag,KMag&-out.meta=&' +
	 '-c={ra},{dec}&-c.bd={dra},{ddec}&-sort=_r&-out.max={nmax}',
	toGeoJSON: L.Catalog._csvToGeoJSON,
	properties: ['Jmag', 'Hmag', 'Kmag', 'b1mag', 'b2mag', 'r1mag', 'r2mag', 'imag'],
	objuri: 'http://vizier.u-strasbg.fr/viz-bin/VizieR-5?-source=I/317&-c={ra},{dec},eq=J2000&-c.rs=0.01'
});

