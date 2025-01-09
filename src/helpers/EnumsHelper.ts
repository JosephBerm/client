export default class EnumHelper<T> {
	public enumList: ToListItems<T>[]

	constructor(toListItems: ToListItems<T>[]) {
		this.enumList = toListItems
	}

	public getDisplay = (item: T): string => {
		return (this.enumList.find((f) => f.value === item) as ToListItems<T>).display
	}

	public getToListItemDisplay = (toListItem: ToListItems<T>): string => getToListItemDisplay(toListItem)

	public getToListItemValue = (toListItem: ToListItems<T>) => getToListItemValue(toListItem)
}

export interface ToListItems<T> {
	display: string
	value: T
	[key: string]: any
}

export function getToListItemDisplay<T>(toListItem: ToListItems<T>): string {
	return toListItem.display
}

export function getToListItemValue<T>(toListItem: ToListItems<T>): T {
	return toListItem.value
}
