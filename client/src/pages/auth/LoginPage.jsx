import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearError } from '@/features/auth/store/authSlice';
import { hasRole } from '@/features/auth/utils/roleUtils';
import useGoogleOneTap from '@/hooks/useGoogleOneTap';
import { ROUTES } from '@/config/routes';
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
    if (hasRole(user, 'admin')) { navigate(ROUTES.ADMIN_DASHBOARD, { replace: true }); return; }
    if (hasRole(user, 'instructor')) {
      if (user.status === 'pending_enrollment') { navigate(ROUTES.INSTRUCTOR_ENROLLMENT, { replace: true }); return; }
      if (user.status === 'pending_approval') { navigate(ROUTES.WAITING_APPROVAL, { replace: true }); return; }
      navigate(ROUTES.INSTRUCTOR_DASHBOARD, { replace: true });
      return;
    }
    navigate(location.state?.from?.pathname || ROUTES.DASHBOARD, { replace: true });
  }, [isAuthenticated, user, navigate, location]);

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  return (
    <LoginPageLayout>
      <LoginForm instructorSignupSuccess={location.state?.instructorSignupSuccess} />
    </LoginPageLayout>
  );
};

export default LoginPage;
