const mongoose = require('mongoose');

// Notes live inside the project document itself. A note has no meaning on its
// own, and this way ownership is checked once, on the parent project.
const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Note text is required'],
      trim: true,
      maxlength: [500, 'A note cannot be longer than 500 characters'],
    },
  },
  { timestamps: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be longer than 100 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Description cannot be longer than 1000 characters'],
    },
    technology: {
      type: String,
      default: '',
      trim: true,
      maxlength: [100, 'Technology cannot be longer than 100 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['idea', 'in-progress', 'completed'],
        message: 'Status must be idea, in-progress or completed',
      },
      default: 'idea',
    },
    // The user this project belongs to. Every query in the controller filters
    // on this field, which is what keeps one user's data away from another's.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    notes: [noteSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
