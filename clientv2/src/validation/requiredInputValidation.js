export const validateInput = (input, name) => {
    if (!input) {
      return name + " is required";
    }
    return "";
  };