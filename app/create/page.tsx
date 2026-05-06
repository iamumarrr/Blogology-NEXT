"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

export default function CreatePost() {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  if (status === 'loading') return <div className="container">Loading...</div>;
  const userRole = (session?.user as any)?.role?.toLowerCase();

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'authenticated' && userRole !== 'writer') {
    router.push('/');
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imageUrl = '';

      // 1. Use Base64 image if exists
      if (imagePreview) {
        imageUrl = imagePreview;
      }

      // 2. Create Post in MongoDB
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, imageUrl }),
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to create post');
      }
    } catch (err) {
      setError('An error occurred. Make sure your environment variables are configured.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container create-post-container fade-in">
      <div className="create-card glass">
        <h1>Create New Post</h1>
        <p className="subtitle">Share your thoughts with the world.</p>

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
                  <span>Click to upload a cover image</span>
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

          <button type="submit" disabled={loading} className="publish-btn">
            {loading ? 'Publishing...' : 'Publish Post'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .create-post-container {
          max-width: 800px;
          margin-top: 2rem;
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
          min-height: 350px;
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

        .image-upload-wrapper:hover {
          border-color: var(--primary);
          background: #f0fdf4;
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
          transition: all 0.2s ease;
        }

        .upload-label span {
          font-weight: 600;
          font-size: 1rem;
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
          transition: all 0.2s ease;
        }

        .remove-img-btn:hover {
          transform: scale(1.1);
          background: #fee2e2;
        }

        .publish-btn {
          width: 100%;
          background: var(--primary);
          color: white;
          padding: 1.2rem;
          border-radius: 16px;
          font-size: 1.2rem;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
