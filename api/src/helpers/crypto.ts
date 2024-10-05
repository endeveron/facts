import crypto from 'crypto';
import { TEncryptedData } from '../types/user';

const algorithm = 'aes-256-cbc';
const key = process.env.NOTIFICATIONS_KEY;
if (!key) throw new Error('Invalid notifications key');

/**
 * Encrypts the given text using AES-256-CBC encryption algorithm.
 * @param plaintext - the text to be encrypted.
 * @returns an object containing the IV (Initialization Vector) and the encrypted data.
 */
export const encryptText = (plaintext: string): TEncryptedData => {
  // generate a random initial vector (IV) of 16 bytes length
  const iv = crypto.randomBytes(16);

  // create a cipher object using AES-256-CBC algorithm, key, and generated IV
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);

  // encrypt the plaintext
  let encrypted = cipher.update(plaintext);

  // finalize the encryption process
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return {
    iv: iv.toString('hex'),
    data: encrypted.toString('hex'),
  };
};

/**
 * Decrypts the given encrypted data using AES-256-CBC encryption algorithm.
 * @param encryptedData - object containing IV (Initialization Vector) and encrypted data.
 * @returns decrypted text as a string.
 */
export const decryptText = (encryptedData: TEncryptedData): string => {
  const { iv, data } = encryptedData;
  // convert provided data from hexadecimal string to Buffer
  const ivBuffer = Buffer.from(iv, 'hex');
  const encryptedText = Buffer.from(data, 'hex');

  // create a decipher object
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(key),
    ivBuffer
  );

  // update the decipher object with encrypted text
  let decrypted = decipher.update(encryptedText);
  // concatenate the partial decryption result with the final decryption
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};
