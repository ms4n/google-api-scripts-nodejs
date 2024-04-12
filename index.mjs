import express from "express";
import axios from "axios";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 7000;

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

const scopes = [
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/userinfo.email",
];

const url = oauth2Client.generateAuthUrl({
  access_type: "offline",

  scope: scopes,
});

app.get("/auth/google", (req, res) => {
  res.redirect(url);
});

app.get("/", (req, res) => {
  res.send("Homepage");
});

app.get("/oauth2callback", async (req, res) => {
  const authorizationCode = req.query.code;

  const { tokens } = oauth2Client.getToken(authorizationCode);

  const accessToken = tokens.access_token;

  axios
    .get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((response) => {
      console.log("User's Email:", response.data.email);
    })
    .catch((error) => {
      console.error("Error fetching email:", error);
    });
  res.redirect("http://localhost:7000/");
});

app.listen(PORT, () => {
  console.log("Server listening on PORT", PORT);
});
