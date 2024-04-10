class Utils {
	constructor() {}
}

export default Utils

export function formatNumber(value: number) {
    // Round up to two decimal places
    value = Math.ceil(value * 100) / 100;

    // Convert the number to a string with two decimal places
    let formattedValue = value.toFixed(2);

    // Add thousands separator
    formattedValue = formattedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return formattedValue;
}