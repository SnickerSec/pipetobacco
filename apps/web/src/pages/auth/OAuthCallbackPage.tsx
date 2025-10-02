import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Spinner from '../../components/ui/Spinner';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      // Handle OAuth error
      console.error('OAuth error:', error);
      navigate('/login?error=' + error);
      return;
    }

    if (token) {
      // Store token in localStorage
      localStorage.setItem('auth_token', token);

      // TODO: Fetch user data with this token
      // For now, just redirect to feed
      navigate('/feed');
    } else {
      // No token, redirect to login
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-tobacco-50">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-tobacco-700">Completing sign in...</p>
      </div>
    </div>
  );
}
