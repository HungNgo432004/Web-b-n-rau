const dashboardRouter = require("./dashboard.route");
const productsdRouter = require("./product.route");
const productCategorydRouter = require("./product-category.route");
const roleRoutes = require("./role.route");
const accountRoutes = require("./account.route");
const authRoutes = require("./auth.route");
const myAccountRoutes = require("./my-account.route");
const settingRoutes = require("./setting.route");
const accountUserRoutes = require("./accountUser.route");
const orderRoutes = require("./order.route");
const systemConfig = require("../../config/system");
const authMiddleware = require("../../middlewares/admin/auth.middlewares");

module.exports = (app) => {
  const PATH_ADMIN = systemConfig.prefixAdmin;
  app.use(
    PATH_ADMIN + "/dashboard",
    authMiddleware.requireAuth,
    dashboardRouter
  );
  app.use(
    PATH_ADMIN + "/products",
    authMiddleware.requireAuth,
    productsdRouter
  );
  app.use(
    PATH_ADMIN + "/products-category",
    authMiddleware.requireAuth,
    productCategorydRouter
  );
  app.use(PATH_ADMIN + "/roles", authMiddleware.requireAuth, roleRoutes);
  app.use(PATH_ADMIN + "/accounts", authMiddleware.requireAuth, accountRoutes);
  app.use(PATH_ADMIN + "/user", authMiddleware.requireAuth, accountUserRoutes);
  app.use(PATH_ADMIN + "/auth", authRoutes);
  app.use(
    PATH_ADMIN + "/my-account",
    authMiddleware.requireAuth,
    myAccountRoutes
  );
  app.use(PATH_ADMIN + "/settings",authMiddleware.requireAuth, settingRoutes);
  app.use(PATH_ADMIN + "/orders", authMiddleware.requireAuth, orderRoutes);
};
