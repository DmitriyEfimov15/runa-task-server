import { PASSWORD_MIN_LENGTH, PASSWORD_REGEX } from 'src/constants/password';

export const valifyPassword = (password: string): boolean => {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return false;
  }

  if (!PASSWORD_REGEX.test(password)) {
    return false;
  }

  return true;
};
