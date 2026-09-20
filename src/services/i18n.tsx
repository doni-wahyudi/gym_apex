import React, { createContext, useContext, useState } from 'react';

export type Language = 'id' | 'en';

const LANG_STORAGE_KEY = 'apex_gym_language';

export const TRANSLATIONS = {
  id: {
    // Navigation
    'nav.dashboard': 'Dasbor Utama',
    'nav.checkin': 'Kios Check-In',
    'nav.pos': 'Kasir POS',
    'nav.members': 'CRM Anggota',
    'nav.fitness': 'Kebugaran & PR',
    'nav.schedule': 'Jadwal Kelas & PT',
    'nav.equipment': 'Kelola Peralatan',
    'nav.portal': 'Portal Anggota',
    'nav.home': 'Beranda',
    'nav.access': 'Akses',
    'nav.more': 'Menu',
    'nav.member_view': 'Khusus Member',

    // Roles
    'role.owner': 'Marcus Vance (Pemilik / Admin)',
    'role.front_desk': 'Sarah Jenkins (Resepsionis)',
    'role.trainer': 'Coach Tyson (Pelatih Utama)',
    'role.member': 'Alex Wright (Member Mandiri)',
    'role.title_owner': 'Pemilik & Admin Gym',
    'role.title_front_desk': 'Staf Resepsionis',
    'role.title_trainer': 'Pelatih Utama',
    'role.title_member': 'Member Aktif',
    'role.current_role': 'Peran Pengguna:',
    'role.simulate_role': 'Simulasi Peran Pengguna:',

    // Header & Actions
    'header.quick_checkin': 'Check-In Cepat',
    'header.quick_sale': 'Penjualan Cepat',
    'header.staff_shifts': 'Shift Staf & Gaji',
    'header.settings': 'Pengaturan',
    'header.inside': 'Di Dalam Fasilitas',
    'header.capacity': 'Kapasitas',
    'header.cloud_connected': 'Supabase Terhubung',
    'header.local_mode': 'Mode Offline Lokal',

    // Dashboard
    'dash.title': 'Pusat Komando Gym HQ',
    'dash.subtitle': 'Okupansi real-time, perputaran kasir harian, dan metrik retensi anggota.',
    'dash.today_revenue': 'Pendapatan Hari Ini',
    'dash.active_members': 'Member Aktif',
    'dash.occupancy': 'Tingkat Okupansi',
    'dash.at_risk_churn': 'Radar Member Berisiko',
    'dash.at_risk_desc': 'Anggota yang belum berkunjung lebih dari 14 hari atau hampir habis.',
    'dash.peak_hours': 'Peta Jam Sibuk (Hari Ini)',
    'dash.renew_pos': 'Perpanjang di POS',
    'dash.recent_sales': 'Transaksi Kasir Terkini',
    'dash.view_all_sales': 'Lihat Semua Transaksi',
    'dash.no_sales': 'Belum ada penjualan tercatat hari ini.',

    // Check In
    'checkin.title': 'Check-In Meja Depan',
    'checkin.subtitle': 'Pindai QR kode, kartu barcode, atau pencarian manual untuk verifikasi masuk.',
    'checkin.tablet_kiosk': 'Mode Kios Tablet',
    'checkin.scan_input': 'Pindai barcode atau ketik ID (AF-1001)...',
    'checkin.verify_btn': 'Verifikasi Masuk',
    'checkin.camera_btn': 'Kamera',
    'checkin.access_granted': 'AKSES DIBERIKAN',
    'checkin.access_denied': 'AKSES DITOLAK',
    'checkin.welcome_back': 'Selamat datang kembali',
    'checkin.test_simulation': 'SIMULASI UJI CEPAT:',
    'checkin.recent_checkins': 'Daftar Kunjungan Hari Ini',
    'checkin.manual_search': 'Atau Cari Berdasarkan Nama:',
    'checkin.checkout_btn': 'Check-Out',
    'checkin.inside_now': 'Sedang Berada di Dalam',
    'checkin.time_in': 'Jam Masuk',

    // Tablet Kiosk
    'kiosk.welcome': 'SELAMAT DATANG DI APEXFORGE',
    'kiosk.prompt': 'Masukkan 4 digit kode member atau nomor HP Anda:',
    'kiosk.staff_exit': 'Keluar Staf',
    'kiosk.staff_pin_prompt': 'Masukkan PIN Staf 4-digit untuk keluar:',
    'kiosk.unlock': 'Buka & Keluar',
    'kiosk.back': 'Kembali',

    // POS
    'pos.title': 'Toko Pro & Kasir Gym',
    'pos.subtitle': 'Proses pembelian suplemen, paket membership, dan sesi pelatihan pribadi.',
    'pos.search_placeholder': 'Cari produk, merk, atau SKU...',
    'pos.cash_drawer': 'Laci Kas',
    'pos.invoices': 'Riwayat Struk',
    'pos.ticket_title': 'Struk Pembelian Saat Ini',
    'pos.walk_in': 'Tamu Non-Member',
    'pos.discount': 'Diskon',
    'pos.tax': 'Pajak (8%)',
    'pos.subtotal': 'Subtotal',
    'pos.total_due': 'Total Tagihan',
    'pos.charge': 'Bayar Sekarang',
    'pos.clear': 'Bersihkan',
    'pos.empty_ticket': 'Keranjang masih kosong.',
    'pos.view_ticket': 'Lihat Tagihan',
    'pos.select_payment': 'Pilih Metode Pembayaran',
    'pos.thermal_receipt': 'Struk Thermal 58mm',
    'pos.whatsapp_receipt': 'Kirim Struk via WhatsApp',
    'pos.category_all': 'Semua',
    'pos.category_supplements': 'Suplemen',
    'pos.category_beverages': 'Minuman',
    'pos.category_gear': 'Aksesoris',
    'pos.category_membership': 'Paket Member',
    'pos.category_pt': 'Sesi PT',
    'pos.method_cash': 'Uang Tunai',
    'pos.method_card': 'Kartu Debit/Kredit',
    'pos.method_qris': 'QRIS / E-Wallet',
    'pos.cash_tendered': 'Uang Diterima',
    'pos.change_due': 'Uang Kembalian',
    'pos.complete_order': 'Selesaikan Pembayaran',
    'pos.stock': 'Stok:',

    // Members
    'members.title': 'Direktori Anggota',
    'members.subtitle': 'Kelola basis data atlet, langganan paket, dan peringatan retensi.',
    'members.add_member': '+ Tambah Anggota',
    'members.search_placeholder': 'Cari nama, email, nomor HP, kode...',
    'members.all': 'Semua',
    'members.active': 'Aktif',
    'members.expiring': 'Segera Habis',
    'members.at_risk': 'Berisiko',
    'members.expired': 'Kadaluarsa',
    'members.view_profile': 'Lihat Profil',
    'members.membership_tier': 'Paket',
    'members.expiry_date': 'Masa Berlaku',
    'members.last_visit': 'Kunjungan Terakhir',
    'members.renew': 'Perpanjang',

    // Fitness
    'fitness.title': 'Pelacak Kebugaran & PR',
    'fitness.subtitle': 'Pantau komposisi berat badan dan cetak rekor angkatan terbaru.',
    'fitness.add_pr': '+ Catat Rekor (PR)',
    'fitness.add_metric': '+ Catat Metrik Tubuh',
    'fitness.body_comp': 'Tren Komposisi Tubuh',
    'fitness.pr_hall': 'Hall of Fame Rekor Pribadi',
    'fitness.weight': 'Berat Badan (kg)',
    'fitness.body_fat': 'Lemak Tubuh (%)',
    'fitness.muscle_mass': 'Massa Otot (kg)',
    'fitness.routines': 'Rutinitas & Program Latihan',
    'fitness.select_member': 'Pilih Anggota:',

    // Schedule
    'schedule.title': 'Jadwal Kelas & Sesi PT',
    'schedule.subtitle': 'Jadwal latihan kelompok mingguan dan daftar instruktur profesional.',
    'schedule.book_spot': 'Pesan Slot',
    'schedule.booked': 'Terisi Penuh',
    'schedule.capacity': 'Kapasitas',
    'schedule.coach': 'Pelatih',

    // Equipment
    'equipment.title': 'Manajemen Peralatan Gym',
    'equipment.subtitle': 'Pantau kondisi mesin latihan, beban bebas, dan jadwal servis berkala.',
    'equipment.operational': 'Berfungsi Baik',
    'equipment.maintenance': 'Perlu Perawatan',
    'equipment.out_of_order': 'Rusak / Nonaktif',
    'equipment.update_status': 'Ubah Status',

    // Staff
    'staff.title': 'Shift Staf & Buku Bagi Hasil PT',
    'staff.clock_in': 'Presensi Masuk',
    'staff.clock_out': 'Presensi Keluar',
    'staff.commission_calc': 'Kalkulator Komisi Pelatih',
    'staff.gross_revenue': 'Total Pendapatan Sesi',
    'staff.gym_profit': 'Keuntungan Gym',
    'staff.trainer_payout': 'Estimasi Bagi Hasil Pelatih',

    // Portal
    'portal.title': 'Portal Mandiri Anggota',
    'portal.digital_pass': 'Kartu Member Digital',
    'portal.todays_workout': 'Latihan Hari Ini',
    'portal.book_classes': 'Daftar Kelas',
    'portal.my_progress': 'Kemajuan Saya',
    'portal.back_admin': 'Kembali ke Admin OS',
    'portal.show_qr': 'Pindai kode QR ini di pintu masuk gym.',

    // Themes & Settings
    'settings.title': 'Pengaturan & Cloud Supabase',
    'settings.language': 'Bahasa Sistem',
    'settings.language_desc': 'Default Bahasa Indonesia. Anda dapat beralih ke Bahasa Inggris kapan saja.',
    'settings.theme': 'Tema Warna Tampilan (5 Pilihan)',
    'settings.theme_desc': 'Pilih dari 5 tema warna atletik yang energik untuk tampilan sistem.',
    'settings.close': 'Tutup',
    'settings.save': 'Simpan Pengaturan',

    // Days of week
    'days.sun': 'Minggu',
    'days.mon': 'Senin',
    'days.tue': 'Selasa',
    'days.wed': 'Rabu',
    'days.thu': 'Kamis',
    'days.fri': 'Jumat',
    'days.sat': 'Sabtu',

    // Common
    'common.save': 'Simpan',
    'common.cancel': 'Batal',
    'common.close': 'Tutup',
    'common.search': 'Cari',
    'common.edit': 'Ubah',
    'common.delete': 'Hapus',
    'common.confirm': 'Konfirmasi',
    'common.status': 'Status',
    'common.all': 'Semua',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Executive Dashboard',
    'nav.checkin': 'Check-In Kiosk',
    'nav.pos': 'POS Register',
    'nav.members': 'Members CRM',
    'nav.fitness': 'Fitness & PRs',
    'nav.schedule': 'Classes & Schedule',
    'nav.equipment': 'Equipment Manager',
    'nav.portal': 'Member Portal',
    'nav.home': 'Home',
    'nav.access': 'Access',
    'nav.more': 'More',
    'nav.member_view': 'Member View',

    // Roles
    'role.owner': 'Marcus Vance (Owner / Admin)',
    'role.front_desk': 'Sarah Jenkins (Front Desk)',
    'role.trainer': 'Coach Tyson (Head Coach)',
    'role.member': 'Alex Wright (Pro Member)',
    'role.title_owner': 'Gym Owner & Admin',
    'role.title_front_desk': 'Front Desk Officer',
    'role.title_trainer': 'Head Strength Coach',
    'role.title_member': 'Pro Member',
    'role.current_role': 'Current Role:',
    'role.simulate_role': 'Simulate User Role:',

    // Header & Actions
    'header.quick_checkin': 'Quick Check-In',
    'header.quick_sale': 'Quick Sale',
    'header.staff_shifts': 'Staff Shifts & Payroll',
    'header.settings': 'Settings',
    'header.inside': 'Inside Facility',
    'header.capacity': 'Capacity',
    'header.cloud_connected': 'Supabase Connected',
    'header.local_mode': 'Local Offline Mode',

    // Dashboard
    'dash.title': 'ApexForge Gym HQ',
    'dash.subtitle': 'Real-time facility occupancy, POS daily turnover, and member retention metrics.',
    'dash.today_revenue': "Today's Revenue",
    'dash.active_members': 'Active Members',
    'dash.occupancy': 'Facility Occupancy',
    'dash.at_risk_churn': 'At-Risk Members (Churn Radar)',
    'dash.at_risk_desc': 'Members inactive over 14 days or expiring soon.',
    'dash.peak_hours': 'Hourly Traffic Heatmap (Today)',
    'dash.renew_pos': 'Renew at POS',
    'dash.recent_sales': 'Live POS Sales Stream',
    'dash.view_all_sales': 'View All Sales History',
    'dash.no_sales': 'No sales recorded yet today.',

    // Check In
    'checkin.title': 'Front Desk Check-In',
    'checkin.subtitle': 'Scan member QR code, barcode ID, or manual lookup for instant facility admission.',
    'checkin.tablet_kiosk': 'Tablet Kiosk Mode',
    'checkin.scan_input': 'Scan barcode or type AF-1001...',
    'checkin.verify_btn': 'Verify Entry',
    'checkin.camera_btn': 'Camera',
    'checkin.access_granted': 'ACCESS GRANTED',
    'checkin.access_denied': 'ACCESS DENIED',
    'checkin.welcome_back': 'Welcome back',
    'checkin.test_simulation': '1-CLICK TEST SIMULATION:',
    'checkin.recent_checkins': "Today's Attendance Roster",
    'checkin.manual_search': 'Or Search Member by Name:',
    'checkin.checkout_btn': 'Check-Out',
    'checkin.inside_now': 'Currently Inside Facility',
    'checkin.time_in': 'Time In',

    // Tablet Kiosk
    'kiosk.welcome': 'WELCOME TO APEXFORGE',
    'kiosk.prompt': 'Enter your 4-digit member code or mobile number:',
    'kiosk.staff_exit': 'Staff Exit',
    'kiosk.staff_pin_prompt': 'Enter 4-digit staff PIN to unlock:',
    'kiosk.unlock': 'Unlock & Exit',
    'kiosk.back': 'Back',

    // POS
    'pos.title': 'Gym Pro Shop & POS',
    'pos.subtitle': 'Process retail purchases, membership packages, and personal training enrollments.',
    'pos.search_placeholder': 'Search item name, brand, or SKU...',
    'pos.cash_drawer': 'Cash Drawer',
    'pos.invoices': 'Invoices',
    'pos.ticket_title': 'Current Ticket',
    'pos.walk_in': 'Walk-in Guest',
    'pos.discount': 'Discount',
    'pos.tax': 'Tax (8%)',
    'pos.subtotal': 'Subtotal',
    'pos.total_due': 'Total Due',
    'pos.charge': 'Charge Now',
    'pos.clear': 'Clear Ticket',
    'pos.empty_ticket': 'Ticket is empty.',
    'pos.view_ticket': 'View Ticket',
    'pos.select_payment': 'Select Payment Method',
    'pos.thermal_receipt': '58mm Thermal Roll Tape',
    'pos.whatsapp_receipt': 'Send WhatsApp Receipt',
    'pos.category_all': 'All',
    'pos.category_supplements': 'Supplements',
    'pos.category_beverages': 'Beverages',
    'pos.category_gear': 'Gear',
    'pos.category_membership': 'Memberships',
    'pos.category_pt': 'PT Sessions',
    'pos.method_cash': 'Cash Tender',
    'pos.method_card': 'Debit / Credit Card',
    'pos.method_qris': 'QRIS / E-Wallet',
    'pos.cash_tendered': 'Cash Tendered',
    'pos.change_due': 'Change Due',
    'pos.complete_order': 'Complete Payment',
    'pos.stock': 'Stock:',

    // Members
    'members.title': 'Member Directory',
    'members.subtitle': 'Manage athlete database, membership tiers, and churn retention alerts.',
    'members.add_member': '+ Add Member',
    'members.search_placeholder': 'Search by name, email, phone, code...',
    'members.all': 'All',
    'members.active': 'Active',
    'members.expiring': 'Expiring Soon',
    'members.at_risk': 'At-Risk',
    'members.expired': 'Expired',
    'members.view_profile': 'View Profile',
    'members.membership_tier': 'Tier',
    'members.expiry_date': 'Expiry Date',
    'members.last_visit': 'Last Visit',
    'members.renew': 'Renew',

    // Fitness
    'fitness.title': 'Fitness & PR Tracker',
    'fitness.subtitle': 'Track body composition metrics and log personal bests.',
    'fitness.add_pr': '+ Add PR',
    'fitness.add_metric': '+ Log Body Metric',
    'fitness.body_comp': 'Body Composition Trend',
    'fitness.pr_hall': 'Personal Records Hall of Fame',
    'fitness.weight': 'Weight (kg)',
    'fitness.body_fat': 'Body Fat (%)',
    'fitness.muscle_mass': 'Muscle Mass (kg)',
    'fitness.routines': 'Workout Routines',
    'fitness.select_member': 'Select Member:',

    // Schedule
    'schedule.title': 'Class Schedule & PT',
    'schedule.subtitle': 'Weekly group timetable and certified trainer roster.',
    'schedule.book_spot': 'Book Spot',
    'schedule.booked': 'Booked',
    'schedule.capacity': 'Capacity',
    'schedule.coach': 'Coach',

    // Equipment
    'equipment.title': 'Equipment Manager',
    'equipment.subtitle': 'Track workout machinery status, condition tags, and maintenance.',
    'equipment.operational': 'Operational',
    'equipment.maintenance': 'Needs Service',
    'equipment.out_of_order': 'Out of Order',
    'equipment.update_status': 'Update Status',

    // Staff
    'staff.title': 'Staff Shifts & PT Commission Ledger',
    'staff.clock_in': 'Clock In',
    'staff.clock_out': 'Clock Out',
    'staff.commission_calc': 'Trainer Commission Ledger',
    'staff.gross_revenue': 'Gross Session Revenue',
    'staff.gym_profit': 'Gym Retained Profit',
    'staff.trainer_payout': 'Trainer Net Payout',

    // Portal
    'portal.title': 'Member Self-Service Portal',
    'portal.digital_pass': 'Digital Member Pass',
    'portal.todays_workout': "Today's Workout",
    'portal.book_classes': 'Book Classes',
    'portal.my_progress': 'My Progress',
    'portal.back_admin': 'Exit to Admin OS',
    'portal.show_qr': 'Scan this QR code at the turnstile.',

    // Themes & Settings
    'settings.title': 'Settings & Supabase Cloud',
    'settings.language': 'System Language',
    'settings.language_desc': 'Defaults to Indonesian. You can switch to English anytime.',
    'settings.theme': 'Color Theme (5 Options)',
    'settings.theme_desc': 'Choose from 5 energetic athletic themes across the OS.',
    'settings.close': 'Close',
    'settings.save': 'Save Settings',

    // Days of week
    'days.sun': 'Sunday',
    'days.mon': 'Monday',
    'days.tue': 'Tuesday',
    'days.wed': 'Wednesday',
    'days.thu': 'Thursday',
    'days.fri': 'Friday',
    'days.sat': 'Saturday',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.status': 'Status',
    'common.all': 'All',
  }
};

export type TranslationKey = keyof typeof TRANSLATIONS.id;

export function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY) as Language;
    if (saved === 'en' || saved === 'id') {
      return saved;
    }
  } catch {
    // fallback if localStorage disabled
  }
  // Default is Indonesian as requested
  return 'id';
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'id',
  setLanguage: () => {},
  t: (key: TranslationKey) => TRANSLATIONS.id[key] || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage());

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // ignore storage write errors
    }
  };

  const t = (key: TranslationKey): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  return useContext(LanguageContext);
}
