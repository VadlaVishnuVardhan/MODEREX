import React, { useEffect, useState } from "react";
import { IoMdGrid } from "react-icons/io";
import { SiYoutubeshorts } from "react-icons/si";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../api/axios";
import { resolveUrl } from "../../utils/formatters";

const Profile = () => {

  const { userProfileUpload, logoutUser, authUser, setAuthUser } = useAuth();

  const [previewProfile, setPreviewProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("post");
  const [profileImage, setProfileImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [posts, setPosts] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();



  // ================= FETCH PROFILE =================
  useEffect(() => {

    const fetchProfile = async () => {
      try {

        const userRes = await axiosInstance.get("/auth/profile");
        setAuthUser(userRes?.data?.user);

        const postRes = await axiosInstance.get(`/posts/user/${id}?type=${activeTab}`);
        setPosts(postRes?.data?.posts || []);

      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

  }, [id, activeTab]);

  // ================= PROFILE IMAGE =================
  const handleFile = (file) => {

    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.warn("Max 3MB allowed");
      return;
    }

    setPreviewProfile(URL.createObjectURL(file));
    setProfileImage(file);
  };

  // ================= UPLOAD PROFILE =================
  const handleProfileUpload = async () => {

    if (!profileImage) {
      toast.warn("Select image first");
      return;
    }

    try {

      const res = await userProfileUpload(profileImage);

      if (res?.success) {

        toast.success("Profile updated");

        const authRes = await axiosInstance.get("/auth/profile");
        setAuthUser(authRes?.data?.user);

        setPreviewProfile(null);
        setProfileImage(null);
      }

    } catch {
      toast.error("Upload failed");
    }
  };

  // ================= LOGOUT =================
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  // ================= SWITCH TAB =================
  const switchTab = async (type) => {

    setActiveTab(type);
    setLoadingPosts(true);

    try {

      const res = await axiosInstance.get(`/posts/user/${id}?type=${type}`);
      setPosts(res?.data?.posts || []);

    } catch {
      toast.error("Failed to load posts");
    }

    setLoadingPosts(false);
  };

  // ================= DELETE POST =================
  const handleDelete = async (postId) => {

    if (!window.confirm("Delete this post?")) return;

    try {

      const res = await axiosInstance.delete(`/posts/${postId}`);

      if (res?.data?.success) {
        toast.success("Post deleted");
        switchTab(activeTab);
      }

    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading) {
    return (
      <p className="text-center text-2xl mt-20 text-blue-500">
        Loading profile...
      </p>
    );
  }

  return (
    <div className="flex justify-center py-10">

      <div className="max-w-[900px] w-full px-4">

        {/* PROFILE HEADER */}
        <div className="flex gap-8 items-center bg-white shadow p-6 rounded-lg">

          <div className="relative">

            <img
              src={
                previewProfile ||
                (authUser?.profile?.url
                  ? resolveUrl(authUser.profile.url)
                  : "/avatar.svg")
              }
              className="w-36 h-36 rounded-full border object-cover"
              alt="profile"
            />

            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => handleFile(e.target.files[0])}
            />

          </div>

          <div>
            <h2 className="text-2xl font-bold">
              {authUser?.name}
            </h2>

            <button
              onClick={handleProfileUpload}
              className="bg-blue-600 text-white px-4 py-1 rounded mt-2"
            >
              Save Profile
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-1 rounded mt-2 ml-3"
            >
              Logout
            </button>
          </div>

        </div>

        {/* TABS */}
        <div className="flex gap-10 justify-center border-b mt-8 pb-3">

          <button
            onClick={() => switchTab("post")}
            className={activeTab === "post" ? "text-blue-600" : ""}
          >
            <IoMdGrid /> Posts
          </button>

          <button
            onClick={() => switchTab("reel")}
            className={activeTab === "reel" ? "text-blue-600" : ""}
          >
            <SiYoutubeshorts /> Reels
          </button>

        </div>

        {/* POSTS GRID */}
        <div className="grid grid-cols-3 gap-4 mt-6">

          {loadingPosts ? (
            <p className="col-span-3 text-center">Loading...</p>
          ) : posts.length === 0 ? (
            <p className="col-span-3 text-center">No posts</p>
          ) : (
            posts.map((item) => (

              <div key={item._id} className="border rounded">

                {item.type === "reel" ? (
                  <video
                    src={resolveUrl(item?.video?.url)}
                    className="h-[220px] w-full object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={resolveUrl(item?.image?.url)}
                    className="h-[220px] w-full object-cover"
                    alt="post"
                  />
                )}

                <div className="p-3">
                  <h4>{item.title}</h4>

                  <button
                    onClick={() => handleDelete(item._id)}
                    className="bg-red-500 text-white px-3 py-1 mt-2 rounded"
                  >
                    Delete
                  </button>
                </div>

              </div>

            ))
          )}

        </div>

      </div>

    </div>
  );
};

export default Profile;
