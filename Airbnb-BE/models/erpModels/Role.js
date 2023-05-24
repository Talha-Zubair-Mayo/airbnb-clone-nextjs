const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const roleSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },

  codeName: {
    type: String,
    trim: true,
    required: true,
  },
  displayName: {
    type: String,
    trim: true,
    required: true,
  },
  roleType: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
  },
  permissions: [{ type: mongoose.Schema.ObjectId, ref: 'Permission', autopopulate: true }],
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', autopopulate: { select: "firstName  lastName  email photo -role" }, maxDepth: 1 },
  created: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });
roleSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Role', roleSchema);
