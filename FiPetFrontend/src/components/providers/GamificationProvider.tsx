
import { db } from "@/src/config/firebase";
import { getLevelXPRequirement, getStreakMinuteRequirement } from "@/src/functions/getXPRequirement";
import { useAuth } from "@/src/hooks/useRequiresAuth";
import { CoinInfo, dayAbbreviations, LevelInfo, MoodClassification, MoodInfo, StreakDay, StreakInfo } from "@/src/types/UserProgress";
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, Timestamp, where, getDocs, updateDoc, DocumentReference, DocumentData } from "@firebase/firestore";
import { createContext, useEffect, useMemo, useRef, useState } from "react";

type GamificationContextType = {
  level: LevelInfo,
  mood: MoodInfo,
  coins: CoinInfo,
  streak: StreakInfo,
  addMood: (percentage: number) => void,
  addXP: (xp: number) => boolean,
};

export const GamificationContext = createContext<GamificationContextType>(null!);
export const STREAK_DISPLAY_LEN = 7;

const MILLIS_IN_HOUR = 1000 * 60 * 60;
const MILLIS_IN_DAY = MILLIS_IN_HOUR * 24;
const MOOD_INCREASE_PER_DAY = 10;
const MOOD_DECREASE_PER_DAY = 20;

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

function getMoodClassification(mood: number): MoodClassification {
  if (mood < 33) {
    return "Sad";
  } else if (mood < 66) {
    return "Bored";
  } else {
    return "Happy";
  }
}

export type UserData = {
  current_level: number,
  current_xp: number,
  pet_mood: number,
  current_coins: number,
  minutes_logged_in: number,
  last_date_logged_in: Timestamp,
}

export type StreakData = {
  records: {
    startTime: Timestamp,
    duration: number,
    ref: DocumentReference<DocumentData, DocumentData>,
  }[],
  days: StreakDay[],
  current: number,
}

/**
 * Gets the number of milliseconds since the start of the day.
 */
function getMillis(date: Date) {
  const hours = date.getHours();
  const minutes = hours * 60 + date.getMinutes();
  const seconds = minutes * 60 + date.getSeconds();
  return seconds * 1000 + date.getMilliseconds();
}

export const GamificationProvider = ({ children }: { children: any }) => {

  const {user} = useAuth();
  const [userData, setUserData] = useState<UserData>({
    current_coins: 0,
    current_xp: 0,
    current_level: 0,
    pet_mood: 0,
    minutes_logged_in: 0,
    last_date_logged_in: new Timestamp(Date.now() / 1000, 0),
  });
  const [streakData, setStreakData] = useState<StreakData>({
    records: [],
    days: [],
    current: 0,
  });

  const minutesLoggedInRef = useRef(0);
  const timerRef = useRef<Date>(new Date());


  //#### Minutes Logged In #####
  useEffect(() => {
    const userDocRef = doc( db, 'users', user.uid );
    const intervalRef = setInterval(() => {
      const minutesPassed = (Date.now() - timerRef.current.valueOf()) / (1000 * 60);
      timerRef.current = new Date();
      minutesLoggedInRef.current += minutesPassed;
      updateDoc(userDocRef, {
        minutes_logged_in: minutesLoggedInRef.current + minutesPassed,
      });
    }, 1000 * 60 * 1);

    return () => {
      clearInterval(intervalRef);
    }
  }, [user.uid]);


  //#### Last Date Logged In ####
  useEffect(() => {
    const userDocRef = doc( db, 'users', user.uid );

    if (startOfDay(userData.last_date_logged_in.toDate()).valueOf() !== startOfDay(new Date()).valueOf()) {
      minutesLoggedInRef.current = 0;
      timerRef.current = new Date();
      updateDoc(userDocRef, {
        last_date_logged_in: serverTimestamp(),
        minutes_logged_in: 0,
      });
    }

    const timeoutRef = setTimeout(() => {
      if (startOfDay(userData.last_date_logged_in.toDate()).valueOf() !== startOfDay(new Date()).valueOf()) {
        minutesLoggedInRef.current = 0;
        timerRef.current = new Date();
        updateDoc(userDocRef, {
          last_date_logged_in: serverTimestamp(),
          minutes_logged_in: 0,
        });
      }
    }, MILLIS_IN_DAY - (getMillis(new Date()) - (startOfDay(new Date()).valueOf())));

    return () => {
      clearTimeout(timeoutRef);
    }
  }, [userData.last_date_logged_in, user.uid]);


  //#### Coins ####
  const coins = useMemo<CoinInfo>(() => {return {coins: userData.current_coins}}, [userData.current_coins]);


  //#### Levels/xp ####
  const levelProgress = useRef<number>(0);
  const level = useMemo<LevelInfo>(() => {
    const requiredLevelXP = getLevelXPRequirement(userData.current_level);
    const previousRequiredLevelXP = getLevelXPRequirement(userData.current_level-1);
    const earnedXP = userData.current_xp - previousRequiredLevelXP;
    const earnRequired = requiredLevelXP - previousRequiredLevelXP;

    const previousLevelProgress = levelProgress.current;
    levelProgress.current = constrain(100 * earnedXP / earnRequired, 0, 100);

    return {
      current: userData.current_level,
      xp: userData.current_xp,
      progress: constrain(100 * earnedXP / earnRequired, 0, 100),
      earnedXP: earnedXP,
      requiredXP: requiredLevelXP,
      previousProgress: previousLevelProgress,
    }
  }, [userData.current_xp, userData.current_level]);


  //#### Mood ####
  const moodProgress = useRef<number>(0);
  const mood = useMemo<MoodInfo>(() => {

    let updateTime = startOfDay(userData.last_date_logged_in.toDate());
    let currentTime = startOfDay(new Date());
    let _mood = userData.pet_mood;

    if (updateTime.valueOf() !== currentTime.valueOf()) {
      const userDocRef = doc( db, 'users', user.uid );
      const daysNotLoggedIn = Math.max(
        ((currentTime.valueOf() - updateTime.valueOf()) / MILLIS_IN_DAY) - 1,
        0
      );
      let change = MOOD_INCREASE_PER_DAY;
      change -= daysNotLoggedIn * MOOD_DECREASE_PER_DAY;

      _mood += change;
      
      updateDoc(userDocRef, {
        current_mood: constrain(_mood, 0, 100),
      });
    }

    const previousMoodProgress = moodProgress.current;
    moodProgress.current = _mood;

    return {
      current: _mood,
      previous: previousMoodProgress,
      moodClassification: getMoodClassification(_mood),
    };
  }, [userData.pet_mood, userData.last_date_logged_in, user.uid]);


  //#### Streaks ####
  const streakProgress = useRef<number>(0);
  const streak = useMemo<StreakInfo>(() => {
    const minutesRequired = getStreakMinuteRequirement(streakData);
    const previousStreakProgress = streakProgress.current;
    streakProgress.current = constrain(100 * userData.minutes_logged_in / minutesRequired, 0, 100);
    return {
      current: streakData.current,
      previousProgress: previousStreakProgress,
      days: streakData.days,
      minutesRequired: minutesRequired,
      minutesUsed: Math.floor(userData.minutes_logged_in),
      progress: streakProgress.current,
    }
  }, [streakData, userData.minutes_logged_in]);


  /**
   * Loads user data from the db as a subscriber system.
   */
  function loadUserData() {

    const userDocRef = doc( db, 'users', user.uid );

    const progressUnsub = onSnapshot( userDocRef, {
      next: (snapshot) => {
        const _userData = snapshot.data();
        setUserData({
          current_coins: _userData?.current_coins || 0,
          current_level: _userData?.current_level || 0,
          current_xp: _userData?.current_xp || 0,
          pet_mood: _userData?.pet_mood || 0,
          minutes_logged_in: _userData?.minutes_logged_in || minutesLoggedInRef.current,
          last_date_logged_in: _userData?.last_date_logged_in || new Timestamp(Date.now()/1000, 0),
        });
      },
      error: (err) => {
        console.error( err );
      }
    });

    return progressUnsub;
  }
  useEffect(loadUserData, [user]);


  /**
   * Loads streak information from the db and stores in a digestable format.
   */
  function loadStreakData() {

    const today = startOfDay( new Date() );

    const displayStartDate = new Date(today.valueOf() - ((STREAK_DISPLAY_LEN-1) * MILLIS_IN_DAY));
    const displayStartTimestamp = new Timestamp(displayStartDate.getSeconds(), displayStartDate.getMilliseconds());
    const streakCollection = collection( db, 'users', user.uid, 'streakData' );
    const streakQuery = query(
      streakCollection,
      where("endTime", ">=", displayStartTimestamp),
      orderBy("endTime", "asc")
    );

    getDocs(streakQuery).then(async (snapshot) => {
      const _streakData: StreakData = {
        records: [],
        days: [],
        current: 0,
      };
      for (let i = 0; i < snapshot.docs.length; i ++) {
        _streakData.records.push({
          ref: snapshot.docs[i].ref,
          startTime: snapshot.docs[i].get("startTime", {serverTimestamps: "estimate"}) as Timestamp,
          duration: snapshot.docs[i].get("duration") as number,
        });
      }

      let i = 0;
      let currentDate = new Date(displayStartDate);
      let days: StreakDay[] = [];
      const records = _streakData.records;
      const streakCollection = collection( db, 'users', user.uid, 'streakData' );

      while( currentDate.valueOf() < today.valueOf() ) {

        const currentDay = currentDate.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

        if ( i >= records.length ) {
          days.push({
            dayAbbreviation: dayAbbreviations[currentDay],
            achieved: false
          });
          currentDate = new Date( currentDate.valueOf() + MILLIS_IN_DAY );
          continue;
        }

        const streakStartTimestamp = records[i].startTime;
        const streakStartDate = startOfDay(streakStartTimestamp.toDate());
        const streakDuration = records[i].duration;

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
      if ( i < records.length ) {
        const streakStart = records[i].startTime;
        _currentStreak = ((today.valueOf() - startOfDay(streakStart.toDate()).valueOf()) / MILLIS_IN_DAY) + 1;
        await updateDoc(records[i].ref, {
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

      _streakData.days = days;
      _streakData.current = _currentStreak;

      setStreakData(_streakData);
    }).catch((error) => {
      console.error(error);
    });
  }
  useEffect(loadStreakData, [user]);


  /**
   * Percentage is 0-100.
   */
  function addMood(percentage: number) {
    const userDocRef = doc( db, 'users', user.uid );
    let _mood = constrain(mood.current + percentage, 0, 100);
    updateDoc( userDocRef, {
      current_mood: _mood,
    });
  }

  /**
   * Returns true if the pet leveled up.
   */
  function addXP(xp: number): boolean {
    const userDocRef = doc( db, 'users', user.uid );
    let _xp = constrain(level.xp + xp, 0, 100);
    let _level = level.current;
    let leveledUp = false;

    if ( _xp > level.requiredXP ) {
      _level += 1;
      leveledUp = true;
    }

    updateDoc( userDocRef, {
      current_xp: _xp,
      current_level: _level,
    });

    return leveledUp;
  }


  return (
    <GamificationContext.Provider value={{ coins, streak, mood, level, addMood, addXP }}>
      {children}
    </GamificationContext.Provider>
  );
}
