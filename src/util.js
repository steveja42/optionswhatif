export function objectsAreEqual(a, b) {
	for (var prop in a) {
	  if (a.hasOwnProperty(prop)) {
		 if (b.hasOwnProperty(prop)) {
			if (typeof a[prop] === 'object') {
			  if (!objectsAreEqual(a[prop], b[prop])) return false;
			} else {
			  if (a[prop] !== b[prop]) return false;
			}
		 } else {
			return false;
		 }
	  }
	}
	return true;
 }