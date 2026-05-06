import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  role: {
    type: String,
    enum: ['reader', 'writer'],
    default: 'reader',
  },
}, { timestamps: true });

if (mongoose.models.User) {
  delete (mongoose.models as any).User;
}

export default mongoose.model('User', UserSchema);
