/* 
regular expressions to change json to interface
(^\s*)"(\w+)":  $1$2:
(:\s*)"[^"]*"  $1string
(:\s*)true|false $1boolean
(:\s*)\d*\.*\d+ $1number
*/





interface Dic {
	[key: string]: Object[]
}
const myObject: Record<string, object[]> = { ... }
//Also, consider typing the keys whenever possible:

type MyKey = 'key1' | 'key2'

const myObject2: Record<MyKey, object[]> = { ... }
