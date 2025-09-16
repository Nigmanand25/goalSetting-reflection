import { db } from './firebase-node';
import { collection, getDocs } from 'firebase/firestore';

async function checkFirebaseData() {
  console.log('🔍 Checking Firebase data...');
  
  try {
    // Check students collection
    const studentsQuery = collection(db, 'students');
    const studentsSnapshot = await getDocs(studentsQuery);
    console.log(`📚 Students collection: ${studentsSnapshot.size} documents`);
    
    // Check daily entries collection
    const entriesQuery = collection(db, 'daily_entries');
    const entriesSnapshot = await getDocs(entriesQuery);
    console.log(`📝 Daily entries collection: ${entriesSnapshot.size} documents`);
    
    // Check user profiles collection
    const profilesQuery = collection(db, 'user_profiles');
    const profilesSnapshot = await getDocs(profilesQuery);
    console.log(`👤 User profiles collection: ${profilesSnapshot.size} documents`);
    
    if (studentsSnapshot.size === 0 && entriesSnapshot.size === 0) {
      console.log('⚠️  No data found in Firebase. You need to generate test data.');
      console.log('💡 Run: npm run generate-test-data');
    } else {
      console.log('✅ Firebase contains data. The admin dashboard should work.');
    }
    
  } catch (error) {
    console.error('❌ Error checking Firebase:', error);
  }
  
  process.exit(0);
}

checkFirebaseData();
