import _ from 'lodash'

export default function paginate<T>(items: T[], pageNumber: number, pageSize: number) {
	const startIndex = (pageNumber - 1) * pageSize
	const endIndex = Math.min(startIndex + pageSize, items.length)
	const toReturn = items.slice(startIndex, endIndex)
	console.log(toReturn)
	return toReturn
}
