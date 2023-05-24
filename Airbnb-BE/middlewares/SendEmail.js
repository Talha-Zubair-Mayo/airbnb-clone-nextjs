require('dotenv').config({ path: '.variables.env' });
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const {
  Mail_Service_Client_ID,
  Mail_Service_Client_Secret,
  Mail_Service_Refresh_Token,
  SenderEmail,
} = process.env;

const oAuth2Client = new google.auth.OAuth2(
  Mail_Service_Client_ID,
  Mail_Service_Client_Secret,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: Mail_Service_Refresh_Token });
const SendMail = async (to, html, subject) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      // @ts-ignore
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: SenderEmail,
        clientId: Mail_Service_Client_ID,
        clientSecret: Mail_Service_Client_Secret,
        refreshToken: Mail_Service_Refresh_Token,
        accessToken: accessToken,
      },
    });
    const mailOptions = {
      from: "StateBook <${SenderEmail}>",
      to: to,
      subject: subject,
      html: html,
    };

    transport.sendMail(mailOptions, (err, infor) => {
      if (err) {
        console.log(err)
        return err
      };
      console.log(infor)
      return infor;
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = SendMail;
