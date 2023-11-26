// สร้าง server ด้วย express และรับข้อมูลจาก Line ผ่าน webhook

// สร้างไฟล์ .env และใส่ access token ของ Line ลงไป
const dotenv = require("dotenv");
dotenv.config({
  path: "./.env",
});

const express = require("express");

const app = express();
// ดึง port จากไฟล์ .env (ตัวแปรใน .env ชื่อว่า port)
const PORT = process.env.port ?? 3000;
// ดึง access token จากไฟล์ .env (ตัวแปรใน .env ชื่อว่า access)
const TOKEN = process.env.access;

const { LineClient, Line } = require("messaging-api-line");

// สร้าง client สำหรับส่งข้อความไปยัง Line
const client = new LineClient({
  accessToken: TOKEN,
});

// สร้าง middleware สำหรับรับข้อมูลจาก Line
app.use(express.json());
// สำหรับรับข้อมูลจาก form-urlencoded
app.use(
  express.urlencoded({
    extended: true,
  })
);

// สร้าง route สำหรับเช็คว่า server ทำงานอยู่หรือไม่
app.get("/", (req, res) => {
  res.send("สวัสดี express");
});

// เวลาใส่ webhook URL ให้ Line จะต้องมี /webhook ตามหลังด้วยนะครัช เพราะว่าเรารับข้อมูลจาก line ผ่าน /webhook
app.post("/webhook", (req, res) => {
  console.log("req.body =>", JSON.stringify(req.body, null, 2)); //สิ่งที่ Line ส่งมา

  // ============= เพิ่มเข้ามาใหม่
  if (req.body.events?.[0]?.type === "message") {
    const text = req.body.events[0].message.text; // ข้อความที่ส่งมา
    const replyToken = req.body.events[0].replyToken; // replyToken ที่ Line ส่งมา

    // ถ้าขอความที่ user ส่งมาเป็น image ให้ส่งข้อความกลับไปว่า ส่งมาเป็น image
    if (text === "image") {
      client.reply(replyToken, [
        Line.createText("Hello! you just send the message " + text),
        Line.createImage({
          originalContentUrl: "https://tobeit.it20.dev/logo-about.webp",
          previewImageUrl: "https://tobeit.it20.dev/logo-about.webp",
        }),
      ]);
      // ถ้าข้อความที่ user ส่งมาเป็น text ให้ส่งข้อความกลับไปว่า ส่งมาเป็น text
    } else if (text === "text") {
      client.reply(replyToken, [
        Line.createText("Hello! you just send the message " + text),
      ]);
      // ถ้าข้อความที่ user ส่งมาเป็น sticker ให้ส่งข้อความกลับไปว่า ส่งมาเป็น sticker
    } else {
      client.reply(replyToken, [Line.createText("Unknown keyword!")]);
    }
  } else {
    // ถ้าไม่ใช่ message ให้ส่งข้อความกลับไปว่า ไม่รู้จัก action นี้
    res.send("Unknown action");
  }
});

// สั่งให้ server รอรับ request ที่ port ที่เรากำหนดไว้
app.listen(PORT, () => {
  console.log(`Line bot app listening at http://localhost:${PORT}`);
});
