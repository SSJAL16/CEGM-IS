import { PhoneNumberUtil } from "google-libphonenumber";

const phoneUtil = PhoneNumberUtil.getInstance();

export const validatePersonNumber = (phone) => {
  try {
    const parsedNumber = phoneUtil.parseAndKeepRawInput(phone, "PH");

    if (!phoneUtil.isValidNumber(parsedNumber)) {
      return "The phone number is invalid.";
    }

    const phoneRegex = /^\+639\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return "Phone number must start with +639 and be followed by 9 digits.";
    }

    return "";
  } catch (error) {
    return "Phone number is required and must start with +639.";
  }
};
