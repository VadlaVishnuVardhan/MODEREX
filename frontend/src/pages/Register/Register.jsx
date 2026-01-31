import useAuth from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Register = () => {

  const { userRegister } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {

    e.preventDefault();

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {

      const res = await userRegister({ name, email, password });

      if (res?.success) {
        toast.success(res?.message || "Registered successfully");
        navigate('/login');
      }

    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <motion.div
      className="flex items-center justify-center w-full h-dvh bg-gradient-to-br from-gray-100 to-gray-300"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >

      <motion.div
        className="max-w-xl w-full bg-white shadow-xl p-8 rounded-2xl flex flex-col gap-6 border-2 border-blue-500"
        initial={{ scale: 0.8, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >

        {/* TITLE */}
        <motion.h2
          className="text-2xl font-semibold text-center"
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Moderex Sign Up
        </motion.h2>

        {/* FORM */}
        <form className="flex flex-col gap-4" onSubmit={handleRegister}>

          <input
            type="text"
            name="name"
            required
            placeholder="Name..."
            className="w-full h-12 border pl-4 rounded-md outline-none"
          />

          <input
            type="email"
            name="email"
            required
            placeholder="Email..."
            className="w-full h-12 border pl-4 rounded-md outline-none"
          />

          <input
            type="password"
            name="password"
            required
            placeholder="Password..."
            className="w-full h-12 border pl-4 rounded-md outline-none"
          />

          <motion.button
            type="submit"
            className="w-full h-12 bg-black text-white rounded-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign Up
          </motion.button>

        </form>

        {/* LOGIN LINK */}
        <p className="text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold underline"
          >
            Sign In
          </Link>
        </p>

      </motion.div>

    </motion.div>
  );
};

export default Register;
