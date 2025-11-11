// RichConstructor decorator not needed in modern Next.js
export default class HtmlImage {
	public src: string = ''
	public alt: string = ''

	constructor(partial?: Partial<HtmlImage>) {
		if (partial) {
			Object.assign(this, partial) // Assign provided properties
		}
	}
}
