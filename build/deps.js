var deps = {
	Core: {
		src: [
			'FileTree.js',
			'IIPUtils.js',
			'Projection.WCS.js',
			'CRS.WCS.js',
			'TileLayer.IIP.js',
			'Catalogs.js',
			'Control.WCS.js',
			'Control.Scale.WCS.js',
			'Control.Reticle.js',
			'Control.IIP.js',
			'Control.IIP.Image.js',
			'Control.IIP.Overlay.js',
			'Control.Layers.IIP.js',
			'Control.FullScreen.js',
			'Control.ExtraMap.js',
		],
		desc: 'The core of the library.'
	}
};

if (typeof exports !== 'undefined') {
	exports.deps = deps;
}
