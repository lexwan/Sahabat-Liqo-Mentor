# TODO: Penyesuaian Frontend React dengan Backend Laravel Sanctum

## 1. Tambahkan endpoint validasi user di `src/api/auth.js`
- [x] Buat fungsi `validateToken()` yang memanggil endpoint protected seperti `/api/dashboard/stats`
- [x] Handle error jika token invalid

## 2. Update `src/hooks/useAuth.js`
- [x] Tambahkan state loading untuk validasi backend
- [x] Panggil `validateToken()` saat aplikasi load
- [x] Update role dan isAuthenticated berdasarkan response backend
- [x] Handle error validasi (logout otomatis)

## 3. Perbaiki `src/routes/ProtectedRoute.jsx`
- [x] Tambahkan loading spinner saat validasi berlangsung
- [x] Update logika validasi role dengan data dari backend
- [x] Pastikan redirect ke dashboard sesuai role yang valid

## 4. Test Implementasi
- [ ] Test login dengan role berbeda
- [ ] Test akses URL manual setelah login (harus redirect sesuai role)
- [ ] Test logout otomatis jika token invalid
- [ ] Test refresh halaman (harus tetap authenticated jika token valid)
