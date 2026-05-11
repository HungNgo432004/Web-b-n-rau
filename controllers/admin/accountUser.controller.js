// Mã hóa
const md5 = require("md5");
const User = require("../../models/user.model");
const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const systemConfig = require("../../config/system");
const { model } = require("mongoose");
const createTreeHelper = require("../../helpers/createTree");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const pagination = require("../../helpers/pagination");
// [GET] /admin/accounts
module.exports.index = async (req, res) => {
  let find = {
    deleted: false
  };
  const filterStatus = filterStatusHelper(req.query);
  if (req.query.status) {
    // Lọc sản phẩm theo trạng thái
    find.status = req.query.status;
  }
  // Đếm sản phẩm
  const countUsers = await User.countDocuments(find);

  //pagination
  const objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItem: 5,
    },
    req.query,
    countUsers
  );
  const objectSearch = searchHelper(req.query);
  // Tìm kiếm theo từ khóa
  if (req.query.keyword) {
    find.fullName = objectSearch.regex;
  }
  //sort
  let sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    sort.position = "desc";
  }
  const records = await User.find(find)
    .sort(sort)
    .limit(objectPagination.limitItem)
    .skip(objectPagination.skip);
  res.render("admin/pages/users/index", {
    pageTitle: "Danh sách tài khoản",
    records: records,
    paginationUser: objectPagination,
    keyword: objectSearch.keyword,
    filterStatus: filterStatus,
  });
};
// [PATCH] /admin/user/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  // Lấy ra trạng thái và id
  const status = req.params.status;
  const id = req.params.id;
  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date(),
  };
  // Update trạng thái
  await User.updateOne(
    { _id: id },
    {
      status: status,
      $push: { updatedBy: updatedBy },
    }
  );
  // Hiển thị thông báo
  req.flash("success", "Cập nhật trạng thái thành công!");
  // Về trước đó
  res.redirect("back");
};
// [DELETE] /admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
  const id = req.params.id; // Lấy ra id
  // await User.deleteOne({_id: id}); // Xóa vĩnh viễn
  await User.updateOne(
    { _id: id },
    {
      deleted: true,
      // Thời gian xóa sản phẩm
      deletedBy: {
        account_id: res.locals.user.id,
        deletedAt: new Date(),
      },
    }
  ); // Xóa mềm
  req.flash("success", `Xóa tài khoản thành công!`); // Hiển thị thông báo
  res.redirect("back");
};
// [PATCH] /admin/products-Category/change-multi
module.exports.changeMulti = async (req, res) => {
  const type = req.body.type;
  const ids = req.body.ids.split(", "); // Lấy ra id
  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date(),
  };
  switch (type) {
    case "active":
    case "inactive":
      await User.updateMany(
        { _id: { $in: ids } },
        {
          status: type,
          $push: { updatedBy: updatedBy },
        }
      ); // Thay đổi trạng thái nhiều sản phẩm và thêm người cập nhật
      req.flash(
        "success",
        `Cập nhật trạng thái thành công ${ids.length} tài khoản!`
      ); // Hiển thị thông báo
      break;
    case "delete-all":
      await User.updateMany(
        { _id: { $in: ids } },
        {
          deleted: true,
          // deletedAt: new Date()
          deletedBy: {
            account_id: res.locals.user.id,
            deletedAt: new Date(),
          },
        }
      ); // Thay đổi xóa nhiều sản phẩn
      req.flash("success", `Xóa thành công ${ids.length} sản phẩm!`); // Hiển thị thông báo
      break;
    default:
      break;
  }
  res.redirect("back"); // Ở lại trang hiện tại
};
// [GET] /admin/accounts/create
module.exports.create = async (req, res) => {
  res.render("admin/pages/users/create", {
    pageTitle: "Tạo mới tài khoản",
  });
};

// [POST] /admin/accounts/create
module.exports.createPost = async (req, res) => {
  const emailExist = await User.findOne({
    email: req.body.email,
    deleted: false,
  });
  if (emailExist) {
    req.flash("error", `Email ${req.body.email} đã tồn tại`);
    res.redirect("back");
  } else {
    req.body.password = md5(req.body.password);
    if (req.file) {
      req.body.avatar = `/uploads/${req.file.filename}`;
    }
    const record = new User(req.body);
    await record.save();

    res.redirect(`${systemConfig.prefixAdmin}/user`);
  }
};
// [GET] /admin/accounts/edit/:id
module.exports.edit = async (req, res) => {
  let find = {
    _id: req.params.id,
    deleted: false,
  };
  try {
    const data = await User.findOne(find);
    res.render("admin/pages/users/edit", {
      pageTitle: "Chỉnh sửa tài khoản người dùng",
      dataUser: data,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/user`);
  }
};

// [PATCH] /admin/accounts/edit/:id
module.exports.editPatch = async (req, res) => {
  const id = req.params.id;
  const emailExist = await User.findOne({
    _id: { $ne: id },
    email: req.body.email,
    deleted: false,
  });
  if (emailExist) {
    req.flash("error", `Email ${req.body.email} đã tồn tại`);
  } else {
    if (req.body.password) {
      req.body.password = md5(req.body.password); // mã hóa password
    } else {
      delete req.body.password;
    }
    if (req.file) {
      req.body.avatar = `/uploads/${req.file.filename}`;
    }
    await User.updateOne({ _id: req.params.id }, req.body); // lưu vào database
    req.flash("success", `Cập nhập thành công!`);
  }
  res.redirect("back");
};
// [PATCH] /admin/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({
      _id: id,
      deleted: false,
    });
    const cart = await Cart.findOne({
      user_id: id,
    });
    const idCart = cart.products;
    const product = await Product.findOne({
      _id: idCart[0].product_id,
    });
    res.render("admin/pages/users/detail", {
      pageTitle: "Chi tiết tài khoản người dùng",
      user: user,
      cart: cart,
      product: product,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/user`);
  }
};
