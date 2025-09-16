import { initializeDefaultStudent } from '@/services/firebaseServiceReal';

// Test Firebase connection
export const testFirebaseConnection = async () => {
    try {
        console.log('Testing Firebase connection...');
        await initializeDefaultStudent();
        console.log('✅ Firebase connection successful!');
        return true;
    } catch (error) {
        console.error('❌ Firebase connection failed:', error);
        return false;
    }
};

// Call this in development to test
// Uncomment below line to test Firebase connection
// testFirebaseConnection();
