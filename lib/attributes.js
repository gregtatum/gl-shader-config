var Extend = require('lodash.assign')
var Map = require('lodash.map')
var MapValues = require('lodash.mapvalues')
var EnsureHasBuffer = require('./utils/ensure-has-buffer')

module.exports = {
	
	setup : function( gl, shaderProgram, rawAttributes ) {
	
		var attributes = MapValues( rawAttributes, function( properties, name ) {
		
			var config = Extend({
				buffer          : null
			  , location        : gl.getAttribLocation( shaderProgram, name )
			  , type            : gl.FLOAT
			  , size            : 3
			  , normalized      : false
			  , stride          : 0
			  , offset          : 0
			  , arrayBufferType : Float32Array
			}, properties)

			if( config.location === -1 ) {
				throw `The attribute "${name}" does not exist in the shader program`
			}
		
			return EnsureHasBuffer( gl, config, gl.ARRAY_BUFFER )			
		})
	
		var bindFns = Map( attributes, function( attribute ) {
			return module.exports.bindFn( gl, attribute )
		})
	
		return [ attributes, bindFns ]
	},

	bindFn : function( gl, attribute ) {
	
		return function() {
		
			attribute.bind()
			gl.enableVertexAttribArray( attribute.location )
			gl.vertexAttribPointer(
				attribute.location
			  , attribute.size
			  , attribute.type
			  , attribute.normalized
			  , attribute.stride
			  , attribute.offset
			)
		}
	}
}