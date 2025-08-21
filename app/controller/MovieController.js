const {MovieModel,movieValidation}=require('../model/movie')

class MovieController {
   
//  Add a new movie
  async addMovie(req, res) {
    try {
      const { error } = movieValidation.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      const movie = new MovieModel(req.body);
      await movie.save();

      return res.status(201).json({ success: true, data: movie });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  //  List movies with theaters & show timings without aggregation
//   async listMovie(req, res) {
//     try {
//       // Fetch all movies
//       const movies = await MovieModel.find();

//       // For each movie, find theaters playing it
//       const result = await Promise.all(
//         movies.map(async (movie) => {
//           const theaters = await TheaterModel.find(
//             { movies: movie._id }, // assumes TheaterSchema has `movies: [ObjectId]`
//             { theaterName: 1, showTimings: 1, _id: 0 }
//           );

//           return {
//             movie,
//             totalTheaters: theaters.length,
//             theaters
//           };
//         })
//       );

//       return res.status(200).json({ success: true, data: result });
//     } catch (err) {
//       return res.status(500).json({ success: false, message: err.message });
//     }
//   }

// with aggregation
async listMovie(req, res) {
  try {
    const movies = await MovieModel.aggregate([
      {
        $lookup: {
          from: "theaters",          // Theater collection (Mongoose pluralizes "Theater")
          localField: "_id",         // Movie._id
          foreignField: "movieId",    // Theater.movies (array of ObjectIds)
          as: "theaters"
        }
      },
      {
        $addFields: {
          totalTheaters: { $size: "$theaters" }
        }
      },
      {
        $project: {
          movieName: 1,
          genre: 1,
          language: 1,
          duration: 1,
          cast: 1,
          director: 1,
          releaseDate: 1,
          totalTheaters: 1,
          "theaters.theaterName": 1,
          "theaters.showTimings": 1
        }
      }
    ]);

    return res.status(200).json({ success: true, data: movies });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

  //  Update a movie
  async updateMovie(req, res) {
    try {
      const { id } = req.params;
      const { error } = movieValidation.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      const movie = await MovieModel.findByIdAndUpdate(id, req.body, { new: true });
      if (!movie) {
        return res.status(404).json({ success: false, message: 'Movie not found' });
      }

      return res.status(200).json({ success: true, data: movie });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  //  Delete a movie
  async deleteMovie(req, res) {
    try {
      const { id } = req.params;
      const movie = await MovieModel.findByIdAndDelete(id);
      if (!movie) {
        return res.status(404).json({ success: false, message: 'Movie not found' });
      }

      return res.status(200).json({ success: true, message: 'Movie deleted successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

}

module.exports = new MovieController