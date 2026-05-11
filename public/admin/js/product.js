// Change Status
const buttonChangeStatus = document.querySelectorAll("[button-change-status]");
if (buttonChangeStatus.length > 0) {
  const formChangeStatus = document.querySelector("#form-change-status"); // Lấy ra form đó
  const path = formChangeStatus.getAttribute("data-path"); // Lấy ra path
  buttonChangeStatus.forEach((button) => {
    button.addEventListener("click", () => {
      // Lấy ra trạng thái hiện tại
      const statusCurrent = button.getAttribute("data-status");
      const id = button.getAttribute("data-id");
      // Thay đổi trạng thái
      const statusChange = statusCurrent == "active" ? "inactive" : "active";
      // Thêm đường dẫn vào action
      const action = path + `/${statusChange}/${id}?_method=PATCH`;
      // Update thuộc tính action trong form
      formChangeStatus.action = action; // Cách 1
      // formChangeStatus.setAttribute("action", action); // Cách 2
      // Thay thế nút Gửi đi để thay đổi trạng thái
      formChangeStatus.submit();
    });
  });
}
