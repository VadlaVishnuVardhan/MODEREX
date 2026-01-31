import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import FlaggedContentTable from './FlaggedContentTable';
import AdminStats from './AdminStats';
import FilterPanel from './FilterPanel';

const AdminDashboard = () => {
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'pending',
    contentType: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [flaggedRes, statsRes] = await Promise.all([
        axiosInstance.get('/admin/flagged', { params: filters }),
        axiosInstance.get('/admin/stats'),
      ]);

      if (flaggedRes.data.success) {
        setFlaggedContent(flaggedRes.data.flaggedContent);
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Admin access required');
        navigate('/');
      } else {
        toast.error('Failed to load admin data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (flaggedId, action) => {
    try {
      const res = await axiosInstance.post(
        `/admin/flagged/${flaggedId}/review`,
        { action }
      );

      if (res.data.success) {
        toast.success(`Content ${action}ed successfully`);
        fetchData();
      }
    } catch (error) {
      toast.error(`Failed to ${action} content`);
    }
  };

  const handleAction = async (flaggedId, action) => {
    try {
      let endpoint = `/admin/flagged/${flaggedId}/action`;
      let data = { action };

      if (action === 'view') {
        // For view, we might want to open a modal or navigate to detail page
        toast.info('View functionality not implemented yet');
        return;
      }

      const res = await axiosInstance.post(endpoint, data);

      if (res.data.success) {
        toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} action completed`);
        fetchData();
      }
    } catch (error) {
      toast.error(`Failed to ${action} content`);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-600">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage and review flagged content from AI moderation
        </p>
      </div>

      {stats && <AdminStats stats={stats} />}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Flagged Content</h2>
          <FilterPanel filters={filters} onFilterChange={setFilters} />
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading...</div>
        ) : (
          <FlaggedContentTable
            flaggedContent={flaggedContent}
            onReview={handleReview}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
