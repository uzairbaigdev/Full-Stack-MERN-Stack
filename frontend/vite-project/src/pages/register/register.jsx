import { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleRegistration = async (event) => {
    event.preventDefault();
    setErrors([]);
    setMessage('');
    setSubmitting(true);

    try {
      const registrationUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '');
      const response = await axios.post(registrationUrl, form);
      setMessage(response.data.message);
      setForm({ username: '', email: '', password: '' });
    } catch (error) {
      const backendErrors = error.response?.data?.errors;
      setErrors(
        backendErrors?.map(({ field, message }) => `${field}: ${message}`) ??
          [error.response?.data?.message ?? 'Could not connect to the server.'],
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';

  const labelClasses = 'mb-1.5 block text-sm font-medium text-slate-700';

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Fill in the details below to get started.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleRegistration} noValidate className="space-y-5">
            <div>
              <label htmlFor="username" className={labelClasses}>
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                value={form.username}
                onChange={handleChange}
                disabled={submitting}
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClasses}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                disabled={submitting}
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClasses}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                disabled={submitting}
                className={inputClasses}
              />
            </div>

            {errors.length > 0 && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3"
              >
                <p className="text-sm font-medium text-red-800">
                  Please fix the following:
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-red-700">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {message && (
              <div
                role="status"
                className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-600/30 disabled:cursor-not-allowed disabled:bg-indigo-400"
            >
              {submitting && (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
              {submitting ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Register;