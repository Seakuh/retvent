import { Schema, model } from 'mongoose';

export const GroovecastSchema = new Schema({
  title: { type: String },
  description: { type: String },
  imageUrl: { type: String, required: true },
  audioUrl: { type: String },
  duration: { type: Number },
  url: { type: String, required: true },
  genre: { type: String },
  releaseDate: { type: Date },
  artistId: { type: String }
});

export const Groovecast = model('Groovecast', GroovecastSchema);
