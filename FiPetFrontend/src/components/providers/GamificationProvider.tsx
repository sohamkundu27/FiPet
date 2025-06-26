
import { db } from "@/src/config/firebase";
import { getLevelXPRequirement, getStreakXPRequirement } from "@/src/functions/getXPRequirement";
import { useAuth } from "@/src/hooks/useRequiresAuth";
import { dayAbbreviations, StreakDay, StreakProgress, UserProgress } from "@/src/types/UserProgress";
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, Timestamp, where, getDocs, updateDoc } from "@firebase/firestore";
import { createContext, useEffect, useState } from "react";

type GamificationContextType = {
  userProgress: UserProgress,
  streakProgress: StreakProgress,
};

export const GamificationContext = createContext<GamificationContextType>(null!);
export const STREAK_DISPLAY_LEN = 7;
const MILLIS_IN_DAY = 1000 * 60 * 60 * 24;


function constrain( num: number, min: number, max: number ) {
  return Math.min(Math.max(num, min), max);
}

/**
 * Modifies the date passed in to be the timestamp at the start of the day.
 */
function startOfDay ( date: Date ): Date {
  let sod = new Date(date);
  sod.setHours(0);
  sod.setMinutes(0);
  sod.setSeconds(0);
  sod.setMilliseconds(0);
  return sod;
}

export const GamificationProvider = ({ children }: { children: any }) => {

  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 0,
    currentXP: 0,
    earnedXP: 0,
    requiredLevelXP: 0,
    levelProgress: 0,
    streakProgress: 0,
    requiredStreakXP: 0,
    coins: 0,
  });
  const [streakProgress, setStreak] = useState<StreakProgress>({
    currentStreak: 0,
    days: []
  });
  const {user} = useAuth();

  function loadStreakInfo() {

    const streakCollection = collection( db, 'users', user.uid, 'streakData' );
    const today = startOfDay( new Date() );

    const displayStartDate = new Date(today.valueOf() - ((STREAK_DISPLAY_LEN-1) * MILLIS_IN_DAY));
    const displayStartTimestamp = new Timestamp(displayStartDate.getSeconds(), displayStartDate.getMilliseconds());
    const streakQuery = query(
      streakCollection,
      where("endTime", ">=", displayStartTimestamp),
      orderBy("endTime", "asc")
    );

    getDocs(streakQuery).then(async (snapshot) => {

      let i = 0;
      let currentDate = new Date(displayStartDate);
      let days: StreakDay[] = [];

      while( currentDate.valueOf() < today.valueOf() ) {

        const currentDay = currentDate.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

        if ( i >= snapshot.docs.length ) {
          days.push({
            dayAbbreviation: dayAbbreviations[currentDay],
            achieved: false
          });
          currentDate = new Date( currentDate.valueOf() + MILLIS_IN_DAY );
          continue;
        }

        const streakStartTimestamp = snapshot.docs[i].get("startTime", {serverTimestamps: 'estimate'}) as Timestamp;
        const streakStartDate = startOfDay(streakStartTimestamp.toDate());
        const streakDuration = snapshot.docs[i].get("duration") as number;

        if ( currentDate.valueOf() <  streakStartDate.valueOf() ) {
          days.push({
            dayAbbreviation: dayAbbreviations[currentDay],
            achieved: false
          });
          currentDate = new Date( currentDate.valueOf() + MILLIS_IN_DAY );
        } else if ( currentDate.valueOf() > streakStartDate.valueOf() + ((streakDuration - 1) * MILLIS_IN_DAY ) ) {
          i ++;
        } else {
          days.push({
            dayAbbreviation: dayAbbreviations[currentDay],
            achieved: true
          });
          currentDate = new Date( currentDate.valueOf() + MILLIS_IN_DAY );
        }
      }

      let _currentStreak;
      const currentDay = today.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
      if ( i < snapshot.docs.length ) {
        const streakStart = snapshot.docs[i].get("startTime") as Timestamp;
        _currentStreak = ((today.valueOf() - startOfDay(streakStart.toDate()).valueOf()) / MILLIS_IN_DAY) + 1;
        await updateDoc(snapshot.docs[i].ref, {
          endTime: serverTimestamp(),
          duration: _currentStreak,
        });
        days.push({
          dayAbbreviation: dayAbbreviations[currentDay],
          achieved: true
        });
      } else {
        const refName = `${today.getMonth().toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}-${today.getFullYear()}`;
        const streakDocRef = doc( streakCollection, refName );
        await setDoc(streakDocRef, {
          startTime: serverTimestamp(),
          endTime: serverTimestamp(),
          duration: 1,
        });
        _currentStreak = 1;
        days.push({
          dayAbbreviation: dayAbbreviations[currentDay],
          achieved: true
        });
      }

      setStreak({
        currentStreak: _currentStreak,
        days: days
      });

    }).catch((error) => {
      console.error(error);
    });

  }

  function loadProgressInfo() {

    const userDocRef = doc( db, 'users', user.uid );

    const progressUnsub = onSnapshot( userDocRef, {
      next: (snapshot) => {
        const userData = snapshot.data();

        const level = userData?.current_level || 0;
        const previousXP = userData?.previous_xp || 0;
        const previousLevel = userData?.previous_level || level;
        const currentXP = userData?.current_xp || 0;

        const requiredLevelXP = getLevelXPRequirement(level);

        const previousRequiredLevelXP = getLevelXPRequirement(level-1);
        const earnedXP = currentXP - previousXP;
        const earnRequired = requiredLevelXP - previousRequiredLevelXP;
        const requiredStreakXP = getStreakXPRequirement(previousLevel, streakProgress);
        setUserProgress({
          level: level,
          currentXP: currentXP,
          earnedXP: earnedXP,
          requiredLevelXP: requiredLevelXP,
          requiredStreakXP: requiredStreakXP,
          coins: userData?.coins || 0,
          levelProgress: Math.round(constrain(100 * earnedXP/earnRequired, 0, 100)) || 0,
          streakProgress: constrain(100 * earnedXP / requiredStreakXP, 0, 100) || 0,
        })
      },
      error: (err) => {
        console.error( err );
      }
    });

    return progressUnsub;
  }

  useEffect(loadStreakInfo, [user]);
  useEffect(loadProgressInfo, [user, streakProgress]);


  return (
    <GamificationContext.Provider value={{ userProgress, streakProgress }}>
      {children}
    </GamificationContext.Provider>
  );
}
