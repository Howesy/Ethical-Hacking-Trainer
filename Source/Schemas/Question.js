const { Schema, model } = require("mongoose");

const questionSchema = new Schema({
    category: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    fillerAnswers: {type: [String], required: true},
    unlocked: { type: Boolean, required: true },
    identifier: { type: Number, required: true }
}, { timestamps: true });

const Question = model("Question", questionSchema);

module.exports = Question;