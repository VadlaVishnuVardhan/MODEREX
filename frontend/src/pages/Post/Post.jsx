import { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth";
import { Link } from "react-router-dom";

const Post = () => {

  const { search } = useAuth();
  const [posts, setPosts] = useState([]);

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {

    const fetchPosts = async () => {
      try {

        const res = await axiosInstance.get(
          `/posts?search=${search || ""}`
        );

        setPosts(res?.data?.posts || []);

      } catch (error) {
        toast.error("Failed to fetch posts");
        setPosts([]);
      }
    };

    fetchPosts();

  }, [search]);

  return (
    <div className="flex flex-col items-center gap-8 px-4 pb-10">

      {posts.map((item) => (

        <div
          key={item._id}
          className="max-w-[470px] w-full bg-white rounded-xl shadow-sm hover:shadow-md transition"
        >

          {/* USER */}
          <Link to={`/profile/${item?.userId?._id}`}>
            <div className="flex items-center gap-3 p-4 border-b">

              <img
                src={
                  item?.userId?.profile?.url?.startsWith("http")
                    ? item.userId.profile.url
                    : item?.userId?.profile?.url
                    ? `${BASE_URL}${item.userId.profile.url}`
                    : "/avatar.jpg"
                }
                className="w-10 h-10 rounded-full object-cover"
                alt="profile"
              />

              <h5 className="font-semibold capitalize">
                {item?.userId?.name}
              </h5>

            </div>
          </Link>

          {/* MEDIA */}
          <div className="mt-3">

            {item.type === "reel" ? (
              <video
                src={
                  item?.video?.url?.startsWith("http")
                    ? item.video.url
                    : item?.video?.url
                    ? `${BASE_URL}${item.video.url}`
                    : null
                }
                className="w-full h-[420px] object-cover"
                controls
              />
            ) : (
              <img
                src={
                  item?.image?.url?.startsWith("http")
                    ? item.image.url
                    : item?.image?.url
                    ? `${BASE_URL}${item.image.url}`
                    : null
                }
                alt={item?.title}
                className="w-full h-[420px] object-cover"
              />
            )}

          </div>

          {/* CONTENT */}
          <div className="p-4">

            <h4 className="font-bold">
              {item?.title}
            </h4>

            <p className="text-gray-700">
              {item?.description}
            </p>

          </div>

        </div>

      ))}

    </div>
  );
};

export default Post;
