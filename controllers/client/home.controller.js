const Product = require("../../models/product.model");
const filterStatusHelper = require("../../helpers/filterStatus1");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const Order = require("../../models/orders.model");
const systemConfig = require("../../config/system");
const productsHelper = require("../../helpers/product");

// [GET] /
module.exports.index = async (req, res) => {
  // Hiển thị danh sách sản phẩm nổi bật
  const productsFeatured = await Product.find({
    featured: "1",
    deleted: false,
    status: "active",
  }).limit(6);
  const newProductsFeatured = productsHelper.priceNewProducts(productsFeatured);
  // Hiển thị danh sách sản phẩm mới nhất
  const productsNew = await Product.find({
    deleted: false,
    status: "active",
  })
    .sort({ position: "desc" })
    .limit(6);

  const newProductsNew = productsHelper.priceNewProducts(productsNew);
  
  const allOrders = await Order.find({ deleted: false });

  // Tính tổng số lượng từng sản phẩm
  let productQuantities = {}; // {product_id: total_quantity}

  allOrders.forEach((order) => {
    if (Array.isArray(order.products)) {
      order.products.forEach((product) => {
        const id = product.product_id.toString();
        productQuantities[id] =
          (productQuantities[id] || 0) + (product.quantity || 0);
      });
    }
  });

  // Chuyển về mảng để sắp xếp
  const sortedProducts = Object.entries(productQuantities)
    .sort((a, b) => b[1] - a[1]) // Sắp xếp theo số lượng giảm dần
    .slice(0, 3); // Lấy top 3

  const topProductIds = sortedProducts.map(([id, _]) => id);

  // Lấy thông tin chi tiết sản phẩm
  const topProducts = await Product.find({
    _id: { $in: topProductIds },
    deleted: false,
  });

  // Đảm bảo đúng thứ tự theo số lượng (vì find không đảm bảo thứ tự)
  const sortedTopProducts = topProductIds.map((id) =>
    topProducts.find((p) => p._id.toString() === id)
  );


  res.render("client/pages/home/index", {
    pageTitle: "Trang chủ",
    productsFeatured: newProductsFeatured,      
    productsNew: newProductsNew,
    topProducts: sortedTopProducts,
  });
};
