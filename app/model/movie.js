const mongoose = require('mongoose')
const schema = mongoose.Schema
const Joi = require('joi')

  const movieValidation=Joi.object({
      movieName:Joi.string().required().min(3).trim(),
      genre:Joi.string().required().trim(),
      language:Joi.string().required().min(4).trim(),
      duration:Joi.string().required().trim(),
      cast: Joi.array().items(Joi.string().trim().min(2)).required(),
      director:Joi.string().required().trim(),
      releaseDate:Joi.date().required(),
  })

const MovieSchema = new schema({
    movieName: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    cast: {
        type:  [String],
        required: true

    },

    director: {
        type: String,
        required: true
    },
    releaseDate: {
        type: Date,
         required: true
    }
});

const MovieModel = mongoose.model('movie', MovieSchema)
module.exports = { MovieModel, movieValidation}