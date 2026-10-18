import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../zustand/authStore.js';

const Login = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage('');
    setSubmitting(true);

    try {
      const response = await axios.post('/login', { email, password });
      const token = response.data.token;

      if (token) {
        const cookieAttributes = [
          'Path=/',
          'Max-Age=3600',
          'SameSite=Lax',
          ...(import.meta.env.PROD ? ['Secure'] : []),
        ];

        document.cookie = [
          `token=${encodeURIComponent(token)}`,
          ...cookieAttributes,
        ].join('; ');
      }

      setUser(response.data.user ?? { email });
      navigate('/dashboard');
    } catch (error) {
      setMessage(
        error.response?.data?.message ?? 'Could not connect to the server.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/15';

  const labelClasses = 'mb-1.5 block text-sm font-medium text-slate-700';

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Log in to your account to continue.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className={labelClasses}>
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Email"
                value={email}
                required
                disabled={submitting}
                onChange={(event) => setEmail(event.target.value)}
                className={`${inputClasses} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500`}
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClasses}>
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                required
                disabled={submitting}
                onChange={(event) => setPassword(event.target.value)}
                className={`${inputClasses} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500`}
              />
            </div>

            {message && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-600/30 disabled:cursor-not-allowed disabled:bg-indigo-400"
            >
              {submitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Login;