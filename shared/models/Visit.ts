import mongoose, { Schema, Document } from 'mongoose';

export interface IVisit extends Document {
  clientId: mongoose.Types.ObjectId;
  agentId: mongoose.Types.ObjectId;
  checkInTime: Date;
  checkOutTime?: Date;
}

const VisitSchema: Schema = new Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  checkInTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  checkOutTime: {
    type: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IVisit>('Visit', VisitSchema);
