import { useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axios';

const CommentForm = ({ postId, onCommentAdded }) => {

  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      toast.warn('Please enter a comment');
      return;
    }

    setIsSubmitting(true);

    try {

      const res = await axiosInstance.post(
        `/posts/${postId}/comment`,
        { text: text.trim() },
        { withCredentials: true } // ✅ IMPORTANT FIX
      );

      const data = res.data;

      if (data.success) {
        setText('');
        toast.success(data.message || 'Comment added');

        if (data.moderation?.flagged) {
          toast.warning('Your comment has been flagged for review');
        }

        if (onCommentAdded) {
          onCommentAdded(data.post);
        }

      } else {
        toast.error(data.message || 'Failed to add comment');
      }

    } catch (error) {
      console.error('Comment error:', error);
      toast.error('Failed to add comment');
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex gap-2">

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />

        <button
          type="submit"
          disabled={isSubmitting || !text.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>

      </div>
    </form>
  );
};

export default CommentForm;
