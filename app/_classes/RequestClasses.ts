// RichConstructor decorator not needed in modern Next.js

export class SubmitOrderRequest {
	quoteId: number | null = null
	emails: string[] = []

	constructor(partial?: Partial<SubmitOrderRequest>) {
		if (partial) {
			Object.assign(this, partial)
		}
	}
}
