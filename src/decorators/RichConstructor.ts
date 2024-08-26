// src/decorators.ts

export function RichConstructor<T extends { new (...args: any[]): {} }>(constructor: T) {
	return class extends constructor {
		constructor(...args: any[]) {
			super(...args)
			const param = args[0]
			if (param) {
				Object.assign(this, param)
				deepCopy(this, param)
			}
		}
	}
}

function deepCopy(target: any, source: any) {
	for (const key of Object.keys(source)) {
		if (source[key] instanceof Array) {
			target[key] = source[key].map((item: any) =>
				typeof item === 'object' ? new (item.constructor as any)(item) : item
			)
		} else if (source[key] instanceof Date) {
			target[key] = new Date(source[key])
		} else if (source[key] !== null && typeof source[key] === 'object') {
			target[key] = new (source[key].constructor as any)(source[key])
		}
	}
}
 