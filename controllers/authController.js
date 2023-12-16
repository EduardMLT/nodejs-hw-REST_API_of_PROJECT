const crypto = require("node:crypto");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const sendEmail = require("../utils/sendEmail");

async function registerAuthController(req, res, next) {
  const { name, email, password } = req.body;

  try {
    const user = await User.findOne({ email }).exec();

    if (user) {
      return res.status(409).send({ message: "Email in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomUUID();

    const sendEmailMessage = {
      to: email,
      subject: "Welcome to The Book of Contacts",
      html: `To confirm your registration please click on the <a href="http://localhost:8080/user/verify/${verifyToken}">link</a>`,
      text: `To confirm your registration please open the link http://localhost:8080/user/verify/${verifyToken}`,
    };

    await sendEmail(sendEmailMessage);

    await User.create({ name, email, verifyToken, password: passwordHash });

    res.status(201).send({ message: "Registration successfully" });
  } catch (error) {
    next(error);
  }
}

async function loginAuthController(req, res, next) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).exec();

    if (user === null) {
      console.log("EMAIL");
      return res
        .status(401)
        .send({ message: "Email or password is incorrect" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch === false) {
      console.log("PASSWORD");
      return res
        .status(401)
        .send({ message: "Email or password is incorrect" });
    }

    if (user.verify !== true) {
      return res.status(401).send({ message: "Your account is not verified" });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 60 }
    );

    await User.findByIdAndUpdate(user._id, { token }).exec();

    res.send({ token });
  } catch (error) {
    next(error);
  }
}

async function logoutAuthController(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.user.id, { token: null }).exec();

    console.log({ token_canceled: null });
    res.send({ message: "Token canceled" });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function currentAuthController(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const [bearer, token] = authHeader.split(" ", 2);

    console.log("currentAuthController", { bearer, token });

    res.status(200).send({ message: "Token current" });
  } catch (error) {
    next(error);
  }
}

async function verifyAuthController(req, res, next) {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verifyToken: token }).exec();

    if (user === null) {
      return res.status(404).send({ message: "Not found" });
    }

    await User.findByIdAndUpdate(user._id, { verify: true, verifyToken: null });

    res.send({ message: "Email confirm successfully" });
  } catch (error) {
    next(error);
  }
}

async function reVerifyAuthController(req, res, next) {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email }).exec();

    let counter = user.confirmationOfVerification;

    if (counter > 5) {
      return res
        .status(400)
        .send({
          message:
            "You have been sent more than 5 messages to confirm. Access is limited",
        });
    }

    counter = counter + 1;

    if (!user) {
      return res.status(400).send({ message: "missing required field email" });
    }

    if (user.verify) {
      return res
        .status(400)
        .send({ message: "Verification has already been passed" });
    }

    const sendEmailMessage = {
      to: email,
      subject: "Welcome to The Book of Contacts",
      html: `To confirm your registration please click on the <a href="http://localhost:8080/user/verify/${user.verifyToken}">link</a>`,
      text: `To confirm your registration please open the link http://localhost:8080/user/verify/${user.verifyToken}`,
    };

    await sendEmail(sendEmailMessage);

    await User.findByIdAndUpdate(user._id, {
      confirmationOfVerification: counter  });

    res.status(201).send({
      message: `A confirmation letter for email sent to your email address repeatedly :  ${counter} time(s) . In case of more than 5 - access will be limited`,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerAuthController,
  loginAuthController,
  logoutAuthController,
  currentAuthController,
  verifyAuthController,
  reVerifyAuthController,
};
