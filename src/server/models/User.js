import mongoose from 'mongoose';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'El nombre de usuario es obligatorio'],
      unique: true,
      trim: true,
      minlength: [3, 'El usuario debe tener al menos 3 caracteres'],
      maxlength: 30,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

userSchema.methods.setPassword = function (password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  this.passwordHash = `${salt}:${hash}`;
};

userSchema.methods.validarPassword = function (password) {
  const [salt, hash] = this.passwordHash.split(':');
  const hashVerificado = crypto.scryptSync(password, salt, 64).toString('hex');
  return hash === hashVerificado;
};

userSchema.methods.toJSON = function () {
  const objeto = this.toObject();
  delete objeto.passwordHash;
  return objeto;
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
