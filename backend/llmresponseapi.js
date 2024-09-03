const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors'); // Import the cors package

const app = express();

app.use(cors()); // Use the CORS middleware
app.use(express.json());

app.post('/api/extract_intent_entities', (req, res) => {
  const response = {
    "intent": "send",
    "entities": {
      "amount": "0.5",
      "currency": "ETH",
      "destination_address": "0x1a2B3c4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9STU"
    }
  };
  res.json(response);
});

// Local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
module.exports.handler = serverless(app); // Export the serverless function
