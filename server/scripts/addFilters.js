// scripts/addFilters.js

const mongoose = require('mongoose');
const Filter = require('../models/Filter');
require('dotenv').config(); // Add this line!

const categories = [
  'AI',
  'Mobile apps',
  'MERN',
  'Python',
  'Javascript',
  'HTML & CSS',
  'Entreprenuership',
  'Success Stories',
  'PLP Graduation',
  'Hackathons',
];

async function addFilters() {
  await mongoose.connect(process.env.MONGO_URI || {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  for (const name of categories) {
    await Filter.updateOne(
      { name },
      { name },
      { upsert: true }
    );
    console.log(`Added/updated filter: ${name}`);
  }

  mongoose.disconnect();
}

addFilters();