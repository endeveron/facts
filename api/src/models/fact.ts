import { Schema, model } from 'mongoose';

import { TFact } from '../types/fact';

const factSchema = new Schema<TFact>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a fact.'],
      minlength: [10, 'Fact title cannot contain less than 10 characters'],
      maxlength: [100, 'Fact title cannot contain more than 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category.'],
    },
  },
  {
    versionKey: false,
  }
);

const FactModel = model<TFact>('Fact', factSchema);
export default FactModel;
