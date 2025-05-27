export function handlePluralization(count, text) {
    return count !== 1 ? `${count} ${text}s` : `1 ${text}`
}