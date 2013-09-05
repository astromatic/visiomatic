var deps = {
	Core: {
		src: [
			'L.Projection.WCS.js',
			'L.CRS.WCS.js',
			'L.TileLayer.IIP.js',
			'L.Control.IIP.js',
			'L.Control.IIP.Image.js',
			'L.Control.IIP.Plot.js'
		],
		desc: 'The core of the library.'
	}
};

if (typeof exports !== 'undefined') {
	exports.deps = deps;
}
