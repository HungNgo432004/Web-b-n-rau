const productRouter = require("./product.route");
const homeRouter = require("./home.route");
const searchRouter = require("./search.route");
const cartRouter = require("./cart.route");
const checkoutRoutes = require("./checkout.route");
const userRouter = require("./user.route");

const categoryMiddleware = require("../../middlewares/client/category.middleware");
const cartMiddleware = require("../../middlewares/client/cart.middleware");
const userMiddleware = require("../../middlewares/client/user.middleware");
const settingMiddelware = require("../../middlewares/client/setting.middleware");
module.exports = (app) => {
  app.use(categoryMiddleware.category);
  app.use(cartMiddleware.cartId);
  app.use(userMiddleware.infoUser);
  app.use(settingMiddelware.settingGeneral);
  app.use("/", homeRouter);

  app.use("/products", productRouter);
  app.use("/search", searchRouter);
  app.use("/cart", cartRouter);
  app.use("/checkout", checkoutRoutes);
  app.use("/user", userRouter);
};
