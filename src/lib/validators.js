// Validation helpers
export function validateBrandName(name) {
    if (!name || name.length < 2) {
        return { valid: false, error: 'Brand name must be at least 2 characters' };
    }
    if (name.length > 100) {
        return { valid: false, error: 'Brand name must be less than 100 characters' };
    }
    return { valid: true };
}

export function validateEmail(email) {
    if (!email) return { valid: true };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, error: 'Invalid email format' };
    }
    return { valid: true };
}

export function validatePhone(phone) {
    if (!phone) return { valid: true };
    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    if (!phoneRegex.test(phone)) {
        return { valid: false, error: 'Invalid phone number' };
    }
    return { valid: true };
}

export function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}
