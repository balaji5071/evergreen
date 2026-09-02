import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Order } from "@/lib/models/Order";
import { requireAdminUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized. Admin required." }, { status: 403 });
    }

    await connectToDatabase();
    const rawUsers = await User.find({}).select("-passwordHash").sort({ createdAt: -1 });

    const now = new Date();

    // Attach Employee ID if missing & compute daysWorked
    const usersWithStats = await Promise.all(
      rawUsers.map(async (u) => {
        const userObj = u.toObject();

        if (userObj.role !== "Customer" && !userObj.employeeId) {
          const count = await User.countDocuments({ role: { $in: ["Admin", "Staff", "Delivery"] } });
          userObj.employeeId = `EMP-${1000 + count}`;
          await User.findByIdAndUpdate(u._id, { employeeId: userObj.employeeId });
        }

        const createdAt = new Date(userObj.createdAt || Date.now());
        const diffTime = Math.abs(now.getTime() - createdAt.getTime());
        const daysWorked = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        let totalOrdersDelivered = 0;
        let totalRevenueCollected = 0;

        if (userObj.role !== "Customer") {
          const deliveredOrders = await Order.find({
            deliveredBy: u._id,
            orderStatus: "Delivered",
          });
          totalOrdersDelivered = deliveredOrders.length;
          totalRevenueCollected = deliveredOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
        }

        return {
          ...userObj,
          daysWorked,
          totalOrdersDelivered,
          totalRevenueCollected,
        };
      })
    );

    return NextResponse.json(usersWithStats);
  } catch (error: any) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized. Admin required." }, { status: 403 });
    }

    const { name, email, phone, password, role, permissions } = await req.json();

    if (!name || !email || !phone || !password || !role) {
      return NextResponse.json(
        { message: "Name, email, phone, password, and role are required." },
        { status: 400 }
      );
    }

    // Admin cannot create Customer accounts
    if (role === "Customer") {
      return NextResponse.json(
        { message: "Admin cannot create customer accounts. Only Staff and Admin accounts can be created." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: "A user with this email already exists." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const count = await User.countDocuments({ role: { $in: ["Admin", "Staff"] } });
    const employeeId = `EMP-${1000 + count + 1}`;

    const defaultPermissions = Array.isArray(permissions) && permissions.length > 0
      ? permissions
      : ["orders", "coupons", "banners", "menu"];

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role,
      permissions: defaultPermissions,
      employeeId,
      dutyStatus: "Available",
    });

    const userObj = newUser.toObject();
    delete (userObj as any).passwordHash;

    return NextResponse.json(userObj, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json({ message: error.message || "Failed to create user" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized. Admin required." }, { status: 403 });
    }

    const { userId, role, permissions } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "UserId is required" }, { status: 400 });
    }

    await connectToDatabase();

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (role) {
      userToUpdate.role = role;
      if (role !== "Customer" && !userToUpdate.employeeId) {
        const count = await User.countDocuments({ role: { $in: ["Admin", "Staff"] } });
        userToUpdate.employeeId = `EMP-${1000 + count + 1}`;
      }
    }

    if (Array.isArray(permissions)) {
      userToUpdate.permissions = permissions;
    }

    await userToUpdate.save();

    return NextResponse.json(userToUpdate);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized. Admin required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ message: "User ID is required for deletion" }, { status: 400 });
    }

    if (userId === (admin._id as any).toString()) {
      return NextResponse.json({ message: "You cannot delete your own admin account." }, { status: 400 });
    }

    await connectToDatabase();

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Staff member deleted successfully." });
  } catch (error: any) {
    console.error("DELETE /api/admin/users error:", error);
    return NextResponse.json({ message: error.message || "Failed to delete user" }, { status: 500 });
  }
}
