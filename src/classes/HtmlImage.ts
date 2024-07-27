import { RichConstructor } from '@/decorators/RichConstructor'
export default class HtmlImage {
	public src: string = ''
	public alt: string = ''

	constructor(partial?: Partial<HtmlImage>) {
		if (partial) {
			Object.assign(this, partial) // Assign provided properties
		}
	}
}
