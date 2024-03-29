import * as T from '../types';

/**
 * validate
 *
 * takes an array of arrays of validations and
 * throws if an error occurs
 */
const validate = (validations: T.Validation[]): void => {
  // @ts-ignore
  if (process.env.NODE_ENV !== 'production') {
    for (const validation of validations) {
      const condition = validation[0];
      const errorMessage = validation[1];
      if (condition) {
        throw new Error(errorMessage);
      }
    }
  }
};

export default validate;
