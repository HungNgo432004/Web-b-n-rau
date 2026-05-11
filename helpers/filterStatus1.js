module.exports = (query) => {
    let filterStatus = [
      {
        name: "Tất cả",
        status: "",
        class: "",
      },
      {
        name: "Đã giao",
        status: "delivered",
        class: "",
      },
      {
        name: "Đang xử lý",
        status: "processing",
        class: "",
      },
      {
        name: "Đang giao",
        status: "shipping",
        class: "",
      },
    ];
    // Trạng thái của nút bấm active
    if(query.status) {
        const index = filterStatus.findIndex((item) => {
            return item.status == query.status;
        });
        filterStatus[index].class = "active";
    } else {
        const index = filterStatus.findIndex((item) => {
            return item.status == "";
        });

        filterStatus[index].class = "active";
    }
    return filterStatus;
}