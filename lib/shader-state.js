var IsUndefined = require('lodash.isundefined')
var Extend = require('lodash.assign')
var MapValues = require('lodash.mapvalues')
var IsArray = require('lodash.isarray')
var Each = require('lodash.foreach')

var Attributes = require('./attributes')
var Buffers = require('./buffers')
var Drawing = require('./drawing')
var Elements = require('./elements')
var Textures = require('./textures')
var Uniforms = require('./uniforms')

var internals = {
		
	setup : function( gl, config ) {
		
		if( !(config.program instanceof WebGLProgram) ) {
			throw "A WebGLProgram must be supplied to the setup"
		}
		
		var [ elements,   bindElements ]     = Elements.setup(   gl, config.elements )
		var [ attributes, bindAttributeFns ] = Attributes.setup( gl, config.program, config.attributes )
		var [ uniforms,   bindUniformFns ]   = Uniforms.setup(   gl, config.program, config.uniforms )
		var [ textures,   bindTextureFns ]   = Textures.setup(   gl, config.program, config.textures )
		
		var bind = internals.bindProgramFn(
			gl
		  , config.program
		  , bindElements
		  , bindAttributeFns
		  , bindUniformFns
		  , bindTextureFns
		)
		
		var unbind = internals.unbindProgramFn( gl )
		
		var [ drawing, draw ] = config.elements ?
			Drawing.elementsFn( gl, config, elements ) :
			Drawing.arraysFn( gl, config )
		
		return {
			
			//The config
			program: config.program
		  , attributes: attributes
		  , uniforms: uniforms
		  , elements: elements
		  , textures: textures
		  , drawing: drawing
			
			//The functions
		  , bind: bind
		  , unbind: unbind
		  , draw: draw
		  , bindDraw : function() {	bind(), draw(), unbind() }
		}
	},
	
	modify : function( gl, oldConfig, newConfig ) {
		
		var cleanedConfig = {}
		
		if( !IsUndefined( newConfig.elements ) ) {
			
			if( IsArray( newConfig.elements ) || ArrayBuffer.isView( newConfig.elements )) {
				cleanedConfig.elements = newConfig.elements
			} else {
				cleanedConfig.elements = Extend({},
					oldConfig.elements,
					internals.cleanValuesAndBuffer( newConfig.elements )
				)
			}
		}
		
		if( !IsUndefined( newConfig.attributes ) ) {
			cleanedConfig.attributes = Extend({},
				oldConfig.attributes,
				MapValues( newConfig.attributes, internals.cleanValuesAndBuffer )
			)
		}
		if( !IsUndefined( newConfig.uniforms ) ) {
			cleanedConfig.uniforms = Extend({},
				oldConfig.uniforms,
				MapValues( newConfig.uniforms, internals.cleanValuesAndBuffer )
			)
		}
		
		return internals.setup( gl,
			Extend( {}, oldConfig, newConfig, cleanedConfig )
		)
	},
		
	bindProgramFn : function( gl, shaderProgram, bindElements, bindAttributeFns, bindUniformFns, bindTextureFns ) {
		
		return function() {
			gl.useProgram( shaderProgram )
			bindElements()
			Each( bindAttributeFns, function(fn) { fn() } )
			Each( bindUniformFns, function(fn) { fn() } )
			Each( bindTextureFns, function(fn) { fn() } )
		}
	},

	unbindProgramFn : function( gl ) {
		
		return function() {
			
		}
	},
			
	cleanValuesAndBuffer : function( thing ) {
		
		// If the buffer needs to be rebuilt
		if( thing.value && IsUndefined(thing.buffer) ) {
			return Extend({
				buffer : null
			}, thing)
		}
		
		if( thing.buffer && IsUndefined(thing.value) ) {
			return Extend({
				value: null
			}, thing)
		}
	}
}

module.exports = function( gl, propsA, propsB ) {
	
	var properties = propsB ?
	
		// If two props are sent, modify A with B
		internals.modify( gl, propsA, propsB ) :
	
		// Otherwise just setup with the props sent
		propsA
	
	return internals.setup( gl, properties )
}