import mongoose, { Schema, Document } from 'mongoose';

export interface IMissedOrder extends Document {
  clientId: mongoose.Types.ObjectId;
  product: string;
  reason: string;
  date: Date;
}

const MissedOrderSchema: Schema = new Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  product: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IMissedOrder>('MissedOrder', MissedOrderSchema);
