import mongoose, { Schema, Document } from 'mongoose';

export interface IDepot extends Document {
  name: string;
  lat: number;
  lng: number;
  inspection: {
    done: boolean;
    hsFile: boolean;
    housekeeping: number;
    hazLicense: boolean;
    stockCounted: boolean;
    notes?: string;
  };
}

const DepotSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  inspection: {
    done: {
      type: Boolean,
      default: false,
    },
    hsFile: {
      type: Boolean,
      default: false,
    },
    housekeeping: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    hazLicense: {
      type: Boolean,
      default: false,
    },
    stockCounted: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
    },
  },
}, {
  timestamps: true,
});

export default mongoose.model<IDepot>('Depot', DepotSchema);
