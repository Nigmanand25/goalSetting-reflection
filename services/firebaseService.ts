import { StudentData, AdminDashboardData, ConfidenceLevel, DailyEntry, Badge } from '../types';

// Master list of all available badges
const ALL_BADGES: Badge[] = [
    { id: 'streak-7', name: '7-Day Streak', description: 'Maintained a consistent streak for 7 days in a row!', icon: '🔥' },
    { id: 'consistency-90', name: 'High Achiever', description: 'Achieved a consistency score of 90% or higher.', icon: '🏆' },
    { id: 'deep-thinker', name: 'Deep Thinker', description: 'Consistently provided deep, thoughtful reflections (average depth of 4+).', icon: '🧠' },
    { id: 'quiz-whiz', name: 'Quiz Whiz', description: 'Mastered the daily quizzes with an average score of 90% or higher.', icon: '🎯' },
    { id: 'perfect-week', name: 'Perfect Week', description: 'Completed every goal for a full 7 days.', icon: '⭐' },
];


// This is a mock database. In a real app, this would interact with Firestore.
interface MockDB {
    students: {
        [studentId: string]: StudentData;
    };
    admin: AdminDashboardData;
}

const MOCK_DB: MockDB = {
    students: {
        'S123': {
            studentId: 'S123',
            name: 'Alex Johnson',
            consistencyScore: 95, // High enough for a badge
            streak: 12, // High enough for a badge
            badges: [], // Badges will be awarded dynamically
            entries: [
                {
                    date: '2025-09-15T10:00:00.000Z',
                    goal: { text: 'Complete Chapter 5 of Algebra textbook.', completed: true },
                    reflection: { text: 'The concepts were challenging but I feel I have a good grasp now.', depth: 4, confidenceLevel: ConfidenceLevel.HIGH },
                    quizEvaluation: { score: 5, total: 5, feedback: 'Great job!' }
                },
                {
                    date: '2025-09-14T10:00:00.000Z',
                    goal: { text: 'Practice 5 loop problems in Python.', completed: true },
                    reflection: { text: 'I struggled with nested while loops but improved after re-watching the lecture.', depth: 5, confidenceLevel: ConfidenceLevel.MEDIUM },
                    quizEvaluation: { score: 5, total: 5, feedback: 'Excellent.' }
                },
                {
                    date: '2025-09-13T10:00:00.000Z',
                    goal: { text: 'Read 20 pages of "The Great Gatsby".', completed: true },
                    reflection: { text: 'I struggled with this chapter.', depth: 2, confidenceLevel: ConfidenceLevel.LOW },
                    quizEvaluation: { score: 3, total: 5, feedback: 'Good effort.' }
                },
                {
                    date: '2025-09-12T10:00:00.000Z',
                    goal: { text: 'Outline the history essay on the Cold War.', completed: true },
                    reflection: { text: 'Felt confident about the structure and key points.', depth: 5, confidenceLevel: ConfidenceLevel.HIGH },
                    quizEvaluation: { score: 5, total: 5, feedback: 'Excellent work!' }
                }
            ]
        },
        'S101': {
            studentId: 'S101',
            name: 'Ben Carter',
            consistencyScore: 60,
            streak: 0,
            badges: [],
            entries: [
                { date: '2025-09-15T10:00:00.000Z', goal: { text: 'Review lecture notes.', completed: false } },
                { date: '2025-09-14T10:00:00.000Z', goal: { text: 'Start the new assignment.', completed: false } },
                { date: '2025-09-13T10:00:00.000Z', goal: { text: 'Read Chapter 3.', completed: false } },
            ]
        },
        'S240': {
            studentId: 'S240',
            name: 'Chloe Davis',
            consistencyScore: 75,
            streak: 2,
            badges: [],
            entries: [
                { date: '2025-09-15T10:00:00.000Z', goal: { text: 'Finish coding project.', completed: true }, reflection: { text: 'It was hard.', depth: 1, confidenceLevel: ConfidenceLevel.LOW } },
                { date: '2025-09-14T10:00:00.000Z', goal: { text: 'Debug the main function.', completed: true }, reflection: { text: 'Got it done.', depth: 2, confidenceLevel: ConfidenceLevel.MEDIUM } },
            ]
        },
        'S315': {
            studentId: 'S315',
            name: 'David Evans',
            consistencyScore: 88,
            streak: 5,
            badges: [],
            entries: [
                { date: '2025-09-15T10:00:00.000Z', goal: { text: 'Practice calculus problems.', completed: true }, reflection: { text: 'Felt good about this.', depth: 4, confidenceLevel: ConfidenceLevel.HIGH }, quizEvaluation: { score: 1, total: 5, feedback: 'Needs review.'} },
                { date: '2025-09-14T10:00:00.000Z', goal: { text: 'Study for the upcoming test.', completed: true }, reflection: { text: 'Covered all topics.', depth: 4, confidenceLevel: ConfidenceLevel.HIGH }, quizEvaluation: { score: 2, total: 5, feedback: 'Needs review.'} },
            ]
        }
    },
    admin: {
        kpis: {
            goalCompletion: 78,
            avgReflectionDepth: 3.8,
            avgTestPerformance: 82,
        },
        atRiskStudents: [
            { id: 'S101', name: 'Ben Carter', reason: 'Missed 3 goals in a row', missedGoals: 3, avgReflectionDepth: 2.5, avgTestScore: 60 },
            { id: 'S240', name: 'Chloe Davis', reason: 'Low reflection depth', missedGoals: 1, avgReflectionDepth: 1.8, avgTestScore: 75 },
            { id: 'S315', name: 'David Evans', reason: 'Consistently low test scores', missedGoals: 0, avgReflectionDepth: 4.0, avgTestScore: 35 },
        ],
        engagementData: [
            { name: 'Week 1', goals: 90, reflections: 85, confidence: 75 },
            { name: 'Week 2', goals: 85, reflections: 80, confidence: 70 },
            { name: 'Week 3', goals: 92, reflections: 88, confidence: 80 },
            { name: 'Week 4', goals: 78, reflections: 75, confidence: 65 },
        ]
    }
};

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Simulates a backend process that awards badges based on student data
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
    if (quizzes.length > 2) {
        const avgScore = (quizzes.reduce((sum, q) => sum + (q!.score / q!.total), 0) / quizzes.length) * 100;
        if (avgScore >= 90 && !earnedBadges.has('quiz-whiz')) {
            earnedBadges.set('quiz-whiz', ALL_BADGES.find(b => b.id === 'quiz-whiz')!);
        }
    }
    
    student.badges = Array.from(earnedBadges.values());
    return student;
}


export const getStudentData = async (studentId: string): Promise<StudentData> => {
    await simulateDelay(500);
    let student = MOCK_DB.students[studentId as keyof typeof MOCK_DB.students];
    if (!student) {
        throw new Error("Student not found");
    }
    // Return a deep copy to prevent mutation of the mock DB
    let studentCopy = JSON.parse(JSON.stringify(student));

    // Simulate backend badge check
    studentCopy = checkAndAwardBadges(studentCopy);
    MOCK_DB.students[studentId] = JSON.parse(JSON.stringify(studentCopy)); // Persist awarded badges in mock DB

    return studentCopy;
};

export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
    await simulateDelay(500);
    // Return a deep copy
    return JSON.parse(JSON.stringify(MOCK_DB.admin));
};


export const addOrUpdateDailyEntry = async (studentId: string, entry: DailyEntry): Promise<StudentData> => {
    await simulateDelay(300);
    const student = MOCK_DB.students[studentId as keyof typeof MOCK_DB.students];
    if (!student) {
        throw new Error("Student not found");
    }

    const entryDate = new Date(entry.date).toISOString().split('T')[0];
    const existingEntryIndex = student.entries.findIndex(e => new Date(e.date).toISOString().split('T')[0] === entryDate);

    if (existingEntryIndex > -1) {
        // Merge new data into existing entry
        student.entries[existingEntryIndex] = { ...student.entries[existingEntryIndex], ...entry };
    } else {
        // Add new entry, ensuring it's at the beginning of the array
        student.entries.unshift(entry);
    }
    
    // Sort entries by date descending to be sure
    student.entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return JSON.parse(JSON.stringify(student));
};