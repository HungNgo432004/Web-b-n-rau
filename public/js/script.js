// Show Alert
const showAlert = document.querySelector("[show-alert]");
console.log(showAlert);
if (showAlert) {
  const time = parseInt(showAlert.getAttribute("data-time")) || 3000; // Lấy thời gian
  // console.log(time);

  const closeAlert = showAlert.querySelector("[close-alert]"); // Lấy nút x

  setTimeout(() => {
    showAlert.classList.add("alert-hidden");
  }, time); // hết time là ẩn

  closeAlert.addEventListener("click", () => {
    showAlert.classList.add("alert-hidden");
  }); // click x là ẩn
}
$(document).ready(function () {
  // Hiển thị Preloader
  $(window).on("load", function () {
    $("#preloder").fadeOut(); // Ẩn Preloader sau khi trang đã load xong
  });

  // Hamburger Menu
  $(".humberger__menu__overlay").on("click", function () {
    $(".humberger__menu__wrapper").fadeOut();
    $(".humberger__menu__overlay").fadeOut();
  });

  $(".humberger__menu__button").on("click", function () {
    $(".humberger__menu__wrapper").fadeIn();
    $(".humberger__menu__overlay").fadeIn();
  });
});
// Chọn phần tử Giỏ hàng
const cartLink = document.querySelector('.header__menu a[href="/cart"]');

// Thêm sự kiện click
cartLink.addEventListener("click", function (e) {
  // Ngăn chặn hành vi mặc định (tránh di chuyển trang ngay lập tức)
  e.preventDefault();

  // Thêm lớp active khi click vào giỏ hàng
  this.classList.add("active");

  // Điều hướng tới trang giỏ hàng
  window.location.href = this.getAttribute("href");
});

// Kiểm tra nếu có giỏ hàng để hiển thị số lượng (miniCart.totalQuantity)
const miniCart = { totalQuantity: 9 }; // Giả sử miniCart có 9 sản phẩm, bạn sẽ thay thế với dữ liệu thực tế từ backend.

const cartText = document.querySelector('.header__menu a[href="/cart"]');
if (miniCart.totalQuantity > 0) {
  cartText.innerText = `Giỏ hàng (${miniCart.totalQuantity})`;
} else {
  cartText.innerText = "Giỏ hàng";
}

// Đảm bảo rằng form tồn tại trước khi thêm event listener
document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("registerForm");

  if (form) {
    form.addEventListener("submit", function (event) {
      var password = document.getElementById("password").value;
      var confirmPassword = document.getElementById("confirmPassword").value;

      if (password !== confirmPassword) {
        event.preventDefault(); // Ngừng gửi form nếu mật khẩu không khớp
        alert(
          "Mật khẩu và xác nhận mật khẩu không khớp. Vui lòng kiểm tra lại."
        );
      }
    });
  }
});

document
  .getElementById("registerForm")
  .addEventListener("submit", function (event) {
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;
    if (password !== confirmPassword) {
      event.preventDefault(); // Ngừng gửi form nếu mật khẩu không khớp
      alert("Mật khẩu và xác nhận mật khẩu không khớp. Vui lòng kiểm tra lại.");
    }
  });
