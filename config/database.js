const mongoose = require("mongoose");
module.exports.connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Thành công");
    } catch (error) {
        console.log("Lỗi");
    }
}

