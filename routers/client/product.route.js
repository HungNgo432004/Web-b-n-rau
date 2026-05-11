const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/product.controller");

// Route trả JSON (API) phải đặt trước để tránh bị hiểu nhầm là slug
router.get("/api/products", controller.api);
router.get("/", controller.index);
router.get("/detail/:slugProduct", controller.detail);
router.get("/:slugCategory", controller.category);

module.exports = router;
