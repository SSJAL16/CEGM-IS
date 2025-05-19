export const validateName = (name, minLength = 2, maxLength = 50) => {
    if (!name.trim()) return "Name is required.";
    if (name.length < minLength) return `Name must be at least ${minLength} characters long.`;
    if (name.length > maxLength) return `Name must be at most ${maxLength} characters long.`;
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Name must contain only letters and spaces.";
    return "";
};
  