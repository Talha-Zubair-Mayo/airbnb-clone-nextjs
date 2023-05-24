const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  totalPrice: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
