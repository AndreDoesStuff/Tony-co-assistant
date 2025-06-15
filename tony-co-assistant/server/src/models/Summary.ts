import mongoose, { Schema, Document } from 'mongoose';

export interface ISummary extends Document {
  title: string;
  type: 'ux-repository' | 'school-bench';
  rawContent: string;
  summaryContent: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    source?: string;
    confidence?: number;
    context?: any;
  };
}

const SummarySchema: Schema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['ux-repository', 'school-bench'], required: true },
  rawContent: { type: String, required: true },
  summaryContent: { type: String, required: true },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  metadata: {
    source: String,
    confidence: Number,
    context: Schema.Types.Mixed,
  },
});

// Update the updatedAt timestamp before saving
SummarySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ISummary>('Summary', SummarySchema); 