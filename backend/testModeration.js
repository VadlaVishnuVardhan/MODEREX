require('dotenv').config();
const { moderateContent } = require('./src/services/moderation.service');

async function testModeration() {
  console.log('Testing moderation with threatening content...\n');

  const testTexts = [
    'This is a normal comment',
    'i will kill him',
    'I hate this so much',
    'You are an idiot'
  ];

  for (const text of testTexts) {
    console.log(`Testing: "${text}"`);
    try {
      const result = await moderateContent(text);
      console.log(`  Flagged: ${result.flagged}`);
      console.log(`  Categories: ${Object.keys(result.categories).filter(cat => result.categories[cat]).join(', ') || 'None'}`);
      console.log(`  Error: ${result.error || 'None'}`);
    } catch (error) {
      console.log(`  Error: ${error.message}`);
    }
    console.log('');
  }
}

testModeration();
