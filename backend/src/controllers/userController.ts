import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { userRepository } from "../repositories/userRepository";

export const userController = {
  async list(req: AuthRequest, res: Response) {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const users = await userRepository.listAll();

    return res.json({
      users: users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
      })),
    });
  },
};
