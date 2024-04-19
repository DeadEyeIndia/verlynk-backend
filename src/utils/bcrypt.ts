import { compare, hash } from "bcryptjs";

/**
 *
 * @param {string} password - Password to be hashed.
 * @returns {Promise<string>} A promise resolving to the hashed password.
 */
export const hashPassword = async (password: string): Promise<string> => {
  return hash(password, 12);
};

/**
 *
 * @param password - The password to be compared.
 * @param hashed - The hashed password to compare against.
 * @returns {Promise<boolean>} A promise resolving to a boolean indicating whether the password matches the hashed version.
 */

export const comparePassword = async (
  password: string,
  hashed: string
): Promise<boolean> => {
  return compare(password, hashed);
};
