'use client';

import { useReducer, useState, useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import { useAuth } from '@/hooks/use-auth';
import { Card, Form, Button, Alert, Spinner, Container, Row, Col, Image } from 'react-bootstrap';

interface LoginState {
  step: 'login' | 'otp';
  identifier: string;
  password: string;
  captchaAnswer: string;
  sessionKey: string;
  captchaImage: string;
  tempToken: string;
  rememberMe: boolean;
  otpCode: string;
}

type LoginAction =
  | { type: 'SET_FIELD'; field: keyof LoginState; value: any }
  | { type: 'SET_STEP'; step: 'login' | 'otp' }
  | { type: 'SET_CAPTCHA'; image: string; sessionKey: string }
  | { type: 'SET_TEMP_TOKEN'; token: string };

const initialState: LoginState = {
  step: 'login',
  identifier: '',
  password: '',
  captchaAnswer: '',
  sessionKey: '',
  captchaImage: '',
  tempToken: '',
  rememberMe: false,
  otpCode: '',
};

function loginReducer(state: LoginState, action: LoginAction): LoginState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'SET_CAPTCHA':
      return { ...state, captchaImage: action.image, sessionKey: action.sessionKey, captchaAnswer: '' };
    case 'SET_TEMP_TOKEN':
      return { ...state, tempToken: action.token };
    default:
      return state;
  }
}

export default function LoginPage() {
  const [state, dispatch] = useReducer(loginReducer, initialState);
  const { callApi, loading, error } = useApi();
  const { login } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const fetchCaptcha = async () => {
    try {
      const res = await fetch('/api/auth/captcha');
      const result = await res.json();
      if (result.success) {
        dispatch({ type: 'SET_CAPTCHA', image: result.data.image, sessionKey: result.data.sessionKey });
      }
    } catch (err) {
      setLocalError('Failed to load captcha');
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await callApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier: state.identifier,
          password: state.password,
          captchaAnswer: state.captchaAnswer,
          sessionKey: state.sessionKey,
        }),
      });

      if (res.success) {
        dispatch({ type: 'SET_TEMP_TOKEN', token: res.data.tempToken });
        dispatch({ type: 'SET_STEP', step: 'otp' });
      }
    } catch (err) {
      fetchCaptcha(); // Refresh captcha on failure
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await callApi('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          tempToken: state.tempToken,
          otpCode: state.otpCode,
          rememberMe: state.rememberMe,
        }),
      });

      if (res.success) {
        login(res.data.token, state.rememberMe);
      }
    } catch (err) {
      // Handle error
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Card border="light" style={{ maxWidth: '400px', width: '100%' }}>
        <Card.Body className="p-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold">HRMS</h2>
            <Card.Text className="text-muted small">Human Resource Management System</Card.Text>
          </div>

          {(error || localError) && (
            <Alert variant="danger" className="py-2 small">
              {error || localError}
            </Alert>
          )}

          {state.step === 'login' ? (
            <Form onSubmit={handleLoginSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Username / Email / Phone</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your identifier"
                  required
                  value={state.identifier}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'identifier', value: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="••••••••"
                  required
                  value={state.password}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'password', value: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Captcha</Form.Label>
                <div className="d-flex gap-2 mb-2">
                  {state.captchaImage && (
                    <Image
                      src={state.captchaImage}
                      alt="captcha"
                      rounded
                      style={{ cursor: 'pointer' }}
                      onClick={fetchCaptcha}
                    />
                  )}
                  <Button variant="outline-secondary" size="sm" onClick={fetchCaptcha}>
                    <i className="bi bi-arrow-clockwise"></i>
                  </Button>
                </div>
                <Form.Control
                  type="text"
                  placeholder="Enter characters above"
                  required
                  value={state.captchaAnswer}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'captchaAnswer', value: e.target.value })}
                />
              </Form.Group>

              <Button type="submit" variant="primary" className="w-100 mt-3" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Continue'}
              </Button>
            </Form>
          ) : (
            <Form onSubmit={handleOtpSubmit}>
              <div className="text-center mb-4">
                <Card.Text className="small text-muted">We've sent a 6-digit OTP to your email.</Card.Text>
              </div>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">OTP Code</Form.Label>
                <Form.Control
                  type="text"
                  className="text-center fs-4 fw-bold"
                  maxLength={6}
                  required
                  value={state.otpCode}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'otpCode', value: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="rememberMe"
                  label="Remember me for 30 days"
                  className="small"
                  checked={state.rememberMe}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'rememberMe', value: e.target.checked })}
                />
              </Form.Group>

              <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Verify & Login'}
              </Button>

              <div className="text-center mt-3">
                <Button
                  variant="link"
                  size="sm"
                  className="text-decoration-none"
                  onClick={() => dispatch({ type: 'SET_STEP', step: 'login' })}
                >
                  Back to Login
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
