"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('reader');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (res.ok) {
        router.push('/login');
      } else {
        const data = await res.json();
        setError(data.error || data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container auth-container fade-in">
      <div className="auth-card glass">
        <h2>Create Account</h2>
        <p className="subtitle">Join our community of writers today.</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label>I want to join as a:</label>
            <div className="role-selector">
              <button 
                type="button" 
                className={`role-btn ${role === 'reader' ? 'active' : ''}`}
                onClick={() => setRole('reader')}
              >
                Reader
              </button>
              <button 
                type="button" 
                className={`role-btn ${role === 'writer' ? 'active' : ''}`}
                onClick={() => setRole('writer')}
              >
                Writer
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="switch-auth">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </div>

      <style jsx>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 80vh;
        }

        .auth-card {
          width: 100%;
          max-width: 480px;
          padding: 3.5rem;
          border-radius: 32px;
          text-align: center;
          background: white;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
          border: 1px solid var(--border-color);
        }

        h2 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: var(--secondary);
          letter-spacing: -1.5px;
        }

        .subtitle {
          color: var(--text-muted);
          margin-bottom: 3rem;
          font-size: 1.1rem;
        }

        .form-group {
          text-align: left;
          margin-bottom: 1.8rem;
        }

        label {
          display: block;
          margin-bottom: 0.6rem;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .role-selector {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .role-btn {
          flex: 1;
          padding: 1rem;
          border-radius: 12px;
          border: 2px solid var(--border-color);
          background: #f8fafc;
          font-weight: 700;
          color: var(--text-muted);
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .role-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .role-btn.active {
          border-color: var(--primary);
          background: var(--accent);
          color: var(--primary-dark);
        }

        input {
          width: 100%;
          background: #f8fafc;
          border: 1px solid var(--border-color);
          padding: 1rem 1.2rem;
          border-radius: 16px;
          color: var(--secondary);
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        input:focus {
          outline: none;
          border-color: var(--primary);
          background: white;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }

        .auth-btn {
          width: 100%;
          background: var(--primary);
          color: white;
          padding: 1.1rem;
          border-radius: 16px;
          font-size: 1.1rem;
          font-weight: 700;
          margin-top: 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .auth-btn:hover:not(:disabled) {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
        }

        .auth-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background: #fef2f2;
          color: #ef4444;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          font-size: 0.95rem;
          font-weight: 500;
          border: 1px solid #fee2e2;
        }

        .switch-auth {
          margin-top: 2.5rem;
          color: var(--text-muted);
          font-size: 1rem;
        }

        .switch-auth a {
          color: var(--primary);
          font-weight: 700;
          margin-left: 0.3rem;
        }

        .switch-auth a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
