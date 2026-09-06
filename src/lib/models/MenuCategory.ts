import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMenuCategory extends Document {
  name: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
}

const MenuCategorySchema = new Schema<IMenuCategory>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const MenuCategory: Model<IMenuCategory> =
  mongoose.models.MenuCategory || mongoose.model<IMenuCategory>("MenuCategory", MenuCategorySchema);
