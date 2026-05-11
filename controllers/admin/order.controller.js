const Product = require("../../models/product.model");
const filterStatusHelper = require("../../helpers/filterStatus1");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const Order = require("../../models/orders.model");
const systemConfig = require("../../config/system");

module.exports.index = async (req, res) => {
  const filterStatus = filterStatusHelper(req.query);
  let find = {
    deleted: false
  };
  if (req.query.status) {
    // Lọc sản phẩm theo trạng thái
    find.status = req.query.status;
  }
  const objectSearch = searchHelper(req.query);
  // Tìm kiếm theo từ khóa
  if (req.query.keyword) {
    if (req.query.keyword) {
      find["userInfo.fullName"] = objectSearch.regex;
    }    
  }  
  // Đếm sản phẩm
  const countOrders = await Order.countDocuments(find);
  //pagination
  const objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItem: 5,
    },
    req.query,
    countOrders
  );
  //sort
  let sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    sort.position = "desc";
  }
  const orders = await Order.find(find)
    .sort(sort)
    .limit(objectPagination.limitItem)
    .skip(objectPagination.skip);

    const allOrders = await Order.find(find);

    let productQuantities = {}; // lưu { product_id: quantity }

    // Bước 1: Đếm số lượng từng sản phẩm theo product_id
    allOrders.forEach((order) => {
      if (Array.isArray(order.products)) {
        order.products.forEach((product) => {
          const productId = product.product_id.toString();
          const quantity = product.quantity || 0;
          if (!productQuantities[productId]) {
            productQuantities[productId] = 0;
          }
          productQuantities[productId] += quantity;
        });
      }
    });

    // Bước 2: Lấy thông tin sản phẩm từ bảng Product
    const productIds = Object.keys(productQuantities);
    const productsInfo = await Product.find({ _id: { $in: productIds } });

    // Bước 3: Gán tên `title` của sản phẩm vào kết quả
    const namedProductQuantities = productsInfo.map((product) => ({
      name: product.title, // <-- Sử dụng title ở đây
      quantity: productQuantities[product._id.toString()] || 0,
    }));
    
    
  res.render("admin/pages/orders/index", {
    pageTitle: "Danh sách đơn hàng",
    order: orders,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination,
    namedProductQuantities,
  });
};
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;
    const orders = await Order.findOne({ _id: id }).populate(
      "products.product_id"
    ); // <-- Quan trọng

    res.render("admin/pages/orders/detail", {
      order: orders,
    });
  } catch (error) {
    console.error(error); // Debug nếu có lỗi
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};

// [DELETE] /admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
  const id = req.params.id; // Lấy ra id
  // await Order.deleteOne({_id: id}); // Xóa vĩnh viễn
  await Order.updateOne(
    { _id: id },
    {
      deleted: true,
    }
  ); // Xóa mềm
  req.flash("success", `Xóa sản phẩm thành công!`); // Hiển thị thông báo
  res.redirect("back");
};

// [PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  // Lấy ra trạng thái và id
  const status = req.params.status;
  const id = req.params.id;
  // Update trạng thái
  await Order.updateOne(
    { _id: id },
    {
      status: status,
    }
  );
  // Hiển thị thông báo
  req.flash("success", "Cập nhật trạng thái thành công!");
  // Về trước đó
  res.redirect("back");
};