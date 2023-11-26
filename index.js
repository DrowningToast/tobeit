const dotenv = require("dotenv");
dotenv.config({
  path: "./.env",
});

const https = require("https");
const express = require("express");

const app = express();
const PORT = process.env.port ?? 3000; //
const TOKEN = process.env.access;

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
    const text = req.body.events[0].message.text;

    // Message data, must be stringified
    const dataString = JSON.stringify({
      replyToken: req.body.events[0].replyToken,
      messages: [
        {
          type: "text",
          text: "Hello, user",
        },
        {
          type: "text",
          text: "May I help you?",
        },
      ],
    });

    // Request header
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    };

    // Options to pass into the request
    const webhookOptions = {
      hostname: "api.line.me",
      path: "/v2/bot/message/reply",
      method: "POST",
      headers: headers,
      body: dataString,
    };

    // Define request
    const request = https.request(webhookOptions, (res) => {
      res.on("data", (d) => {
        process.stdout.write(d);
      });
    });

    // Handle error
    request.on("error", (err) => {
      console.error(err);
    });

    // Send data
    request.write(dataString);
    request.end();
  } else {
    res.send("Unknown action");
  }
});

app.listen(PORT, () => {
  console.log(`Line bot app listening at http://localhost:${PORT}`);
});
