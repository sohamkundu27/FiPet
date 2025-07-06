import { useAuth } from '@/src/hooks/useAuth';
import SplashScreen from '@/src/screens/splash/SplashScreen';

export default function Index() {
  const { ready } = useAuth();
  if ( ! ready ) {
    return (
      <SplashScreen redirect="/home" ready={ready}/>
    );
  } else {
    return (
      <SplashScreen redirect="/home" ready={true}/>
    );
  }
} 
