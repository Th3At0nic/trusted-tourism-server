const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileupload = require("express-fileupload");
const fs = require("fs-extra");
const port = 5003;
require("dotenv").config();
const app = express();
app.use(bodyParser.json());
app.use(cors());
//Mongo DB code for DB connect Start
const ObjectId = require("mongodb").ObjectId;
const assert = require("assert");
//Mongo DB code for DB connect ends
app.use(express.static("members"));
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
  console.log("Database appointments Connected");

  const memberCollection = client.db("goodnessGlamour").collection("members");
  console.log("members Connected");

  const reviewCollection = client.db("goodnessGlamour").collection("reviews");

  const serviceCollection = client.db("goodnessGlamour").collection("services");
  console.log("services Connected");
  console.log("rahat connected");

  const orderCollection = client.db("goodnessGlamour").collection("orders");
  const adminUserCollection = client
    .db("goodnessGlamour")
    .collection("adminUser");

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

  app.get("/members", (req, res) => {
    memberCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/services", (req, res) => {
    serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/addMember", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const file = req.files.file;
    const filePath = `${__dirname}/allmember/${file.name}`;
    file.mv(filePath, (err) => {
      if (err) {
        console.log(err);
        res.status(500).send({ msg: "Failed to upload image" });
      }
      // return res.send({ name: file.name, path: `/${file.name}` });
      const newImg = fs.readFileSync(filePath);
      const encodedImg = newImg.toString("base64");

      let image = {
        contentType: req.files.file.mimetype,
        size: req.files.file.size,
        img: Buffer.from(encodedImg, "base64"),
      };

      memberCollection.insertOne({ name, email, image }).then((result) => {
        fs.remove(filePath, (error) => {
          if (error) {
            console.log(error);
            res.status(500).send({ msg: "Failed to upload image" });
          }
          res.send(result.insertedCount > 0);
        });
      });
    });
  });

  app.post("/addReview", (req, res) => {
    const name = req.body.name;
    const from = req.body.from;
    const detail = req.body.detail;
    reviewCollection.insertOne({ name, detail, from }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/addReview", (req, res) => {
    reviewCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  //Showing Product By ID API
  app.get("/showServiceById/:id", (req, res) => {
    const id = req.params.id;
    serviceCollection.find({ _id: ObjectId(id) }).toArray((err, documents) => {
      //console.log(documents);
      res.send(documents[0]);
    });
  });

  //SHowing Order By email API
  app.get("/showOrders/:email", (req, res) => {
    const email = req.params.email;

    adminUserCollection.find({ email: email }).toArray((err, admin) => {
      let filter = { email: email };
      if (admin.length !== 0) {
        filter = "";
      }
      console.log(admin.length);
      orderCollection.find(filter).toArray((err, documents) => {
        console.log(documents);
        res.send(documents);
      });
    });
  });

  //Order Submit/Checkout API
  app.post("/addOrder", (req, res) => {
    const order = req.body;
    //console.log(order);
    orderCollection.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/addService", (req, res) => {
    const packageName = req.body.packageName;
    const price = req.body.price;
    const person = req.body.person;
    const file = req.files.file;
    const detail = req.body.detail;
    const filePath = `${__dirname}/services/${file.name}`;
    file.mv(filePath, (err) => {
      if (err) {
        console.log(err);
        res.status(500).send({ msg: "Failed to upload image" });
      }
      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString("base64");

      let image = {
        contentType: req.files.file.mimetype,
        size: req.files.file.size,
        img: Buffer.from(encImg, "base64"),
      };

      serviceCollection
        .insertOne({
          packageName: packageName,
          price: price,
          person: person,
          detail: detail,
          image,
        })
        .then((result) => {
          console.log(result);
          fs.remove(filePath, (error) => {
            if (error) {
              console.log(error);
              res.status(500).send({ msg: "Failed to upload image" });
            }
            res.send(result.insertedCount > 0);
          });
        });
    });
  });
});

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(process.env.PORT || port);
