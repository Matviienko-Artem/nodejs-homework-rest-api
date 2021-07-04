const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");
const fs = require("fs/promises");

const path = require("path");
const Users = require("../repositories/users");

const { HttpCode } = require("../helpers/constants");
const UploadAvatarService = require("../services/local-upload");
const EmailService = require("../services/email");
const {
  CreateSenderNodemailer,
  // CreateSenderSendGrid,
} = require("../services/email-sender");
const User = require("../model/user");

require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;

const signup = async (req, res, next) => {
  try {
    const user = await Users.findByEmail(req.body.email);

    if (user) {
      return res.status(HttpCode.CONFLICT).json({
        status: "error",
        code: HttpCode.CONFLICT,
        message: "Email in use ",
      });
    }

    const { id, name, email, subscription, avatar, verifyToken } =
      await Users.create(req.body);

    try {
      const emailService = new EmailService(
        process.env.NODE_ENV,
        new CreateSenderNodemailer()
      );
      console.log(emailService);
      await emailService.sendVerifyEmail(verifyToken, email, name);
    } catch (error) {
      console.log(`*******${error.message}`);
    }

    return res.status(HttpCode.CREATED).json({
      status: "success",
      code: HttpCode.CREATED,
      data: { id, name, email, subscription, avatar },
    });
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const user = await Users.findByEmail(req.body.email);
    const isValidPassword = await user?.isValidPassword(req.body.password);

    if (!user || !isValidPassword || !user.isVerified) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: "error",
        code: HttpCode.UNAUTHORIZED,
        message: "Email or password is wrong",
      });
    }
    const id = user.id;
    const payload = { id };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "2h" });
    await Users.updateToken(id, token);
    return res.json({
      status: "success",
      code: HttpCode.OK,
      data: { token },
    });
  } catch (e) {
    next(e);
  }
};

const logout = async (req, res, next) => {
  try {
    const id = req.user.id;

    await Users.updateToken(id, null);

    res.status(HttpCode.NO_CONTENT).json({});
  } catch (e) {
    next(e);
  }
};

const current = async (req, res, next) => {
  try {
    const user = await Users.findById(req.user.id);
    const { name, email, subscription, avatar } = user;
    if (user) {
      return res.json({
        status: "success",
        code: HttpCode.OK,
        message: "user",
        data: { name, email, subscription, avatar },
      });
    }
    return res.json({
      status: "error",
      code: HttpCode.NOT_FOUD,
      message: "Not found",
    });
  } catch (e) {
    next(e);
  }
};

const avatars = async (req, res, next) => {
  try {
    const id = req.user.id;
    const uploads = new UploadAvatarService(process.env.AVATAR_OF_USERS);
    const avatarUrl = await uploads.saveAvatar({ idUser: id, file: req.file });
    try {
      await fs.unlink(path.join(process.env.AVATAR_OF_USERS, req.user.avatar));
    } catch (e) {
      console.log(e.message);
    }

    await Users.updateAvatar(id, avatarUrl);
    return res.json({
      status: "success",
      code: HttpCode.OK,
      data: { avatarUrl },
    });
  } catch (e) {
    next(e);
  }
};

const verify = async (req, res, next) => {
  try {
    const user = await Users.findByVerifyToken(req.params.token);
    if (user) {
      await Users.updateTokenVerify(user.id, true, null);
      return res.json({
        status: "success",
        code: HttpCode.OK,
        data: { message: "Success" },
      });
    }
    return res.status(HttpCode.BAD_REQUEST).json({
      status: "error",
      code: HttpCode.BAD_REQUEST,
      message: "Verification token isn't valid",
    });
  } catch (error) {}
};

const repeatEmailVerification = async (req, res, next) => {
  try {
    const user = await Users.findByEmail(req.body.email);
    if (user) {
      const { name, email, isVerified, verifyToken } = user;
      if (!isVerified) {
        // const config = {
        //   host: "smtp.meta.ua",
        //   port: 465,
        //   secure: true,
        //   auth: {
        //     user: "yasya0103@meta.ua",
        //     pass: process.env.PASSWORD,
        //   },
        //   tls: {
        //     rejectUnauthorized: false,
        //   },
        // };

        // const transporter = nodemailer.createTransport(config);
        // const emailOptions = {
        //   from: "yasya0103@meta.ua",
        //   to: email,
        //   subject: "Nodemailer test",
        //   text: `Проба отправки, Отправитель: Артемон`,
        // };

        // transporter.sendMail(emailOptions);

        const emailService = new EmailService(
          process.env.NODE_ENV,
          new CreateSenderNodemailer()
        );
        await emailService.sendVerifyEmail(verifyToken, email, name);
        return res.json({
          status: "success",
          code: HttpCode.OK,
          data: { message: "Resubmitted success" },
        });
      }
      return res.status(HttpCode.CONFLICT).json({
        status: "error",
        code: HttpCode.CONFLICT,
        message: "Email has benn verified ",
      });
    }
    return res.json({
      status: "error",
      code: HttpCode.NOT_FOUD,
      message: "User not found",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  current,
  avatars,
  verify,
  repeatEmailVerification,
};
