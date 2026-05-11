const ProductCategory = require("../models/product-category.model");
module.exports.getSubCategory = async (parentId) => {
  const getCategory = async (parentId) => {
    const subs = await ProductCategory.find({
      parent_id: parentId,
      status: "active",
      deleted: false,
    }); // lấy các danh mục con

    let allSub = [...subs]; // lưu các danh mục con vào 1 mảng

    for (const sub of subs) {
      const childs = await getCategory(sub.id); // nếu mà có danh mục con thì truy vấn cấp con nữa
      allSub = allSub.concat(childs);
    }
    return allSub;
  };
  const result = await getCategory(parentId);
  return result;
};
