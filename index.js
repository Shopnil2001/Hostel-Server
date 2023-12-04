const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
// const jwt = require('jsonwebtoken')
const app = express();
// const cookieParser = require('cookie-parser')
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.necrkau.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const MealsCollection = client.db('HostelDB').collection('Meals');
    const ReviewCollection = client.db('HostelDB').collection('reviews');
    const UserCollection = client.db('HostelDB').collection('users');
    const UpcomingCollection = client.db('HostelDB').collection('upcoming');
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    app.get('/Meals', async (req, res) => {
      
      const filter = req.query
      let query = {
        // FoodName : {$regex: filter.search, $options:'i'}
      };
      if(filter.search){
        query={FoodName : {$regex: filter.search, $options:'i'}}
      }
      if (req.query?.FoodCategory) {
        query = {

          FoodCategory: req.query.FoodCategory
        }
      }
      const cursor = MealsCollection.find(query)
      const result = await cursor.toArray();
      res.send(result)
    })
    app.get('/users', async (req, res) => {
     let query = {}
      if (req.query?.Email) {
        
        query = {
          Email: req.query.Email
        }
      }
      const cursor = UserCollection.find(query)
      const result = await cursor.toArray();
      res.send(result)
    })
    app.get('/upcoming', async (req, res) => {
      let query = {}
       const cursor = UpcomingCollection.find(query)
       const result = await cursor.toArray();
       res.send(result)
     })
     app.put('/upcoming/:id',async(req, res)=>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const options ={upsert : true}
      const updated = req.body;
      console.log(updated);
      const meal ={
        $set: {
           Likes:updated.Likes
        }
      }
      const result = await UpcomingCollection.updateOne(filter, meal, options);
      res.send(result)
    })
   
    app.post('/users',async (req, res)=>{
      const user = req.body;
      const query = {Email : user.Email}
      const oldUser = await UserCollection.findOne(query)
      if(oldUser){
        return res.send({message : 'user exist'})
      }
      const result = await UserCollection.insertOne(user)
      res.send(result);
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Server is running')
})

app.listen(port, () => {
  console.log(`server is running on port ${port}`);

})
