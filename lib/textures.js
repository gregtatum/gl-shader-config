module.exports = {
	
	setup : function( gl, shaderProgram, rawTextures ) {
		
		var i = 0

		var textures = _.mapValues( rawTextures, function( properties, textureName ) {

			var textureBuffer = {}
			
			if( _.isUndefined( properties.texture ) ) {
				
				if( properties.image ) {
					textureBuffer = Buffers.texture( gl, properties.image, properties, properties.callback )					
				} else if( properties.url ) {
					textureBuffer = Buffers.texture( gl, properties.url, properties, properties.callback )
				}
			}
			
			var unit = i++
			
			return _.extend({
				location   : gl.getUniformLocation( shaderProgram, textureName ),
				type       : null,
				value      : null,
				transpose  : false,
				unit       : unit,
				unitEnum   : gl["TEXTURE"+unit]
			}, textureBuffer, properties)
		})
		
		
		var bindFns = _.map( textures, function( texture, key ) {
			
			return function() {
				gl.activeTexture( texture.unitEnum )
				gl.bindTexture( gl.TEXTURE_2D, texture.texture )
				gl.uniform1i( texture.location, texture.unit )
			}
		})
		
		return [ textures, bindFns ]
	},
}