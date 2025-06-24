import React, { createContext, useContext, useState } from 'react';

type Progress = {
  [questId: string]: {
    correctCount: number;
    total: number;
  };
};

const UserProgressContext = createContext<{
  progress: Progress;
  setProgress: React.Dispatch<React.SetStateAction<Progress>>;
}>({
  progress: {},
  setProgress: () => {},
});

export const UserProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const [progress, setProgress] = useState<Progress>({});
  return (
    <UserProgressContext.Provider value={{ progress, setProgress }}>
      {children}
    </UserProgressContext.Provider>
  );
};

export const useUserProgress = () => useContext(UserProgressContext); 