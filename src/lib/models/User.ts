import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWorkLog {
  date: string;
  dutyStatus: string;
  ordersHandled: number;
  dutyHours: number;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: "Customer" | "Admin" | "Staff";
  permissions?: string[];
  employeeId?: string;
  dutyStatus?: "Available" | "Busy" | "Offline";
  workLogs?: IWorkLog[];
  notificationEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WorkLogSchema = new Schema<IWorkLog>({
  date: { type: String, required: true },
  dutyStatus: { type: String, default: "Present" },
  ordersHandled: { type: Number, default: 0 },
  dutyHours: { type: Number, default: 8 },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["Customer", "Admin", "Staff"],
      default: "Customer",
    },
    permissions: {
      type: [String],
      default: ["orders", "coupons", "banners", "menu"],
    },
    employeeId: { type: String, default: "" },
    dutyStatus: {
      type: String,
      enum: ["Available", "Busy", "Offline"],
      default: "Available",
    },
    workLogs: { type: [WorkLogSchema], default: [] },
    notificationEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Pre-save hook to auto-generate employeeId if staff/admin
UserSchema.pre("save", async function (next) {
  if (this.role !== "Customer" && !this.employeeId) {
    const count = await mongoose.model("User").countDocuments({
      role: { $in: ["Admin", "Staff"] },
    });
    this.employeeId = `EMP-${1000 + count + 1}`;
  }
  next();
});

if (mongoose.models.User) {
  delete mongoose.models.User;
}

export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
