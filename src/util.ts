import { post } from './network'
export const debugging = false

export function objectsAreEqual(a: any, b: any) {
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

export function trackPage(path: string) {
	post({ type: "pagecount", siteName: "owireact", path }, 'xz42', true)
}
export enum ll {
	error = 1,
	warning,
	important,
	normal,
	trace,
}

const loggingLevel = ll.normal

export function log(logLevel: ll, ...args: any[]): void {
	if (logLevel > loggingLevel)
		return
	let prepend = ""// new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })
	let output = ""
	for (const arg of args) {
		let appendValue = arg
		if (arg && typeof arg === 'object')
			appendValue = JSON.stringify(arg);

		output += appendValue + ' '
	}
	console.log(`${prepend} ${getFunctionName()}:${output}`);
}

/**
 * Returns the name of the calling function
 * doesn't work for async functions
 */
function getFunctionName() {

	let functionName = ''
	try {

		throw new Error('Throw error to get stack trace');

	} catch (error: any) {
		// The calling function we're interested in is up a few levels
		functionName = error.stack.split('\n')[3].replace(/^\s*at\s*(\w+).*/, '$1');
	}
	return functionName
}