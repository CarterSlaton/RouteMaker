import mongoose, { Schema, Document } from 'mongoose';

export interface IRoute extends Document {
  name: string;
  distance: number;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  coordinates: {
    type: string;
    coordinates: number[][];
  };
  createdAt: Date;
}

const RouteSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  distance: {
    type: Number,
    required: true,
    min: 0
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Moderate', 'Hard']
  },
  coordinates: {
    type: {
      type: String,
      enum: ['LineString'],
      required: true
    },
    coordinates: {
      type: [[Number]],
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index for location-based queries
RouteSchema.index({ coordinates: '2dsphere' });

export default mongoose.model<IRoute>('Route', RouteSchema);
