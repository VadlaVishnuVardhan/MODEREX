import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import CommentsSection from '../../Components/Comments/CommentsSection';
import { resolveUrl } from '../../utils/formatters';

const Home = () => {
  const { search } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axiosInstance.get('/posts', {
        params: {
          search: search || '',
        }
      });
      setPosts(res?.data?.posts || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-10">
        <span className="text-gray-600">Loading feed...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center py-10">
        <span className="text-red-500">{error}</span>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="w-full flex flex-col items-center py-10 gap-2">
        <span className="text-gray-600">No posts found.</span>
        <Link to="/create" className="text-blue-600 hover:underline">Create your first post</Link>
      </div>
    );
  }

  const handlePostUpdate = (postId, updatedPost) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === postId ? updatedPost : post
      )
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-2 pb-10">
      <ul className="flex flex-col gap-6">
        {posts.map((item) => {
          const avatar = resolveUrl(item?.userId?.profile?.url) || '/avatar.jpg';
          const mediaUrl = resolveUrl(item?.image?.url || item?.video?.url);
          const isVideo = Boolean(item?.video?.url);

          return (
            <li key={item._id} className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center gap-3 mb-3">
                <img src={avatar} alt={item?.userId?.name || 'user'} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex flex-col">
                  <span className="font-semibold">{item?.userId?.name || 'Unknown'}</span>
                  <span className="text-xs text-gray-500">{new Date(item?.createdAt || Date.now()).toLocaleString()}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold mb-2">{item?.title}</h3>
              {item?.description && (
                <p className="text-gray-700 mb-3">{item.description}</p>
              )}

              {mediaUrl && (
                <div className="w-full overflow-hidden rounded-lg border mb-4">
                  {isVideo ? (
                    <video controls className="w-full max-h-[520px] bg-black">
                      <source src={mediaUrl} />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img src={mediaUrl} alt={item?.title || 'post'} className="w-full max-h-[520px] object-cover" />
                  )}
                </div>
              )}

              <CommentsSection 
                post={item} 
                onPostUpdate={(updatedPost) => handlePostUpdate(item._id, updatedPost)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Home;
