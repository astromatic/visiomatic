var deps = {
	Core: {
		src: [
			'Projection.WCS.js',
			'CRS.WCS.js',
			'IIPUtils.js',
			'TileLayer.IIP.js',
			'RGB.js',
			'EllipseMarker.js',
			'Ellipse.js',
			'Catalog.js',
			'FlipSwitch.js',
			'SpinBox.js',
			'FileTree.js',
			'Control.Attribution.Logos.js',
			'Control.ExtraMap.js',
			'Control.FullScreen.js',
			'Control.IIP.js',
			'Control.IIP.Catalog.js',
			'Control.IIP.Channel.js',
			'Control.IIP.Doc.js',
			'Control.IIP.Image.js',
			'Control.IIP.Profile.js',
			'Control.IIP.Region.js',
			'Control.IIP.Snapshot.js',
			'Control.Layers.IIP.js',
			'Control.Reticle.js',
			'Control.Scale.WCS.js',
			'Control.Sidebar.js',
			'Control.WCS.js'
		],
		desc: 'The core of the library.'
	}
};

if (typeof exports !== 'undefined') {
	exports.deps = deps;
}
