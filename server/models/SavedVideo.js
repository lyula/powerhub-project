const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SavedVideoSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a user can only save a specific video once
SavedVideoSchema.index({ user: 1, video: 1 }, { unique: true });

module.exports = mongoose.model("SavedVideo", SavedVideoSchema);
