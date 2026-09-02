import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { connectToDatabase } from "./db";
import { User, IUser } from "./models/User";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Please define the ${name} environment variable.`);
  }
  return value;
}

const JWT_SECRET = requireEnv("JWT_SECRET");

export interface JWTPayload {
  userId: string;
  email: string;
  role: "Customer" | "Admin" | "Staff";
  name: string;
  permissions?: string[];
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function getSessionUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("evergreen_token")?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}

export async function requireAuthUser(): Promise<IUser | null> {
  const session = await getSessionUser();
  if (!session) return null;

  await connectToDatabase();
  const user = await User.findById(session.userId).select("-passwordHash");
  return user;
}

export async function requireAdminUser(): Promise<IUser | null> {
  const user = await requireAuthUser();
  if (!user || user.role !== "Admin") {
    return null;
  }
  return user;
}

export async function requireStaffOrAdminUser(): Promise<IUser | null> {
  const user = await requireAuthUser();
  if (!user || (user.role !== "Staff" && user.role !== "Admin")) {
    return null;
  }
  return user;
}
