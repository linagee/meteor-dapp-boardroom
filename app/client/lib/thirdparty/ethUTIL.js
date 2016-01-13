ethUTIL = {
	isHexPrefixed: function (str) {
	  return str.slice(0, 2) === '0x'
	},
	
	stripHexPrefix: function (str) {
	  if (typeof str !== 'string') {
		return str
	  }
	  return this.isHexPrefixed(str) ? str.slice(2) : str
	},
	
	unpad: function(a) {
	  a = this.stripHexPrefix(a)
	  var first = a[0]
	  while (a.length > 0 && first.toString() === '0') {
		a = a.slice(1)
		first = a[0]
	  }
	  return a
	},
};