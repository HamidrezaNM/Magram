// @optimization `toLocaleTimeString` is avoided because of bad performance
export function formatTime(datetime) {
    const date = typeof datetime === 'number' ? new Date(datetime) : datetime;
    const timeFormat = '24h';

    let hours = date.getHours();
    let marker = '';
    if (timeFormat === '12h') {
        marker = hours >= 12 ? '\xa0PM' : '\xa0AM'; // NBSP
        hours = hours > 12 ? hours % 12 : hours;
    }

    return `${String(hours).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}${marker}`;
}