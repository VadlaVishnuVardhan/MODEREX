import { resolveUrl, formatDate } from '../../utils/formatters';
import { FaCheck, FaTimes, FaExclamationTriangle, FaTrash, FaUserTimes, FaEye } from 'react-icons/fa';

const FlaggedContentTable = ({ flaggedContent, onReview, onAction }) => {
  if (!flaggedContent || flaggedContent.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No flagged content found
      </div>
    );
  }

  const getCategoryBadges = (moderation) => {
    if (!moderation?.categories) return null;
    
    const flaggedCategories = Object.entries(moderation.categories)
      .filter(([_, isFlagged]) => isFlagged)
      .map(([category]) => category);

    return flaggedCategories.map((category) => (
      <span
        key={category}
        className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full mr-1 mb-1"
      >
        {category}
      </span>
    ));
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              User
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Content
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Flagged For
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {flaggedContent.map((item) => (
            <tr key={item._id} className="hover:bg-gray-50">
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <img
                    src={resolveUrl(item.userId?.profile?.url) || '/avatar.jpg'}
                    alt={item.userId?.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.userId?.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.userId?.email}
                    </div>
                  </div>
                </div>
              </td>
              
              <td className="px-4 py-4 max-w-xs">
                <p className="text-sm text-gray-900 line-clamp-2">
                  {item.text}
                </p>
              </td>
              
              <td className="px-4 py-4">
                <span className="text-sm text-gray-900 capitalize">
                  {item.contentType}
                </span>
              </td>
              
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-1">
                  {getCategoryBadges(item.moderation)}
                </div>
              </td>
              
              <td className="px-4 py-4">
                {getStatusBadge(item.status)}
              </td>
              
              <td className="px-4 py-4 text-sm text-gray-500">
                {formatDate(item.createdAt)}
              </td>
              
              <td className="px-4 py-4">
                <div className="flex gap-1 flex-wrap">
                  {item.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onReview(item._id, 'approve')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                        title="Approve"
                      >
                        <FaCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onAction(item._id, 'delete')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onAction(item._id, 'warn')}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded transition"
                        title="Warn"
                      >
                        <FaExclamationTriangle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onAction(item._id, 'suspend')}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded transition"
                        title="Suspend"
                      >
                        <FaUserTimes className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onAction(item._id, 'view')}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                    title="View"
                  >
                    <FaEye className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FlaggedContentTable;
