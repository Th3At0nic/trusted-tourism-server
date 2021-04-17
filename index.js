const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = 5003;
require("dotenv").config();
const app = express();
app.use(bodyParser.json());
app.use(cors());

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
      res.send(result.insertedCount);
    });
  });
});

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(process.env.PORT || port);
