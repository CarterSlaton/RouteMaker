import mongoose, { Schema, Document } from 'mongoose';

export interface IRoute extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  distance: number;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  coordinates: {
    type: string;
    coordinates: number[][];
  };
  elevationData?: {
    elevationGain: number;
    elevationLoss: number;
    minElevation: number;
    maxElevation: number;
    profile: Array<{ distance: number; elevation: number }>;
  };
  directions?: Array<{
    instruction: string;
    distance: number;
    type: string;
  }>;
  createdAt: Date;
}

const RouteSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  elevationData: {
    elevationGain: { type: Number },
    elevationLoss: { type: Number },
    minElevation: { type: Number },
    maxElevation: { type: Number },
    profile: [{
      distance: { type: Number },
      elevation: { type: Number }
    }]
  },
  directions: [{
    instruction: { type: String },
    distance: { type: Number },
    type: { type: String }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index for location-based queries
RouteSchema.index({ coordinates: '2dsphere' });

export default mongoose.model<IRoute>('Route', RouteSchema);
