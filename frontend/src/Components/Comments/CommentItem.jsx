import { useState } from 'react';
import { resolveUrl, formatDate, getModerationBadgeText } from '../../utils/formatters';
import { FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axios';

const CommentItem = ({ comment, postId, onCommentDeleted }) => {
  const { authUser } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const avatarUrl = resolveUrl(comment?.userId?.profile?.url) || '/avatar.jpg';
  const moderationCategory = getModerationBadgeText(comment?.moderation);
  const isOwner = authUser?._id && comment?.userId?._id && String(authUser._id) === String(comment.userId._id);

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;

    setIsDeleting(true);
    try {
      const res = await axiosInstance.delete(`/posts/${postId}/comment/${comment._id}`);
      if (res?.data?.success) {
        toast.success('Comment deleted');
        if (onCommentDeleted) {
          onCommentDeleted(res.data.post);
        }
      }
    } catch (error) {
      toast.error('Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
      <img
        src={avatarUrl}
        alt={comment?.userId?.name || 'User'}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">
            {comment?.userId?.name || 'Unknown User'}
          </span>
          <span className="text-xs text-gray-500">
            {formatDate(comment?.createdAt)}
          </span>

          {moderationCategory && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
              <FaExclamationTriangle className="w-3 h-3" />
              <span className="capitalize">{moderationCategory}</span>
            </span>
          )}

          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-700 text-xs ml-auto disabled:opacity-50"
              title="Delete comment"
            >
              <FaTrash className="w-3 h-3" />
            </button>
          )}
        </div>

        <p className="text-gray-800 text-sm break-words">
          {comment?.text}
        </p>
      </div>
    </div>
  );
};

export default CommentItem;
