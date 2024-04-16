import { compare, hash } from "bcryptjs";

export const hashPassword = async (password: string) => {
  return hash(password, 12);
};

export const comparePassword = async (password: string, hashed: string) => {
  return compare(password, hashed);
};
