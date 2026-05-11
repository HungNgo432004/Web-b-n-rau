module.exports.createPost = (req, res, next) => {
  // Nếu không điền vào ô tiêu đề
  if (!req.body.title) {
    req.flash("error", `Tiêu đề không được để trống!`);
    res.redirect("back");
    return;
  }
  // Giới hạn ký tự tiêu đề
  if (req.body.title.length < 1) {
    req.flash("error", `Tiêu đề dài tối thiểu là 5 ký tự!`);
    res.redirect("back");
    return;
  }
  next(); // Chạy sang controller
};
