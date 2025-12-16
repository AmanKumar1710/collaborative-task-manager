import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/userRepository";
import { ENV } from "../config/env";
import { RegisterInput, LoginInput, UpdateProfileInput } from "../utils/validation/authSchemas";
import { IUser } from "../models/User";

const JWT_EXPIRES_IN = "7d";

function signToken(user: IUser) {
  return jwt.sign(
    { sub: user._id, email: user.email },
    ENV.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new Error("EMAIL_IN_USE");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    const token = signToken(user);
    return { user, token };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const token = signToken(user);
    return { user, token };
  },

  async getCurrentUser(userId: string) {
    return userRepository.findById(userId);
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    return userRepository.updateProfile(userId, { name: input.name });
  },
};
