import { RichConstructor } from '@/decorators/RichConstructor'

export class SubmitOrderRequest {
	quoteId: number | null = null
	emails: string[] = []

	constructor(partial?: Partial<SubmitOrderRequest>) {
		if (partial) {
			Object.assign(this, partial)
		}
	}
}
