const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['New', 'Backlog', 'In Progress', 'Completed', 'Approved'],
    default: 'New'
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  startDate: { type: String },
  endDate: { type: String },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true });

taskSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

taskSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);