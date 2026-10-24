const mongoose = require("mongoose");

const saveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    schemaVersion: {
      type: Number,
      required: true,
      default: 1,
    },
    day: {
      type: Number,
      required: true,
      default: 1,
    },
    state: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },
    worldProgress: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

saveSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  if (typeof next === "function") next();
});

module.exports = mongoose.model("Save", saveSchema);
