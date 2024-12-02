import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  pseudo: string;
  email: string;
  password: string;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  pseudo: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
