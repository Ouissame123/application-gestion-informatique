const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Atlas connection
const uri = "mongodb+srv://ouissame:ouissame123@ouioui.iss8v.mongodb.net/";
const client = new MongoClient(uri);

// Connect to MongoDB
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Mongoose connected to MongoDB Atlas'))
  .catch(err => console.error('Mongoose connection error:', err));

// Define schema
const formSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  sub_family: String,
  brand: String,
  model: String,
  code_onee: String,
  serial_number: String,
  m_a: String,
  name_function: String,
  entity: String,
  remarks: String
});

const FormData = mongoose.model('FormData', formSchema);


async function main() {
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("Connected to MongoDB Atlas using MongoClient");

    const db = client.db('db');
    const collection = db.collection('admins');

    // Sign-in endpoint
    app.post('/signin', async (req, res) => {
      const { username, password } = req.body;

      try {
        // Check if the admin exists
        const admin = await collection.findOne({ username: username });

        if (!admin || admin.password !== password) {
          return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Generate a token (replace 'your_jwt_secret' with your own secret)
        const token = jwt.sign({ username: admin.username }, 'your_jwt_secret', { expiresIn: '1h' });

        // Send the token and redirect
        res.json({ token, redirectUrl: 'home.html' });
      } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });

    // API endpoint to handle form submission
    app.post('/submit', async (req, res) => {
      try {
        console.log('Received data:', req.body);
        // Get the last document and increment its ID
        const lastData = await FormData.findOne().sort({ id: -1 }); // Find the last inserted document
        const newId = lastData ? lastData.id + 1 : 1; // Increment ID or start from 1

        // Add the new ID to the request body
        const data = new FormData({ id: newId, ...req.body })

        await data.save();
        res.status(200).send('Data saved successfully!');
      } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).send('Error saving data: ' + error.message);
      }

    });
    // API endpoint pour récupérer les données
    app.get('/data', async (req, res) => {
      try {
        const data = await FormData.find();
        res.json(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        res.status(500).send('Erreur lors de la récupération des données');
      }
    });

    app.get('/last-id', async (req, res) => {
      try {
        const lastData = await FormData.findOne().sort({ id: -1 }); // Find the last inserted document
        const lastId = lastData ? lastData.id : 0; // If there is no data, start with ID 0
        res.json({ lastId: lastId });
      } catch (error) {
        console.error('Error fetching last ID:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });

    // API endpoint to delete data
    app.delete('/data/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await FormData.findByIdAndDelete(id);
        if (result) {
          res.status(200).json({ message: 'Data deleted successfully' });
        } else {
          res.status(404).json({ message: 'Data not found' });
        }
      } catch (error) {
        console.error('Error deleting data:', error);
        res.status(500).send('Error deleting data: ' + error.message);
      }
    });

    // API endpoint to update data
    app.put('/data/:id', async (req, res) => {
      try {
        const { id } = req.params; // MongoDB _id
        const updatedData = req.body;

        console.log('Updating data with ID:', id);
        console.log('New data:', updatedData);

        const result = await FormData.findByIdAndUpdate(id, updatedData, { new: true });

        if (!result) {
          return res.status(404).json({ message: 'Data not found' });
        }

        console.log('Updated document:', result);
        res.status(200).json({ message: 'Form data updated successfully', updatedData: result });
      } catch (error) {
        console.error('Error updating form data:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });


    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });


  } catch (e) {
    console.error(e);
  }
}

main().catch(console.error);
