// Mongo db user and password in .env file MONGODB_URI=mongodb+srv://coffee-store-conceptual:xGixERjmBh3M32d0@cluster0.bmunlsr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0;

const express = require("express");
require("dotenv").config();
const port = process.env.PORT || 3000;

// 2.4 for post data to the server we need to use cors so first import
const cors = require("cors");
const app = express();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
// 2.1 for post method as the data is coming from the client side as json format. it needs to convert to server side data format. so we use middleware
app.use(express.json());

// 2.5 use the cors
app.use(cors());

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const database = client.db("coffee-store-conceptual");
    const coffeeCollection = database.collection("coffees");

    // 1.0 getting all the coffees data
    app.get("/coffees", async (req, res) => {
      const allCoffees = await coffeeCollection.find().toArray();
      console.log(allCoffees);
      res.send(allCoffees);
      //   1.1 Note: to check for get, post, patch, delete method we use thunder client extension in vs code. after install u will get an icon of thunder to the sidebar of the vs code
    });

    // 4.1
    app.get("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const coffee = await coffeeCollection.findOne(query);
      console.log(coffee);
      res.send(coffee);
    });
    // 2.0 save data to the database using post method
    app.post("/add-coffee", async (req, res) => {
      const coffeeData = req.body;
      const result = coffeeCollection.insertOne(coffeeData);
      console.log(coffeeData);
      // 2.2 we will send response with a status code with message
      res.status(201).send({ ...result, message: "data paisi, thanks" });
    });

    // 2.3 setup the thunder client on conceptual session 1, part-4, mil-11

    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome coffee store server");
});

app.listen(port, () => {
  console.log(`coffee server is running on port ${port}`);
});
