import { TiHome } from "react-icons/ti";
import { SiYoutubeshorts, SiReaddotcv } from "react-icons/si";
import { FiPlusSquare } from "react-icons/fi";
import { FaShieldAlt } from "react-icons/fa";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import { resolveUrl } from "../../utils/formatters";

const navLinks = [
  {
    link: "home",
    icon: <TiHome size={"1.5rem"} />,
    to: "/",
  },
  {
    link: "reel",
    icon: <SiYoutubeshorts size={"1.5rem"} />,
    to: "/reel",
  },
  {
    link: "post",
    icon: <SiReaddotcv size={"1.5rem"} />,
    to: "/post",
  },
  {
    link: "create",
    icon: <FiPlusSquare size={"1.5rem"} />,
    to: "/create",
  },
];

const Sidebar = () => {

  const { authUser } = useAuth();

  return (
    <motion.div
      initial={{ x: -200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="max-w-[260px] w-full h-screen border-r bg-white shadow-md px-6 py-10 fixed left-0 top-0 z-20"
    >
      <div className="flex flex-col gap-12">

        {/* LOGO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pl-3"
        >
          <Link to="/">
            <motion.span
              className="text-3xl font-semibold tracking-wide"
              animate={{
                rotate: [0, 3, -3, 0],
                color: ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#2563eb"]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              MODEREX
            </motion.span>
          </Link>
        </motion.div>

        {/* NAV LINKS */}
        <motion.ul
          className="flex flex-col gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {navLinks.map((item, index) => (
            <motion.li
              key={index}
              whileHover={{ scale: 1.03, x: 5 }}
              transition={{ stiffness: 120 }}
              className="rounded-lg"
            >
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg transition ${
                    isActive
                      ? "text-blue-600 font-bold bg-blue-100"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                {item.icon} {item.link}
              </NavLink>
            </motion.li>
          ))}
        </motion.ul>

        {/* PROFILE */}
        {authUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-5 border-t"
          >
            <motion.div whileHover={{ scale: 1.03, x: 5 }}>
              <Link
                to={`/profile/${authUser?._id}`}
                className="flex items-center gap-3 p-3 font-semibold text-gray-800 hover:bg-gray-100 rounded-lg transition"
              >
                <img
                  className="w-8 h-8 rounded-full object-cover border"
                  src={resolveUrl(authUser?.profile?.url) || "/avatar.jpg"}
                  alt="profile"
                />
                Profile
              </Link>
            </motion.div>

            {/* ADMIN LINK */}
            {authUser?.isAdmin && (
              <motion.div whileHover={{ scale: 1.03, x: 5 }} className="mt-2">
                <Link
                  to="/admin"
                  className="flex items-center gap-3 p-3 font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <FaShieldAlt className="w-5 h-5" />
                  Admin Dashboard
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}

      </div>
    </motion.div>
  );
};

export default Sidebar;
