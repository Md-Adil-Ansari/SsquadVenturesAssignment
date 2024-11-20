
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const errorHandler = require('../../../shared/middlewares/errorHandler');
const { sendSuccess } = require('../../../shared/utils/responseHandler');
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/users', userRoutes);

app.get('/api/users/health', (req, res) => {
    sendSuccess(res, { data: { status: 'User Service is running.' } }, 200);
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`User Service running on port ${PORT}`);
    });
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});
