const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Example route
const exampleRoute = require('./routes/exampleRoute');
app.use('/api/example', exampleRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
