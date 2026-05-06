"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight, Clock, Tag, Heart, PlusSquare } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Post {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  author: { name: string };
  createdAt: string;
  likes: string[];
}

export default function Home() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/posts');
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  if (loading) {
    return (
      <div className="container loading-state">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container fade-in">
      <header className="home-header">
        <div className="header-badge">Latest Updates</div>
        <h1>Stories & Insights</h1>
        <p>Explore our community's latest thoughts and perspectives on everything that matters.</p>
      </header>

      

      {posts.length === 0 ? (
        <div className="no-posts-card glass">
          <h3>No posts yet.</h3>
          <p>Be the first to share something amazing with our community!</p>
          <Link href="/create" className="cta-btn-primary">
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div className="posts-grid">
            {posts.map((post) => {
              const readTime = calculateReadingTime(post.content);
              return (
                <Link href={`/post/${post._id}`} key={post._id} className="modern-post-card">
                  <div className="card-top">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="card-img" />
                    ) : (
                      <div className="img-placeholder">
                        <Tag size={32} />
                      </div>
                    )}
                    <div className="read-time-badge">
                      <Clock size={12} />
                      {readTime} min read
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <div className="meta-row">
                      <div className="author-pill">
                        <User size={12} />
                        {post.author.name}
                      </div>
                      <div className="date-pill">
                        <Calendar size={12} />
                        {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    
                    <h2 className="post-title">{post.title}</h2>
                    <p className="post-excerpt">
                      {post.content.length > 110
                        ? post.content.substring(0, 110) + '...'
                        : post.content}
                    </p>
                    
                    <div className="card-footer">
                      <div className="card-stats">
                        <div className="stat-item">
                          <Heart size={14} className={(post.likes?.length || 0) > 0 ? "text-red" : ""} fill={(post.likes?.length || 0) > 0 ? "currentColor" : "none"} />
                          <span>{post.likes?.length || 0}</span>
                        </div>
                      </div>
                      <span className="read-more-link">
                        Continue Reading
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
      )}

      <style jsx>{`
        .home-header {
          text-align: center;
          margin-bottom: 6rem;
          padding-top: 2rem;
        }

        .header-badge {
          display: inline-block;
          background: var(--accent);
          color: var(--primary-dark);
          padding: 0.5rem 1.25rem;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1.5rem;
        }

        .home-header h1 {
          font-size: 4rem;
          margin-bottom: 1rem;
          color: var(--secondary);
          letter-spacing: -2px;
        }

        .home-header p {
          color: var(--text-muted);
          font-size: 1.2rem;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2.5rem;
        }

        .modern-post-card {
          background: white;
          border-radius: 32px;
          overflow: hidden;
          text-decoration: none;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(15, 23, 42, 0.08);
          display: flex;
          flex-direction: column;
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.02),
            0 2px 4px -1px rgba(0, 0, 0, 0.01);
          position: relative;
        }

        .modern-post-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 32px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(15, 23, 42, 0.05));
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0.5;
          transition: opacity 0.5s ease;
        }

        .modern-post-card:hover {
          transform: translateY(-10px);
          box-shadow: 
            0 30px 60px -12px rgba(15, 23, 42, 0.12),
            0 18px 36px -18px rgba(15, 23, 42, 0.15);
          border-color: rgba(16, 185, 129, 0.2);
        }

        .modern-post-card:hover::after {
          opacity: 1;
        }

        .card-top {
          position: relative;
          height: 250px;
          overflow: hidden;
        }

        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .img-placeholder {
          width: 100%;
          height: 100%;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }

        .modern-post-card:hover .card-img {
          transform: scale(1.1);
        }

        .read-time-badge {
          position: absolute;
          bottom: 1.25rem;
          right: 1.25rem;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          padding: 0.4rem 0.8rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--secondary);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 2;
        }

        .card-body {
          padding: 2.25rem;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .meta-row {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .author-pill, .date-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          background: #f8fafc;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          border: 1px solid rgba(0, 0, 0, 0.03);
        }

        .author-pill {
          color: var(--secondary);
        }

        .post-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--secondary);
          line-height: 1.3;
          margin-bottom: 1rem;
          transition: color 0.2s ease;
        }

        .modern-post-card:hover .post-title {
          color: var(--primary-dark);
        }

        .post-excerpt {
          font-size: 1.05rem;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 2rem;
          flex-grow: 1;
        }

        .card-footer {
          margin-top: auto;
          padding-top: 1.5rem;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-stats {
          display: flex;
          gap: 1rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .text-red {
          color: #ef4444;
        }

        .read-more-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--primary);
          transition: gap 0.3s ease;
        }

        .modern-post-card:hover .read-more-link {
          gap: 0.8rem;
        }

        .no-posts-card {
          text-align: center;
          padding: 8rem 2rem;
          border-radius: 40px;
          background: white;
          max-width: 700px;
          margin: 0 auto;
        }

        .cta-btn-primary {
          display: inline-block;
          background: var(--secondary);
          color: white;
          padding: 1.1rem 2.5rem;
          border-radius: 50px;
          font-weight: 700;
          margin-top: 2rem;
          transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.1);
        }

        .cta-btn-primary:hover {
          background: #334155;
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(15, 23, 42, 0.2);
        }

        .loading-state {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 60vh;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f1f5f9;
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .home-header h1 {
            font-size: 2.5rem;
          }
          .posts-grid {
            grid-template-columns: 1fr;
          }
          .card-top {
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
}
