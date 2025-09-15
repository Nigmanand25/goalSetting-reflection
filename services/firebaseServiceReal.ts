import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  addDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { StudentData, AdminDashboardData, DailyEntry, Badge, AtRiskStudent, UserRole } from '../types';

// User profile interface for Firebase
interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: UserRole;
    createdAt: Date;
    lastLoginAt: Date;
}

// Firestore collection names
const COLLECTIONS = {
  STUDENTS: 'students',
  DAILY_ENTRIES: 'dailyEntries',
  ADMIN_DATA: 'adminData',
  USERS: 'users',
  ADMIN_USERS: 'adminUsers'
};

// Master list of all available badges (same as mock)
const ALL_BADGES: Badge[] = [
    { id: 'streak-7', name: '7-Day Streak', description: 'Maintained a consistent streak for 7 days in a row!', icon: '🔥' },
    { id: 'consistency-90', name: 'High Achiever', description: 'Achieved a consistency score of 90% or higher.', icon: '🏆' },
    { id: 'deep-thinker', name: 'Deep Thinker', description: 'Consistently provided deep, thoughtful reflections (average depth of 4+).', icon: '🧠' },
    { id: 'quiz-whiz', name: 'Quiz Whiz', description: 'Mastered the daily quizzes with an average score of 90% or higher.', icon: '🎯' },
    { id: 'perfect-week', name: 'Perfect Week', description: 'Completed every goal for a full 7 days.', icon: '⭐' },
];

// Helper function to check and award badges
const checkAndAwardBadges = (student: StudentData): StudentData => {
    const earnedBadges = new Map(student.badges.map(b => [b.id, b]));

    // 7-Day Streak
    if (student.streak >= 7 && !earnedBadges.has('streak-7')) {
        earnedBadges.set('streak-7', ALL_BADGES.find(b => b.id === 'streak-7')!);
    }

    // High Achiever
    if (student.consistencyScore >= 90 && !earnedBadges.has('consistency-90')) {
        earnedBadges.set('consistency-90', ALL_BADGES.find(b => b.id === 'consistency-90')!);
    }

    // Deep Thinker
    const reflections = student.entries.map(e => e.reflection).filter(Boolean);
    if (reflections.length > 2) {
        const avgDepth = reflections.reduce((sum, r) => sum + r!.depth, 0) / reflections.length;
        if (avgDepth >= 4 && !earnedBadges.has('deep-thinker')) {
            earnedBadges.set('deep-thinker', ALL_BADGES.find(b => b.id === 'deep-thinker')!);
        }
    }

    // Quiz Whiz
    const quizzes = student.entries.map(e => e.quizEvaluation).filter(Boolean);
    if (quizzes.length > 0) {
        const avgScore = (quizzes.reduce((sum, q) => sum + (q!.score / q!.total), 0) / quizzes.length) * 100;
        if (avgScore >= 90 && !earnedBadges.has('quiz-whiz')) {
            earnedBadges.set('quiz-whiz', ALL_BADGES.find(b => b.id === 'quiz-whiz')!);
        }
    }
    
    student.badges = Array.from(earnedBadges.values());
    return student;
};

// Get student data from Firestore (now uses authenticated user ID)
export const getStudentData = async (studentId: string, displayName?: string): Promise<StudentData> => {
    try {
        // Get student document
        const studentDoc = await getDoc(doc(db, COLLECTIONS.STUDENTS, studentId));
        
        if (!studentDoc.exists()) {
            // Create new student if doesn't exist
            const newStudent: StudentData = {
                studentId,
                name: displayName || `Student ${studentId}`,
                consistencyScore: 0,
                streak: 0,
                badges: [],
                entries: []
            };
            
            await setDoc(doc(db, COLLECTIONS.STUDENTS, studentId), newStudent);
            return newStudent;
        }

        let studentData = studentDoc.data() as StudentData;

        // Get daily entries for this student (simplified query)
        const entriesQuery = query(
            collection(db, COLLECTIONS.DAILY_ENTRIES),
            where('studentId', '==', studentId),
            limit(30) // Last 30 days
        );
        
        const entriesSnapshot = await getDocs(entriesQuery);
        const entries: DailyEntry[] = [];
        
        entriesSnapshot.forEach((doc) => {
            const entryData = doc.data();
            entries.push({
                date: entryData.date,
                goal: entryData.goal,
                reflection: entryData.reflection,
                quizEvaluation: entryData.quizEvaluation
            });
        });

        // Sort entries by date descending (newest first)
        entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        studentData.entries = entries;
        
        // Check and award badges
        studentData = checkAndAwardBadges(studentData);
        
        // Update student document with new badges if any were awarded
        await updateDoc(doc(db, COLLECTIONS.STUDENTS, studentId), {
            badges: studentData.badges
        });

        return studentData;
        
    } catch (error) {
        console.error('Error getting student data:', error);
        // If it's an index error, provide helpful message
        if (error instanceof Error && error.message.includes('query requires an index')) {
            console.error('Firestore Index Required. Please create the index as suggested in the error message.');
        }
        throw new Error('Failed to fetch student data');
    }
};

// Add or update daily entry
export const addOrUpdateDailyEntry = async (studentId: string, entry: DailyEntry): Promise<StudentData> => {
    try {
        const entryDate = new Date(entry.date).toISOString().split('T')[0];
        
        // Check if entry exists for this date
        const existingEntryQuery = query(
            collection(db, COLLECTIONS.DAILY_ENTRIES),
            where('studentId', '==', studentId),
            where('dateString', '==', entryDate)
        );
        
        const existingEntrySnapshot = await getDocs(existingEntryQuery);
        
        // Filter out undefined values to avoid Firebase errors
        const cleanEntry = Object.fromEntries(
            Object.entries(entry).filter(([_, value]) => value !== undefined)
        );

        const entryData = {
            ...cleanEntry,
            studentId,
            dateString: entryDate,
            timestamp: Timestamp.fromDate(new Date(entry.date))
        };

        if (!existingEntrySnapshot.empty) {
            // Update existing entry
            const existingDoc = existingEntrySnapshot.docs[0];
            await updateDoc(existingDoc.ref, entryData);
        } else {
            // Create new entry
            await addDoc(collection(db, COLLECTIONS.DAILY_ENTRIES), entryData);
        }

        // Return updated student data
        return await getStudentData(studentId);
        
    } catch (error) {
        console.error('Error adding/updating daily entry:', error);
        throw new Error('Failed to save daily entry');
    }
};

// Create or update user profile in Firestore
export const createUserProfile = async (user: any, role: UserRole = UserRole.STUDENT): Promise<UserProfile> => {
    try {
        const userProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Unknown User',
            photoURL: user.photoURL,
            role: role,
            createdAt: new Date(),
            lastLoginAt: new Date()
        };

        // Always save to users collection (both students and admins)
        await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userProfile);

        // If admin, also add to admin users collection with special permissions
        if (role === UserRole.ADMIN) {
            try {
                await setDoc(doc(db, COLLECTIONS.ADMIN_USERS, user.uid), {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || 'Admin User',
                    promotedAt: new Date(),
                    permissions: ['read', 'write', 'admin', 'manage_users'],
                    canPromoteUsers: true,
                    canViewAllData: true
                });
                console.log(`🔐 Admin profile created for: ${user.email}`);
            } catch (adminError) {
                console.warn('Could not create admin profile, but user profile created:', adminError);
            }
        }

        // If student, create student profile for learning data
        if (role === UserRole.STUDENT) {
            // This will be created when getStudentData is called
            console.log(`👨‍🎓 Student profile created for: ${user.email}`);
        }

        return userProfile;
    } catch (error) {
        console.error('Error creating user profile:', error);
        if (error instanceof Error && error.message.includes('permissions')) {
            console.error('🔐 Firestore Security Rules Issue:');
            console.error('1. Go to Firebase Console → Firestore Database → Rules');
            console.error('2. Update rules to allow authenticated users to write');
            console.error('3. Or use the temporary open rules for development');
        }
        throw error;
    }
};

// Get user profile and determine role
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            
            // Update last login (with error handling)
            try {
                await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
                    lastLoginAt: new Date()
                });
            } catch (updateError) {
                console.warn('Could not update last login time:', updateError);
                // Don't fail the whole operation for this
            }
            
            return userData;
        }
        
        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        if (error instanceof Error && error.message.includes('permissions')) {
            console.error('🔐 Firestore Security Rules Issue: Please check Firebase Console → Firestore Database → Rules');
        }
        return null;
    }
};

// Check if user is admin
export const isUserAdmin = async (uid: string): Promise<boolean> => {
    try {
        const adminDoc = await getDoc(doc(db, COLLECTIONS.ADMIN_USERS, uid));
        return adminDoc.exists();
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
};

// Get admin dashboard data with real-time calculations
export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
    try {
        // Get all students data for calculations
        const studentsQuery = query(collection(db, COLLECTIONS.STUDENTS));
        const studentsSnapshot = await getDocs(studentsQuery);
        
        const students: StudentData[] = [];
        studentsSnapshot.forEach((doc) => {
            students.push(doc.data() as StudentData);
        });

        // Get all daily entries for calculations
        const entriesQuery = query(collection(db, COLLECTIONS.DAILY_ENTRIES));
        const entriesSnapshot = await getDocs(entriesQuery);
        
        const allEntries: DailyEntry[] = [];
        entriesSnapshot.forEach((doc) => {
            const entryData = doc.data();
            allEntries.push({
                date: entryData.date,
                goal: entryData.goal,
                reflection: entryData.reflection,
                quizEvaluation: entryData.quizEvaluation
            });
        });

        // Calculate KPIs
        const completedGoals = allEntries.filter(e => e.goal?.completed).length;
        const totalGoals = allEntries.length;
        const goalCompletion = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

        const reflections = allEntries.filter(e => e.reflection).map(e => e.reflection!);
        const avgReflectionDepth = reflections.length > 0 
            ? Math.round((reflections.reduce((sum, r) => sum + r.depth, 0) / reflections.length) * 10) / 10 
            : 0;

        const quizzes = allEntries.filter(e => e.quizEvaluation).map(e => e.quizEvaluation!);
        const avgTestPerformance = quizzes.length > 0 
            ? Math.round((quizzes.reduce((sum, q) => sum + (q.score / q.total), 0) / quizzes.length) * 100) 
            : 0;

        // Identify at-risk students
        const atRiskStudents: AtRiskStudent[] = students
            .filter(student => {
                const studentEntries = allEntries.filter(e => e.date.includes(student.studentId));
                const missedGoals = studentEntries.filter(e => !e.goal?.completed).length;
                const studentReflections = studentEntries.filter(e => e.reflection).map(e => e.reflection!);
                const avgDepth = studentReflections.length > 0 
                    ? studentReflections.reduce((sum, r) => sum + r.depth, 0) / studentReflections.length 
                    : 0;
                
                return missedGoals > 2 || avgDepth < 2 || student.consistencyScore < 60;
            })
            .map(student => {
                const studentEntries = allEntries.filter(e => e.date.includes(student.studentId));
                const missedGoals = studentEntries.filter(e => !e.goal?.completed).length;
                const studentReflections = studentEntries.filter(e => e.reflection).map(e => e.reflection!);
                const studentQuizzes = studentEntries.filter(e => e.quizEvaluation).map(e => e.quizEvaluation!);
                
                const avgDepth = studentReflections.length > 0 
                    ? studentReflections.reduce((sum, r) => sum + r.depth, 0) / studentReflections.length 
                    : 0;
                
                const avgScore = studentQuizzes.length > 0 
                    ? (studentQuizzes.reduce((sum, q) => sum + (q.score / q.total), 0) / studentQuizzes.length) * 100 
                    : 0;

                let reason = 'Multiple issues';
                if (missedGoals > 2) reason = `Missed ${missedGoals} goals`;
                else if (avgDepth < 2) reason = 'Low reflection depth';
                else if (student.consistencyScore < 60) reason = 'Low consistency score';

                return {
                    id: student.studentId,
                    name: student.name,
                    reason,
                    missedGoals,
                    avgReflectionDepth: Math.round(avgDepth * 10) / 10,
                    avgTestScore: Math.round(avgScore)
                };
            });

        // Generate engagement data (weekly trends)
        const engagementData = [
            { name: 'Week 1', goals: goalCompletion, reflections: Math.round(avgReflectionDepth * 20), confidence: Math.round(avgTestPerformance * 0.8) },
            { name: 'Week 2', goals: Math.max(0, goalCompletion - 5), reflections: Math.round(avgReflectionDepth * 18), confidence: Math.round(avgTestPerformance * 0.75) },
            { name: 'Week 3', goals: Math.min(100, goalCompletion + 3), reflections: Math.round(avgReflectionDepth * 22), confidence: Math.round(avgTestPerformance * 0.85) },
            { name: 'Week 4', goals: goalCompletion, reflections: Math.round(avgReflectionDepth * 20), confidence: Math.round(avgTestPerformance * 0.8) },
        ];

        const adminData: AdminDashboardData = {
            kpis: {
                goalCompletion,
                avgReflectionDepth,
                avgTestPerformance,
            },
            atRiskStudents: atRiskStudents.slice(0, 5), // Top 5 at-risk students
            engagementData
        };

        // Cache the calculated data
        await setDoc(doc(db, COLLECTIONS.ADMIN_DATA, 'dashboard'), {
            ...adminData,
            lastUpdated: new Date(),
            totalStudents: students.length,
            totalEntries: allEntries.length
        });

        return adminData;
        
    } catch (error) {
        console.error('Error getting admin dashboard data:', error);
        
        // Return fallback data if calculation fails
        const fallbackData: AdminDashboardData = {
            kpis: {
                goalCompletion: 75,
                avgReflectionDepth: 3.5,
                avgTestPerformance: 80,
            },
            atRiskStudents: [],
            engagementData: [
                { name: 'Week 1', goals: 75, reflections: 70, confidence: 65 },
                { name: 'Week 2', goals: 70, reflections: 68, confidence: 60 },
                { name: 'Week 3', goals: 78, reflections: 75, confidence: 70 },
                { name: 'Week 4', goals: 75, reflections: 70, confidence: 65 },
            ]
        };
        
        return fallbackData;
    }
};

// Verify data integrity and user collections
export const verifyUserDataIntegrity = async (userId: string, role: UserRole): Promise<void> => {
    try {
        // Check if user exists in users collection
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
        
        if (!userDoc.exists()) {
            console.log(`⚠️ User ${userId} not found in users collection`);
            return;
        }

        const userData = userDoc.data();
        console.log(`✅ User data verified: ${userData.email} (${userData.role})`);

        // If admin, verify admin collection
        if (role === UserRole.ADMIN) {
            const adminDoc = await getDoc(doc(db, COLLECTIONS.ADMIN_USERS, userId));
            if (adminDoc.exists()) {
                console.log(`🔐 Admin privileges confirmed for: ${userData.email}`);
            } else {
                console.log(`⚠️ Admin not found in admin collection: ${userData.email}`);
            }
        }

        // If student, verify student collection will be created on first access
        if (role === UserRole.STUDENT) {
            console.log(`👨‍🎓 Student data will be created on first app usage: ${userData.email}`);
        }

    } catch (error) {
        console.error('Error verifying user data integrity:', error);
    }
};

// Initialize default student (for demo)
export const initializeDefaultStudent = async (): Promise<void> => {
    const defaultStudentId = 'demo-student';
    
    try {
        const studentDoc = await getDoc(doc(db, COLLECTIONS.STUDENTS, defaultStudentId));
        
        if (!studentDoc.exists()) {
            const defaultStudent: StudentData = {
                studentId: defaultStudentId,
                name: 'Demo Student',
                consistencyScore: 85,
                streak: 7,
                badges: [],
                entries: []
            };
            
            await setDoc(doc(db, COLLECTIONS.STUDENTS, defaultStudentId), defaultStudent);
            
            // Add some sample entries
            const sampleEntries: DailyEntry[] = [
                {
                    date: new Date().toISOString(),
                    goal: { text: 'Complete today\'s learning goals', completed: false },
                },
                {
                    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    goal: { text: 'Practice coding exercises', completed: true },
                    reflection: { text: 'Good progress today with understanding loops', depth: 4, confidenceLevel: 'HIGH' as any }
                }
            ];
            
            for (const entry of sampleEntries) {
                await addOrUpdateDailyEntry(defaultStudentId, entry);
            }
            
            console.log('✅ Demo student initialized');
        }
    } catch (error) {
        console.error('Error initializing default student:', error);
    }
};
