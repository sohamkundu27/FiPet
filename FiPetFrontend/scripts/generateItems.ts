import { collection, deleteDoc, doc, getDocs, setDoc, getFirestore } from "@firebase/firestore";
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

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

type Item = {
  name: string,
  cost: number,
  imageType: "emoji" | "png",
  image: string,
  requiredLevel: number,
}

const items: Item[] = [
  {
    name: "Hat",
    cost: 100,
    image: "🧢",
    imageType: "emoji",
    requiredLevel: 0,
  }
];

(async () => {
  const itemCollection = collection(db, "items");
  const existingItems = (await getDocs(itemCollection)).size;

  const loopEnd = Math.max(items.length, existingItems);
  let itemsCreated = 0;
  let itemsDeleted = 0;

  console.log("Regenerating Items...");
  for (let i = 0; i < loopEnd; i ++ ) {
    const itemDoc = doc(itemCollection, `item-${i}`)
    if ( i < items.length ) {
      setDoc(itemDoc, {
        ...items[i]
      }).then(() => {
        itemsCreated ++;
      }).catch((err) => {
        console.error(err, `Failed to create item-${i} with name ${items[i].name}`);
      }).finally(() => {
        if (i === loopEnd - 1) {
          console.log(`Created ${itemsCreated} items!`);
          console.log(`Deleted ${itemsDeleted} items!`);
          process.exit(0);
        }
      });
    } else {
      deleteDoc(itemDoc).then(() => {
        itemsDeleted ++;
      }).catch((err) => {
        console.error(err, `Failed to delete item-${i}`);
      }).finally(() => {
        if (i === loopEnd - 1) {
          console.log(`Created ${itemsCreated} items!`);
          console.log(`Deleted ${itemsDeleted} items!`);
          process.exit(0);
        }
      });
    }
  }
})();
