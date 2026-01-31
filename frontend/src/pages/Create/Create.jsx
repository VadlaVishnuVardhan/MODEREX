import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../api/axios";
import { motion } from "framer-motion";

const Create = () => {

  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const [uploadFile, setUploadFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // INPUT HANDLER
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // FILE HANDLER
  const handleFile = (file) => {
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Max 50MB allowed!");
      return;
    }

    const type = file.type.startsWith("video") ? "video" : "image";

    setPreview({
      url: URL.createObjectURL(file),
      type,
    });

    setUploadFile(file);
  };

  // DRAG AND DROP HANDLERS
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  // CLICK TO UPLOAD
  const handleClickUpload = () => {
    fileInputRef.current.click();
  };

  // CREATE POST
  const handleCreatePost = async () => {

    if (!form.title || !form.description || !uploadFile) {
      toast.warn("Fill all fields & upload media!");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("media", uploadFile); // MUST MATCH BACKEND

    setLoading(true);

    try {

      const res = await axiosInstance.post(
        "/posts/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res?.data?.success) {
        toast.success("Post uploaded successfully");

        setForm({ title: "", description: "" });
        setUploadFile(null);
        setPreview(null);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex w-full h-dvh items-center justify-center"
    >

      <div className="max-w-xl w-full bg-white shadow-lg rounded-2xl p-6 border-2 border-blue-500">

        <h2 className="text-xl text-center mb-5 text-blue-500 font-semibold">
          Create Post (Moderex)
        </h2>

        {/* TITLE */}
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Post title..."
          className="w-full p-2 border rounded mb-3"
        />

        {/* DESCRIPTION */}
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Post description..."
          className="w-full p-2 border rounded mb-3"
        />

        {/* FILE UPLOAD AREA */}
        <div
          className={`w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
            isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClickUpload}
        >
          <div className="text-center">
            <p className="text-gray-600">
              {uploadFile ? uploadFile.name : "Drag & drop an image or video here, or click to select"}
            </p>
            <p className="text-sm text-gray-400 mt-1">Max 50MB</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={(e) => handleFile(e.target.files[0])}
          className="hidden"
        />

        {/* PREVIEW */}
        {preview && (
          <div className="mt-3">
            {preview.type === "image" ? (
              <img src={preview.url} className="h-40 w-full object-cover" />
            ) : (
              <video src={preview.url} controls className="h-40 w-full" />
            )}
          </div>
        )}

        {/* SUBMIT */}
        <button
          onClick={handleCreatePost}
          disabled={loading}
          className="w-full mt-4 bg-black text-white p-2 rounded"
        >
          {loading ? "Uploading..." : "Upload Post"}
        </button>

      </div>

    </motion.div>
  );
};

export default Create;
