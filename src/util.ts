import { post } from './network'
export const debugging = true
export const runningLocally = window.location.hostname === "localhost"

export function objectsAreEqual(a:any, b:any) {
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

 export function trackPage(path:string){
	post({ type: "pagecount", siteName:"owireact",path}, 'xz42',true)   
}

export function log(x: string | any): void {
	let prepend = ""// new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })
	if (x && typeof x === 'object')
		x = JSON.stringify(x);
	console.log(`${prepend} ${getFunctionName()}:${x}`);
}

/**
 * Returns the name of the calling function
 * doesn't work for async functions
 */
function getFunctionName() {

	let functionName = ''
	try {

		throw new Error('Throw error to get stack trace');

	} catch (error:any) {
		// The calling function we're interested in is up a few levels
		functionName = error.stack.split('\n')[3].replace(/^\s*at\s*(\w+).*/, '$1');
	}
	return functionName
}