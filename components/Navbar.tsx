"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, PlusSquare, Home, User as UserIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const navItems = [
    { id: 'home', label: 'Home', href: '/', icon: <Home size={18} /> },
  ];

  const userRole = (session?.user as any)?.role?.toLowerCase();

  if (session && userRole === 'writer') {
    navItems.push({ id: 'create', label: 'Create Post', href: '/create', icon: <PlusSquare size={18} /> });
  }

  return (
    <nav className="navbar-container">
      <div className="navbar-wrapper glass">
        <Link href="/" className="logo-card">
          <Sparkles className="logo-icon" size={24} />
          <span className="logo-text">Blog<span>ology</span></span>
        </Link>

        <div className="nav-cards" onMouseLeave={() => setHoveredTab(null)}>
          {navItems.map((item) => (
            <Link 
              key={item.id}
              href={item.href} 
              className={`nav-card-item ${item.id === 'create' ? 'create-card' : 'standard-card'}`}
              onMouseEnter={() => setHoveredTab(item.id)}
            >
              <AnimatePresence>
                {hoveredTab === item.id && (
                  <motion.div
                    layoutId="sliding-bg"
                    className="hover-bg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </AnimatePresence>
              <div className="inner-content">
                {item.icon}
                <span className="text-label">{item.label}</span>
              </div>
            </Link>
          ))}

          {session ? (
            <div className="user-card-group">
              <div className="user-profile-tile">
                <UserIcon size={16} />
                <div className="user-info-stack">
                  <span className="name-text">{session.user?.name}</span>
                  <span className="role-tag">{userRole}</span>
                </div>
              </div>
              <button onClick={() => signOut()} className="exit-action-card" title="Sign Out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="auth-card-group">
              <Link 
                href="/login" 
                className="nav-card-item auth-card login-btn"
                onMouseEnter={() => setHoveredTab('login')}
              >
                <AnimatePresence>
                  {hoveredTab === 'login' && (
                    <motion.div
                      layoutId="sliding-bg"
                      className="hover-bg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                </AnimatePresence>
                <span className="inner-content">Login</span>
              </Link>
              <Link 
                href="/signup" 
                className="nav-card-item auth-card signup-btn"
                onMouseEnter={() => setHoveredTab('signup')}
              >
                <AnimatePresence>
                  {hoveredTab === 'signup' && (
                    <motion.div
                      layoutId="sliding-bg"
                      className="hover-bg signup-hover"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                </AnimatePresence>
                <span className="inner-content">Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
