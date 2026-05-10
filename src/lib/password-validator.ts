export const validatePassword = (password: string): boolean => {
  // min 8 char, ada huruf besar, huruf kecil, karakter khusus, tanpa spasi
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password) && !/\s/.test(password);
};
