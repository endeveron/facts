import { Schema, model } from 'mongoose';

import { TFact } from '../types/fact';

const factSchema = new Schema<TFact>(
  {
    category: {
      type: String,
      required: [true, 'Please select a category.'],
    },
    title: {
      type: String,
      required: [true, 'Please provide a fact.'],
      minlength: [10, 'Fact title cannot contain less than 10 characters'],
      maxlength: [100, 'Fact title cannot contain more than 100 characters'],
    },
  },
  {
    versionKey: false,
  }
);

const FactModel = model<TFact>('Fact', factSchema);
export default FactModel;
