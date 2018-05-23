exports.config = {

	// environment
	"browser": true,
	"node": true,
	"predef": ['alert', 'ActiveXObject', 'define', 'L'],
	"strict": false,

	// code style
	"bitwise": false,
	"camelcase": true,
	"curly": true,
	"eqeqeq": true,
	"forin": false,
	"immed": true,
	"latedef": true,
	"newcap": true,
	"noarg": true,
	"noempty": true,
	"nonew": true,
	"undef": true,
	"unused": false,
	"quotmark": "single",

	// whitespace
	"indent": 4,
	"trailing": true,
	"white": true,
	"smarttabs": true,
	"maxlen": 128

	// code simplicity - not enforced but nice to check from time to time
	// "maxstatements": 20,
	// "maxcomplexity": 5
	// "maxparams": 4,
	// "maxdepth": 4
};
