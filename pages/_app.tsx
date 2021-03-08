import 'styles/globals.css'
import { AppProps } from 'next/app';
import { AuthProvider } from 'hooks/useAuth';
export default function MyApp({ Component, pageProps }: AppProps): any {
 return (
  <AuthProvider>
   <Component {...pageProps} />
  </AuthProvider>
 );
}