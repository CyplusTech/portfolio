require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();

const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.use(express.static("public"))
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res, next) => {
    res.render("home")
})

app.get("/download-cv", (req, res) => {
  const file = path.join(__dirname, "public", "images", "my-cv.pdf");
  res.download(file, "my-cv.pdf", (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(500).send("File not found or error occurred");
    }
  });
});


app.post("/contact", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ error: "Name, email, and message are required!" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: subject || "New Contact Form Message",
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${
        phone || "N/A"
      }\nMessage:\n${message}`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send message!" });
  }
});

const PORT = 4000;
app.listen(PORT, ()=> console.log(`server running on port ${PORT}`))