const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    cart_id: String,
    userInfo: {
      fullName: String,
      phone: String,
      address: String,
    },
    products: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId, // <- Quan trọng
          ref: "Product", // <- Liên kết tới model Product
        },
        // product_id: String,
        price: Number,
        discountPercentage: Number,
        quantity: Number,
      },
    ],
    deleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["processing", "shipping", "delivered"],
      default: "processing",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema, "orders");

module.exports = Order;
