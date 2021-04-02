const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dbarr.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(express.json());
app.use(cors());

const port = 5000;

app.get("/", (req, res) => {
  res.send("Books Store!");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const booksCollection = client.db("bookStore").collection("books");
    const ordersCollection = client.db("bookStore").collection("orders");

  app.get("/books", (req, res) => {
    booksCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });

  app.post("/addBook", (req, res) => {
    const newBook = req.body;
    booksCollection.insertOne(newBook).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  //Read by id
  app.get("/book/:id", (req, res) => {
    const id = req.params.id;
    booksCollection.find({ _id: ObjectID(id) }).toArray((err, documents) => {
      res.send(documents[0]);
    });
  });

  app.post("/addOrder", (req, res) => {
    const order = req.body;
    ordersCollection.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/getOrder", (req, res) => {
    ordersCollection.find({ email: req.query.email }).toArray((err, documents) => {
      res.send(documents);
    });
  });
  app.delete("/deleteBook/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    console.log("delete this", id);
    booksCollection
      .deleteOne({ _id: id })
      .then(result =>{
        res.send(result.deletedCount > 0);
      })
  });
});

app.listen(process.env.PORT || port);
