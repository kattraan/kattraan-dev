import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearError } from '@/features/auth/store/authSlice';
import { getPostAuthRedirectPath } from '@/features/home/utils/landingNavigation';
import useGoogleOneTap from '@/hooks/useGoogleOneTap';
import LoginPageLayout from './LoginPageLayout';
import LoginForm from './LoginForm';

const LoginPage = () => {
  useGoogleOneTap('google-login-btn');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const destination = getPostAuthRedirectPath(user);
    if (destination) navigate(destination, { replace: true });
  }, [isAuthenticated, user, navigate]);

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  return (
    <LoginPageLayout>
      <LoginForm instructorSignupSuccess={location.state?.instructorSignupSuccess} />
    </LoginPageLayout>
  );
};

export default LoginPage;
