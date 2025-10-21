const express = require('express');
const bodyParser = require('body-parser');
const megaRoutes = require('./routes/mega');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));

// Routes
app.use('/', megaRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`MEGA extractor listening on ${PORT}`));
