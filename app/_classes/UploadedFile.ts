// RichConstructor decorator not needed in modern Next.js

export default class UploadedFile {
	public name: string | null = null
	public contentType: string | null = null
	public data: Uint8Array | null = null
	public filePath: string | null = null

	constructor(partial: Partial<UploadedFile>) {
		if (partial) {
			Object.assign(this, partial)
		}
	}

	public GetFileType(): string | null {
		return this.name?.split('.')[1] ?? null
	}
}
