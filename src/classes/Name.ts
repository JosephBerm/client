export default class Name {
	public first: string = ''
	public middle?: string = ''
	public last: string = ''

	toString = () => {
		return `${this.last}, ${this.first}`
	}
}
