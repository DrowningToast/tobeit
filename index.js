const dotenv = require("dotenv");
dotenv.config({
  path: "./.env",
});

const https = require("https");
const express = require("express");

const app = express();
const PORT = process.env.port ?? 3000; //
const TOKEN = process.env.access;

const { LineClient, Line } = require("messaging-api-line");

const client = new LineClient({
  accessToken: TOKEN,
});

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.send("สวัสดี express");
});

app.post("/webhook", (req, res) => {
  console.log("req.body =>", JSON.stringify(req.body, null, 2)); //สิ่งที่ Line ส่งมา

  // ============= เพิ่มเข้ามาใหม่
  if (req.body.events?.[0]?.type === "message") {
    const text = req.body.events[0].message.text; // ข้อความที่ส่งมา
    const replyToken = req.body.events[0].replyToken; // replyToken ที่ Line ส่งมา

    if (text === "image") {
      client.reply(replyToken, [
        Line.createText("Hello! you just send the message " + text),
        Line.createImage({
          originalContentUrl: "https://tobeit.it20.dev/logo-about.webp",
          previewImageUrl: "https://tobeit.it20.dev/logo-about.webp",
        }),
      ]);
    } else if (text === "text") {
      client.reply(replyToken, [
        Line.createText("Hello! you just send the message " + text),
      ]);
    } else {
      client.reply(replyToken, [Line.createText("Unknown keyword!")]);
    }
  } else {
    res.send("Unknown action");
  }
});

app.listen(PORT, () => {
  console.log(`Line bot app listening at http://localhost:${PORT}`);
});
