const Mailgen = require("mailgen");
require("dotenv").config();

class EmailService {
  constructor(env, sender) {
    this.sender = sender;
    switch (env) {
      case "development":
        this.link = process.env.NGROK; //"http://localhost:3000";
        break;
      case "production":
        this.link = "link for production";
        break;
      default:
        this.link = process.env.NGROK; //"http://localhost:3000";
        break;
    }
  }
  #createTemplateVerificationEmail(verifyToken, name) {
    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "N1nja System",
        link: this.link,
      },
    });
    const email = {
      body: {
        name,
        intro:
          "Welcome to N1nja System! We're very excited to have you on board.Welcome to N1nja System! We're very excited to have you on board.Welcome to N1nja System! We're very excited to have you on board.",
        action: {
          instructions: "To get started with Mailgen, please click here:",
          button: {
            color: "#22BC66", // Optional action button color
            text: "Confirm your account",
            link: `${this.link}/api/users/verify/${verifyToken}`,
          },
        },
      },
    };
    return mailGenerator.generate(email);
  }
  async sendVerifyEmail(verifyToken, email, name) {
    const emailHtml = await this.#createTemplateVerificationEmail(
      verifyToken,
      name
    );
    const msg = {
      to: email,
      subject: "Verify your accout",
      html: emailHtml,
    };
    const result = await this.sender.send(msg);
    console.log(result);
  }
}
module.exports = EmailService;
