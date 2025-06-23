import { useAuth } from '@/src/hooks/useAuth';
import { Redirect } from 'expo-router';

export default function Index() {
  if (!useAuth().userState) {
    return <Redirect href="/splash?page=landing" />;
  } else {
    return <Redirect href="/splash?page=home" />;
  }
} 
