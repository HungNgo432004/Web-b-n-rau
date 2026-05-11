const Account = require("../../models/account.model");
const Role = require("../../models/role.model");
const systemConfig = require("../../config/system");

module.exports.requireAuth = async (req, res, next) => {
  //   // console.log(req.cookies.token);
  if (!req.cookies.token) {
    res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
    return;
  } else {
    const user = await Account.findOne({
      token: req.cookies.token, // tìm token giống trong database
    });
    if (!user) {
      res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
      return;
    } else {
      res.locals.user = user;
      const role = await Role.findOne({
        _id: user.role_id, // tìm các quyền
      }).select("title permissions");
      res.locals.user = user;
      res.locals.role = role;
    }
    next();
  }
};
