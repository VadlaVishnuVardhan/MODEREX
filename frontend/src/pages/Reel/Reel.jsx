import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import axiosInstance from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import { resolveUrl } from "../../utils/formatters";

const Reel = () => {

  const { search } = useAuth();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchReels = async () => {

      try {
        setLoading(true);

        const res = await axiosInstance.get(
          `/posts?type=reel&search=${search || ""}`
        );

        setReels(res?.data?.posts || []);

      } catch {
        toast.error("Failed to load reels");
        setReels([]);
      } finally {
        setLoading(false);
      }

    };

    fetchReels();

  }, [search]);

  return (
    <div className="flex flex-col items-center gap-6 pb-10">

      {/* LOADING */}
      {loading && (
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-full max-w-[470px] p-4 bg-gray-200 rounded-xl h-[500px]"
        />
      )}

      {/* EMPTY */}
      {!loading && reels.length === 0 && (
        <p className="text-lg text-gray-500">
          No reels found
        </p>
      )}

      {/* REELS */}
      {!loading && reels.map((item) => (

        <motion.div
          key={item._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-[470px] w-full bg-white shadow rounded-lg"
        >

          {/* USER */}
          <Link to={`/profile/${item?.userId?._id}`}>
            <div className="flex items-center gap-3 p-4 border-b">

              <img
                src={resolveUrl(item?.userId?.profile?.url) || "/avatar.jpg"}
                className="w-10 h-10 rounded-full object-cover"
                alt="profile"
              />

              <h5 className="font-semibold capitalize">
                {item?.userId?.name}
              </h5>

            </div>
          </Link>

          {/* VIDEO */}
          <div className="h-[450px]">

            <video
              src={
                item?.video?.url?.startsWith("http")
                  ? item.video.url
                  : item?.video?.url
                  ? `${BASE_URL}${item.video.url}`
                  : null
              }
              controls
              className="w-full h-full object-cover"
            />

          </div>

          {/* TEXT */}
          <div className="p-4">

            <h4 className="font-semibold">
              {item?.title}
            </h4>

            <p className="text-gray-600">
              {item?.description}
            </p>

          </div>

        </motion.div>

      ))}

    </div>
  );
};

export default Reel;
