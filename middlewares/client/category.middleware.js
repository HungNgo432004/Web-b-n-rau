const ProductCategory = require("../../models/product-category.model");

const createTree = require("../../helpers/createTree");

module.exports.category = async (req, res, next) => {
  const ProductsCategory = await ProductCategory.find({
    deleted: false,
  });
  const newProductsCategory = createTree(ProductsCategory);
  res.locals.layoutProductsCategory = newProductsCategory;
  next();
};
