export function decimalToHex(num) {
    if (!num) return
    const hex = "#" + num.toString(16).padStart(6, "0");

    return hex
}