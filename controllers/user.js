const fs = require("node:fs/promises");
const path = require("node:path");

const User = require("../models/user");
const { adjustingAvatar } = require("../utils/settingsAvatar");

async function uploadAvatar(req, res, next) {
  try {
    const { path: tempUpload, originalname } = req.file;
    console.log("1.1 - Controller - user", { tempUpload, originalname });

    await adjustingAvatar(tempUpload);

    await fs.rename(
      tempUpload,
      path.join(__dirname, "..", "public/avatars", req.file.filename)
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: req.file.filename },
      { new: true }
    ).exec();

    if (user === null) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send(user);
  } catch (error) {
    next(error);
  }
}

module.exports = { uploadAvatar };
