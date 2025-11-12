import mongoose from "mongoose";
import { ProductStatus } from "@monorepo/common";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.ACTIVE,
    },
    category: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Update status based on stock
productSchema.pre("save", function (next) {
  if (this.stock === 0 && this.status === ProductStatus.ACTIVE) {
    this.status = ProductStatus.OUT_OF_STOCK;
  } else if (this.stock > 0 && this.status === ProductStatus.OUT_OF_STOCK) {
    this.status = ProductStatus.ACTIVE;
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
