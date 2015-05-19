var Extend = require('lodash.assign')
var MapValues = require('lodash.mapvalues')
var Map = require('lodash.map')
var Contains = require('lodash.contains')
var IsArray = require('lodash.isarray')
var IsObject = require('lodash.isobject')
var IsNumber = require('lodash.isnumber')
var IsFloat32Array = require('./utils/is-float32-array')
module.exports = {
	
	setup : function( gl, shaderProgram, rawUniforms ) {
	
		var uniforms = MapValues( rawUniforms, function( initialProperties, uniformName ) {
			
			var uniformProperties = IsObject( initialProperties ) && !IsFloat32Array( initialProperties ) ?
				initialProperties :
				module.exports.valueToObj( initialProperties, uniformName ) 
		
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
	
	valueToObj : function( value, uniformName ) {

		if( IsNumber(value) ) {
			
			return { value: value, type: "1f" }
			
		} else if( IsArray( value ) || IsFloat32Array( value ) ) {
			
			if( value.length > 0 && value.length <= 4 ) {
				return {
					value: value,
					type: value.length + "fv"
				}
			}
			
			if( value.length === 9 ) {
				return {
					value: value,
					type: "Matrix3fv"
				}
			}
			
			if( value.length === 16 ) {
				return {
					value: value,
					type: "Matrix4fv"
				}
			}
			
		}
		throw new Error(`The uniform ${uniformName} was not a valid value.`)
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
			console.warn('Uniform Types should be of the forms:', vectorUniformTypes.concat( matrixUniformTypes ).concat( singleUniformTypes ) )
			throw "Could not find that uniform function base on the uniform type."
		}
	}
}