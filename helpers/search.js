module.exports = (query) => {
  let objectSearch = {
    keyword: "",
    regex: "",
  };
  if (query.keyword) {
    // Tìm kiếm sản phẩm theo keyword
    objectSearch.keyword = query.keyword;
    const regex = new RegExp(objectSearch.keyword, "i"); // Tìm kiếm tương đối
    // console.log(regex);
    objectSearch.regex = regex;
  }
  return objectSearch;
};
