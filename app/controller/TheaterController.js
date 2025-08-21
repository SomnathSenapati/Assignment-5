
const { TheaterModel, theaterValidation } = require('../model/theater')
const mongoose = require('mongoose')
class TheaterController {

    //  Add a Theater  simpler
    // async addTheater(req, res) {
    //     try {
    //         // 1. Validate request body
    //         const { error } = theaterValidation.validate(req.body);
    //         if (error) {
    //             return res.status(400).json({ success: false, message: error.message });
    //         }

    //         // 2. Create a new theater
    //         const theater = new TheaterModel(req.body);

    //         // 3. Save to DB
    //         await theater.save();

    //         // 4. Send success response
    //         return res.status(201).json({ success: true, data: theater });
    //     } catch (err) {
    //         return res.status(500).json({ success: false, message: err.message });
    //     }
    // }


    //add with showtime and no of seats

async addTheater(req, res) {
  try {
    let payload = req.body;

    // If showTimings are strings, convert them
    if (Array.isArray(payload.showTimings) && typeof payload.showTimings[0] === "string") {
      payload.showTimings = payload.showTimings.map(time => ({
        time,
        availableSeats: payload.numberOfSeat
      }));
    }

    const { error } = theaterValidation.validate(payload);
    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    const theater = new TheaterModel(payload);
    await theater.save();

    return res.status(201).json({ success: true, data: theater });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}



    // Get list of theaters playing a specific movie
   async  getTheatersByMovie(req, res) {
  try {
    const id = String(req.params.movieId || "").trim();

    const result = await TheaterModel.aggregate([
      // 1) Pick whichever field exists: movies OR movieId
      { 
        $addFields: { 
          _movieIds: { $ifNull: ["$movies", "$movieId"] } 
        } 
      },
      // 2) Ensure it's always an array (in case someone stored a single value)
      {
        $addFields: {
          _movieIdsArr: {
            $cond: [
              { $isArray: "$_movieIds" },
              "$_movieIds",
              { $cond: [{ $gt: ["$_movieIds", null] }, ["$_movieIds"], []] }
            ]
          }
        }
      },
      // 3) Convert every element to string so we can compare reliably
      {
        $addFields: {
          _movieIdsStr: {
            $map: {
              input: "$_movieIdsArr",
              as: "m",
              in: { $toString: "$$m" } // works for ObjectId or string
            }
          }
        }
      },
      // 4) Match the param (trimmed) against normalized strings
      {
        $match: { $expr: { $in: [id, "$_movieIdsStr"] } }
      },
      // 5) Return only what you need
      {
        $project: {
          _id: 0,
          theaterName: 1,
          location: 1,
          showTimings: 1
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      totalTheaters: result.length,
      theaters: result
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

}

module.exports = new TheaterController()