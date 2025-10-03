import { useState, FormEvent, useRef } from 'react';
import { api } from '../services/api';
import MentionTextarea from './MentionTextarea';

interface CreatePostFormProps {
  onPostCreated?: () => void;
  clubId?: string;
}

export default function CreatePostForm({ onPostCreated, clubId }: CreatePostFormProps) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload an image or video.');
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setError('File too large. Maximum size is 50MB.');
      return;
    }

    setUploadedFile(file);
    setError(null);

    // Create preview URL
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Please write something');
      return;
    }

    if (!clubId) {
      setError('Please select a club to post to');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let finalImageUrl = imageUrl;

      // Upload file if one was selected
      if (uploadedFile) {
        setIsUploading(true);
        const uploadResult = await api.uploadFile(uploadedFile);
        finalImageUrl = uploadResult.url;
        setIsUploading(false);
      }

      await api.createPost(content, finalImageUrl || undefined, clubId);
      setContent('');
      setImageUrl('');
      handleRemoveFile();
      setShowMediaInput(false);
      setIsFocused(false);
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <form onSubmit={handleSubmit}>
        <MentionTextarea
          value={content}
          onChange={setContent}
          onFocus={() => setIsFocused(true)}
          placeholder="What's on your mind? Type @ to mention someone"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          rows={isFocused ? 4 : 1}
          disabled={isSubmitting}
        />

        {showMediaInput && (
          <div className="mt-3 space-y-3">
            {/* File Upload */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={isSubmitting || isUploading}
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Image/Video
              </label>
            </div>

            {/* Preview */}
            {previewUrl && uploadedFile && (
              <div className="relative">
                {uploadedFile.type.startsWith('image/') ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-64 rounded-lg object-cover"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    controls
                    className="max-h-64 rounded-lg"
                  />
                )}
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* URL Input (alternative to file upload) */}
            {!uploadedFile && (
              <>
                <div className="text-center text-sm text-gray-500">or</div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image/video URL"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </>
            )}
          </div>
        )}

        {error && (
          <div className="mt-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setShowMediaInput(!showMediaInput);
              if (showMediaInput) {
                handleRemoveFile();
              }
            }}
            className="flex items-center text-gray-600 hover:text-orange-600"
            disabled={isSubmitting}
          >
            <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {showMediaInput ? 'Remove Media' : 'Add Media'}
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isUploading || !content.trim()}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
