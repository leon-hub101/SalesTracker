import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  name: string;
  address: string;
  lat: number;
  lng: number;
  region: string;
  hasComplaint: boolean;
  complaintNote?: string;
  requestedVisit: boolean;
}

const ClientSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
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
  region: {
    type: String,
    required: true,
  },
  hasComplaint: {
    type: Boolean,
    default: false,
  },
  complaintNote: {
    type: String,
  },
  requestedVisit: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IClient>('Client', ClientSchema);
