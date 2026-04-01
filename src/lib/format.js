export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}
export function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
}
export function getMonthName(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' }).format(date);
}
