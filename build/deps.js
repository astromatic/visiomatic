var deps = {
	Core: {
		src: [
			'IIPUtils.js',
			'Projection.WCS.js',
			'CRS.WCS.js',
			'Control.WCS.js',
			'Control.Scale.WCS.js',
			'TileLayer.IIP.js',
			'Catalogs.js',
			'Control.IIP.js',
			'Control.IIP.Image.js',
			'Control.IIP.Overlay.js',
			'Control.Layers.IIP.js',
			'Control.ExtraMap.js'
		],
		desc: 'The core of the library.'
	}
};

if (typeof exports !== 'undefined') {
	exports.deps = deps;
}
