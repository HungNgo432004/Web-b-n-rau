const ProductCategory = require("../../models/product-category.model");
const Product = require("../../models/product.model");
const Account = require("../../models/account.model");
const User = require("../../models/user.model");
const Order = require("../../models/orders.model");

module.exports.dashboard = async (req, res) => {
  const statistic = {
    categoryProduct: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    product: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    account: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    user: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    order: {
      total: 0,
      processing: 0,
      delivered: 0,
      shipping: 0,
      totalAmount: 0, // Thêm tổng số tiền đã thu được
    },
  };

  try {
    // Thống kê danh mục sản phẩm
    statistic.categoryProduct.total = await ProductCategory.countDocuments({
      deleted: false,
    });
    statistic.categoryProduct.active = await ProductCategory.countDocuments({
      status: "active",
      deleted: false,
    });
    statistic.categoryProduct.inactive = await ProductCategory.countDocuments({
      status: "inactive",
      deleted: false,
    });

    // Thống kê sản phẩm
    statistic.product.total = await Product.countDocuments({ deleted: false });
    statistic.product.active = await Product.countDocuments({
      status: "active",
      deleted: false,
    });
    statistic.product.inactive = await Product.countDocuments({
      status: "inactive",
      deleted: false,
    });

    // Thống kê tài khoản admin
    statistic.account.total = await Account.countDocuments({ deleted: false });
    statistic.account.active = await Account.countDocuments({
      status: "active",
      deleted: false,
    });
    statistic.account.inactive = await Account.countDocuments({
      status: "inactive",
      deleted: false,
    });

    // Thống kê tài khoản client
    statistic.user.total = await User.countDocuments({ deleted: false });
    statistic.user.active = await User.countDocuments({
      status: "active",
      deleted: false,
    });
    statistic.user.inactive = await User.countDocuments({
      status: "inactive",
      deleted: false,
    });

    // Thống kê đơn hàng
    statistic.order.total = await Order.countDocuments({});
    statistic.order.processing = await Order.countDocuments({
      status: "processing",
    });
    statistic.order.delivered = await Order.countDocuments({
      status: "delivered",
    });
    statistic.order.shipping = await Order.countDocuments({
      status: "shipping",
    });

    // Tính tổng số tiền đã thu được từ các đơn hàng đã giao (delivered)
    const totalAmountResult = await Order.aggregate([
      { $match: { status: "delivered" } }, // Lọc các đơn hàng có trạng thái "delivered"
      { $unwind: "$products" }, // Giải nén mảng sản phẩm thành các phần tử riêng biệt
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: { $multiply: ["$products.price", "$products.quantity"] },
          }, // Tính tổng số tiền cho mỗi sản phẩm
        },
      },
    ]);
    
    // Gán giá trị tổng số tiền vào statistic
    statistic.order.totalAmount =
      totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;
    // Render kết quả lên view
    res.render("admin/pages/dashboard/index", {
      pageTitle: "Tổng quan",
      statistic: statistic,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).send("Lỗi khi lấy thông tin thống kê");
  }
};
