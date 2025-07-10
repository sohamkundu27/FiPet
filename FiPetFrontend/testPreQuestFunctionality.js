const { initializeApp } = require('@firebase/app');
const { getFirestore, doc, setDoc, getDoc, updateDoc } = require('@firebase/firestore');

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

const TEST_PREQUEST_ID = 'test-prequest-001';

// Test image URLs
const testImageUrls = {
  page1: 'https://picsum.photos/400/400?random=1&t=' + Date.now(),
  page2: 'https://picsum.photos/400/400?random=2&t=' + Date.now(),
  page3: 'https://picsum.photos/400/400?random=3&t=' + Date.now(),
  page4: 'https://picsum.photos/400/400?random=4&t=' + Date.now()
};

async function createTestPreQuest() {
  console.log('🔄 Creating test preQuest document...');
  
  const testPreQuestData = {
    page1: {
      top: "Welcome to the test preQuest!",
      bottom: "This is page 1 of our test preQuest."
    },
    page2: {
      top: "Page 2 content",
      bottom: "This is page 2 of our test preQuest."
    },
    page3: {
      top: "Page 3 content",
      bottom: "This is page 3 of our test preQuest."
    },
    page4: {
      top: "Final page",
      bottom: "This is the final page of our test preQuest."
    }
  };

  try {
    const preQuestRef = doc(db, 'preQuestReadings', TEST_PREQUEST_ID);
    await setDoc(preQuestRef, testPreQuestData);
    console.log('✅ Test preQuest created successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error creating test preQuest:', error.message);
    return false;
  }
}

async function updatePreQuestImages() {
  console.log('🔄 Updating preQuest with image URLs...');
  
  try {
    const preQuestRef = doc(db, 'preQuestReadings', TEST_PREQUEST_ID);
    
    const updateData = {};
    
    // Update each page with image URL if provided
    Object.entries(testImageUrls).forEach(([page, imageUrl]) => {
      if (imageUrl) {
        updateData[`${page}.imageUrl`] = imageUrl;
      }
    });
    
    await updateDoc(preQuestRef, updateData);
    console.log('✅ PreQuest images updated successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error updating preQuest images:', error.message);
    return false;
  }
}

async function fetchPreQuestData() {
  console.log('🔄 Fetching preQuest data...');
  
  try {
    const preQuestRef = doc(db, 'preQuestReadings', TEST_PREQUEST_ID);
    const preQuestDoc = await getDoc(preQuestRef);
    
    if (!preQuestDoc.exists()) {
      console.log('❌ PreQuest document not found');
      return null;
    }
    
    const data = { id: preQuestDoc.id, ...preQuestDoc.data() };
    console.log('✅ PreQuest data fetched successfully!');
    console.log('📄 Document structure:');
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ Error fetching preQuest data:', error.message);
    return null;
  }
}

async function verifyImageUrls(data) {
  console.log('🔍 Verifying image URLs in data...');
  
  let allValid = true;
  
  for (let i = 1; i <= 4; i++) {
    const pageKey = `page${i}`;
    const pageData = data[pageKey];
    
    if (pageData && pageData.imageUrl) {
      console.log(`✅ ${pageKey}: Image URL present - ${pageData.imageUrl}`);
    } else {
      console.log(`⚠️  ${pageKey}: No image URL (will use fallback)`);
      allValid = false;
    }
  }
  
  return allValid;
}

async function runFullTest() {
  console.log('🚀 Starting PreQuest Image Functionality Test\n');
  
  // Step 1: Create test preQuest
  const created = await createTestPreQuest();
  if (!created) {
    console.log('❌ Test failed at creation step');
    return;
  }
  
  // Step 2: Update with images
  const updated = await updatePreQuestImages();
  if (!updated) {
    console.log('❌ Test failed at update step');
    return;
  }
  
  // Step 3: Fetch and verify
  const data = await fetchPreQuestData();
  if (!data) {
    console.log('❌ Test failed at fetch step');
    return;
  }
  
  // Step 4: Verify image URLs
  const verified = await verifyImageUrls(data);
  
  console.log('\n📊 Test Results:');
  console.log('✅ Document Creation: PASSED');
  console.log('✅ Image URL Updates: PASSED');
  console.log('✅ Data Retrieval: PASSED');
  console.log(verified ? '✅ Image URL Verification: PASSED' : '⚠️  Image URL Verification: PARTIAL (some pages may use fallback)');
  
  console.log('\n🎉 PreQuest Image Functionality Test Completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Open your app and navigate to /testPreQuestRunner');
  console.log('2. Run the "Test Image Loading" to see the images in action');
  console.log('3. Test with real preQuest documents by entering their IDs');
}

// Run the test
runFullTest().catch(console.error); 