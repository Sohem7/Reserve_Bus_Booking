const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const url = 'mongodb+srv://sohem:rajani123@cluster0.u0lvqnx.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'data';

app.post('/api/trips/addTrip', async (req, res) => {
    try {
        const client = new MongoClient(url);

        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('trips');

        const { tripName, destination, startDate, endDate } = req.body;

        const trip = {
            tripName,
            destination,
            startDate,
            endDate
        };

        const result = await collection.insertOne(trip);

        res.json({ message: 'Trip added successfully', insertedId: result.insertedId });

        client.close();
    } catch (err) {
        console.error('Error adding trip:', err);
        res.status(500).json({ error: 'Error adding trip' });
    }
});

app.post('/api/bookings/saveBooking', async (req, res) => {
    try {
        const client = new MongoClient(url);

        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('bookings');

        // Extract booking details from the request body
        const { passengerName, busNumber, departureDate, seatNumber } = req.body;

        // Create a document to insert into the collection
        const booking = {
            passengerName,
            busNumber,
            departureDate,
            seatNumber
        };

        // Insert the new booking into the collection
        const result = await collection.insertOne(booking);

        res.json({ message: 'Booking saved successfully', insertedId: result.insertedId });

        client.close();
    } catch (err) {
        console.error('Error saving booking:', err);
        res.status(500).json({ error: 'Error saving booking' });
    }
});

app.get('/api/pastTrips', async (req, res) => {
    try {
        const client = new MongoClient(url);

        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('trips'); 

        // Find past trips with a limit of 50 results
        const pastTrips = await collection.find().limit(50).toArray();

        res.json(pastTrips);

        client.close();
    } catch (err) {
        console.error('Error retrieving past trips:', err);
        res.status(500).json({ error: 'Error retrieving past trips' });
    }
});

app.get('/api/trips/getTripsByDate', async (req, res) => {
  try {
    const client = new MongoClient(url);

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('trips'); 

    // Extract the date parameter from the query string
    const dateParam = req.query.date;

    // Convert the date parameter to a JavaScript Date object
    const searchDate = new Date(dateParam);

    // Find trip details associated with the specified date
    const trips = await collection.find({ startDate: { $lte: searchDate }, endDate: { $gte: searchDate } }).toArray();

    res.json(trips);

    client.close();
  } catch (err) {
    console.error('Error retrieving trip details:', err);
    res.status(500).json({ error: 'Error retrieving trip details' });
  }
});

app.get('/api/trips/getTrips', async (req, res) => {
  try {
    const client = new MongoClient(url);

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('trips'); // Replace with your collection name

    // Define query parameters based on user input (query parameters)
    const { from, to, date, arrival, departure, startRating, endRating, operators } = req.query;

    // Construct a filter object based on the user-specified parameters
    const filter = {};

    if (from) {
      filter.from = from;
    }
    if (to) {
      filter.to = to;
    }
    if (date) {
      filter.date = new Date(parseInt(date)); 
    }
    if (arrival) {
      filter.startTime = new Date(parseInt(arrival)); 
    }
    if (departure) {
      filter.EndTime = new Date(parseInt(departure)); 
    }
    if (startRating) {
      filter['busFare.$numberInt'] = { $gte: parseInt(startRating) };
    }
    if (endRating) {
      if (!filter['busFare.$numberInt']) {
        filter['busFare.$numberInt'] = {};
      }
      filter['busFare.$numberInt'].$lte = parseInt(endRating);
    }
    if (operators) {
      filter['busName'] = { $in: operators.split(',') };
    }

    // Find trip details based on the user-specified parameters
    const trips = await collection.find(filter).toArray();

    res.json(trips);

    client.close();
  } catch (err) {
    console.error('Error retrieving trip details:', err);
    res.status(500).json({ error: 'Error retrieving trip details' });
  }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
