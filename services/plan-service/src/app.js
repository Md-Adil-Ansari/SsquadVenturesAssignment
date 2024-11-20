
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const planRoutes = require('./routes/planRoutes');
const errorHandler = require('../../../shared/middlewares/errorHandler');
const { sendSuccess } = require('../../../shared/utils/responseHandler');

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());


app.use('/api/plans', planRoutes);

app.get('/api/plans/health', (req, res) => {
    sendSuccess(res, { data: { status: 'Plan Service is running.' }, message: 'Service is healthy.' }, 200);
});

app.use(errorHandler);

const PORT = process.env.PORT || 3002;

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Plan Service running on port ${PORT}`);
    });
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});
