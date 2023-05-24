const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  imageSrc: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
  },
  roomCount: {
    type: Number,
  },
  bathroomCount: {
    type: Number,
  },
  guestCount: {
    type: Number,
  },
  locationValue: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  price: {
    type: Number,
  },
  reservations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
    },
  ],
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
