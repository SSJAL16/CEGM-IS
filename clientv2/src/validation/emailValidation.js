export const validateEmail = (email, minLength = 5, maxLength = 50) => {
    if (!email.trim()) return "Email is required.";

    if (email.length < minLength) return `Email must be at least ${minLength} characters long.`;
    if (email.length > maxLength) return `Email must not exceed ${maxLength} characters.`;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email format.";

    return "";
};
  