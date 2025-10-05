import { SignUp } from '@clerk/nextjs'
import './signup.css';  
import Header from '../../../../../components/Header';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200">
      <Header />
      
      {/* Sign-Up Section */}
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-80px)]">
        <div className="backdrop-blur-sm rounded-lg p-8 shadow-lg" style={{background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.4), rgba(107, 33, 168, 0.2))'}}>
          <SignUp forceRedirectUrl={'/protected/form'}/>
        </div>
      </div>
    </div>
  );
}
