const express = require("express");
// Thêm các phương thức khác
const path = require("path");
const methodOverride = require("method-override");
const flash = require("express-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const moment = require("moment");
const storageMulter = require("./helpers/storageMulter");
require("dotenv").config();
// Converse lại biến trong form để truyền vào body
const bodyParser = require("body-parser");
const database = require("./config/database");

const systemConfig = require("./config/system");

const route = require("./routers/admin/index.route");
const routeAdmin = require("./routers/client/index.route");
database.connect();

const app = express();
const port = process.env.PORT;

app.use(methodOverride("_method"));
// Converse lại biến trong form để truyền vào body
app.use(bodyParser.urlencoded({ extended: false }));

app.set("views", "./views");
app.set("view engine", "pug");
// TinyMCE
app.use(
  "/tinymce",
  express.static(path.join(__dirname, "node_modules", "tinymce"))
);

// Flash
app.use(cookieParser("Hung"));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());

// App locals Variables
app.locals.prefixAdmin = systemConfig.prefixAdmin;
app.locals.moment = moment;
app.use(express.static("public"));
//Routes
route(app);
routeAdmin(app);

app.get("*", (req, res) => {
  res.render("client/pages/errors/404", {
    pageTitle: "404 Not Found",
  });
});


app.listen(port, () => {
  console.log(`Đã đăng nhập thành công ${port}`);
});
