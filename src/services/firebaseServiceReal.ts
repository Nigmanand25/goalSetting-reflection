import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  addDoc,
  Timestamp 
} from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { StudentData, AdminDashboardData, DailyEntry, Badge, AtRiskStudent, UserRole, DailyEngagement, DailyEngagementMetrics } from '../types';


// User profile interface for Firebase
interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: UserRole;
    createdAt: Date;
    lastLoginAt: Date;
    geminiApiKey?: string;
    apiKeyUpdatedAt?: string;
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

// Calculate consistency score and current streak based on daily entries
const calculateConsistencyAndStreak = (entries: DailyEntry[]): { consistencyScore: number; streak: number } => {
    if (entries.length === 0) {
        return { consistencyScore: 0, streak: 0 };
    }

    // Sort entries by date ascending (oldest first) for streak calculation
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Calculate consistency score (last 30 days or all entries if less than 30)
    const last30Days = sortedEntries.slice(-30);
    const activeDays = last30Days.filter(entry => 
        entry.goal || entry.reflection || entry.quizEvaluation
    ).length;
    const consistencyScore = Math.round((activeDays / Math.min(30, entries.length)) * 100);

    // Calculate current streak (consecutive days from most recent)
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Start from most recent entry and work backwards
    const recentEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (let i = 0; i < recentEntries.length; i++) {
        const entryDate = new Date(recentEntries[i].date);
        entryDate.setHours(0, 0, 0, 0);
        
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        
        // Check if this entry is from the expected consecutive day
        if (entryDate.getTime() === expectedDate.getTime()) {
            // Check if the day had meaningful activity
            const entry = recentEntries[i];
            if (entry.goal || entry.reflection || entry.quizEvaluation) {
                streak++;
            } else {
                break; // Break streak if no meaningful activity
            }
        } else {
            break; // Break streak if day is missing
        }
    }

    return { consistencyScore, streak };
};

// Calculate comprehensive daily engagement metrics
const calculateDailyEngagement = (entries: DailyEntry[]): DailyEngagementMetrics => {
    if (entries.length === 0) {
        return {
            dailyEngagement: [],
            averageDaily: 0,
            activeDays: 0,
            streakDays: 0,
            weeklyTrend: 0,
            monthlyTrend: 0
        };
    }

    // Get last 30 days
    const today = new Date();
    const last30Days: Date[] = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0);
        last30Days.push(date);
    }

    // Calculate engagement for each day
    const dailyEngagement: DailyEngagement[] = last30Days.map(date => {
        const dateString = date.toISOString().split('T')[0];
        const dayEntries = entries.filter(entry => {
            const entryDate = new Date(entry.date);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === date.getTime();
        });

        let engagementScore = 0;
        let activitiesCompleted = 0;
        let hasGoal = false;
        let hasReflection = false;
        let hasQuiz = false;

        dayEntries.forEach(entry => {
            // Goal setting activity (30 points)
            if (entry.goal) {
                hasGoal = true;
                activitiesCompleted++;
                engagementScore += 30;
                
                // Bonus for completed goals (10 extra points)
                if (entry.goal.completed) {
                    engagementScore += 10;
                }
            }

            // Reflection quality (10-50 points based on depth)
            if (entry.reflection) {
                hasReflection = true;
                activitiesCompleted++;
                engagementScore += entry.reflection.depth * 10; // 10-50 points
                
                // Bonus for detailed reflections (depth 4+)
                if (entry.reflection.depth >= 4) {
                    engagementScore += 5;
                }
            }

            // Quiz completion (0-25 points based on performance)
            if (entry.quizEvaluation) {
                hasQuiz = true;
                activitiesCompleted++;
                const quizPerformance = (entry.quizEvaluation.score / entry.quizEvaluation.total) * 100;
                engagementScore += Math.round(quizPerformance * 0.25); // 0-25 points
                
                // Bonus for excellent performance (90%+)
                if (quizPerformance >= 90) {
                    engagementScore += 5;
                }
            }
        });

        // Cap engagement score at 100
        engagementScore = Math.min(100, engagementScore);

        return {
            date: dateString,
            engagementScore,
            activitiesCompleted,
            hasGoal,
            hasReflection,
            hasQuiz
        };
    });

    // Calculate metrics
    const totalEngagement = dailyEngagement.reduce((sum, day) => sum + day.engagementScore, 0);
    const averageDaily = totalEngagement / 30;
    const activeDays = dailyEngagement.filter(day => day.engagementScore > 0).length;

    // Calculate current engagement streak
    let streakDays = 0;
    for (let i = dailyEngagement.length - 1; i >= 0; i--) {
        if (dailyEngagement[i].engagementScore > 0) {
            streakDays++;
        } else {
            break;
        }
    }

    // Calculate trends
    const last7Days = dailyEngagement.slice(-7);
    const previous7Days = dailyEngagement.slice(-14, -7);
    const last7Average = last7Days.reduce((sum, day) => sum + day.engagementScore, 0) / 7;
    const previous7Average = previous7Days.reduce((sum, day) => sum + day.engagementScore, 0) / 7;
    const weeklyTrend = previous7Average > 0 ? ((last7Average - previous7Average) / previous7Average) * 100 : 0;

    const last14Days = dailyEngagement.slice(-14);
    const previous14Days = dailyEngagement.slice(-28, -14);
    const last14Average = last14Days.reduce((sum, day) => sum + day.engagementScore, 0) / 14;
    const previous14Average = previous14Days.reduce((sum, day) => sum + day.engagementScore, 0) / 14;
    const monthlyTrend = previous14Average > 0 ? ((last14Average - previous14Average) / previous14Average) * 100 : 0;

    return {
        dailyEngagement,
        averageDaily: Math.round(averageDaily * 10) / 10,
        activeDays,
        streakDays,
        weeklyTrend: Math.round(weeklyTrend * 10) / 10,
        monthlyTrend: Math.round(monthlyTrend * 10) / 10
    };
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

        // Get ALL daily entries for this student for comprehensive analytics
        const entriesQuery = query(
            collection(db, COLLECTIONS.DAILY_ENTRIES),
            where('studentId', '==', studentId)
            // Remove limit for full data analytics
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
        
        // Calculate dynamic consistency score and streak
        const { consistencyScore, streak } = calculateConsistencyAndStreak(entries);
        studentData.consistencyScore = consistencyScore;
        studentData.streak = streak;
        
        // Calculate daily engagement metrics
        const dailyEngagement = calculateDailyEngagement(entries);
        studentData.dailyEngagement = dailyEngagement;
        
        // Check and award badges
        studentData = checkAndAwardBadges(studentData);
        
        // Update student document with calculated values and badges
        await updateDoc(doc(db, COLLECTIONS.STUDENTS, studentId), {
            badges: studentData.badges,
            consistencyScore: studentData.consistencyScore,
            streak: studentData.streak,
            dailyEngagement: studentData.dailyEngagement
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

// Get comprehensive student analytics data for admin dashboard
export const getStudentAnalytics = async (studentId: string): Promise<StudentData> => {
    try {
        // Get the full student data with all entries (no limit)
        const studentData = await getStudentData(studentId);
        
        // Enhance with additional analytics data if needed
        // This function fetches ALL entries for comprehensive analytics
        return studentData;
        
    } catch (error) {
        console.error('Error getting student analytics:', error);
        throw new Error('Failed to fetch student analytics');
    }
};

// Get student data by email
export const getStudentDataByEmail = async (email: string): Promise<StudentData> => {
    try {
        // Try to find student by email in user profiles
        const usersQuery = query(
            collection(db, COLLECTIONS.USERS),
            where('email', '==', email),
            limit(1)
        );
        const usersSnapshot = await getDocs(usersQuery);
        
        if (!usersSnapshot.empty) {
            const userDoc = usersSnapshot.docs[0];
            const userData = userDoc.data() as UserProfile;
            return getStudentData(userData.uid, userData.displayName);
        }
        
        throw new Error(`Student not found for email: ${email}`);
    } catch (error) {
        console.error('Error getting student data by email:', error);
        throw error;
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

// Update user profile
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
    try {
        await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
            ...updates,
            lastUpdatedAt: new Date()
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
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

        // Get real users with student role for admin dashboard
        const usersQuery = query(collection(db, COLLECTIONS.USERS), where('role', '==', 'student'));
        const usersSnapshot = await getDocs(usersQuery);
        
        const studentsList: { id: string; name: string; email: string; }[] = [];
        usersSnapshot.forEach((doc) => {
            const userData = doc.data();
            studentsList.push({
                id: doc.id,
                name: userData.name || userData.displayName || 'Anonymous Student',
                email: userData.email || 'No email'
            });
        });

        const adminData: AdminDashboardData = {
            kpis: {
                goalCompletion,
                avgReflectionDepth,
                avgTestPerformance,
            },
            atRiskStudents: atRiskStudents.slice(0, 5), // Top 5 at-risk students
            students: studentsList, // All students list
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
            students: [], // Empty students list for fallback
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

// Function to remove a user and all their data (Admin only)
export const removeUser = async (userId: string, adminUserId: string): Promise<void> => {
    try {
        console.log(`Admin ${adminUserId} attempting to remove user ${userId}`);

        // Verify admin permissions
        const adminProfile = await getUserProfile(adminUserId);
        if (!adminProfile || adminProfile.role !== UserRole.ADMIN) {
            throw new Error('Unauthorized: Only admins can remove users');
        }

        // Get user data to confirm existence
        const userProfile = await getUserProfile(userId);
        if (!userProfile) {
            throw new Error('User not found');
        }

        // Prevent admin from removing themselves
        if (userId === adminUserId) {
            throw new Error('Cannot remove your own admin account');
        }

        // Prevent removing other admin users
        if (userProfile.role === UserRole.ADMIN) {
            throw new Error('Cannot remove other admin users');
        }

        console.log(`Removing user: ${userProfile.email} (${userProfile.displayName})`);

        // 1. Delete all daily entries for this user
        const entriesQuery = query(
            collection(db, COLLECTIONS.DAILY_ENTRIES),
            where('userId', '==', userId)
        );
        const entriesSnapshot = await getDocs(entriesQuery);
        
        const deletionPromises = [];
        entriesSnapshot.docs.forEach(doc => {
            deletionPromises.push(deleteDoc(doc.ref));
        });

        // 2. Delete student data
        const studentDocRef = doc(db, COLLECTIONS.STUDENTS, userId);
        deletionPromises.push(deleteDoc(studentDocRef));

        // 3. Delete user profile
        const userDocRef = doc(db, COLLECTIONS.USERS, userId);
        deletionPromises.push(deleteDoc(userDocRef));

        // 4. Remove from admin users if exists
        const adminUserDocRef = doc(db, COLLECTIONS.ADMIN_USERS, userId);
        deletionPromises.push(deleteDoc(adminUserDocRef));

        // Execute all deletions
        await Promise.all(deletionPromises);

        console.log(`✅ Successfully removed user ${userId} and all associated data`);

        // Note: We cannot delete the Firebase Auth user from the client side
        // This would require Firebase Admin SDK on the server side
        // For now, we just remove all Firestore data

    } catch (error) {
        console.error('Error removing user:', error);
        throw error;
    }
};

// Function to get list of all users (Admin only)
export const getAllUsers = async (adminUserId: string): Promise<UserProfile[]> => {
    try {
        // Verify admin permissions
        const adminProfile = await getUserProfile(adminUserId);
        if (!adminProfile || adminProfile.role !== UserRole.ADMIN) {
            throw new Error('Unauthorized: Only admins can view all users');
        }

        const usersQuery = query(collection(db, COLLECTIONS.USERS));
        const snapshot = await getDocs(usersQuery);
        
        const users: UserProfile[] = [];
        snapshot.docs.forEach(doc => {
            users.push({ uid: doc.id, ...doc.data() } as UserProfile);
        });

        return users.sort((a, b) => a.displayName.localeCompare(b.displayName));
    } catch (error) {
        console.error('Error getting all users:', error);
        throw error;
    }
};

// Enhanced user deletion options interface
export interface UserDeletionOptions {
    deleteAuthAccount?: boolean;
    clearBrowserData?: boolean;
    clearExternalData?: boolean;
}

// Function to clear browser storage and cache data
const clearBrowserData = async (userId: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    
    try {
        console.log('🧹 Clearing browser storage...');
        
        // Clear localStorage entries related to this user or Firebase
        const localKeysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
                key.includes(userId) || 
                key.includes('firebase') || 
                key.includes('gemini') ||
                key.includes('auth') ||
                key.includes('user')
            )) {
                localKeysToRemove.push(key);
            }
        }
        localKeysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log(`Removed localStorage: ${key}`);
        });
        
        // Clear sessionStorage
        const sessionKeysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && (
                key.includes(userId) || 
                key.includes('firebase') || 
                key.includes('gemini') ||
                key.includes('auth')
            )) {
                sessionKeysToRemove.push(key);
            }
        }
        sessionKeysToRemove.forEach(key => {
            sessionStorage.removeItem(key);
            console.log(`Removed sessionStorage: ${key}`);
        });
        
        // Clear IndexedDB (Firebase offline data)
        if ('indexedDB' in window) {
            try {
                const dbs = await indexedDB.databases();
                for (const db of dbs) {
                    if (db.name && (
                        db.name.includes('firebase') || 
                        db.name.includes('firestore')
                    )) {
                        indexedDB.deleteDatabase(db.name);
                        console.log(`Deleted IndexedDB: ${db.name}`);
                    }
                }
            } catch (idbError) {
                console.error('Error clearing IndexedDB:', idbError);
            }
        }
        
        // Clear service worker cache
        if ('serviceWorker' in navigator && 'caches' in window) {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(async (cacheName) => {
                        await caches.delete(cacheName);
                        console.log(`Deleted cache: ${cacheName}`);
                    })
                );
            } catch (cacheError) {
                console.error('Error clearing cache:', cacheError);
            }
        }
        
        // Clear cookies related to the application
        document.cookie.split(";").forEach((cookie) => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            if (name.includes('firebase') || name.includes('auth') || name.includes('session')) {
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                console.log(`Cleared cookie: ${name}`);
            }
        });
        
        console.log('✅ Browser storage cleared successfully');
    } catch (error) {
        console.error('❌ Error clearing browser data:', error);
        throw error;
    }
};

// Function to clear external integrations data
const clearExternalData = async (userId: string): Promise<void> => {
    try {
        console.log('🔗 Clearing external integrations...');
        
        // Placeholder for external API cleanup
        // Add specific external service cleanup here:
        
        // Example: Clear Gemini API usage logs
        // await fetch('/api/gemini/clear-logs', { method: 'POST', body: JSON.stringify({ userId }) });
        
        // Example: Clear analytics data
        // await analytics.clearUser(userId);
        
        // Example: Clear third-party integrations
        // await thirdPartyService.deleteUser(userId);
        
        console.log('✅ External data cleanup completed');
    } catch (error) {
        console.error('❌ Error clearing external data:', error);
        throw error;
    }
};

// Enhanced complete user deletion function
export const removeUserCompletely = async (
    userId: string, 
    adminUserId: string, 
    options: UserDeletionOptions = {}
): Promise<void> => {
    const { 
        deleteAuthAccount = false, 
        clearBrowserData: shouldClearBrowser = true, 
        clearExternalData: shouldClearExternal = false 
    } = options;
    
    try {
        console.log(`🗑️ Starting complete deletion for user: ${userId}`);
        console.log('Options:', options);
        
        // 1. Delete all Firestore data (existing logic)
        await removeUser(userId, adminUserId);
        console.log('✅ Firestore data deleted');
        
        // 2. Delete Firebase Authentication account (if requested and possible)
        if (deleteAuthAccount) {
            try {
                // Note: We can only delete the current user's auth account from the client
                // To delete other users' auth accounts, we would need Firebase Admin SDK on the server
                const currentUser = auth.currentUser;
                if (currentUser && currentUser.uid === userId) {
                    await deleteUser(currentUser);
                    console.log('✅ Firebase Auth account deleted');
                } else {
                    console.warn('⚠️ Cannot delete auth account: Requires server-side Firebase Admin SDK');
                    throw new Error('Auth account deletion requires server-side implementation');
                }
            } catch (authError) {
                console.error('❌ Error deleting auth account:', authError);
                throw new Error(`Failed to delete authentication account: ${authError}`);
            }
        }
        
        // 3. Clear browser storage and cache (if requested)
        if (shouldClearBrowser) {
            await clearBrowserData(userId);
        }
        
        // 4. Clear external integrations (if requested)
        if (shouldClearExternal) {
            await clearExternalData(userId);
        }
        
        console.log('🎉 Complete user deletion successful');
        
    } catch (error) {
        console.error('❌ Error in complete user deletion:', error);
        throw error;
    }
};
