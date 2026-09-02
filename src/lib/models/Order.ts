import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export type OrderStatus =
  | "Placed"
  | "Accepted"
  | "Preparing"
  | "Ready"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export interface ICancelledBy {
  userId?: mongoose.Types.ObjectId;
  name?: string;
  role?: string;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: "Pending" | "Completed" | "Failed";
  orderStatus: OrderStatus;
  address: {
    title?: string;
    address: string;
  };
  latitude?: number;
  longitude?: number;
  deliveredAt?: Date;
  deliveredBy?: mongoose.Types.ObjectId;
  upiRef?: string;
  cancelledBy?: ICancelledBy;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        menuItemId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        imageUrl: { type: String, default: "" },
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: "Cash On Delivery" },
    paymentStatus: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
    orderStatus: {
      type: String,
      enum: ["Placed", "Accepted", "Preparing", "Ready", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Placed",
    },
    address: {
      title: { type: String, default: "Home" },
      address: { type: String, required: true },
    },
    latitude: { type: Number },
    longitude: { type: Number },
    deliveredAt: { type: Date },
    deliveredBy: { type: Schema.Types.ObjectId, ref: "User" },
    upiRef: { type: String },
    cancelledBy: {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      name: { type: String },
      role: { type: String },
    },
    cancelledAt: { type: Date },
    cancelReason: { type: String, default: "" },
  },
  { timestamps: true }
);

if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

export const Order: Model<IOrder> = mongoose.model<IOrder>("Order", OrderSchema);
