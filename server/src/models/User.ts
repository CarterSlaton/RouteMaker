import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  preferredUnit: 'km' | 'mi'; // User's preferred distance unit
  // Map Preferences
  mapStyle: 'streets-v12' | 'satellite-streets-v12' | 'outdoors-v12' | 'dark-v11';
  defaultZoom: number;
  autoSaveRoutes: boolean;
  // Display Preferences
  compactView: boolean;
  showRoutePreview: boolean;
  reduceAnimations: boolean;
  fontSize: 'small' | 'medium' | 'large';
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  preferredUnit: {
    type: String,
    enum: ['km', 'mi'],
    default: 'km' // Default to kilometers
  },
  // Map Preferences
  mapStyle: {
    type: String,
    enum: ['streets-v12', 'satellite-streets-v12', 'outdoors-v12', 'dark-v11'],
    default: 'streets-v12'
  },
  defaultZoom: {
    type: Number,
    default: 12,
    min: 1,
    max: 20
  },
  autoSaveRoutes: {
    type: Boolean,
    default: true
  },
  // Display Preferences
  compactView: {
    type: Boolean,
    default: false
  },
  showRoutePreview: {
    type: Boolean,
    default: true
  },
  reduceAnimations: {
    type: Boolean,
    default: false
  },
  fontSize: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    const password = this.get('password') as string;
    this.set('password', await bcrypt.hash(password, salt));
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
