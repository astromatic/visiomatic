var deps = {
	Core: {
		src: [
			'L.IIPUtils.js',
			'L.Projection.WCS.js',
			'L.CRS.WCS.js',
			'L.Control.WCS.js',
			'L.TileLayer.IIP.js',
			'L.Catalogs.js',
			'L.Control.IIP.js',
			'L.Control.IIP.Image.js',
			'L.Control.IIP.Overlay.js',
			'L.Control.Layers.IIP.js',
			'L.Control.ExtraMap.js'
		],
		desc: 'The core of the library.'
	}
};

if (typeof exports !== 'undefined') {
	exports.deps = deps;
}
