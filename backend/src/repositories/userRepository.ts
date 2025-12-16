import { UserModel, IUser } from "../models/User";

export const userRepository = {
  create(data: Pick<IUser, "name" | "email" | "passwordHash">) {
    return UserModel.create(data);
  },

  findByEmail(email: string) {
    return UserModel.findOne({ email }).exec();
  },

  findById(id: string) {
    return UserModel.findById(id).exec();
  },

  updateProfile(id: string, updates: Partial<Pick<IUser, "name">>) {
    return UserModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  },

  listAll() {
    return UserModel.find({}, { name: 1, email: 1 }).sort({ name: 1 }).exec();
  },
};
