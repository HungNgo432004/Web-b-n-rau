const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/order.controller");
const validate = require("../../validates/admin/product.validate");
const multer = require("multer");
const storageMulter = require("../../helpers/storageMulter");
// Upload file ảnh
const upload = multer({ storage: storageMulter() });

router.get("/", controller.index);
// Phương thức Chi tiết sản phẩm
router.get("/detail/:id", controller.detail);
router.delete("/delete/:id", controller.deleteItem);
// Phương thức patch update 1 trường
router.patch("/change-status/:status/:id", controller.changeStatus);

module.exports = router;
