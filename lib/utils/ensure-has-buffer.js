module.exports = function ensureHasBuffer( gl, obj, bufferType ) {
	
	if( obj.value && !obj.buffer ) {
			
		var value = (obj.value instanceof Array) ?
			new obj.arrayBufferType( obj.value ) :
			obj.value
		
		var bufferObj = BufferTools.create( gl, value, bufferType, obj.usage )
		
		return _.extend( {}, obj, bufferObj )
		
	} else {
		
		return obj
	}	
}