"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, User, ChevronLeft, Clock, Share2, Bookmark, Heart, MessageSquare, Send, Trash2, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Post {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  author: { _id: string; name: string };
  createdAt: string;
  likes: string[];
  comments: {
    _id: string;
    user: { _id: string; name: string };
    text: string;
    createdAt: string;
  }[];
}

export default function PostDetails() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPost();
  }, [id]);

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

  if (!post) {
    return (
      <div className="container error-state">
        <h2>Story not found</h2>
        <p>The story you're looking for might have been moved or deleted.</p>
        <Link href="/" className="back-to-home">Back to Home</Link>
      </div>
    );
  }

  const readTime = calculateReadingTime(post.content);
  const userId = (session?.user as any)?.id;
  const isLiked = userId ? (post.likes?.includes(userId) ?? false) : false;

  const handleLike = async () => {
    if (!session) {
      alert("Please log in to like this post!");
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    try {
      const res = await fetch(`/api/posts/${id}/like`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setPost(prev => {
          if (!prev) return null;
          
          const currentLikes = prev.likes || [];
          const isActuallyLiked = userId ? currentLikes.includes(userId) : false;

          let newLikes;
          if (data.isLiked) {
            // Should be liked
            newLikes = isActuallyLiked ? currentLikes : [...currentLikes, userId];
          } else {
            // Should be unliked
            newLikes = currentLikes.filter(uid => uid !== userId);
          }
            
          return {
            ...prev,
            likes: newLikes
          };
        });
      }
    } catch (err) {
      console.error('Error liking post:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const insertFormat = (before: string, after: string) => {
    const area = document.getElementById('comment-area') as HTMLTextAreaElement;
    if (!area) return;

    const start = area.selectionStart;
    const end = area.selectionEnd;
    const text = area.value;
    const selected = text.substring(start, end);
    const newText = text.substring(0, start) + before + selected + after + text.substring(end);
    
    setCommentText(newText);
    
    // Focus back and set cursor
    setTimeout(() => {
      area.focus();
      area.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      alert("Please log in to comment!");
      return;
    }
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setPost(prev => prev ? {
          ...prev,
          comments: [...(prev.comments || []), newComment]
        } : null);
        setCommentText("");
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this story? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        window.location.href = '/';
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete post");
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      alert("An error occurred while deleting the post.");
    }
  };

  return (
    <div className="container post-details-wrapper fade-in">
      <div className="post-navigation">
        <Link href="/" className="back-btn">
          <ChevronLeft size={18} />
          Back to all stories
        </Link>
        <div className="post-actions">
          <button 
            className={`action-btn like-btn ${isLiked ? 'active' : ''}`} 
            onClick={handleLike}
            disabled={isLiking}
            title={isLiked ? "Unlike" : "Like"}
          >
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            <span className="like-count">{post.likes?.length || 0}</span>
          </button>
          <button className="action-btn" title="Share"><Share2 size={18} /></button>
          <button className="action-btn" title="Save"><Bookmark size={18} /></button>
          
          {(session?.user as any)?.id === (post.author as any)?._id && (
            <>
              <Link 
                href={`/post/${id}/edit`}
                className="action-pill edit-pill" 
                title="Edit Story"
              >
                <Edit3 size={16} />
                <span>Edit</span>
              </Link>
              <button 
                className="action-pill delete-pill" 
                onClick={handleDelete}
                title="Delete Story"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="content-card">
        <article className="full-post">
          <header className="post-header-main">
            <div className="header-meta">
              <span className="meta-pill author">
                <User size={14} />
                {post.author.name}
              </span>
              <span className="meta-pill date">
                <Calendar size={14} />
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span className="meta-pill time">
                <Clock size={14} />
                {readTime} min read
              </span>
            </div>
            <h1 className="main-title">{post.title}</h1>
          </header>

          {post.imageUrl && (
            <div className="featured-image-container">
              <img src={post.imageUrl} alt={post.title} className="main-img" />
            </div>
          )}

          <div className="post-body-content">
            {post.content.split('\n').map((para, i) => (
              para.trim() && <p key={i}>{para}</p>
            ))}
          </div>

          <footer className="post-footer-main">
            <div className="author-bio">
              <div className="author-avatar">
                <User size={24} />
              </div>
              <div className="author-details">
                <h4>Written by {post.author.name}</h4>
                <p>Community contributor at Blogology. Sharing thoughts and stories with the world.</p>
              </div>
            </div>
          </footer>
        </article>

        <section className="comments-section">
          <div className="comments-header">
            <MessageSquare size={24} />
            <h3>Comments ({post.comments?.length || 0})</h3>
          </div>

          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <div className="form-avatar">
              {session?.user?.name?.charAt(0) || <User size={20} />}
            </div>
            <div className="form-input-wrapper">
              <div className="editor-toolbar">
                <button type="button" onClick={() => insertFormat('**', '**')} title="Bold">B</button>
                <button type="button" onClick={() => insertFormat('_', '_')} title="Italic">I</button>
                <button type="button" onClick={() => insertFormat('`', '`')} title="Code">{"< >"}</button>
                <button type="button" onClick={() => insertFormat('> ', '')} title="Quote">"</button>
                <button type="button" onClick={() => insertFormat('- ', '')} title="List">•</button>
                <div className="toolbar-divider"></div>
                <button type="button" onClick={() => insertFormat('', ' ❤️')} title="Heart">❤️</button>
                <button type="button" onClick={() => insertFormat('', ' 🔥')} title="Fire">🔥</button>
                <button type="button" onClick={() => insertFormat('', ' 👍')} title="Like">👍</button>
                <button type="button" onClick={() => insertFormat('', ' ✨')} title="Sparkle">✨</button>
              </div>
              <textarea
                id="comment-area"
                placeholder={session ? "Write a comment..." : "Please log in to comment"}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={!session || isSubmittingComment}
              />
              <button 
                type="submit" 
                className="submit-comment-btn"
                disabled={!session || isSubmittingComment || !commentText.trim()}
              >
                <Send size={18} />
              </button>
            </div>
          </form>

          <div className="comments-list">
            {post.comments?.length > 0 ? (
              post.comments.map((comment, i) => (
                <div key={comment._id || i} className="comment-item fade-in">
                  <div className="comment-avatar">
                    {comment.user.name.charAt(0)}
                  </div>
                  <div className="comment-content">
                    <div className="comment-meta">
                      <span className="comment-author">{comment.user.name}</span>
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-comments">
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <style jsx>{`
        .post-details-wrapper {
          max-width: 950px;
          margin: 0 auto;
          padding: 4rem 1.5rem;
        }

        .post-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 0 1rem;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .back-btn:hover {
          color: var(--primary);
          transform: translateX(-4px);
        }

        .post-actions {
          display: flex;
          gap: 0.75rem;
        }

        .action-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          background: white;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: #f8fafc;
          color: var(--secondary);
          border-color: var(--secondary);
        }

        .action-pill {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0 1.25rem;
          height: 42px;
          border-radius: 50px;
          border: 1px solid var(--border-color);
          background: white;
          color: var(--text-muted);
          font-weight: 700;
          font-size: 0.9rem;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .edit-pill {
          background: #f0fdf4;
          color: var(--primary);
          border-color: #bbf7d0;
        }

        .edit-pill:hover {
          background: #dcfce7;
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
        }

        .delete-pill {
          background: #fef2f2;
          color: #ef4444;
          border-color: #fca5a5;
        }

        .delete-pill:hover {
          background: #fee2e2;
          border-color: #f87171;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
        }

        .like-btn {
          gap: 0.5rem;
          width: auto;
          padding: 0 1rem;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .like-btn.active {
          background: #fee2e2;
          color: #ef4444;
          border-color: #fca5a5;
        }

        .like-btn:not(.active):hover {
          color: #ef4444;
          border-color: #fca5a5;
          background: #fff5f5;
        }

        .like-btn.active:hover {
          transform: scale(0.95);
        }

        .like-count {
          font-size: 0.9rem;
          font-weight: 700;
        }

        /* Comments Styles */
        .comments-section {
          margin-top: 5rem;
          padding-top: 5rem;
          border-top: 1px solid #e2e8f0;
        }

        .comments-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2.5rem;
          color: var(--secondary);
        }

        .comments-header h3 {
          font-size: 1.5rem;
          margin: 0;
        }

        .comment-form {
          display: flex;
          gap: 1.25rem;
          margin-bottom: 4rem;
        }

        .form-avatar {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: var(--accent);
          color: var(--primary-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .form-input-wrapper {
          flex-grow: 1;
          position: relative;
          background: #f8fafc;
          border: 1px solid var(--border-color);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .form-input-wrapper:focus-within {
          border-color: var(--primary);
          background: white;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }

        .editor-toolbar {
          display: flex;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-bottom: 1px solid var(--border-color);
          background: rgba(16, 185, 129, 0.03);
        }

        .editor-toolbar button {
          background: transparent;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          color: var(--text-muted);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'Courier New', Courier, monospace;
        }

        .editor-toolbar button:hover {
          background: white;
          color: var(--primary);
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .toolbar-divider {
          width: 1px;
          height: 20px;
          background: var(--border-color);
          margin: 0 0.25rem;
          align-self: center;
        }

        .comment-form textarea {
          width: 100%;
          min-height: 100px;
          padding: 1.25rem;
          padding-right: 4rem;
          border: none;
          background: transparent;
          font-family: inherit;
          font-size: 1rem;
          resize: vertical;
          transition: all 0.2s ease;
        }

        .comment-form textarea:focus {
          outline: none;
        }

        .submit-comment-btn {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: var(--primary);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .submit-comment-btn:hover:not(:disabled) {
          background: var(--primary-dark);
          transform: translateY(-2px);
        }

        .submit-comment-btn:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .comment-item {
          display: flex;
          gap: 1.25rem;
          padding: 1.5rem;
          background: #f8fafc;
          border-radius: 24px;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }

        .comment-item:hover {
          background: white;
          border-color: var(--border-color);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.02);
        }

        .comment-avatar {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: white;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: var(--secondary);
          flex-shrink: 0;
        }

        .comment-content {
          flex-grow: 1;
        }

        .comment-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .comment-author {
          font-weight: 700;
          color: var(--secondary);
          font-size: 0.95rem;
        }

        .comment-date {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .comment-text {
          font-size: 1rem;
          line-height: 1.6;
          color: #475569;
          margin: 0;
        }

        .no-comments {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-muted);
          background: #f8fafc;
          border-radius: 24px;
          border: 2px dashed #e2e8f0;
        }

        .content-card {
          background: white;
          border-radius: 48px;
          padding: 5rem;
          border: 1px solid rgba(15, 23, 42, 0.05);
          box-shadow: 
            0 40px 100px -20px rgba(15, 23, 42, 0.08),
            0 20px 40px -15px rgba(15, 23, 42, 0.04);
          position: relative;
        }

        .content-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 48px;
          padding: 1.5px;
          background: linear-gradient(165deg, rgba(16, 185, 129, 0.15), transparent 40%, rgba(15, 23, 42, 0.05));
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .post-header-main {
          margin-bottom: 4rem;
        }

        .header-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .meta-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          background: #f1f5f9;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .meta-pill.author {
          background: var(--accent);
          color: var(--primary-dark);
        }

        .main-title {
          font-size: 4rem;
          font-weight: 900;
          line-height: 1.1;
          color: var(--secondary);
          letter-spacing: -2.5px;
        }

        .featured-image-container {
          width: 100%;
          border-radius: 32px;
          overflow: hidden;
          margin-bottom: 5rem;
          box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.1);
        }

        .main-img {
          width: 100%;
          height: auto;
          display: block;
        }

        .post-body-content {
          font-size: 1.25rem;
          line-height: 1.9;
          color: #334155;
          margin-bottom: 6rem;
          max-width: 750px;
          margin-left: auto;
          margin-right: auto;
        }

        .post-body-content p {
          margin-bottom: 2.25rem;
        }

        .post-footer-main {
          padding-top: 4rem;
          border-top: 1px solid #e2e8f0;
          margin-bottom: 2rem;
        }

        .author-bio {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2.5rem;
          background: #f8fafc;
          border-radius: 32px;
          border: 1px solid #f1f5f9;
        }

        .author-avatar {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .author-details h4 {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--secondary);
          margin-bottom: 0.5rem;
        }

        .author-details p {
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .back-to-home {
          display: inline-block;
          background: var(--primary);
          color: white;
          padding: 1rem 2rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 700;
          margin-top: 1.5rem;
        }

        .loading-state, .error-state {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 60vh;
          text-align: center;
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

        @media (max-width: 768px) {
          .main-title {
            font-size: 2.8rem;
          }
          .content-card {
            padding: 2.5rem 1.5rem;
            border-radius: 32px;
          }
          .post-details-wrapper {
            padding: 2rem 1rem;
          }
          .author-bio {
            flex-direction: column;
            text-align: center;
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
