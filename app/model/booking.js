


const mongoose = require('mongoose')
const schema = mongoose.Schema
const Joi = require('joi')
const JoiObjectId = require('joi-objectid')(Joi);
const bookingValidation = Joi.object({
    movieId: JoiObjectId().required(),
    userId: JoiObjectId().required(),
    theaterId: JoiObjectId().required(),
    showTime: Joi.string().required().trim(),
    numberOfTicket: Joi.number().required()
})



const BookingSchema = new schema({
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "movie",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    theaterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "theater",
        required: true
    },

    showTime: {
        type: String,
        required: true
    },
    numberOfTicket: {
        type: Number,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

});

const BookingModel = mongoose.model('booking', BookingSchema)
module.exports = { BookingModel, bookingValidation }