import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStoreSettings extends Document {
  taxEnabled: boolean;
  taxPercentage: number;
  packagingEnabled: boolean;
  packagingChargeType: "whole_order" | "per_item";
  packagingFee: number;
  deliveryEnabled: boolean;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  restaurantName: string;
  restaurantPhone: string;
  restaurantAddress: string;
  updatedAt: Date;
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    taxEnabled: { type: Boolean, default: false },
    taxPercentage: { type: Number, default: 5 },
    packagingEnabled: { type: Boolean, default: true },
    packagingChargeType: {
      type: String,
      enum: ["whole_order", "per_item"],
      default: "whole_order",
    },
    packagingFee: { type: Number, default: 15 },
    deliveryEnabled: { type: Boolean, default: true },
    deliveryFee: { type: Number, default: 30 },
    freeDeliveryThreshold: { type: Number, default: 300 },
    restaurantName: { type: String, default: "Evergreen Cafe & Restaurant" },
    restaurantPhone: { type: String, default: "+91 98765 43210" },
    restaurantAddress: { type: String, default: "Ravan Gali, Nisha Complex, Ambagarh Chowki, Rajnandgaon, Chhattisgarh - 491665" },
  },
  { timestamps: true }
);

export const StoreSettings: Model<IStoreSettings> =
  mongoose.models.StoreSettings ||
  mongoose.model<IStoreSettings>("StoreSettings", StoreSettingsSchema);
