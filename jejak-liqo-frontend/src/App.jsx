import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/auth/Login";
import LoginRedirect from "./components/LoginRedirect";
import AdminDashboard from "./pages/admin/Dashboard";
import KelolaMentee from "./pages/admin/KelolaMentee/KelolaMentee";
import KelolaMentor from "./pages/admin/KelolaMentor/KelolaMentor";
import KelolaLaporan from "./pages/admin/KelolaLaporan/KelolaLaporan";
import LaporanBulananPage from "./pages/admin/KelolaLaporan/LaporanBulananPage";
import CatatanPertemuan from "./pages/admin/CatatanPertemuan/CatatanPertemuan";
import KelolaKelompok from "./pages/admin/KelolaKelompok/KelolaKelompok";
import TambahKelompok from "./pages/admin/KelolaKelompok/TambahKelompok";
import KelolaPengumuman from "./pages/admin/KelolaPengumuman/KelolaPengumuman";
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import KelolaAdmin from "./pages/superadmin/KelolaAdmin/KelolaAdmin";

import AddAdmin from "./pages/superadmin/KelolaAdmin/AddAdmin";
import RecycleBin from "./pages/superadmin/KelolaAdmin/RecycleBin";
import Pengumuman from "./pages/superadmin/Pengumuman";
import MentorDashboard from "./pages/mentor/Dashboard";
import MentorKelolaKelompok from "./pages/mentor/KelolaKelompok/KelolaKelompok";
import MentorTambahKelompok from "./pages/mentor/KelolaKelompok/TambahKelompok";
import MentorTambahMentee from "./pages/mentor/KelolaMentee/TambahMentee";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {

  return (
    <ThemeProvider>
      <Router>
      <Routes>
        {/* Login */}
        <Route path="/" element={<><LoginRedirect /><Login /></>} />
        <Route path="/login" element={<><LoginRedirect /><Login /></>} />

        {/* Dashboard routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-mentee"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KelolaMentee />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-mentor"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KelolaMentor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-laporan"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KelolaLaporan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/laporan-bulanan"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <LaporanBulananPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/catatan-pertemuan"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CatatanPertemuan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-kelompok"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KelolaKelompok />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-kelompok/tambah"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TambahKelompok />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/kelola-pengumuman"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KelolaPengumuman />
            </ProtectedRoute>
          }
        />

        

        <Route
          path="/superadmin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin/kelola-admin"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <KelolaAdmin />
            </ProtectedRoute>
          }
        />



        <Route
          path="/superadmin/add-admin"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <AddAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin/recycle-bin"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <RecycleBin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin/pengumuman"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <Pengumuman />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor/dashboard"
          element={
            <ProtectedRoute allowedRoles={["mentor"]}>
              <MentorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor/kelompok/:id"
          element={
            <ProtectedRoute allowedRoles={["mentor"]}>
              <MentorKelolaKelompok />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor/kelompok/tambah"
          element={
            <ProtectedRoute allowedRoles={["mentor"]}>
              <MentorTambahKelompok />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor/kelompok/:id/kelola-mentee"
          element={
            <ProtectedRoute allowedRoles={["mentor"]}>
              <MentorTambahMentee />
            </ProtectedRoute>
          }
        />



        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;