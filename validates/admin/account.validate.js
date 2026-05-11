module.exports.createPost = (req, res, next) => {
  // Nếu không điền vào ô tiêu đề
  if (!req.body.fullName) {
    req.flash("error", "Vui lòng nhập họ tên!");
    req.redirect("back");
    return;
  }
  if (!req.body.email) {
    req.flash("error", "Vui lòng nhập email!");
    req.redirect("back");
    return;
  }
  if (!req.body.password) {
    req.flash("error", "Vui lòng nhập mật khẩu!");
    req.redirect("back");
    return;
  }
  next(); // Chạy sang controller
};
module.exports.editPatch = (req, res, next) => {
  // Nếu không điền vào ô tiêu đề
  if (!req.body.fullName) {
    req.flash("error", "Vui lòng nhập họ tên!");
    req.redirect("back");
    return;
  }
  if (!req.body.email) {
    req.flash("error", "Vui lòng nhập email!");
    req.redirect("back");
    return;
  }
  next(); // Chạy sang controller
};
