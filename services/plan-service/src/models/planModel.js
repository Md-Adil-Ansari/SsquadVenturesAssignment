const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
    {
        creatorName: {
            type: String,
            required: [true, 'Creator name is required.'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Category is required.'],
            trim: true,
            enum: {
                values: ['travel', 'shop', 'socialize', 'business'],
                message: 'Category must be one of the following: travel, shop, socialize, business',
            },
        },
        subcategory: {
            type: String,
            trim: true,
        },
        location: {
            type: {
                type: String,
                enum: {
                    values: ['Point'],
                    message: 'Location type must be Point.',
                },
                default: 'Point',
            },
            coordinates: {
                type: [Number],
                required: [true, 'Coordinates are required.'],
            },
        },
        date: {
            type: Date,
            required: [true, 'Date is required.'],
        },
        time: {
            type: String,
            required: [true, 'Time is required.'],
            trim: true,
        },
        people: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'CreatedBy field is required.'],
        },
        peopleNames: [
            {
                type: String,
                trim: true,
            },
        ],
        status: {
            type: String,
            enum: {
                values: ['open', 'full'],
                message: 'Status must be either open or full.',
            },
            default: 'open',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);
