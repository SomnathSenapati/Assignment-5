const mongoose = require("mongoose");
const { BookingModel, bookingValidation } = require("../model/booking");
const { TheaterModel } = require("../model/theater");
const { MovieModel } = require("../model/movie");
const {UserModel} = require("../model/user");
const nodemailer = require("nodemailer");
class BookingController {
    // Book tickets
    async bookTickets(req, res) {
        try {
            //  Validate request
            const { error } = bookingValidation.validate(req.body);
            if (error) {
                return res.status(400).json({ success: false, message: error.message });
            }

            const { movieId, userId, theaterId, showTime, numberOfTicket } = req.body;

            //  Check movie exists
            const movie = await MovieModel.findById(movieId);
            if (!movie) {
                return res.status(404).json({ success: false, message: "Movie not found" });
            }

            //  Check theater exists
            const theater = await TheaterModel.findById(theaterId);
            if (!theater) {
                return res.status(404).json({ success: false, message: "Theater not found" });
            }

            //  Find the showTime object
            const show = theater.showTimings.find(s => s.time === showTime);

            if (!show) {
                return res.status(400).json({ success: false, message: "Showtime not found" });
            }

            //  Check availability
            if (show.availableSeats < numberOfTicket) {
                return res.status(400).json({ success: false, message: "Not enough seats available" });
            }

            //  Subtract tickets
            show.availableSeats -= numberOfTicket;

            //  Save theater
            await theater.save();


            //  Create booking
            const booking = await BookingModel.create({
                movieId,
                userId,
                theaterId,
                showTime,
                numberOfTicket
            })

            return res.status(201).json({
                success: true,
                message: "Booking successful",
                data: booking,
                remainingSeats: show.availableSeats
            });
        } catch (err) {
            console.log("server error", err.message)
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    async cancelBooking(req, res) {
        try {
            const { bookingId } = req.params;

            // 1 Find the booking
            const booking = await BookingModel.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ success: false, message: "Booking not found" });
            }

            const { theaterId, showTime, numberOfTicket } = booking;

            // 2️ Find the theater
            const theater = await TheaterModel.findById(theaterId);
            if (!theater) {
                return res.status(404).json({ success: false, message: "Theater not found" });
            }

            // 3️ Find the showTime object
            const show = theater.showTimings.find(s => s.time === showTime);
            if (!show) {
                return res.status(400).json({ success: false, message: "Showtime not found in theater" });
            }

            // 4️ Add seats back
            show.availableSeats += numberOfTicket;

            // 5️ Save theater
            await theater.save();

            // 6️ Delete booking
        await BookingModel.findByIdAndDelete(bookingId);

            return res.status(200).json({
                success: true,
                message: "Booking canceled successfully",
                remainingSeats: show.availableSeats
            });

        } catch (err) {
            console.error("Server error:", err.message);
            return res.status(500).json({ success: false, message: err.message });
        }
    }

async getBookingHistory(req, res) {
    try {
        const { userId } = req.params;

        const bookings = await BookingModel.aggregate([
            // 1️ Match bookings by user
            { $match: { userId:new  mongoose.Types.ObjectId(userId) } },

            // 2️Lookup movie details
            {
                $lookup: {
                    from: "movies", // collection name in MongoDB (usually plural of model)
                    localField: "movieId",
                    foreignField: "_id",
                    as: "movie"
                }
            },
            { $unwind: "$movie" }, // flatten array

            // 3️ Lookup theater details
            {
                $lookup: {
                    from: "theaters", // collection name in MongoDB
                    localField: "theaterId",
                    foreignField: "_id",
                    as: "theater"
                }
            },
            { $unwind: "$theater" },

            // 4️ Project only the fields you want
            {
                $project: {
                    _id: 1,
                    showTime: 1,
                    numberOfTicket: 1,
                    createdAt: 1,
                    "movie._id": 1,
                    "movie.movieName": 1,
                    "movie.genre": 1,
                    "movie.language": 1,
                    "theater._id": 1,
                    "theater.theaterName": 1,
                    "theater.location": 1
                }
            },

            // 5️ Sort by latest booking
            { $sort: { createdAt: -1 } }
        ]);

        return res.status(200).json({
            success: true,
            totalBookings: bookings.length,
            bookings
        });

    } catch (err) {
        console.error("Server error:", err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
}



async getMoviesWithTotalBookings(req, res) {
    try {
        const result = await BookingModel.aggregate([
            // 1️ Group by movieId and sum numberOfTicket
            {
                $group: {
                    _id: "$movieId",
                    totalTickets: { $sum: "$numberOfTicket" }
                }
            },
            // 2️ Lookup movie details
            {
                $lookup: {
                    from: "movies", // collection name in MongoDB
                    localField: "_id",
                    foreignField: "_id",
                    as: "movie"
                }
            },
            { $unwind: "$movie" },

            // 3️ Project the final fields
            {
                $project: {
                    _id: 0,
                    movieId: "$movie._id",
                    movieName: "$movie.movieName",
                    genre: "$movie.genre",
                    language: "$movie.language",
                    totalTickets: 1
                }
            },

            // 4️ Sort by totalTickets descending
            { $sort: { totalTickets: -1 } }
        ]);

        return res.status(200).json({
            success: true,
            totalMovies: result.length,
            movies: result
        });

    } catch (err) {
        console.error("Server error:", err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
}


async getBookingsByTheater(req, res) {
    try {
        const result = await BookingModel.aggregate([
            // 1️ Lookup theater details
            {
                $lookup: {
                    from: "theaters",
                    localField: "theaterId",
                    foreignField: "_id",
                    as: "theater"
                }
            },
            { $unwind: "$theater" },

            // 2️ Lookup movie details
            {
                $lookup: {
                    from: "movies",
                    localField: "movieId",
                    foreignField: "_id",
                    as: "movie"
                }
            },
            { $unwind: "$movie" },

            // 3️ Group by theater and movie, then sum tickets per showTime
            {
                $group: {
                    _id: {
                        theaterId: "$theater._id",
                        theaterName: "$theater.theaterName",
                        movieId: "$movie._id",
                        movieName: "$movie.movieName",
                        showTime: "$showTime"
                    },
                    totalTickets: { $sum: "$numberOfTicket" }
                }
            },

            // 4️ Group by theater to nest movies
            {
                $group: {
                    _id: {
                        theaterId: "$_id.theaterId",
                        theaterName: "$_id.theaterName"
                    },
                    movies: {
                        $push: {
                            movieId: "$_id.movieId",
                            movieName: "$_id.movieName",
                            showTime: "$_id.showTime",
                            totalTickets: "$totalTickets"
                        }
                    }
                }
            },

            // 5️ Project final structure
            {
                $project: {
                    _id: 0,
                    theaterId: "$_id.theaterId",
                    theaterName: "$_id.theaterName",
                    movies: 1
                }
            },

            // 6️ Optional: Sort theaters alphabetically
            { $sort: { theaterName: 1 } }
        ]);

        return res.status(200).json({
            success: true,
            totalTheaters: result.length,
            theaters: result
        });

    } catch (err) {
        console.error("Server error:", err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
}



async sendBookingSummary(req, res) {
        try {
            const { userId } = req.params;

            // 1️ Fetch user
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            // 2️ Fetch all bookings of the user
            const bookings = await BookingModel.aggregate([
                { $match: { userId: user._id } },
                {
                    $lookup: {
                        from: "movies",
                        localField: "movieId",
                        foreignField: "_id",
                        as: "movie"
                    }
                },
                { $unwind: "$movie" },
                {
                    $lookup: {
                        from: "theaters",
                        localField: "theaterId",
                        foreignField: "_id",
                        as: "theater"
                    }
                },
                { $unwind: "$theater" },
                {
                    $project: {
                        _id: 0,
                        movieName: "$movie.movieName",
                        theaterName: "$theater.theaterName",
                        showTime: 1,
                        numberOfTicket: 1
                    }
                }
            ]);

            if (bookings.length === 0) {
                return res.status(200).json({ success: true, message: "No bookings found" });
            }

            // 3️ Generate HTML table
            let tableRows = bookings.map(b => `
                <tr>
                    <td>${b.movieName}</td>
                    <td>${b.theaterName}</td>
                    <td>${b.showTime}</td>
                    <td>${b.numberOfTicket}</td>
                </tr>
            `).join("");

            let html = `
                <h2>Booking Summary</h2>
                <table border="1" cellpadding="10" cellspacing="0">
                    <thead>
                        <tr>
                            <th>Movie Name</th>
                            <th>Theater Name</th>
                            <th>Show Time</th>
                            <th>Tickets</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            `;

            // 4️ Create transporter
            const transporter = nodemailer.createTransport({
                service: "gmail", // or any SMTP service
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                  tls: {
        rejectUnauthorized: false
    }
            });

            // 5️ Send mail
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: "Your Booking Summary",
                html
            });

            return res.status(200).json({ success: true, message: "Booking summary sent to email" });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: err.message });
        }
    }




}

module.exports = new BookingController;
