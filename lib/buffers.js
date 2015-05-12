module.exports = function createBuffer( gl, value, type = gl.ARRAY_BUFFER, usage = gl.STATIC_DRAW ) {
	
	var buffer = gl.createBuffer()
	gl.bindBuffer( type, buffer )
	gl.bufferData( type, value, usage )
	// gl.bindBuffer( type, null ) TODO
	
	return {
		value: value
	  , buffer: buffer
	  , bufferData: function() {
			gl.bufferData( type, value, usage )
		}
	  , bind: function() {
			gl.bindBuffer( type, buffer )
		}
	}
}