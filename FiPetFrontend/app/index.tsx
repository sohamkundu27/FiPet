import { useAuth } from '@/src/hooks/useAuth';
import SplashScreen from '@/src/screens/splash/SplashScreen';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const { ready, user } = useAuth();
  const router = useRouter();

  if (!ready) {
    return (
      <SplashScreen redirect="/home" ready={ready}/>
    );
  }

  if (!user) {
    // Show splash and redirect to landing if not logged in
    return <SplashScreen redirect="/landing" ready={true} />;
  }

  return (
    <SplashScreen redirect="/home" ready={true}/>
  );
} 
