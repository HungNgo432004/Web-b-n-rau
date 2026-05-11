// Permissions
const tablePermissions = document.querySelector("[table-permissions]");
if (tablePermissions) {
  const buttonSubmit = document.querySelector("[button-submit]"); // lấy button cập nhật
  buttonSubmit.addEventListener("click", () => {
    let result = [];
    const rows = tablePermissions.querySelectorAll("[data-name]"); // lấy ra tất cả các hàng của bảng
    rows.forEach((row) => {
      const name = row.getAttribute("data-name"); // lấy ra tên từng hàng
      const inputs = row.querySelectorAll("input"); // lấy ra tất cả ô input
      if (name == "id") {
        inputs.forEach((input) => {
          const value = input.value; // lấy id của ô input
          result.push({
            id: value,
            permissions: [],
          });
        });
      } else {
        inputs.forEach((input, index) => {
          const checked = input.checked; // ô input đã check
          if (checked) {
            result[index].permissions.push(name); // thêm tên vào mảng permissions
          }
        });
      }
    });
    const formChangePermissions = document.querySelector(
      "#form-change-permissions"
    ); // lấy ra form
    const inputPermissions = formChangePermissions.querySelector("input"); // lấy ô input ở form
    inputPermissions.value = JSON.stringify(result); // gán giá trị cho ô input
    formChangePermissions.submit();
  });
}

// Permissions Data Default
const dataRecords = document.querySelector("[data-records]"); // lấy ra data các ô được chọn
if (dataRecords) {
  const records = JSON.parse(dataRecords.getAttribute("data-records")); // lấy ra data và chuyển thành mảng javascript
  const tablePermissions = document.querySelector("[table-permissions]"); // lấy ra bảng
  records.forEach((record, index) => {
    const permissions = record.permissions;
    permissions.forEach((permissions) => {
      const row = tablePermissions.querySelector(
        `tr[data-name="${permissions}"]`
      ); // lấy ra hàng có data tương ứng
      // console.log(row);
      const input = row.querySelectorAll("input")[index]; // lấy ra ô input tương ứng
      input.checked = true; // ô input được check
    });
  });
}
