import { useState } from 'react';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import { FaComment } from 'react-icons/fa';

const CommentsSection = ({ post, onPostUpdate }) => {
  const handleCommentDeleted = (updatedPost) => {
    if (onPostUpdate) {
      onPostUpdate(updatedPost);
    }
  };
  const [isExpanded, setIsExpanded] = useState(true);
  const [localPost, setLocalPost] = useState(post);

  const handleCommentAdded = (updatedPost) => {
    setLocalPost(updatedPost);
    if (onPostUpdate) {
      onPostUpdate(updatedPost);
    }
  };

  const commentsCount = localPost?.comments?.length || 0;

  return (
    <div className="border-t pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition mb-3"
      >
        <FaComment className="w-4 h-4" />
        <span className="font-semibold">
          {isExpanded ? 'Hide' : 'Show'} {commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}
        </span>
      </button>

      {isExpanded && (
        <div className="space-y-4">
          <CommentForm 
            postId={localPost._id} 
            onCommentAdded={handleCommentAdded}
          />
          <CommentList
            comments={localPost.comments}
            postId={localPost._id}
            onCommentDeleted={handleCommentDeleted}
          />
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
