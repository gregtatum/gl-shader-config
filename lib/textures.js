var MapValues = require('lodash.mapvalues')
var IsUndefined = require('lodash.isundefined')
var Extend = require('lodash.assign')
var Map = require('lodash.map')
var Each = require('lodash.foreach')
var IsString = require('lodash.isstring')

var internals = {
	
	setup : function( gl, shaderProgram, rawTextures ) {
		
		var i = 0

		var textures = MapValues( rawTextures, function( properties, textureName ) {

			var textureBuffer = {}
			
			if( IsUndefined( properties.texture ) ) {
				
				if( properties.image ) {
					textureBuffer = internals.create( gl, properties.image, properties, properties.callback )					
				} else if( properties.url ) {
					textureBuffer = internals.create( gl, properties.url, properties, properties.callback )
				}
			}
			
			var unit = i++
			
			return Extend({
				location   : gl.getUniformLocation( shaderProgram, textureName ),
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
	
	create : function( gl, srcOrImage, properties, callback ) {
		
		var config = Extend({
			parameters : [
				[gl.TEXTURE_MIN_FILTER, gl.LINEAR]
			]
		  , level : 0
		  , internalformat : gl.RGBA
		  , format : gl.RGBA
		  , type : gl.UNSIGNED_BYTE
		  , mipmap : false
		  , state : { loaded: false }
		}, properties)
		
		var texture = gl.createTexture()
		var image
		
		var uploadData = function() {
			
			gl.bindTexture( gl.TEXTURE_2D, texture )
			
			gl.texImage2D(
				gl.TEXTURE_2D          // GLenum target
			  , 0                      // GLint level
			  , gl.RGBA                // GLenum internalformat
			  , gl.RGBA                // GLenum format
			  , gl.UNSIGNED_BYTE       // GLenum type
			  , image                  // TexImageSource? source
			)
			
			Each( config.parameters,
				([name, value]) => { gl.texParameteri( gl.TEXTURE_2D, name, value) }
			)
			
			if( config.mipmap ) {
				gl.generateMipmap(gl.TEXTURE_2D)
			}
			
			gl.bindTexture(gl.TEXTURE_2D, null)
			if( callback ) callback()
		}
		
		if( IsString( srcOrImage ) ) {
			image = new Image()
			image.onload = uploadData
			image.src = srcOrImage
		} else {
			image = srcOrImage
			uploadData()
		}
		
		return {
			texture : texture,
			image : image
		}
	}
	
}

module.exports = {
	setup : internals.setup
}
