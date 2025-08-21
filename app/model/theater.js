

const mongoose = require('mongoose')
const schema = mongoose.Schema
const Joi = require('joi')
const JoiObjectId = require('joi-objectid')(Joi);

const theaterValidation = Joi.object({
  theaterName: Joi.string().required().min(3).trim(),
  location: Joi.string().required().trim(),
  numberOfScreens: Joi.number().required(),
  numberOfSeat: Joi.number().required(),
  movieId: Joi.array().items(JoiObjectId()).required(),
  showTimings: Joi.array().items(
    Joi.object({
      time: Joi.string().required(),
      availableSeats: Joi.number().required()
    })
  ).required()
});



const TheaterSchema = new schema({
    movieId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "movie"
    }
    ]
    ,
    theaterName: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    numberOfScreens: {
        type: Number,
        required: true
    },
    numberOfSeat: {
        type: Number,
        required: true
    },
    showTimings: [
        {
            time: { type: String, required: true },
            availableSeats: { type: Number, required: true },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },

});

const TheaterModel = mongoose.model('theater', TheaterSchema)
module.exports = { TheaterModel, theaterValidation }