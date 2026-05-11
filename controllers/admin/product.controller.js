const Product = require("../../models/product.model");
const Account = require("../../models/account.model");
const systemConfig = require("../../config/system");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const pagination = require("../../helpers/pagination");
const createTreeHelper = require("../../helpers/createTree");
const ProductCategory = require("../../models/product-category.model");
// [GET] /admin/products
module.exports.index = async (req, res) => {
  const filterStatus = filterStatusHelper(req.query);
  let find = {
    deleted: false,
  };
  if (req.query.status) {
    // Lọc sản phẩm theo trạng thái
    find.status = req.query.status;
  }
  const objectSearch = searchHelper(req.query);
  // Tìm kiếm theo từ khóa
  if (req.query.keyword) {
    find.title = objectSearch.regex;
  }
  // Đếm sản phẩm
  const countProducts = await Product.countDocuments(find);
  //pagination
  const objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItem: 10,
    },
    req.query,
    countProducts
  );
  //sort
  let sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    sort.position = "desc";
  }
  const products = await Product.find(find)
    .sort(sort)
    .limit(objectPagination.limitItem)
    .skip(objectPagination.skip);

  for (const product of products) {
    // Lấy ra người tạo
    const userCreated = await Account.findOne({
      _id: product.createdBy.account_id,
    });
    if (userCreated) {
      product.createdBy.accountFullName = userCreated.fullName; // tên người tạo
    }
    // Lấy ra người sửa
    const userUpdatedId = product.updatedBy.slice(-1)[0];
    if (userUpdatedId) {
      const userUpdated = await Account.findOne({
        _id: userUpdatedId.account_id,
      });
      if (userUpdated) {
        userUpdatedId.accountFullName = userUpdated.fullName; // tên người tạo
      }
    }
  }
  // console.log(products);
  res.render("admin/pages/products/index", {
    pageTitle: "Danh sach san pham",
    products: products,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination,
  });
};
// [PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  // Lấy ra trạng thái và id
  const status = req.params.status;
  const id = req.params.id;
  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date(),
  };
  // Update trạng thái
  await Product.updateOne(
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

// [PATCH] /admin/products/change-multi
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
      await Product.updateMany(
        { _id: { $in: ids } },
        {
          status: type,
          $push: { updatedBy: updatedBy },
        }
      ); // Thay đổi trạng thái nhiều sản phẩm và thêm người cập nhật
      req.flash(
        "success",
        `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`
      ); // Hiển thị thông báo
      break;
    case "delete-all":
      await Product.updateMany(
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
    case "change-position":
      for (const item of ids) {
        const [id, position] = item.split("-");
        await Product.updateOne(
          { _id: id },
          {
            position: position,
            $push: { updatedBy: updatedBy },
          }
        );
      } // Thay đổi vị trí sản phẩn
      req.flash(
        "success",
        `Thay đổi vị trí thành công ${ids.length} sản phẩm!`
      ); // Hiển thị thông báo
      break;
    default:
      break;
  }
  res.redirect("back"); // Ở lại trang hiện tại
};

// [DELETE] /admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
  const id = req.params.id; // Lấy ra id
  // await Product.deleteOne({_id: id}); // Xóa vĩnh viễn
  await Product.updateOne(
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
  req.flash("success", `Xóa sản phẩm thành công!`); // Hiển thị thông báo
  res.redirect("back");
};
// [GET] /admin/products/create
module.exports.create = async (req, res) => {
  let find = {
    deleted: false,
  };
  const records = await ProductCategory.find(find);
  const newRecords = createTreeHelper(records);
  res.render("admin/pages/products/create", {
    pageTitle: "Them moi san pham",
    productCategory: newRecords,
  });
};
// [POST] /admin/products/create
module.exports.createPost = async (req, res) => {
  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);
  if (req.body.position == "") {
    // Đếm số lượng sản phẩm trong Mongo
    const countProducts = await Product.countDocuments();
    req.body.position = countProducts + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }
  req.body.createdBy = {
    account_id: res.locals.user.id,
  };
  if (req.file && req.file.filename) {
    req.body.thumbnail = `/uploads/${req.file.filename}`;
  }
  // Tạo mới sản phẩm và lưu vào database
  const product = new Product(req.body);
  await product.save();
  res.redirect(`${systemConfig.prefixAdmin}/products`);
};
// [GET] /admin/products/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findOne({
      _id: id,
      deleted: false,
    });
    const records = await ProductCategory.find({
      deleted: false,
    });
    const newRecords = createTreeHelper(records);
    res.render("admin/pages/products/edit", {
      pageTitle: "Chỉnh sửa sản phẩm",
      product: product,
      productCategory: newRecords,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};
// [PATCH] /admin/edit/:id
module.exports.editPatch = async (req, res) => {
  const id = req.params.id;
  // Thay đổi type dữ liệu
  req.body.price = parseInt(req.body.price);
  req.body.discountPercentage = parseInt(req.body.discountPercentage);
  req.body.stock = parseInt(req.body.stock);
  req.body.position = parseInt(req.body.position);

  // Lấy đường dẫn ảnh và upload ảnh
  if (req.file && req.file.filename) {
    req.body.thumbnail = `/uploads/${req.file.filename}`;
  }

  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date(),
  };

  await Product.updateOne(
    { _id: id },
    {
      ...req.body,
      $push: { updatedBy: updatedBy },
    }
  );

  req.flash("success", "Cập nhật sản phẩm thành công!");

  res.redirect("back");
};
// [PATCH] /admin/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findOne({
      _id: id,
      deleted: false,
    });
    res.render("admin/pages/products/detail", {
      pageTitle: product.title,
      product: product,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  }
};
