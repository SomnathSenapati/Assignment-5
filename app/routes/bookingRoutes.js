const express=require('express')
const BookingController=require('../controller/BookingController')

const router=express.Router()

router.post('/booking',BookingController.bookTickets)
router.delete('/booking/:bookingId', BookingController.cancelBooking);
router.get('/bookings/:userId', BookingController.getBookingHistory);
router.get('/reports/movies-bookings', BookingController.getMoviesWithTotalBookings);
router.get('/reports/bookings-by-theater', BookingController.getBookingsByTheater);
router.get("/booking-summary/:userId", BookingController.sendBookingSummary);

module.exports=router