import { Schema, model, Document } from 'mongoose';

interface DataInterface extends Document {
  chat_id: number;
  text: string;
  reply_to_message_id: number;
  data: Date;
  wasSended: boolean;
}

const DataSchema = new Schema(
  {
    chat_id: Number,
    text: String,
    reply_to_message_id: Number,
    wasSended: Boolean,
    data: Date,
  },
  {
    timestamps: false,
  },
);

export default model<DataInterface>('Data', DataSchema);
