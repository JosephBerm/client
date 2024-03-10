class Utils {
	constructor() {}

	public static handleFormChange = <T>(setFunc: Function, key: keyof T, value: string) => {
		setFunc((prevProduct: T) => ({
			...prevProduct,
			[key]: value,
		}))
	}
}

export default Utils
