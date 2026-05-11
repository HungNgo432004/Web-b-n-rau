const Cart = require("../../models/cart.model");

module.exports.cartId = async (req, res, next) => {
  if (!req.cookies.cartId) {
    const cart = new Cart(); // Tạo ra giỏ hàng
    await cart.save(); // lưu vào database
    const expiresTime = 1000 * 60 * 60 * 24 * 365; // 1 năm
    res.cookie("cartId", cart.id, {
      expires: new Date(Date.now() + expiresTime),
    });
  } else {
    // Khi đã có giỏ hàng
    const cart = await Cart.findOne({
      _id: req.cookies.cartId,
    }); // lấy ra giỏ hàng
    cart.totalQuantity = cart.products.reduce(
      (sum, item) => sum + item.quantity,
      0
    ); // tổng số lượng sản phẩm trong giỏ hàng
    res.locals.miniCart = cart;
  }
  next();
};
