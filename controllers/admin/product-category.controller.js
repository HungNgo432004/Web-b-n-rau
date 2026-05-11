const ProductCategory = require("../../models/product-category.model");
const Account = require("../../models/account.model");
const systemConfig = require("../../config/system");
const createTreeHelper = require("../../helpers/createTree");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const pagination = require("../../helpers/pagination");
// [GET] /admin/products-category
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
  const countProducts = await ProductCategory.countDocuments(find);
  //pagination
  const objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItem: 4,
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
  const productCategory = await ProductCategory.find(find)
    .sort(sort)
    .limit(objectPagination.limitItem)
    .skip(objectPagination.skip);

  const newRecords = createTreeHelper(productCategory);
  for (const product of productCategory) {
    // Lấy ra người tạo
    const userCreated = await Account.findOne({
      _id: product.createdBy.account_id,
    });
    if (userCreated) {
      product.createdBy.accountFullName = userCreated.fullName; // tên người tạo
    }
    // Lấy ra người sửa
    const userUpdatedId = product.updatedBy.slice(-1)[0]; //ể lấy phần tử cuối cùng của mảng lấy người cuối cùng trong mảng
    if (userUpdatedId) {
      const userUpdated = await Account.findOne({
        _id: userUpdatedId.account_id,
      });
      if (userUpdated) {
        userUpdatedId.accountFullName = userUpdated.fullName; // tên người tạo
      }
    }
  }
  res.render("admin/pages/products-Category/index", {
    pageTitle: "Danh mục sản phẩm",
    filterStatus: filterStatus,
    productCategory: newRecords,
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
  await ProductCategory.updateOne(
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
      await ProductCategory.updateMany(
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
      await ProductCategory.updateMany(
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
        await ProductCategory.updateOne(
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
  await ProductCategory.updateOne(
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
// [GET] /admin/products-category/create
module.exports.create = async (req, res) => {
  let find = {
    deleted: false,
  };
  const productCategory = await ProductCategory.find(find);
  const newRecords = createTreeHelper(productCategory);
  res.render("admin/pages/products-Category/create", {
    pageTitle: "Tao danh muc san pham",
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
    const count = await ProductCategory.countDocuments();
    req.body.position = count + 1;
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
  const productCategory = new ProductCategory(req.body);
  await productCategory.save();
  res.redirect(`${systemConfig.prefixAdmin}/products-category`);
};
// [GET] /admin/products-category/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await ProductCategory.findOne({
      _id: id,
      deleted: false,
    });

    const records = await ProductCategory.find({
      deleted: false,
    });
    const newRecords = createTreeHelper(records);
    res.render("admin/pages/products-category/edit", {
      pageTitle: "Chỉnh sửa danh mục sản phẩm",
      data: data,
      productCategory: newRecords,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
  }
};
// [PATCH] /admin/products-category/edit/:id
module.exports.editPatch = async (req, res) => {
  const id = req.params.id;
  // Lấy đường dẫn ảnh và upload ảnh
  if (req.file && req.file.filename) {
    req.body.thumbnail = `/uploads/${req.file.filename}`;
  }
  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date(),
  };
  req.body.position = parseInt(req.body.position);

  await ProductCategory.updateOne(
    { _id: id },
    {
      ...req.body,
      $push: { updatedBy: updatedBy },
    }
  );

  res.redirect(`${systemConfig.prefixAdmin}/products-category`);
};
