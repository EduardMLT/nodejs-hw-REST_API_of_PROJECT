const express = require("express");

const UserController = require("../../controllers/user");

const upload = require("../../middlewares/upload");

const router = express.Router();

router.patch("/avatar", upload.single("avatar"),  UserController.uploadAvatar);

module.exports = { avatarRouter: router };
