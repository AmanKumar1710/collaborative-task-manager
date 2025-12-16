import { Response } from "express";
import { authService } from "../services/authService";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from "../utils/validation/authSchemas";
import { AuthRequest } from "../middleware/authMiddleware";

function setAuthCookie(res: Response, token: string) {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // set true in production with HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export const authController = {
  async register(req: AuthRequest, res: Response) {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Validation error", errors: parseResult.error.flatten() });
    }

    try {
      const { user, token } = await authService.register(parseResult.data);
      setAuthCookie(res, token);
      return res.status(201).json({
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (err) {
      if (err instanceof Error && err.message === "EMAIL_IN_USE") {
        return res.status(409).json({ message: "Email already in use" });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  async login(req: AuthRequest, res: Response) {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Validation error", errors: parseResult.error.flatten() });
    }

    try {
      const { user, token } = await authService.login(parseResult.data);
      setAuthCookie(res, token);
      return res.json({
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  async me(req: AuthRequest, res: Response) {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await authService.getCurrentUser(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      user: { id: user._id, name: user.name, email: user.email },
    });
  },

  async updateProfile(req: AuthRequest, res: Response) {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Validation error", errors: parseResult.error.flatten() });
    }

    const updated = await authService.updateProfile(req.userId, parseResult.data);
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      user: { id: updated._id, name: updated.name, email: updated.email },
    });
  },

  async logout(_req: AuthRequest, res: Response) {
    res.clearCookie("token");
    return res.status(204).send();
  },
};
