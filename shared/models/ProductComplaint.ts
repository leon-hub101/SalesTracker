import mongoose, { Schema, Document } from 'mongoose';

export interface IProductComplaint extends Document {
  clientId: mongoose.Types.ObjectId;
  product: string;
  comment: string;
  date: Date;
}

const ProductComplaintSchema: Schema = new Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  product: {
    type: String,
    required: true,
  },
  comment: {
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

export default mongoose.model<IProductComplaint>('ProductComplaint', ProductComplaintSchema);
