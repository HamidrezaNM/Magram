export const pause = (ms) => new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
});