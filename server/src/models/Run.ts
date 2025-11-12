import mongoose, { Schema, Document } from "mongoose";

export interface IGPSPoint {
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
}

export interface IRunStatistics {
  totalDistance: number; // in kilometers
  totalTime: number; // in seconds
  averagePace: number; // minutes per kilometer
  currentPace?: number; // minutes per kilometer (during active run)
  calories?: number;
}

export interface IRun extends Document {
  user: mongoose.Types.ObjectId;
  route?: mongoose.Types.ObjectId; // Reference to the route being followed
  routeName?: string;
  startTime: Date;
  endTime?: Date;
  status: "active" | "paused" | "completed" | "cancelled";
  gpsPoints: IGPSPoint[];
  statistics: IRunStatistics;
  pausedDuration: number; // total paused time in seconds
  pauseTimestamps: Array<{ pausedAt: Date; resumedAt?: Date }>;
  notes?: string;
  weather?: {
    temperature?: number;
    conditions?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const GPSPointSchema = new Schema({
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  accuracy: {
    type: Number,
  },
});

const RunStatisticsSchema = new Schema({
  totalDistance: {
    type: Number,
    required: true,
    default: 0,
  },
  totalTime: {
    type: Number,
    required: true,
    default: 0,
  },
  averagePace: {
    type: Number,
    default: 0,
  },
  currentPace: {
    type: Number,
  },
  calories: {
    type: Number,
  },
});

const PauseTimestampSchema = new Schema({
  pausedAt: {
    type: Date,
    required: true,
  },
  resumedAt: {
    type: Date,
  },
});

const RunSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    route: {
      type: Schema.Types.ObjectId,
      ref: "Route",
    },
    routeName: {
      type: String,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "paused", "completed", "cancelled"],
      default: "active",
      required: true,
    },
    gpsPoints: {
      type: [GPSPointSchema],
      default: [],
    },
    statistics: {
      type: RunStatisticsSchema,
      required: true,
      default: () => ({}),
    },
    pausedDuration: {
      type: Number,
      default: 0,
    },
    pauseTimestamps: {
      type: [PauseTimestampSchema],
      default: [],
    },
    notes: {
      type: String,
    },
    weather: {
      temperature: Number,
      conditions: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
RunSchema.index({ user: 1, createdAt: -1 });
RunSchema.index({ status: 1 });

export default mongoose.model<IRun>("Run", RunSchema);
