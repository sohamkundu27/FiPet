import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp } from '@firebase/app';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDh1F64AeCS_xzkgATynBu4K4xOEIi1mns",
  authDomain: "fipet-521d1.firebaseapp.com",
  projectId: "fipet-521d1",
  storageBucket: "fipet-521d1.firebasestorage.app",
  messagingSenderId: "365751870741",
  appId: "1:365751870741:web:a0afa3d48256677627751c",
  measurementId: "G-S8BFBHYL8B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Callable functions
const sendPasswordResetCodeFunction = httpsCallable(functions, 'sendPasswordResetCode');
const verifyPasswordResetCodeFunction = httpsCallable(functions, 'verifyPasswordResetCode');
const updatePasswordAfterResetFunction = httpsCallable(functions, 'updatePasswordAfterReset');

export const passwordResetService = {
  // Send verification code to email
  async sendVerificationCode(email: string) {
    try {
      const result = await sendPasswordResetCodeFunction({ email });
      return result.data;
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      throw new Error(error.message || 'Failed to send verification code');
    }
  },

  // Verify the code entered by user
  async verifyCode(email: string, code: string) {
    try {
      const result = await verifyPasswordResetCodeFunction({ email, code });
      return result.data;
    } catch (error: any) {
      console.error('Error verifying code:', error);
      throw new Error(error.message || 'Failed to verify code');
    }
  },

  // Update password after verification
  async updatePassword(email: string, code: string, newPassword: string) {
    try {
      const result = await updatePasswordAfterResetFunction({ email, code, newPassword });
      return result.data;
    } catch (error: any) {
      console.error('Error updating password:', error);
      throw new Error(error.message || 'Failed to update password');
    }
  }
}; 