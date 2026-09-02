import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMenuItem extends Document {
  categoryId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  available: boolean;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: "MenuCategory", required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    price: { type: Number, required: true },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const MenuItem: Model<IMenuItem> =
  mongoose.models.MenuItem || mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);
