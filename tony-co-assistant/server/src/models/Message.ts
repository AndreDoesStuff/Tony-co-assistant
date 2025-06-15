import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  conversationId: string;
  metadata?: {
    source?: string;
    confidence?: number;
    context?: any;
  };
}

const MessageSchema: Schema = new Schema({
  content: { type: String, required: true },
  sender: { type: String, enum: ['user', 'ai'], required: true },
  timestamp: { type: Date, default: Date.now },
  conversationId: { type: String, required: true },
  metadata: {
    source: String,
    confidence: Number,
    context: Schema.Types.Mixed,
  },
});

export default mongoose.model<IMessage>('Message', MessageSchema); 