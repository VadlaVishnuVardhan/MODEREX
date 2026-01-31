import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/axios';

const Login = () => {

  const { userLogin, setAuthUser } = useAuth();
  const navigate = useNavigate();

  const loginHandle = async (e) => {

    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {

      // LOGIN API
      const res = await userLogin({ email, password });

      if (res?.success) {

        toast.success(res?.message || "Login successful");

        // FETCH PROFILE AFTER COOKIE SET
        const authRes = await axiosInstance.get('/auth/profile');

        setAuthUser(authRes?.data?.user || null);

        navigate('/');

      }

    } catch (error) {

      toast.error(
        error?.response?.data?.message || "Invalid email or password"
      );

    }

  };

  return (
    <div className="flex items-center justify-center w-full h-dvh relative">

      {/* Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-purple-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />

      {/* LOGIN CARD */}
      <motion.div
        className="max-w-xl w-full shadow-lg bg-white/80 backdrop-blur-md rounded-xl p-8 z-10 flex flex-col gap-6 border"
        initial={{ scale: 0.8, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >

        <motion.h2
          className="text-2xl text-center font-semibold"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Moderex Login
        </motion.h2>

        {/* FORM */}
        <form className="flex flex-col gap-4" onSubmit={loginHandle}>

          <input
            type="email"
            name="email"
            placeholder="Email..."
            required
            className="w-full h-12 border rounded-lg pl-4 outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="Password..."
            required
            className="w-full h-12 border rounded-lg pl-4 outline-none"
          />

          <motion.button
            type="submit"
            className="w-full bg-black text-white h-12 rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
          >
            Sign In
          </motion.button>

        </form>

        {/* REGISTER LINK */}
        <p className="text-center">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-blue-600 font-semibold">
            Sign Up
          </Link>
        </p>

      </motion.div>
    </div>
  );
};

export default Login;
