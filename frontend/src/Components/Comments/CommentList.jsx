import CommentItem from './CommentItem';

const CommentList = ({ comments = [], postId, onCommentDeleted }) => {
  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {comments.map((comment) => (
        <CommentItem
          key={comment._id}
          comment={comment}
          postId={postId}
          onCommentDeleted={onCommentDeleted}
        />
      ))}
    </div>
  );
};

export default CommentList;
