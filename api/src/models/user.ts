import { Schema, model } from 'mongoose';

import { TUser } from '../types/user';

const userSchema = new Schema<TUser>(
  {
    account: {
      name: {
        type: String,
        required: [true, 'User name is required'],
        minlength: [2, 'User name cannot contain less than 2 characters'],
        maxlength: [20, 'User name cannot contain more than 20 characters'],
      },
      email: {
        type: String,
        required: [true, 'User email is required'],
      },
      password: {
        minlength: [6, 'Password cannot contain less than 6 characters'],
        type: String,
        required: [true, 'Password is required'],
      },
      role: {
        index: {
          type: Number,
          required: [true, 'User role index is required'],
        },
        name: {
          type: String,
          required: [true, 'User role name is required'],
        },
      },
    },
    facts: {
      favorites: [
        {
          type: String,
        },
      ],
      categoryRateMap: {
        type: Map,
        of: Number,
        required: [true, 'Fact category rate map is required'],
      },
      offsetMap: {
        type: Map,
        of: Number,
        required: [true, 'Fact category offset map is required'],
      },
    },
    notificationSubscr: {
      type: {
        token: {
          type: {
            data: String,
            iv: String,
          },
          default: null,
          _id: false,
        },
        isActive: {
          type: Boolean,
          default: false,
        },
        schedule: {
          type: String || null,
          default: null,
        },
      },
      default: null,
      _id: false,
    },
  },
  {
    versionKey: false,
  }
);

const UserModel = model<TUser>('User', userSchema);
export default UserModel;
