# gl-shader-state

Configure the state of a WebGL shader with a simple data structure object. Easily bind, draw, and unbind.

## Config for ShaderState.setup( gl, shaderConfiguration )

 * `gl` - the current context
 * `config` - an object with the configured state, as defined below
 
OR

 * `gl` - the current context
 * `baseConfig` - Some other configuration to base the new config from
 * `config` - an object with the configured state, as defined below


The setup will return a new copy of your config that has been filled out with defaults.

	shaderConfiguration = {
	    //The config
	    program: WebGLProgram // the shader program
	  , elements: {}
	  , attributes: {}
	  , uniforms: {}
	  , drawing: {}
	}

Additionally the following functions will be added to the mapped config object:

	shaderConfiguration = { 
	    ...
	  , bind: function() {}
	  , unbind: function() {}
	  , draw: function() {}
	}


### config.elements

Set the elements as the array and it will automatically create the bindings for `ELEMENT_ARRAY_BUFFER`

	config.elements = [0,1,2,2,3,0, ... ]

Or set up the configuration manually.

	config.elements = {
	    value : [0,1,2,2,3,0,...]          // will lose the reference if it's not an ArrayBuffer
	  , buffer : WebGLBuffer                // if undefined, will be generated from the .value
	  , type   : gl.ELEMENT_ARRAY_BUFFER
	  , arrayBufferType : Uint16Array       // the .value will be converted into this ArrayBuffer view
	  , bind   : function() {               // the function that performs the bind
	        gl.bindBuffer( type, buffer )
	    }
	}

### config.attributes

	config.attributes = {
		attrName : {
			
			//Required:
			value          : [ -1,-1,-1, 0,0,0, 1,1,1, ... ]
		  , size            : 3
		  
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
	       	value     : null
	      ,	type      : "
	      , location  : null
	      ,	transpose : false
	    }
	}
