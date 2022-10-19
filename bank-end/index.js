const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h7j27jb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();

    console.log("database connected");
    const database = client.db("Ticket_Booking");
    const booking_list = database.collection("Train_Booking_list");
    const user_booking_list = database.collection("User_Booking_list");

    //  get all booking
    app.get("/booking", async (req, res) => {
      const { from, date, to, selectedClass, train_name, coach } = req.query;

      let query;
      if (from) {
        query = { from, to, date, class: selectedClass, train_name, coach };
      } else {
        query = {};
      }
      const cursor = user_booking_list.find(query);
      const result = await cursor.toArray();
      res.json(result);
    });

    // booking post api
    app.post("/booking", async (req, res) => {
      const { userInfo } = req.body;
      const user_result = await user_booking_list.insertOne(userInfo);
      res.json({ user_result });
    });
    //  query for booking
    app.get("/mybookings", async (req, res) => {
      const searchEmail = req.query.email;
      let query;
      if (searchEmail) {
        query = { email: searchEmail };
      } else {
        query = {};
      }
      const cursor = user_booking_list.find(query);
      const events = await cursor.toArray();

      res.json(events);
    });
    // // all booking list
    // app.get("/mybookinglist", async (req, res) => {
    //   const query = {};
    //   const cursor = user_booking_list.find(query);
    //   const events = await cursor.toArray();

    //   res.json(events);
    // });
    //! for delete  booking
    app.delete("/booking/:id", async (req, res) => {
      const id = req.params.id;
      console.log("id :", id);
      const query = { _id: ObjectId(id) };
      console.log("query :", query);
      const result = await user_booking_list.deleteOne(query);

      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", async (req, res) => {
  res.send("online ticket booking  server running");
});
app.listen(port, () => {
  console.log("ticket  server on and  port :", port);
});
