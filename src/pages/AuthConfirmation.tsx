
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AuthConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the token and type from URL query parameters
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        
        if (!token || !type) {
          setStatus('error');
          setMessage('Missing confirmation parameters. Please check your email link.');
          return;
        }

        // Process the confirmation based on the type
        if (type === 'signup') {
          // Handle email confirmation for signup
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email',
          });

          if (error) {
            console.error('Verification error:', error);
            setStatus('error');
            setMessage(`Failed to verify email: ${error.message}`);
          } else {
            setStatus('success');
            setMessage('Email verified successfully! You can now log in.');
          }
        } else if (type === 'recovery') {
          // Handle password reset confirmation
          setStatus('success');
          setMessage('Please enter your new password:');
          // Redirect to password reset page with token
          navigate(`/reset-password?token=${token}`);
          return;
        } else {
          setStatus('error');
          setMessage('Unknown confirmation type.');
        }
      } catch (error) {
        console.error('Confirmation error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during verification.');
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  const goToHome = () => {
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <div className="flex flex-col items-center text-center space-y-4">
          {status === 'processing' && (
            <div className="animate-pulse">
              <div className="h-12 w-12 rounded-full border-4 border-brain-teal border-t-transparent animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">{message}</p>
            </div>
          )}
          
          {status === 'success' && (
            <>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">Success!</h3>
              <p className="text-muted-foreground">{message}</p>
              <Button onClick={goToHome} className="mt-4 bg-gradient-to-r from-brain-purple to-brain-teal text-white">
                Go to Home
              </Button>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">Verification Failed</h3>
              <p className="text-muted-foreground">{message}</p>
              <Button onClick={goToHome} className="mt-4">
                Return Home
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AuthConfirmation;
