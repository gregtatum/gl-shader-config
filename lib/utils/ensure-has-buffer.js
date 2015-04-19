var Buffers = require('../buffers')
var Extend = require('lodash.assign')

module.exports = function ensureHasBuffer( gl, obj, bufferType ) {
	
	if( obj.value && !obj.buffer ) {
			
		var value = (obj.value instanceof Array) ?
			new obj.arrayBufferType( obj.value ) :
			obj.value
		
		var bufferObj = Buffers.create( gl, value, bufferType, obj.usage )
		
		return Extend( {}, obj, bufferObj )
		
	} else {
		
		return obj
	}	
}