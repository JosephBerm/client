export default class Name {
	public first: string = ''
	public middle?: string = ''
	public last: string = ''
	public title?: string = ''
	public suffix?: string = ''

	public toString = () => {
		return this.getFormattedName('lastFirst')
	}

	public getInitials = () => {
		let initials = this.first.charAt(0).toUpperCase()
		if (this.middle) initials += this.middle.charAt(0).toUpperCase()
		initials += this.last.charAt(0).toUpperCase()
		return initials
	}

	public getFullName = () => {
		let fullName = this.first
		if (this.middle) fullName += ` ${this.middle}`
		fullName += ` ${this.last}`
		return fullName
	}

	public getFormattedName = (format: 'firstLast' | 'lastFirst' | 'last' | 'first' = 'firstLast') => {
		switch (format) {
			case 'firstLast':
				return `${this.first} ${this.last}`
			case 'lastFirst':
				return `${this.last}, ${this.first}`
			case 'last':
				return this.last
			case 'first':
				return this.first
			default:
				return ''
		}
	}

	public validateName = () => {
		return this.first.trim() !== '' && this.last.trim() !== ''
	}
}
