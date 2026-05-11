const express = require("express");
const multer = require("multer");
const router = express.Router();
const controller = require("../../controllers/admin/setting.controller");
const storageMulter = require("../../helpers/storageMulter");
// Upload file ảnh
const upload = multer({ storage: storageMulter() });

router.get("/general", controller.general);

router.patch(
  "/general",
  upload.single("logo"),
  controller.generalPatch
);

module.exports = router;
