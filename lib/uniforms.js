var Extend = require('lodash.assign')
var MapValues = require('lodash.mapvalues')
var Map = require('lodash.map')
var Contains = require('lodash.contains')
var IsArray = require('lodash.isarray')

module.exports = {
	
	setup : function( gl, shaderProgram, rawUniforms ) {
	
		var uniforms = MapValues( rawUniforms, function( uniformProperties, uniformName ) {
		
			return Extend({
				location   : gl.getUniformLocation( shaderProgram, uniformName ),
				type       : null,
				value      : null,
				transpose  : false
			}, uniformProperties)
		})
	
		var bindFns = Map( uniforms, function( uniform ) {
			return module.exports.bindFn( gl, uniform )
		})
	
		return [ uniforms, bindFns ]
	},

	bindFn : function( gl, config ) {
			
		var vectorUniformTypes = [ "1fv", "2fv", "3fv", "4fv", "1iv", "2iv", "3iv", "4iv" ]
		var matrixUniformTypes = [ "Matrix2fv", "Matrix3fv", "Matrix4fv" ]
		var singleUniformTypes = [ "1f",  "2f",  "3f",  "4f",  "1i",  "2i",  "3i",  "4i" ]
	
		var glUniform = gl["uniform" + config.type]
	
		if( Contains( vectorUniformTypes, config.type )) {
		
			return function() {
				glUniform.call( gl, config.location, config.value )
			}
		
		} else if( Contains( matrixUniformTypes, config.type )) {
		
			return function() {
				glUniform.call( gl, config.location, Boolean(config.transpose), config.value )
			}
		
		} else if( Contains( singleUniformTypes, config.type )) {
		
			var dimensions = config.type.substr(0,1)
		
			switch( dimensions ) {
				case "1":
					if( IsArray( config.value ) ) {
						return function() {
							glUniform.call( gl, config.location, config.value[0] )
						}
					} else {
						return function() {
							glUniform.call( gl, config.location, config.value )
						}
					}
					break;
				case "2":
					return function() {
						glUniform.call( gl, config.location, config.value[0], config.value[1] )
					}
					break;
				case "3":
					return function() {
						glUniform.call( gl, config.location, config.value[0], config.value[1], config.value[3] )
					}
					break;
				case "4":
					return function() {
						glUniform.call( gl, config.location, config.value[0], config.value[1], config.value[3], config.value[4] )
					}
					break;
			}
		} else {
			console.warn('Uniform Types should be of the forms:', validUniformTypes.concat( singleUniformTypes) )
			throw "Could not find that uniform function base on the uniform type."
		}
	}
}