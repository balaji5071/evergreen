import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  discount: number; // For backward compatibility
  minOrderAmount: number;
  maxDiscountAmount?: number;
  description?: string;
  terms?: string;
  validTill?: Date;
  active: boolean;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percentage", "flat"], default: "percentage" },
    discountValue: { type: Number, required: true },
    discount: { type: Number }, // legacy fallback
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number, default: 0 },
    description: { type: String, default: "" },
    terms: { type: String, default: "" },
    validTill: { type: Date },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Clear model cache in Next.js development HMR to ensure schema updates take effect
if (mongoose.models.Coupon) {
  delete mongoose.models.Coupon;
}

export const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);
