const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/account.controller");
const validate = require("../../validates/admin/product.validate");
const multer = require("multer");
const storageMulter = require("../../helpers/storageMulter");
const validateAccount = require("../../validates/admin/account.validate");
// Upload file ảnh
const upload = multer({ storage: storageMulter() });

router.get("/", controller.index);

router.get("/create", controller.create);

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

module.exports = router;
