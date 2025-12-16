import { apiClient } from "../lib/apiClient";

export interface AppUser {
  id: string;
  name: string;
  email: string;
}

export async function fetchUsers(): Promise<AppUser[]> {
  const res = await apiClient.get("/users");
  return res.data.users as AppUser[];
}
