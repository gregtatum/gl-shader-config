var MapValues = require('lodash.mapvalues')
var IsUndefined = require('lodash.isundefined')
var Extend = require('lodash.assign')
var Map = require('lodash.map')

module.exports = {
	
	setup : function( gl, shaderProgram, rawTextures ) {
		
		var i = 0

		var textures = MapValues( rawTextures, function( properties, textureName ) {

			var textureBuffer = {}
			
			if( IsUndefined( properties.texture ) ) {
				
				if( properties.image ) {
					textureBuffer = Buffers.texture( gl, properties.image, properties, properties.callback )					
				} else if( properties.url ) {
					textureBuffer = Buffers.texture( gl, properties.url, properties, properties.callback )
				}
			}
			
			var unit = i++
			
			return Extend({
				location   : gl.getUniformLocation( shaderProgram, textureName ),
				type       : null,
				value      : null,
				transpose  : false,
				unit       : unit,
				unitEnum   : gl["TEXTURE"+unit]
			}, textureBuffer, properties)
		})
		
		
		var bindFns = Map( textures, function( texture, key ) {
			
			return function() {
				gl.activeTexture( texture.unitEnum )
				gl.bindTexture( gl.TEXTURE_2D, texture.texture )
				gl.uniform1i( texture.location, texture.unit )
			}
		})
		
		return [ textures, bindFns ]
	},
}