# gl-shader-config (experimental)

Configure the state of a WebGL shader with a simple data structure object. Easily bind, draw, and unbind. This module hides the verbosity of the underlying WebGL API, but maintains the expressiveness of how you can deal with the data in your application.

## How to use:

	require('gl-shader-config')(
	    gl      // the current WebGL context
	  , config  // an object defining the config (see below)
	)

OR

	require('gl-shader-config')(
	    gl          // the current WebGL context
	  , baseConfig  // an existing shader config
	  , newConfig   // the changes to apply
	)

The main function will return a new copy of your config object that has been filled out with default values. It will upload any missing buffer data, and ensure that array data is an ArrayBuffer.

## Example:

	var ShaderConfig = require('gl-shader-config')
	
	var magentaBox = ShaderConfig( gl, {
		
		program: shaderProgram,
		
		elements: box.cells,
		
		attributes: {
			position: {
				value: box.positions,
				size: 3
			}
		},
		uniforms: {
			color : {
				value: [1,0,1,1],
				type: "4fv"
			},
			...
		}
	})
	
	var cyanBox = ShaderConfig( gl, magentaBox, {
		
		uniforms: {
			color: {
				value: [0,1,1,1],
				type: "4fv"
			}
		}
	})
	
	magentaBox.bindDraw()
	cyanBox.bindDraw()


## The config object

The config defines the shader state. Any missing details will be filled in, and all passed data will written to the appropriate buffer. Any bare arrays will be converted to the specified `ArrayBuffer` type.

	shaderConfig = {
	    program    : WebGLProgram   // the shader program
	  , elements   : {}             // config for the elements array
	  , attributes : {}             // config for attributes
	  , uniforms   : {}             // config for uniforms
	  , textures   : {}             // config for textures for the uniforms
	  , drawing    : {}             // how to define the draw function
	  ..
	}

Additionally the following functions will be added to the mapped config object:

	shaderConfig = { 
	    ...
	  , bind     : function() {}  // bind the shader config
	  , unbind   : function() {}  // unbind the shader config
	  , draw     : function() {}  // draw the shader
	  , bindDraw : function() {}  // convenience function to bind, draw, unbind
	}

### config.elements

Set the elements as an array and it will automatically create the bindings for `gl.ELEMENT_ARRAY_BUFFER`.

	config.elements = [0,1,2,2,3,0, ... ]

Or set up the configuration manually. Any missing details will be filled in if possible.

	config.elements = {
	    value  : [0,1,2,2,3,0,...]          // will lose the reference if it's not an ArrayBuffer
	  , buffer : WebGLBuffer                // if undefined, will be generated from the .value
	  , type   : gl.ELEMENT_ARRAY_BUFFER
	  , arrayBufferType : Uint16Array       // the .value will be converted into this ArrayBuffer view
	  , bind   : function() {               // the function that performs the bind
	        gl.bindBuffer( type, buffer )
	    }
	}

### config.attributes

Key-pair values where the property name is the name of the attribute in the shader, and the value is the configuration.

	config.attributes = {
		attrName : {
			
			//Required:
			value           : [ -1,-1,-1, 0,0,0, 1,1,1, ... ]
		  , size            : 3 // how many values to use per attribute, e.g. vec3 uses 3
		  
		  	//Optional:		  
		  , buffer          : WebGLBuffer
		  , location        : AttributeLocation
		  , type            : gl.FLOAT  // BYTE, SHORT, UNSIGNED_{BYTE, SHORT}, FIXED, FLOAT
		  , normalized      : false
		  , stride          : 0
		  , offset          : 0
		  , arrayBufferType : Float32Array
		}
	}


### config.uniforms


	config.uniforms = {
	    uniformName : {
	       	value     : SomeValue         // The value
	      ,	type      : String            // What type of value, see below for possible options
	      , location  : UniformLocation   // uniform location int
	      ,	transpose : false             // tranpose a matrix
	    }
	}

The types can follow the fall into one of the values as defined below. These correspond to the suffixes of the WebGL uniform commands: `gl.uniform[1234][fi]`, `gl.uniform[1234][fi]v`, and `gl.uniformMatrix[234]fv`

	vectorUniformTypes = [ "1fv", "2fv", "3fv", "4fv", "1iv", "2iv", "3iv", "4iv" ]
	matrixUniformTypes = [ "Matrix2fv", "Matrix3fv", "Matrix4fv" ]
	singleUniformTypes = [ "1f",  "2f",  "3f",  "4f",  "1i",  "2i",  "3i",  "4i" ]


### config.textures

Sets up a uniform texture.

    config.textures = {
        textureName : {
        
          // Basic values
          
		  , url            : "/texture.png"     // An image to load, fires callback when loaded
          , callback       : Function           // Called after the image url has been loaded
          , image          : Image              // A loaded Image
          
          // Advanced
		  
          , location       : UniformLocation
          , unit           : 0                  // int value to which unit the texture will be bound
          , unitEnum       : gl.TEXTURE0        // the gl enum of the above value                             
          , level          : 0                  // level of detail for the texture
          , internalformat : gl.RGBA            // ALPHA, LUMINANCE, LUMINANCE_ALPHA, RGB, RGBA
          , format         : gl.RGBA            // ALPHA, LUMINANCE, LUMINANCE_ALPHA, RGB, RGBA
          , mipmap         : false              // Generate a mipmap, texture dimensions must be power of 2
          , state          : { loaded: false }  // Whether or not the image is loaded or not
          , type           : gl.UNSIGNED_BYTE   // UNSIGNED_BYTE, FLOAT, UNSIGNED_SHORT_5_6_5,
                                                // UNSIGNED_SHORT_4_4_4_4, UNSIGNED_SHORT_5_5_5_1
          , parameters     : [ [gl.TEXTURE_MIN_FILTER, gl.LINEAR] ]
                             // key value tuples to define the texture parameters via gl.texParameteri()
                             // TEXTURE_MAG_FILTER, TEXTURE_MIN_FILTER, TEXTURE_WRAP_S, TEXTURE_WRAP_T
        }
    }

### config.drawing

gl.drawElements (used when an elements property exists)

	config.drawing = {
	    mode   : gl.TRIANGLES           // POINTS, LINES, LINE_STRIP, LINE_LOOP, TRIANGLES, TRIANGLE_STRIP, TRIANGLE_FAN
	  , count  : elements.value.length  // The number of elements to render
	  , type   : gl.UNSIGNED_SHORT      // Must be a gl.UNSIGNED_SHORT
	  , offset : 0                      // How many BYTES to offset by
	}

gl.drawArrays (used when no elements property exists)

	config.drawing = {
        mode : gl.TRIANGLES  // POINTS, LINES, LINE_STRIP, LINE_LOOP, TRIANGLES, TRIANGLE_STRIP, TRIANGLE_FAN
      , first : 0            // The first element to render in the array of vector points
      , count : Number       // Guesses the vertex count from the attributes' values
	}
