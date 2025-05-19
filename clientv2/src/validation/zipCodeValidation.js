export const validateZipCode = (zipCode) => {
    if (!zipCode.trim()) return "Zip code is required.";
    if (!/^[0-9]+$/.test(zipCode)) return "Zip code must contain only digits.";
    if (zipCode.length < 4 || zipCode.length > 10) return "Zip code must be between 4 and 10 digits.";
    return "";
};