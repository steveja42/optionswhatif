const server = (window.location.hostname === "localhost") ? 'http://localhost:8080' : 'https://sj-td.herokuapp.com'  //https://resultify.live'
//const server =  'https://resultify.live'

/**
	 * Performs http get request from our node.js server
	 *
	 * @param {string} route the url .
	 * @return [response in JSON(null if error), error object]
	 */
	export async function get(route:string) {
		
		try {
			const rawResponse = await fetch(`${server}/${route}`);
			const json = await rawResponse.json()
			return [json]
		}
		catch (error) {
			console.error(`get: error occurred ${error}`);
			return [null, error]
		}
	}

	/**
	 * Performs http post request to our node.js server
	 *
	 * @param {string} data json to be posted .
	 * @return [response in JSON(null if error), error object]
	 */
	export async function post(data:object) {
	
			try {
				const response = await fetch(`${server}/feedback`, { 
					method: 'POST',
					body: JSON.stringify(data),
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
	
				});
				if (response.ok)
					return [true];
				let text = await response.text()	
				return [false, `error: status ${response.status} ${response.statusText} ${text}`]
			}
		
		catch (error) {
			console.error(`post: error occurred with fetch ${error}`);
			return [false, error]
		}
	}