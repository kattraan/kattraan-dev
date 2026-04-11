export const validatePasswordStrength = (password) => {
    const meta = {
        hasMinLength: password.length >= 8,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(meta).filter(Boolean).length;

    let strength = 'None';
    if (score > 0 && score <= 2) strength = 'Weak';
    else if (score > 2 && score <= 4) strength = 'Medium';
    else if (score === 5) strength = 'Strong';

    return {
        meta,
        score,
        strength,
        isValid: score === 5, // Requires all criteria for "Strong"
        error: score === 5 ? "" : "Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters."
    };
};
