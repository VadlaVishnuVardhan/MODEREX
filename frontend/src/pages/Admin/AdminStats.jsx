import { FaExclamationCircle, FaClock, FaCheck, FaTimes } from 'react-icons/fa';

const AdminStats = ({ stats }) => {
  const statCards = [
    {
      label: 'Total Flagged',
      value: stats.totalFlagged,
      icon: FaExclamationCircle,
      color: 'blue',
    },
    {
      label: 'Pending Review',
      value: stats.pending,
      icon: FaClock,
      color: 'yellow',
    },
    {
      label: 'Approved',
      value: stats.approved,
      icon: FaCheck,
      color: 'green',
    },
    {
      label: 'Rejected',
      value: stats.rejected,
      icon: FaTimes,
      color: 'red',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow-sm p-6 border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${colorClasses[stat.color]}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminStats;
