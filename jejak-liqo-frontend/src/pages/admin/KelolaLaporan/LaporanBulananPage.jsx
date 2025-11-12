import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../../components/admin/Layout';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import LogoGelap from '../../../assets/images/logo/LogoShaf_Gelap.png';
import LogoTerang from '../../../assets/images/logo/LogoShaf_Terang.png';
import { useTheme } from '../../../hooks/useTheme';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

/*
  Laporan Bulanan Page
  - Filter bulan & tahun
  - Pilih kelompok (bulk select)
  - Tabel data laporan mentoring
  - Label identitas kelompok (Ikhwan/Akhwat)
  - Ekspor PDF & Excel (SheetJS)
  - Riwayat laporan tersimpan di localStorage (fallback). Integrasi API dapat disesuaikan.
*/

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const statusBadge = (status) => {
  const map = {
    Hadir: 'bg-green-100 text-green-800',
    Izin: 'bg-yellow-100 text-yellow-800',
    Sakit: 'bg-blue-100 text-blue-800',
    Alpa: 'bg-red-100 text-red-800'
  };
  const cls = map[status] || 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{status}</span>;
};

// Data akan dimuat dari API backend Laravel

const formatDateIndo = (dateStr) => {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

const buildLabelKelompok = (gender) => gender === 'Ikhwan' ? 'Laporan Kelompok Ikhwan' : 'Laporan Kelompok Akhwat';

const LaporanBulananPage = () => {
  const { isDark } = useTheme();

  const today = new Date();
  const [bulan, setBulan] = useState(today.getMonth()); // 0-11
  const [tahun, setTahun] = useState(today.getFullYear());

  const [groups, setGroups] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [history, setHistory] = useState(() => {
    const raw = localStorage.getItem('laporan_bulanan_history');
    return raw ? JSON.parse(raw) : [];
  });

  useEffect(() => {
    localStorage.setItem('laporan_bulanan_history', JSON.stringify(history));
  }, [history]);

  const tahunOptions = useMemo(() => {
    const current = new Date().getFullYear();
    const arr = [];
    for (let t = current - 4; t <= current + 1; t++) arr.push(t);
    return arr;
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { month: bulan + 1, year: tahun };
      if (selectedGroupIds.length) params.group_ids = selectedGroupIds;
      const { data } = await api.get('/monthly-reports', { params });
      const list = Array.isArray(data?.data) ? data.data : [];
      setReportData(list);
      const listGroups = list.map(g => ({
        id: g.group_id,
        nama: g.group_name,
        gender: g.group_type?.includes('Ikhwan') ? 'Ikhwan' : 'Akhwat',
        mentor: g.mentor_name || '-',
      }));
      setGroups(listGroups);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Gagal memuat data laporan';
      setError(msg);
      if (toast?.error) toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulan, tahun, JSON.stringify(selectedGroupIds)]);

  const tableRows = useMemo(() => {
    let no = 1;
    const rows = [];
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    reportData.forEach(gr => {
      const gMeta = { mentor: gr.mentor_name || '-', nama: gr.group_name || '-', gender: gr.group_type?.includes('Ikhwan') ? 'Ikhwan' : 'Akhwat' };
      const meetings = Array.isArray(gr.meetings) ? gr.meetings : [];
      meetings.forEach(m => {
        const meetingDate = new Date(m.meeting_date);
        const dayName = dayNames[meetingDate.getDay()];
        const info = `${dayName}, ${formatDateIndo(m.meeting_date)} / ${m.meeting_type || '-'} / ${m.topic || '-'}`;
        const attendees = Array.isArray(m.attendances) ? m.attendances : [];
        attendees.forEach(att => {
          rows.push({
            no: no++,
            mentor: gMeta.mentor,
            kelompok: gMeta.nama,
            mentee: att.mentee_name || '-',
            kelas: att.activity_class || '-',
            info,
            kehadiran: att.status || '-',
            gender: gMeta.gender,
          });
        });
      });
    });
    return rows;
  }, [reportData]);

  const labelKelompok = useMemo(() => {
    if (!selectedGroupIds.length) {
      const genders = new Set(reportData.map(d => (d.group_type?.includes('Ikhwan') ? 'Ikhwan' : 'Akhwat')));
      if (genders.size === 1) return buildLabelKelompok([...genders][0]);
      if (genders.size > 1) return 'Laporan Kelompok Ikhwan & Akhwat';
      return 'Laporan Kelompok';
    }
    const genders = new Set(
      groups.filter(g => selectedGroupIds.includes(g.id)).map(g => g.gender)
    );
    if (genders.size === 1) return buildLabelKelompok([...genders][0]);
    return 'Laporan Kelompok Ikhwan & Akhwat';
  }, [groups, selectedGroupIds, reportData]);

  const logoSrc = isDark ? LogoTerang : LogoGelap;

  const handleToggleGroup = (id) => {
    setSelectedGroupIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const handleSelectAll = () => {
    setSelectedGroupIds(groups.map(g => g.id));
  };
  const handleClearSelection = () => setSelectedGroupIds([]);

  const exportFileName = `Laporan-Mentoring-${monthNames[bulan]}-${tahun}${selectedGroupIds.length ? `-${selectedGroupIds.length}Kelompok` : ''}`;

  const recordHistory = (type, filename) => {
    const adminName = JSON.parse(localStorage.getItem('auth_user') || '{}')?.name || 'Admin';
    setHistory(prev => [
      {
        id: `${Date.now()}`,
        type, // PDF or Excel
        filename,
        month: bulan,
        year: tahun,
        groups: selectedGroupIds.length ? selectedGroupIds.length : 'Semua',
        exportedAt: new Date().toISOString(),
        admin: adminName,
      },
      ...prev
    ]);
  };

  const onExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });

    // Header with logo and titles
    const img = new Image();
    img.src = logoSrc;

    const marginX = 14;
    const startY = 12;

    doc.addImage(img, 'PNG', marginX, startY - 8, 24, 24);
    doc.setFontSize(14);
    doc.text('Laporan Kegiatan Mentoring Bulanan', marginX + 30, startY);
    doc.setFontSize(11);
    doc.text(`${labelKelompok}`, marginX + 30, startY + 6);
    doc.setFontSize(10);
    doc.text(`Periode: ${monthNames[bulan]} ${tahun}`, marginX + 30, startY + 12);
    doc.text(`Tanggal Ekspor: ${formatDateIndo(new Date())}`, marginX + 30, startY + 18);

    const head = [[
      'No', 'Mentor', 'Nama Kelompok', 'Nama Lengkap (Mentee)', 'Kelas', 'Hari, Tanggal, Tipe, Pembahasan', 'Kehadiran'
    ]];

    const body = tableRows.map(r => [
      r.no, r.mentor, r.kelompok, r.mentee, r.kelas, r.info, r.kehadiran
    ]);

    autoTable(doc, {
      startY: 32,
      head,
      body,
      styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [33, 150, 243] },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 35 },
        2: { cellWidth: 40 },
        3: { cellWidth: 45 },
        4: { cellWidth: 22 },
        5: { cellWidth: 100 },
        6: { cellWidth: 22 },
      },
      didDrawPage: (data) => {
        // footer page number
        const str = `Halaman ${doc.getNumberOfPages()}`;
        doc.setFontSize(8);
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.getHeight() - 6);
      }
    });

    const filename = `${exportFileName}.pdf`;
    doc.save(filename);
    recordHistory('PDF', filename);
  };

  const onExportExcel = () => {
    const wsData = [
      ['Laporan Kegiatan Mentoring Bulanan'],
      [labelKelompok],
      [`Periode: ${monthNames[bulan]} ${tahun}`],
      [`Tanggal Ekspor: ${formatDateIndo(new Date())}`],
      [],
      ['No', 'Mentor', 'Nama Kelompok', 'Nama Lengkap (Mentee)', 'Kelas', 'Hari, Tanggal, Tipe, Pembahasan', 'Kehadiran'],
      ...tableRows.map(r => [r.no, r.mentor, r.kelompok, r.mentee, r.kelas, r.info, r.kehadiran])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Basic column widths
    const cols = [8, 18, 22, 28, 12, 60, 12].map(wch => ({ wch }));
    ws['!cols'] = cols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan');

    const filename = `${exportFileName}.xlsx`;
    XLSX.writeFile(wb, filename);
    recordHistory('Excel', filename);
  };

  return (
    <Layout role="admin">
      <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Laporan Bulanan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Buat, lihat, dan ekspor laporan kegiatan mentoring per bulan.</p>
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bulan</label>
            <select
              value={bulan}
              onChange={(e) => setBulan(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300"
            >
              {monthNames.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tahun</label>
            <select
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300"
            >
              {tahunOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={onExportPDF} className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700">Ekspor PDF</button>
            <button onClick={onExportExcel} className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700">Ekspor Excel</button>
          </div>
        </div>

        {/* Group select */}
        <div className="mb-4 border rounded p-3 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="font-medium">Pilih Kelompok (Bulk)</div>
            <div className="flex gap-2">
              <button onClick={handleSelectAll} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-600">Pilih Semua</button>
              <button onClick={handleClearSelection} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-600">Kosongkan</button>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-2">
            {groups.map(g => (
              <label key={g.id} className="flex items-center gap-2 border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  checked={selectedGroupIds.includes(g.id)}
                  onChange={() => handleToggleGroup(g.id)}
                />
                <div>
                  <div className="font-medium">{g.nama}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Mentor: {g.mentor} • {g.gender}</div>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Label: {labelKelompok}</div>
        </div>

        {/* Table */}
        <div className="border rounded overflow-x-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2 text-left font-medium tracking-wider">No</th>
                <th className="px-3 py-2 text-left font-medium tracking-wider">Mentor</th>
                <th className="px-3 py-2 text-left font-medium tracking-wider">Nama Kelompok</th>
                <th className="px-3 py-2 text-left font-medium tracking-wider">Nama Lengkap (Mentee)</th>
                <th className="px-3 py-2 text-left font-medium tracking-wider">Kelas</th>
                <th className="px-3 py-2 text-left font-medium tracking-wider">Hari, Tanggal, Tipe, Pembahasan</th>
                <th className="px-3 py-2 text-left font-medium tracking-wider">Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {(loading || error || tableRows.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-gray-500 dark:text-gray-400">{loading ? 'Memuat data...' : (error || 'Belum ada data untuk periode ini.')}</td>
                </tr>
              )}
              {tableRows.map((r) => (
                <tr key={`${r.no}-${r.mentee}-${r.info}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 py-2">{r.no}</td>
                  <td className="px-3 py-2">{r.mentor}</td>
                  <td className="px-3 py-2">{r.kelompok}</td>
                  <td className="px-3 py-2">{r.mentee}</td>
                  <td className="px-3 py-2">{r.kelas}</td>
                  <td className="px-3 py-2 whitespace-pre-line">{r.info}</td>
                  <td className="px-3 py-2">{statusBadge(r.kehadiran)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* History */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Riwayat Laporan</h2>
          <div className="border rounded overflow-x-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left font-medium tracking-wider">Nama File</th>
                  <th className="px-3 py-2 text-left font-medium tracking-wider">Periode</th>
                  <th className="px-3 py-2 text-left font-medium tracking-wider">Jumlah Kelompok</th>
                  <th className="px-3 py-2 text-left font-medium tracking-wider">Tanggal Ekspor</th>
                  <th className="px-3 py-2 text-left font-medium tracking-wider">Admin</th>
                  <th className="px-3 py-2 text-left font-medium tracking-wider">Tipe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {history.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-gray-500 dark:text-gray-400">Belum ada riwayat ekspor.</td>
                  </tr>
                )}
                {history.map(h => (
                  <tr key={h.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 py-2">{h.filename}</td>
                    <td className="px-3 py-2">{monthNames[h.month]} {h.year}</td>
                    <td className="px-3 py-2">{h.groups}</td>
                    <td className="px-3 py-2">{formatDateIndo(h.exportedAt)}</td>
                    <td className="px-3 py-2">{h.admin}</td>
                    <td className="px-3 py-2">{h.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LaporanBulananPage;
