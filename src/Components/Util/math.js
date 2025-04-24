export const clamp = (num, min, max) => (Math.min(max, Math.max(min, num)));
export const isBetween = (num, min, max) => (num >= min && num <= max);
export const round = (num, decimals = 0) => Math.round(num * 10 ** decimals) / 10 ** decimals;
export const ceil = (num, decimals = 0) => Math.ceil(num * 10 ** decimals) / 10 ** decimals;
export const floor = (num, decimals = 0) => Math.floor(num * 10 ** decimals) / 10 ** decimals;
export const lerp = (start, end, interpolationRatio) => {
    return (1 - interpolationRatio) * start + interpolationRatio * end;
};