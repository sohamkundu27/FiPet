const { initializeApp } = require('@firebase/app');
const { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs } = require('@firebase/firestore');

// Firebase configuration
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
const db = getFirestore(app);

async function listQuestsWithPreQuests() {
  console.log('🔍 Finding quests with preQuests...');
  
  try {
    const questsRef = collection(db, 'quests');
    const snapshot = await getDocs(questsRef);
    
    const questsWithPreQuests = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.preQuest) {
        questsWithPreQuests.push({
          id: doc.id,
          title: data.title || 'Untitled Quest',
          preQuest: data.preQuest
        });
      }
    });
    
    if (questsWithPreQuests.length === 0) {
      console.log('❌ No quests with preQuests found');
      return null;
    }
    
    console.log('✅ Found quests with preQuests:');
    questsWithPreQuests.forEach((quest, index) => {
      console.log(`${index + 1}. Quest: "${quest.title}" (ID: ${quest.id})`);
      console.log(`   PreQuest ID: ${quest.preQuest}`);
    });
    
    return questsWithPreQuests;
  } catch (error) {
    console.error('❌ Error finding quests:', error.message);
    return null;
  }
}

async function updatePreQuestWithImages(preQuestId) {
  console.log(`🔄 Updating preQuest ${preQuestId} with image URLs...`);
  
  const testImageUrls = {
    page1: 'https://picsum.photos/400/400?random=1',
    page2: 'https://picsum.photos/400/400?random=2',
    page3: 'https://picsum.photos/400/400?random=3',
    page4: 'https://picsum.photos/400/400?random=4'
  };
  
  try {
    const preQuestRef = doc(db, 'preQuestReadings', preQuestId);
    
    // First, check if the document exists
    const preQuestDoc = await getDoc(preQuestRef);
    if (!preQuestDoc.exists()) {
      console.log(`❌ PreQuest document ${preQuestId} not found`);
      return false;
    }
    
    const updateData = {};
    
    // Update each page with image URL if provided
    Object.entries(testImageUrls).forEach(([page, imageUrl]) => {
      if (imageUrl) {
        updateData[`${page}.imageUrl`] = imageUrl;
      }
    });
    
    await updateDoc(preQuestRef, updateData);
    console.log(`✅ PreQuest ${preQuestId} updated with images successfully!`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating preQuest ${preQuestId}:`, error.message);
    return false;
  }
}

async function runRealQuestTest() {
  console.log('🚀 Starting Real Quest PreQuest Image Test\n');
  
  // Step 1: Find quests with preQuests
  const quests = await listQuestsWithPreQuests();
  if (!quests) {
    console.log('\n💡 No quests with preQuests found. You can:');
    console.log('1. Create a quest with a preQuest field');
    console.log('2. Use the test screens in the app');
    console.log('3. Use the test preQuest we created earlier (test-prequest-001)');
    return;
  }
  
  // Step 2: Update the first quest's preQuest with images
  const firstQuest = quests[0];
  console.log(`\n🎯 Testing with quest: "${firstQuest.title}"`);
  
  const updated = await updatePreQuestWithImages(firstQuest.preQuest);
  if (!updated) {
    console.log('❌ Failed to update preQuest with images');
    return;
  }
  
  console.log('\n📊 Test Results:');
  console.log('✅ Found quests with preQuests: PASSED');
  console.log('✅ Updated preQuest with images: PASSED');
  
  console.log('\n🎉 Real Quest Test Completed!');
  console.log('\n📝 How to test in the app:');
  console.log(`1. Open your app and go to the quests screen`);
  console.log(`2. Find the quest: "${firstQuest.title}"`);
  console.log(`3. Start the quest (it should show preQuest reading)`);
  console.log(`4. Navigate through the preQuest pages to see the images`);
  console.log(`5. Verify that images load correctly from URLs`);
  
  console.log('\n🔧 Alternative testing:');
  console.log('• Use /testPreQuestRunner in your app');
  console.log('• Use /testPreQuestImageLoading to see images immediately');
  console.log('• Use /testPreQuestImages to update other preQuests');
}

// Run the test
runRealQuestTest().catch(console.error); 