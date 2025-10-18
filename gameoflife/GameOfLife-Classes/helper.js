// Helper Functions

function generateUniqueId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-SG', {
        style: 'currency',
        currency: 'SGD'
    }).format(amount);
}

function validateEnum(value, validValues) {
    return validValues.includes(value);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateUniqueId, formatCurrency, validateEnum };
}

if (typeof window !== 'undefined') {
    window.GOL = { generateUniqueId, formatCurrency, validateEnum };
}
