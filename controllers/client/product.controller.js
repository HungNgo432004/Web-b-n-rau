const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const productCategoryHelper = require("../../helpers/products-category");
const productsHelper = require("../../helpers/product");
const paginationHelper = require("../../helpers/pagination");
const pagination = require("../../helpers/pagination");
// [GET] /products
module.exports.index = async (req, res) => {
  let find = {
    status: "active",
    deleted: false,
  };
  // Đếm sản phẩm
  const countProducts = await Product.countDocuments(find);
  //pagination
  const objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItem: 9,
    },
    req.query,
    countProducts
  );
  const product = await Product.find(find)
    .sort({ position: "desc" })
    .limit(objectPagination.limitItem)
    .skip(objectPagination.skip);

  const newProducts = productsHelper.priceNewProducts(product);
  res.render("client/pages/products/index", {
    pageTitle: "Danh sách sản phẩm",
    product: newProducts,
    pagination: objectPagination,
  });
};
// Trả dữ liệu JSON
module.exports.api = async (req, res) => {
  const product = await Product.find({ status: "active", deleted: false }).sort(
    { position: "desc" }
  );
  const newProducts = productsHelper.priceNewProducts(product);
  res.json(newProducts);
};
// [GET] /products/detail/:slugProduct
module.exports.detail = async (req, res) => {
  try {
    const slug = req.params.slugProduct;
    const product = await Product.findOne({
      slug: slug,
      deleted: false,
      status: "active",
    });
    if (product.product_category_id) {
      const category = await ProductCategory.findOne({
        _id: product.product_category_id,
        deleted: false,
        status: "active",
      });
      product.category = category;
    }

    product.priceNew = productsHelper.priceNewProduct(product);

    res.render("client/pages/products/detail", {
      pageTitle: "Chi tiết sản phẩm",
      product: product,
    });
  } catch (error) {
    res.redirect("/");
  }
};

// [GET] /products/:slugCategory
module.exports.category = async (req, res) => {
  const slugCategory = req.params.slugCategory;
  const category = await ProductCategory.findOne({
    slug: slugCategory,
    deleted: false,
    status: "active",
  });

  if (!category) {
    return res.redirect("/");
  }
  const getSubCategory = async (parentId) => {
    const subs = await ProductCategory.find({
      parent_id: parentId,
      status: "active",
      deleted: false,
    });

    let allSub = [...subs];

    for (const sub of subs) {
      const childs = await getSubCategory(sub.id);
      allSub = allSub.concat(childs);
    }

    return allSub;
  };
  const listSubCategory = await getSubCategory(category.id);
  const listSubCategoryId = listSubCategory.map((item) => item.id);
  const listAllCategoryId = [category.id, ...listSubCategoryId];
  // Đếm đúng số lượng sản phẩm trong danh mục này và danh mục con
  const countProducts = await Product.countDocuments({
    product_category_id: { $in: listAllCategoryId },
    status: "active",
    deleted: false,
  });
  // Pagination
  const objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItem: 9,
    },
    req.query,
    countProducts
  );

  const products = await Product.find({
    product_category_id: { $in: listAllCategoryId },
    status: "active",
    deleted: false,
  })
    .sort({ position: "desc" })
    .limit(objectPagination.limitItem)
    .skip(objectPagination.skip);
  const newProducts = productsHelper.priceNewProducts(products);
  res.render("client/pages/products/index", {
    pageTitle: category.title,
    product: newProducts,
    pagination: objectPagination,
  });
};
