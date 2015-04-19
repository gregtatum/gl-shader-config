var IsNumber = require('lodash.isnumber')
var Extend = require('lodash.assign')
var Find = require('lodash.find')

module.exports = {
	
	guessAttributeLength : function( attributes ) {
		
		var attribute = Find( attributes, function( attribute ) {
			return !!attribute.value && attribute.size > 0
		})
		
		return attribute ? attribute.value.length / attribute.size : null
	},
	
	arraysFn : function( gl, shaderConfig ) {
		
		var config = Extend({
			mode : gl.TRIANGLES
		  , count : module.exports.guessAttributeLength( shaderConfig.attributes )
		  , first : 0
		}, shaderConfig.drawing)
		
		if( !IsNumber( config.count ) ) {
			throw "Count not guess the count of the attributes, and no count was provided on the draw property."
		}
		
		var draw = function() {
			
			gl.drawArrays(
				config.mode, 
				config.first,
				config.count
			)
		}
		
		return [ config, draw ]
	},
	
	elementsFn : function( gl, shaderConfig, elements ) {
	
		var config = Extend({
			mode : gl.TRIANGLES
		  , count : elements.value.length
		  , type : gl.UNSIGNED_SHORT
		  , offset : 0
		}, shaderConfig.drawing)
	
		var draw = function() {
			
			gl.drawElements(
				config.mode,
				config.count,
				config.type,
				config.offset
			)
		}
	
		return [ config, draw ]
	},
	
	
}