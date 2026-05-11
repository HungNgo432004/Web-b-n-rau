const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/accountUser.controller");
const validate = require("../../validates/admin/product.validate");
const multer = require("multer");
const storageMulter = require("../../helpers/storageMulter");
const validateAccount = require("../../validates/admin/account.validate");
// Upload file ảnh
const upload = multer({ storage: storageMulter() });

router.get("/", controller.index);
// Phương thức patch update nhiều trường
router.patch("/change-multi", controller.changeMulti);
router.get("/create", controller.create);
// Phương thức patch update 1 trường
router.patch("/change-status/:status/:id", controller.changeStatus);
// Phương thức delete xóa sản phẩm
router.delete("/delete/:id", controller.deleteItem);
router.post(
  "/create",
  upload.single("avatar"),
  controller.createPost,
  validateAccount.createPost
);

router.get("/edit/:id", controller.edit);

router.patch(
  "/edit/:id",
  upload.single("avatar"),
  validateAccount.editPatch,
  controller.editPatch
);
// Phương thức Chi tiết sản phẩm
router.get("/detail/:id", controller.detail);

module.exports = router;
