"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Upload, Image as ImageIcon, X, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditPost() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title);
          setContent(data.content);
          setImagePreview(data.imageUrl);
          
          // Check if user is the author
          if (session && (session.user as any).id !== (data.author as any)._id) {
             router.push('/');
          }
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post data');
      } finally {
        setLoading(false);
      }
    };

    if (id && session) fetchPost();
  }, [id, session, router]);

  if (status === 'loading' || loading) return <div className="container">Loading...</div>;

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, imageUrl: imagePreview }),
      });

      if (res.ok) {
        router.push(`/post/${id}`);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update post');
      }
    } catch (err) {
      setError('An error occurred while updating the post.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container create-post-container fade-in">
      <Link href={`/post/${id}`} className="back-link">
        <ChevronLeft size={18} />
        Back to post
      </Link>
      
      <div className="create-card glass">
        <h1>Edit Post</h1>
        <p className="subtitle">Update your story for the community.</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Post Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a compelling title"
              required
            />
          </div>

          <div className="form-group">
            <label>Image Upload</label>
            <div className="image-upload-wrapper">
              {!imagePreview ? (
                <label className="upload-label">
                  <Upload size={24} />
                  <span>Click to change cover image</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                </label>
              ) : (
                <div className="preview-container">
                  <img src={imagePreview} alt="Preview" />
                  <button type="button" onClick={removeImage} className="remove-img-btn">
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your story here..."
              required
            />
          </div>

          <button type="submit" disabled={saving} className="publish-btn">
            {saving ? 'Saving changes...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .create-post-container {
          max-width: 800px;
          margin-top: 2rem;
          padding-bottom: 5rem;
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          text-decoration: none;
          margin-bottom: 2rem;
          font-weight: 600;
        }

        .create-card {
          padding: 3.5rem;
          border-radius: 32px;
          background: white;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
          border: 1px solid var(--border-color);
        }

        h1 {
          font-size: 3rem;
          margin-bottom: 0.5rem;
          color: var(--secondary);
          letter-spacing: -2px;
        }

        .subtitle {
          color: var(--text-muted);
          margin-bottom: 3.5rem;
          font-size: 1.1rem;
        }

        .form-group {
          margin-bottom: 2.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.8rem;
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        input[type="text"] {
          width: 100%;
          background: #f8fafc;
          border: 1px solid var(--border-color);
          padding: 1.1rem 1.4rem;
          border-radius: 16px;
          color: var(--secondary);
          font-size: 1.1rem;
          transition: all 0.2s ease;
        }

        input[type="text"]:focus {
          outline: none;
          border-color: var(--primary);
          background: white;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }

        textarea {
          width: 100%;
          background: #f8fafc;
          border: 1px solid var(--border-color);
          padding: 1.2rem 1.4rem;
          border-radius: 16px;
          color: var(--secondary);
          font-size: 1.1rem;
          min-height: 400px;
          resize: vertical;
          transition: all 0.2s ease;
          line-height: 1.7;
        }

        textarea:focus {
          outline: none;
          border-color: var(--primary);
          background: white;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }

        .image-upload-wrapper {
          border: 2px dashed #cbd5e1;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.2s ease;
          background: #f8fafc;
        }

        .preview-container {
          position: relative;
          width: 100%;
          height: 350px;
        }

        .preview-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          cursor: pointer;
          gap: 1.2rem;
          color: var(--text-muted);
          margin: 0;
        }

        .remove-img-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: white;
          color: #ef4444;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .publish-btn {
          width: 100%;
          background: var(--primary);
          color: white;
          padding: 1.2rem;
          border-radius: 16px;
          font-size: 1.2rem;
          font-weight: 700;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }

        .publish-btn:hover:not(:disabled) {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -5px rgba(16, 185, 129, 0.4);
        }

        .error-message {
          background: #fef2f2;
          color: #ef4444;
          padding: 1.2rem;
          border-radius: 16px;
          margin-bottom: 2.5rem;
          border: 1px solid #fee2e2;
        }
      `}</style>
    </div>
  );
}
