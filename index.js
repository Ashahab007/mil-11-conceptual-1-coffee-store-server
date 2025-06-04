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

    // 8.1 create a new db for myorders
    const orderCollection = database.collection("orders");

    // 1.0 getting all the coffees data
    app.get("/coffees", async (req, res) => {
      const allCoffees = await coffeeCollection.find().toArray();
      console.log(allCoffees);
      res.send(allCoffees);
      //   1.1 Note: to check for get, post, patch, delete method we use thunder client extension in vs code. after install u will get an icon of thunder to the sidebar of the vs code
    });

    // 4.2 create api for coffee detail
    app.get("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const coffee = await coffeeCollection.findOne(query);
      console.log(coffee);
      res.send(coffee);
    });

    // 5.3 created the api for My Added Coffee's
    app.get("/my-added-coffees/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const coffees = await coffeeCollection.find(query).toArray();
      console.log(coffees);
      res.send(coffees);
    });

    // 10.0 Now my requirement is show the my ordered coffee by customer email
    app.get("/my-orders/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { customerEmail: email }; //as we have sent the customerEmail and coffeeId in db during order
      const myOrders = await orderCollection.find(filter).toArray();
      res.send(myOrders);
    });

    // 6.5 creating handle likes api with patch method
    app.patch("/likes/:coffeeId", async (req, res) => {
      // 6.6 find the liked coffee
      const id = req.params.coffeeId;
      const filter = { _id: new ObjectId(id) };
      const coffee = await coffeeCollection.findOne(filter);
      // 6.7 took the email from the req body
      const email = req.body.email;
      // check if the user has already liked the coffee or not this condition is set on 6.8 updateDoc
      const alreadyLiked = coffee?.likeby.includes(email);
      console.log("shurute like er obostha ----> alreadyLiked ", alreadyLiked);

      // 6.8 now updated the doc conditionally
      const updateDoc = alreadyLiked
        ? {
            // dislike coffee (pop email from likeby array using mongodb pull method)
            $pull: {
              likeby: email,
            },
          }
        : {
            $addToSet: {
              // like coffee (push email in likeby array using mongodb addToSet method)
              likeby: email,
            },
          };
      // 6.9 updated is send via res
      await coffeeCollection.updateOne(filter, updateDoc);
      console.log("sheshe like er obostha ----> alreadyLiked ", !alreadyLiked);
      res.send({
        // sending with message (optional) to check
        message: alreadyLiked ? "dislike successful" : "liked successful",
        liked: !alreadyLiked,
      });
    });

    // 2.0 save data to the database using post method
    app.post("/add-coffee", async (req, res) => {
      const coffeeData = req.body;
      //converting the quantity to number
      const quantity = coffeeData.quantity;
      coffeeData.quantity = parseInt(quantity);

      const result = coffeeCollection.insertOne(coffeeData);
      console.log(coffeeData);
      // 2.2 we will send response with a status code with message
      res.status(201).send({ ...result, message: "data paisi, thanks" });
    });

    // 2.3 setup the thunder client on conceptual   mil-11 session 1, part-4,

    // 8.2 create api for orders using post method
    app.post("/place-order/:coffeeId", async (req, res) => {
      const id = req.params.coffeeId;
      const orderData = req.body;
      console.log(orderData);

      const result = await orderCollection.insertOne(orderData);
      console.log(orderData);
      // 8.3 decrease the quantity by using the id by applying mongodb $inc operator
      if (result.acknowledged) {
        await coffeeCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $inc: {
              quantity: -1,
            },
          }
        );
      }

      res.send(result);
      res.status(201).send(result);
    });

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
