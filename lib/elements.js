var EnsureHasBuffer = require('./utils/ensure-has-buffer')
var IsArray = require('lodash.isarray')
var Extend = require('lodash.assign')

module.exports = {
	
	setup : function( gl, valueOrProperties ) {
	
		if( valueOrProperties ) {
			// Accepts a buffer object as generated from the buffer tools (buffers.js)
	
			var properties = IsArray( valueOrProperties ) ? { value: valueOrProperties } : valueOrProperties
	
			var preliminaryConfig = Extend({
				value          : null
			  , buffer          : null
			  , type            : gl.ELEMENT_ARRAY_BUFFER
			  , arrayBufferType : Uint16Array
			  , bind            : null
			  , usage           : gl.STATIC_DRAW
			}, properties)
	
			var config = EnsureHasBuffer(
				gl,
				preliminaryConfig,
				gl.ELEMENT_ARRAY_BUFFER
			)
	
			return [ config, config.bind ]
		} else {
			return [ null, function() {} ]
		}
	},

	bindFn : function( elements ) {
	
		if( elements ) {
			return elements.bind
		} else { 
			return function() {}
		}
	}
}