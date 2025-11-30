/**
 * Payment Validation Utilities
 * Implements Luhn algorithm for credit card validation
 * Industry-standard validation following ISO/IEC 7812-1
 */

/**
 * Luhn Algorithm Implementation
 * Validates credit card numbers using checksum calculation
 * 
 * @param {string} cardNumber - Credit card number to validate
 * @returns {boolean} - True if valid, false otherwise
 * 
 * How it works:
 * 1. Double every second digit from right to left
 * 2. If doubling results in 2 digits, add them together
 * 3. Sum all digits
 * 4. If sum is divisible by 10, card is valid
 */
export function validateCardNumber(cardNumber) {
    // Remove all non-digit characters
    const cleaned = cardNumber.replace(/\D/g, '');
    
    // Card number should be between 13-19 digits
    if (cleaned.length < 13 || cleaned.length > 19) {
        return false;
    }
    
    let sum = 0;
    let isEven = false;
    
    // Loop through values starting from the right
    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i], 10);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9; // Same as adding the two digits
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

/**
 * Identify card type based on number pattern
 */
export function identifyCardType(cardNumber) {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    // Visa: starts with 4
    if (/^4/.test(cleaned)) {
        return 'Visa';
    }
    
    // Mastercard: starts with 51-55 or 2221-2720
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) {
        return 'Mastercard';
    }
    
    // American Express: starts with 34 or 37
    if (/^3[47]/.test(cleaned)) {
        return 'American Express';
    }
    
    // Discover: starts with 6011, 622126-622925, 644-649, or 65
    if (/^6(?:011|5|4[4-9]|22(?:12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[01][0-9]|92[0-5]))/.test(cleaned)) {
        return 'Discover';
    }
    
    return 'Unknown';
}

/**
 * Validate CVV/CVC code
 */
export function validateCVV(cvv, cardType = 'Unknown') {
    const cleaned = cvv.replace(/\D/g, '');
    
    // American Express uses 4 digits, others use 3
    if (cardType === 'American Express') {
        return cleaned.length === 4;
    }
    
    return cleaned.length === 3;
}

/**
 * Validate expiration date
 */
export function validateExpirationDate(month, year) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed
    
    const expMonth = parseInt(month, 10);
    const expYear = parseInt(year, 10);
    
    // Validate month range
    if (expMonth < 1 || expMonth > 12) {
        return false;
    }
    
    // Handle 2-digit and 4-digit year formats
    let fullExpYear = expYear;
    if (expYear < 100) {
        // Assume 2-digit year (e.g., 25 = 2025)
        fullExpYear = 2000 + expYear;
    }
    
    // Check if card is expired
    if (fullExpYear < currentYear) {
        return false;
    }
    
    if (fullExpYear === currentYear && expMonth < currentMonth) {
        return false;
    }
    
    // Check if expiration is too far in the future (more than 20 years)
    if (fullExpYear > currentYear + 20) {
        return false;
    }
    
    return true;
}

/**
 * Format card number with spaces for display
 */
export function formatCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\D/g, '');
    const cardType = identifyCardType(cleaned);
    
    // American Express: 4-6-5 format
    if (cardType === 'American Express') {
        return cleaned.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
    }
    
    // Others: 4-4-4-4 format
    return cleaned.replace(/(\d{4})/g, '$1 ').trim();
}

/**
 * Mask card number for display (show only last 4 digits)
 */
export function maskCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\D/g, '');
    const last4 = cleaned.slice(-4);
    return `•••• •••• •••• ${last4}`;
}

/**
 * Comprehensive payment validation
 * Returns an object with validation results and error messages
 */
export function validatePaymentInfo(cardNumber, cvv, month, year) {
    const errors = [];
    const cardType = identifyCardType(cardNumber);
    
    // Validate card number
    if (!validateCardNumber(cardNumber)) {
        errors.push('Invalid card number. Please check and try again.');
    }
    
    // Validate CVV
    if (!validateCVV(cvv, cardType)) {
        errors.push(`Invalid CVV. ${cardType === 'American Express' ? '4 digits required' : '3 digits required'}.`);
    }
    
    // Validate expiration
    if (!validateExpirationDate(month, year)) {
        errors.push('Card is expired or has invalid expiration date.');
    }
    
    return {
        isValid: errors.length === 0,
        cardType: cardType,
        errors: errors,
        formattedNumber: formatCardNumber(cardNumber),
        maskedNumber: maskCardNumber(cardNumber)
    };
}

/**
 * Test card numbers for development
 */
export const TEST_CARDS = {
    VISA: '4532015112830366',
    MASTERCARD: '5425233430109903',
    AMEX: '374245455400126',
    DISCOVER: '6011000991300009',
    INVALID: '1234567890123456'
};
