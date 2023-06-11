const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

/// MongoDB connection
console.log(process.env.DB_USER);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rin8xcl.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // Access the MongoDB collections and define routes here
    const usersCollection = client.db('sportCamp').collection('users');
   const classCollection =client.db('sportCamp').collection('classes')
   const selectedCollection =client.db('sportCamp').collection('selectedClass')

   

    app.get('/users', async (req, res) => {
        const result = await usersCollection.find().toArray();
        res.send(result);
      });

    app.post('/users', async (req, res) => {
      
        const user = req.body;
        console.log(user);
        const query = { email: user.email };
        const existingUser = await usersCollection.findOne(query);
        console.log('existing User', existingUser);
        if (existingUser) {
          return res.send({ message: 'User already exists' });
        }
        const result = await usersCollection.insertOne(user);
        res.send(result);
      
      
    });
///role checking
  app.patch('/users/admin/:id',async(req,res)=>{
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)};
    const updateDoc ={
        $set : {
            role: 'admin'
        }
    };
    const result =await usersCollection.updateOne(filter,updateDoc);
    res.send(result)
  })

  app.patch('/users/instructor/:id',async(req,res)=>{
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)};
    const updateDoc ={
        $set : {
            role: 'instructor'
        }
    };
    const result =await usersCollection.updateOne(filter,updateDoc);
    res.send(result)
  })
/// geting for instructor page instructor list by 'role' ways..
app.get('/users/instructors', async (req, res) => {
  const instructors = await usersCollection.find({ role: 'instructor' }).toArray();
  res.send(instructors);
});

  //posted for addClass by instructor..
  app.post('/classes',async(req,res)=>{
    const user =req.body;
    const result =await classCollection.insertOne(user);
    res.send(result);
   })

   // get data in the myClasses 
   app.get('/classes/:instructorEmail',async(req,res)=>{
    const cursor = classCollection.find();
    const result = await cursor.toArray();
    res.send(result)
   })

  // post for myselected component by classess
app.post ('/myselectedclass',async(req,res)=>{
  const selectedClass=req.body;
  const result = await selectedCollection.insertOne(selectedClass);
  res.send(result);
})

// get for myselected component...
app.get('/myselectedclass/:studentEmail',async(req,res)=>{
  const cursor = selectedCollection.find();
  const result = await cursor.toArray();
  res.send(result)
 })

 /// users delete...
 app.delete('/users/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await usersCollection.deleteOne(query);
  res.send(result)
})



    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } finally {
    // The client will be closed when you finish/error
    // Move the client.close() call outside of the `finally` block to keep the connection open while the server is running
  }
}

// Call the run function to establish the connection and define routes
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('sportCamp server running');
});

app.listen(port, () => {
  console.log(`Server is running on Port: ${port}`);
});
