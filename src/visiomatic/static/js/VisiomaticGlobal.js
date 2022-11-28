/*
#	General VisiOmatic module index with global export
#
#	This file part of:	VisiOmatic
#
#	Copyright: (C) 2022 Emmanuel Bertin - CNRS/IAP/CFHT/SorbonneU
*/
import * as V from './Visiomatic.js'

function getGlobalObject() {
	if (typeof globalThis !== 'undefined') {
		return globalThis;
	}
	if (typeof self !== 'undefined') {
		return self;
	}
	if (typeof window !== 'undefined') {
		return window;
	}
	if (typeof global !== 'undefined') {
		return global;
	}

	throw new Error('Unable to locate global object.');
}

const globalObject = getGlobalObject();

globalObject.V = V;

