export const validateSupplierName = (name, minLength = 2, maxLength = 50) => {
    if (!name.trim()) return "Company name is required.";
    if (name.length < minLength) return `Company name must be at least ${minLength} characters long.`;
    if (name.length > maxLength) return `Company name must be at most ${maxLength} characters long.`;
    return "";
};
  