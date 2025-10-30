import mongoose, { Schema, Document } from 'mongoose';

export interface ITrainingLog extends Document {
  agentId: mongoose.Types.ObjectId;
  description: string;
  date: Date;
}

const TrainingLogSchema: Schema = new Schema({
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
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

export default mongoose.model<ITrainingLog>('TrainingLog', TrainingLogSchema);
