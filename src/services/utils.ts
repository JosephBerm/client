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


// Generic function to convert enum to an array of objects
export function convertEnumToObject<T extends Record<string | number, number | string>>(enumObj: T): Record<string, number> {
    const copyOfeNum = { ...enumObj };

    for (const key in copyOfeNum) {
        if (!isNaN(Number(key))) {
            delete copyOfeNum[key];
        }
    }

    return copyOfeNum as Record<string, number>;
}

export function EnumToDropdownValues<T extends {[index: string]: string | number}>(enumVariable: T) {
    return Object.keys(enumVariable)
      .filter(key => isNaN(Number(key))) // filter out the numeric keys
      .map(key => ({ id: enumVariable[key], name: key })); // map to an array of { value, label } objects
}
