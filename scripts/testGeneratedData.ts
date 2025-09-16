import { getStudentDataByEmail } from '../services/firebaseService';

// Script to test the generated data
async function testGeneratedData() {
  try {
    console.log('🔍 Fetching test student data for test@gmail.com...\n');
    
    const studentData = await getStudentDataByEmail('test@gmail.com');
    
    console.log('✅ Successfully retrieved test student data:');
    console.log('========================================');
    console.log(`👤 Name: ${studentData.name}`);
    console.log(`🆔 Student ID: ${studentData.studentId}`);
    console.log(`📊 Consistency Score: ${studentData.consistencyScore}%`);
    console.log(`🔥 Current Streak: ${studentData.streak} days`);
    console.log(`🏆 Badges Earned: ${studentData.badges.length}`);
    console.log(`📝 Total Entries: ${studentData.entries.length}`);
    
    console.log('\n📈 Entry Breakdown:');
    console.log(`✅ Completed Goals: ${studentData.entries.filter(e => e.goal.completed).length}`);
    console.log(`❌ Incomplete Goals: ${studentData.entries.filter(e => !e.goal.completed).length}`);
    console.log(`💭 Reflections: ${studentData.entries.filter(e => e.reflection).length}`);
    console.log(`🧠 Quiz Evaluations: ${studentData.entries.filter(e => e.quizEvaluation).length}`);
    
    console.log('\n🏅 Badges:');
    studentData.badges.forEach(badge => {
      console.log(`  ${badge.icon} ${badge.name}: ${badge.description}`);
    });
    
    console.log('\n📊 Recent Activity (Last 5 Days):');
    studentData.entries.slice(-5).forEach((entry, index) => {
      const date = new Date(entry.date).toLocaleDateString();
      const status = entry.goal.completed ? '✅' : '❌';
      const reflection = entry.reflection ? `(Depth: ${entry.reflection.depth})` : '';
      const quiz = entry.quizEvaluation ? `(Quiz: ${entry.quizEvaluation.score}/${entry.quizEvaluation.total})` : '';
      console.log(`  ${date} ${status} ${entry.goal.text.substring(0, 50)}... ${reflection} ${quiz}`);
    });
    
    console.log('\n🎯 SMART Score Analysis:');
    const smartScores = studentData.entries.filter(e => e.goal.smartPercentage);
    if (smartScores.length > 0) {
      const avgSmart = smartScores.reduce((sum, e) => sum + (e.goal.smartPercentage || 0), 0) / smartScores.length;
      console.log(`  Average SMART Score: ${avgSmart.toFixed(1)}%`);
      console.log(`  Goals with SMART Analysis: ${smartScores.length}`);
    }
    
    console.log('\n💭 Reflection Analysis:');
    const reflections = studentData.entries.filter(e => e.reflection);
    if (reflections.length > 0) {
      const avgDepth = reflections.reduce((sum, e) => sum + (e.reflection?.depth || 0), 0) / reflections.length;
      const highConfidence = reflections.filter(e => e.reflection?.confidenceLevel === 'high').length;
      console.log(`  Average Reflection Depth: ${avgDepth.toFixed(1)}/5`);
      console.log(`  High Confidence Reflections: ${highConfidence}/${reflections.length}`);
    }
    
    console.log('\n🧠 Quiz Performance:');
    const quizzes = studentData.entries.filter(e => e.quizEvaluation);
    if (quizzes.length > 0) {
      const avgScore = quizzes.reduce((sum, e) => sum + ((e.quizEvaluation?.score || 0) / (e.quizEvaluation?.total || 1)) * 100, 0) / quizzes.length;
      const totalCorrect = quizzes.reduce((sum, e) => sum + (e.quizEvaluation?.correctAnswers || 0), 0);
      const totalQuestions = quizzes.reduce((sum, e) => sum + (e.quizEvaluation?.total || 0), 0);
      console.log(`  Average Quiz Score: ${avgScore.toFixed(1)}%`);
      console.log(`  Total Correct Answers: ${totalCorrect}/${totalQuestions}`);
    }
    
    console.log('\n🎉 Test data generation completed successfully!');
    console.log('You can now use test@gmail.com to login and see this data in the admin dashboard.');
    
  } catch (error) {
    console.error('❌ Error fetching test data:', error);
  }
}

// Run the test
testGeneratedData();
