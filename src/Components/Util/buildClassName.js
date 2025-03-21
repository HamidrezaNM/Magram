export default function buildClassName(...params) {
    return params.filter(Boolean).join(' ')
}