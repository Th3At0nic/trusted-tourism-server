const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileupload = require("express-fileupload");
const port = 5003;
require("dotenv").config();
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("beauticians"));
app.use(fileupload());

const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hz5rx.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const appointmentCollection = client
    .db("goodnessGlamour")
    .collection("appointments");
  console.log("Database Connected");

  app.post("/addAppointment", (req, res) => {
    const appointment = req.body;
    appointmentCollection.insertOne(appointment).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/appointmentsByDate", (req, res) => {
    const date = req.body;
    console.log(date.date);
    appointmentCollection
      .find({ date: date.date })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.post("/addBeautician", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const file = req.files.file;
    console.log(name, email, file);
    file.mv(`${__dirname}/beauticians/${file.name}`, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ msg: "Failed to upload image" });
      }
      return res.send({ name: file.name, path: `/${file.name}` });
    });
  });
});

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(process.env.PORT || port);
