import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomeLayout from "./pages/HomeLayout/HomeLayout";
import NotFound from "./pages/NotFound/NotFound";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import Post from "./pages/Post/Post";
import Reel from "./pages/Reel/Reel";
import Create from "./pages/Create/Create";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import { ToastContainer } from "react-toastify";
import PrivateRoute from "./Components/PrivateRoute";

function App() {
  return (
    <>
      <BrowserRouter>

        <Routes>

          {/* PROTECTED LAYOUT */}
          <Route path="/" element={<HomeLayout />}>

            <Route
              index
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />

            <Route
              path="reel"
              element={
                <PrivateRoute>
                  <Reel />
                </PrivateRoute>
              }
            />

            <Route
              path="post"
              element={
                <PrivateRoute>
                  <Post />
                </PrivateRoute>
              }
            />

            <Route
              path="create"
              element={
                <PrivateRoute>
                  <Create />
                </PrivateRoute>
              }
            />

            <Route
              path="profile/:id"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            <Route
              path="admin"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

          </Route>

          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>

        {/* TOAST */}
        <ToastContainer position="top-right" autoClose={3000} />

      </BrowserRouter>
    </>
  );
}

export default App;
