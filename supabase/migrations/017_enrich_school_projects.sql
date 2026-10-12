-- =============================================================
-- 017 - Enrich School Projects & Populate Kelas X, XI, XII
-- Jalankan di Supabase Dashboard > SQL Editor (setelah 016)
-- =============================================================

-- ---------- 1. Bersihkan placeholder kosong ----------
DELETE FROM public.projects WHERE slug IN (
  'kelas-x',
  'kelas-xi'
);

-- ---------- 2. Perkaya Proyek Kelas XII (SMK TKJ) ----------

-- Crimping Kabel RJ45
UPDATE public.projects
SET title = 'Crimping Kabel UTP RJ-45 & Pengujian LAN',
    description = 'Praktik pembuatan kabel UTP straight-through standar T568B dan verifikasi kontinuitas 8 pin menggunakan LAN tester.',
    content = E'## Tujuan Praktikum\nMemahami karakteristik transmisi kabel twisted pair dan menguasai teknik terminasi konektor RJ-45 sesuai standar industri TIA/EIA 568B.\n\n## Alat dan Bahan\n- Kabel UTP Cat5e\n- Konektor RJ-45\n- Tang crimping (Crimping tool)\n- Wire stripper / pengupas kabel\n- Network LAN tester\n\n## Langkah Kerja\n1. Kupas jaket luar kabel UTP sepanjang kurang lebih 2 cm menggunakan stripper.\n2. Uraikan 4 pasang pilinan kawat dan urutkan sesuai standar T568B:\n   * Pin 1: Putih-Oranye\n   * Pin 2: Oranye\n   * Pin 3: Putih-Hijau\n   * Pin 4: Biru\n   * Pin 5: Putih-Biru\n   * Pin 6: Hijau\n   * Pin 7: Putih-Cokelat\n   * Pin 8: Cokelat\n3. Luruskan dan potong rata ujung kawat hingga tersisa sekitar 1.2 cm.\n4. Masukkan seluruh kawat ke dalam konektor RJ-45 hingga menyentuh ujung pin tembaga.\n5. Masukkan konektor ke tang crimping lalu tekan kuat hingga pin tembaga mengunci kawat.\n\n## Hasil dan Pengujian\nPengujian kedua ujung kabel menggunakan LAN tester menunjukkan indikator LED 1 sampai 8 menyala berurutan secara normal tanpa ada jalur yang putus (open) atau tertukar (crossed).\n\n## Kesimpulan\nKabel straight-through berhasil dibuat sesuai standar dan siap digunakan untuk menghubungkan perangkat heterogen seperti workstation klien ke switch.',
    updated_at = now()
WHERE slug = 'tjkn-kabel-rj45';

-- JUNIOR NETWORK ADMINISTRATOR
UPDATE public.projects
SET title = 'Junior Network Administrator (JNA)',
    description = 'Simulasi arsitektur jaringan skala enterprise menggunakan Cisco Packet Tracer mencakup routing, switching, dan layanan server.',
    content = E'## Deskripsi Proyek\nPraktik simulasi komprehensif mengacu pada skema sertifikasi Junior Network Administrator (JNA) berbasis SKKNI bidang Teknik Komputer dan Jaringan.\n\n## Ruang Lingkup Konfigurasi\n- **Switching**: Pembuatan database VLAN dan port tagging (802.1Q trunking).\n- **Routing**: Inter-VLAN routing (Router-on-a-Stick) dan routing dinamis.\n- **Layanan Jaringan**: Konfigurasi DHCP Server, DNS Server, dan Web HTTP Server lokal.\n- **Keamanan**: Implementasi standard access-list (ACL) dan port security.\n\n## Hasil Verifikasi\nSeluruh endpoint pada subnet yang berbeda dapat saling berkomunikasi melalui gateway router dan mampu mengakses layanan web server internal secara stabil.',
    updated_at = now()
WHERE slug = 'junior-network-administrator';

-- Topologi A
UPDATE public.projects
SET title = 'Perancangan Topologi Jaringan A',
    description = 'Desain skema topologi jaringan A, perhitungan subnetting IP Address VLSM, dan pemetaan segmen host.',
    content = E'## Ringkasan Proyek\nPerancangan arsitektur jaringan komputer dengan topologi bintang (star topology) untuk kebutuhan laboratorium kejuruan.\n\n## Perhitungan Subnetting (VLSM)\nMengoptimalkan alokasi alamat IPv4 privat menggunakan metode Variable Length Subnet Masking (VLSM) agar tidak terjadi pemborosan IP address pada tiap segmen departemen.\n\n## Spesifikasi Perangkat\n- 1 Unit Router Gateway Utama\n- 2 Unit Switch Distribusi Layer 2\n- 24 Workstation Klien Terdistribusi\n\n## Hasil Pengujian\nPengujian broadcast domain dan segmentasi lalu lintas data membuktikan latensi rendah dan pemisahan broadcast yang efektif.',
    updated_at = now()
WHERE slug = 'topologi-a';

-- Topologi B
UPDATE public.projects
SET title = 'Perancangan Topologi Jaringan B',
    description = 'Implementasi arsitektur jaringan B dengan segmentasi multi-VLAN, redundant link, dan analisis bandwidth.',
    content = E'## Ringkasan Proyek\nPengembangan topologi jaringan lanjutan dengan redundansi jalur switch dan isolasi departemen berbasis Virtual LAN (VLAN).\n\n## Tahapan Implementasi\n1. Pemetaan port switch untuk VLAN Manajemen, VLAN Klien, dan VLAN Server.\n2. Konfigurasi trunk port dengan enkapsulasi dot1q menuju gateway utama.\n3. Uji failover konektivitas saat salah satu link fisik dinonaktifkan.\n\n## Hasil Uji\nThroughput pengiriman data antar-segmen terpantau stabil dengan utilisasi resource yang optimal.',
    updated_at = now()
WHERE slug = 'topologi-b';

-- Routing BGP
UPDATE public.projects
SET title = 'Routing BGP (Border Gateway Protocol)',
    description = 'Praktikum konfigurasi dynamic routing protokol BGP eksternal antar-Autonomous System (AS) pada lingkungan simulasi lab.',
    content = E'## Konsep BGP\nBorder Gateway Protocol (BGP) adalah protokol routing eksterior standar internet yang menghubungkan sistem otonom (Autonomous System / AS) yang berbeda melalui path-vector routing.\n\n## Parameter Praktik\n- **Router 1**: AS 65001 (IP Loopback: 10.1.1.1/32)\n- **Router 2**: AS 65002 (IP Loopback: 10.2.2.2/32)\n- **Peering Interkoneksi**: 192.168.12.0/30\n\n## Langkah Konfigurasi\n```bash\n# Inisialisasi BGP Instance & Peer\n/routing bgp instance set default as=65001\n/routing bgp peer add name=peer-to-as2 remote-address=192.168.12.2 remote-as=65002\n/routing bgp network add network=10.1.1.0/24 synchronize=no\n```\n\n## Hasil Uji\nStatus BGP peer berubah menjadi Established, dan tabel routing berhasil menerima rute prefix dari AS tetangga secara otomatis.',
    updated_at = now()
WHERE slug = 'routing-bgp';

-- Integrity Hashing
UPDATE public.projects
SET title = 'Integrity Hashing & Verifikasi Keaslian File',
    description = 'Praktikum validasi integritas data dan analisis cryptographic hash (MD5, SHA-1, SHA-256) menggunakan PowerShell dan terminal.',
    content = E'## Tujuan Praktikum\nMemahami prinsip integritas data (Integrity) dalam pilar CIA Triad dan mendeteksi adanya manipulasi atau korupsi data menggunakan fungsi hash kriptografi.\n\n## Metode Verifikasi\nMenggunakan commandlet PowerShell `Get-FileHash` untuk menghasilkan nilai hash unik dari berkas uji:\n\n```powershell\nGet-FileHash -Path .\\data_uji.txt -Algorithm SHA256\n```\n\n## Analisis Avalanche Effect\nSaat satu karakter di dalam berkas diubah, seluruh string hash 64-karakter heksadesimal berubah secara drastis (efek longsoran salju / avalanche effect). Ini membuktikan bahwa hash sangat andal untuk mendeteksi modifikasi tidak sah sekecil apa pun.\n\n## Kesimpulan\nChecksum SHA-256 menjamin keaslian berkas sebelum dan sesudah didistribusikan melalui jaringan.',
    updated_at = now()
WHERE slug = 'integrity-hashing';

-- OSINT MALWARE PHISING
UPDATE public.projects
SET title = 'Investigasi OSINT & Analisis Ancaman Phishing',
    description = 'Praktik investigasi sumber terbuka (OSINT) untuk mendeteksi domain tiruan, analisis header email palsu, dan mitigasi phishing.',
    content = E'## Latar Belakang\nSerangan rekayasa sosial (social engineering) seperti phishing merupakan vektor utama penyebaran malware. Praktikum ini melatih kemampuan investigasi jejak digital menggunakan metode Open Source Intelligence (OSINT).\n\n## Metodologi Investigasi\n1. **Pemeriksaan Header Email**: Menganalisis baris `Received: from`, `Return-Path`, dan status verifikasi SPF, DKIM, serta DMARC.\n2. **Whois & DNS Recon**: Memeriksa umur domain yang mencurigakan dan nameserver penyedia hosting.\n3. **Analisis Reputasi URL**: Mengecek reputasi tautan menggunakan platform intelijen ancaman seperti VirusTotal dan URLhaus.\n\n## Rekomendasi Pertahanan\nMenerapkan autentikasi dua faktor (2FA), filter anti-spam berbasis gateway email, serta peningkatan literasi keamanan bagi pengguna.',
    updated_at = now()
WHERE slug = 'osint-malware-phising';

-- Firewall
UPDATE public.projects
SET title = 'Konfigurasi Firewall Filter Rules & Port Security',
    description = 'Implementasi aturan firewall filter, proteksi port router, dan pencegahan flooding ICMP pada MikroTik RouterOS.',
    content = E'## Ringkasan Praktikum\nKonfigurasi keamanan perimeter jaringan untuk melindungi router gateway dan workstation lokal dari akses tanpa izin.\n\n## Aturan Firewall (Chain Input & Forward)\n- Mengizinkan koneksi established dan related.\n- Menolak (drop) seluruh request koneksi invalid.\n- Membatasi request ping (ICMP) untuk mencegah denial-of-service (DoS flooding).\n- Menutup akses port remote management (Telnet port 23, Webfig port 80) dari arah interface publik dan hanya mengizinkan SSH/Winbox dari IP manajemen.\n\n## Hasil Pengujian\nPengujian port scanning menggunakan Nmap membuktikan seluruh port sensitif berstatus filtered/closed.',
    updated_at = now()
WHERE slug = 'praktikum-3-firewall';

-- Jobsheet 1 Application & CV
UPDATE public.projects
SET title = 'Job Application Letter & Curriculum Vitae (Part 1)',
    description = 'Penyusunan surat lamaran kerja formal dan resume berbahasa Inggris untuk posisi teknisi jaringan dan IT support.',
    content = E'## Overview\nThis project documents the preparation of professional English-language career documentation aligned with international vocational standards.\n\n## Key Components\n- **Application Letter**: Formal heading, applicant introduction, qualifications highlight in networking and Linux administration, and formal closing.\n- **Curriculum Vitae (CV)**: Clear layout highlighting educational background at SMK Negeri 3 Jepara, technical skills (Cisco, MikroTik, Linux Kernel), and school project achievements.\n\n## Learning Outcome\nImproved formal written English proficiency, mastering business correspondence etiquette, and creating an industry-ready job application profile.',
    updated_at = now()
WHERE slug = 'jobsheet-1-application-cv';

-- Jobsheet 2 Application and CV
UPDATE public.projects
SET title = 'Job Application Letter & Curriculum Vitae (Part 2)',
    description = 'Penyempurnaan berkas portofolio CV berbahasa Inggris dan latihan wawancara kerja teknis bidang teknologi informasi.',
    content = E'## Overview\nContinuation of vocational English communication training, focusing on resume refinement and technical interview simulations.\n\n## Scope of Work\n1. Revision of action verbs in describing project accomplishments.\n2. Formatting digital CV files into readable, ATS-compliant layouts.\n3. Structured responses to common English interview prompts regarding networking troubleshooting and team collaboration.',
    updated_at = now()
WHERE slug = 'jobsheet-2-application-and-cv';

-- Post Test
UPDATE public.projects
SET title = 'Evaluasi & Post Test Administrasi Sistem Jaringan',
    description = 'Dokumentasi evaluasi pemahaman troubleshooting jaringan komputer, routing table, dan manajemen sistem server.',
    content = E'## Deskripsi Post Test\nEvaluasi akhir modul pembelajaran Administrasi Sistem Jaringan untuk mengukur penguasaan materi praktikum secara mandiri.\n\n## Materi Evaluasi\n- Analisis paket data dan pemecahan masalah konektivitas gateway.\n- Rekonfigurasi alamat IP statis dan pengujian DNS resolver.\n- Evaluasi performa sistem server Linux.\n\n## Hasil\nSeluruh indikator penilaian berhasil diselesaikan dengan hasil tervalidasi.',
    updated_at = now()
WHERE slug = 'post-test';

-- Video AI
UPDATE public.projects
SET title = 'Video Cerita Budaya Jawa Berbantuan AI',
    description = 'Proyek kreatif pembuatan video narasi legenda daerah berbahasa Jawa krama menggunakan integrasi generative AI visual dan voice.',
    content = E'## Latar Belakang Proyek\nMemadukan pelestarian budaya lokal bahasa Jawa dengan pemanfaatan teknologi kecerdasan buatan modern untuk media pembelajaran yang interaktif dan menarik bagi generasi muda.\n\n## Alur Produksi\n1. Penulisan naskah cerita dan dialog menggunakan bahasa Jawa ragam krama alus.\n2. Pembuatan aset visual ilustrasi adegan cerita berbasis AI image generator.\n3. Perekaman sulih suara (voiceover) dan sinkronisasi audio latar.\n4. Penyuntingan video akhir dan penambahan takarir (subtitle) dwibahasa.\n\n## Refleksi Pembelajaran\nProyek ini melatih kreativitas bercerita, ketepatan unggah-ungguh bahasa Jawa, serta keahlian kurasi konten digital multimedia.',
    updated_at = now()
WHERE slug = 'video-ai';

-- Jikoshoukai
UPDATE public.projects
SET title = 'Jikoshoukai (Perkenalan Diri Bahasa Jepang)',
    description = 'Praktik pelafalan, tata bahasa, dan perekaman video perkenalan diri formal (jikoshoukai) dalam mata pelajaran Bahasa Jepang.',
    content = E'## Deskripsi Kegiatan\nPraktik komunikasi lisan bahasa Jepang tingkat dasar yang berfokus pada pengenalan identitas diri, asal sekolah, peminatan kejuruan, dan salam penutup santun.\n\n## Kosakata & Pola Kalimat Utama\n- `Hajimemashite` (Salam pembuka perkenalan)\n- `Watashi no namae wa Faqih desu` (Nama saya Faqih)\n- `SMK Negeri 3 Jepara no seito desu` (Saya siswa SMK Negeri 3 Jepara)\n- `Douzo yoroshiku onegaishimasu` (Salam penutup perkenalan)\n\n## Dokumentasi\nVideo presentasi lisan direkam dan diunggah sebagai bukti pencapaian kompetensi keterampilan berbicara bahasa asing.',
    updated_at = now()
WHERE slug = 'jikoshoukai';

-- ---------- 3. Perkaya Proyek Kelas XI ----------

-- Analytical Text
UPDATE public.projects
SET title = 'Analytical Exposition Text on Digital Technology',
    description = 'Penulisan esai analitis berbahasa Inggris mengenai peran teknologi jaringan dan keamanan data di era digital.',
    content = E'## Project Purpose\nDeveloping critical thinking and argumentative writing skills in English through an analytical exposition essay about the necessity of digital privacy and network security in modern education.\n\n## Essay Structure\n- **Thesis**: Stating the primary argument regarding data protection awareness.\n- **Argument 1**: The exponential increase in cyber threats targeting educational institutions.\n- **Argument 2**: Importance of implementing robust security hygiene among students.\n- **Reiteration**: Reaffirming the conclusion and proposing practical steps for cyber safety.',
    updated_at = now()
WHERE slug = 'analytical-text';

-- KP 4 Kehidupan berbangsa
UPDATE public.projects
SET title = 'KP 4 - Dinamika Kehidupan Berbangsa dan Bernegara',
    description = 'Laporan kajian sejarah perkembangan politik, sosial, dan dinamika kebangsaan Indonesia pada masa kemerdekaan.',
    content = E'## Ringkasan Materi\nKajian lembar kerja siswa mata pelajaran Sejarah Indonesia yang mengulas fase krusial perjuangan mempertahankan kemerdekaan, pembentukan lembaga negara, dan integrasi nasional.\n\n## Poin Pembahasan\n1. Peristiwa diplomasi internasional (Perjanjian Linggarjati, Renville, dan KMB).\n2. Peran tokoh pemuda dan pelajar dalam mempertahankan kedaulatan republik.\n3. Refleksi nilai keteladanan para pahlawan untuk generasi penerus bangsa.',
    updated_at = now()
WHERE slug = 'kp-4-kehidupan-berbangsa';

-- Esai
UPDATE public.projects
SET title = 'Esai Refleksi Sejarah Nasional Indonesia',
    description = 'Karya tulis esai kritis menganalisis peran diplomasi dan persatuan nasional dalam menjaga kedaulatan tanah air.',
    content = E'## Pendahuluan\nEsai ini mengkaji bagaimana integrasi sosial dan semangat persatuan lintas suku dan agama menjadi kunci ketahanan bangsa Indonesia menghadapi berbagai agresi militer dan krisis geopolitik di masa pascakemerdekaan.\n\n## Kesimpulan Esai\nNilai perjuangan para pendahulu bangsa menegaskan pentingnya solidaritas dan persatuan sebagai modal utama kemajuan bangsa di era global.',
    updated_at = now()
WHERE slug = 'esai';

-- ---------- 4. Tambahkan Proyek Otentik Kelas X (Dasar Kejuruan TKJ) ----------

-- Dasar Topologi & Pengkabelan LAN (Kelas X)
INSERT INTO public.projects (
  title,
  slug,
  category,
  class_level,
  subject,
  layout,
  description,
  content,
  published,
  featured,
  sort_order
) VALUES (
  'Pengenalan Topologi LAN & Pengkabelan Jaringan',
  'dasar-topologi-jaringan-lan',
  'school',
  'x',
  'DASAR TEKNIK JARINGAN KOMPUTER',
  'text-first',
  'Praktik dasar pengenalan media transmisi, pemetaan topologi Local Area Network (LAN), dan pengenalan pengalamatan IPv4.',
  E'## Tujuan Pembelajaran\nMemahami konsep dasar jaringan komputer, model referensi OSI 7 layer, serta karakteristik media transmisi kabel tembaga (twisted pair).\n\n## Materi Praktikum\n1. **Karakteristik Topologi**: Membandingkan kelebihan dan kekurangan topologi Bus, Star, dan Tree.\n2. **Identifikasi Perangkat**: Mengenal fungsi NIC (Network Interface Card), switch unmanaged, access point, dan router.\n3. **Pengalamatan IP Kelas C**: Memahami format penulisan IP address privat (192.168.x.x) dan fungsi subnet mask 255.255.255.0.\n\n## Hasil Pembelajaran\nSiswa mampu merancang skema jaringan sederhana untuk menghubungkan 4 unit komputer dalam satu segmen workgroup yang sama.',
  true,
  false,
  101
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  updated_at = now();

-- Perakitan Komputer & Uji Hardware (Kelas X)
INSERT INTO public.projects (
  title,
  slug,
  category,
  class_level,
  subject,
  layout,
  description,
  content,
  published,
  featured,
  sort_order
) VALUES (
  'Praktik Perakitan PC & Troubleshooting Hardware',
  'perakitan-pc-troubleshooting-hardware',
  'school',
  'x',
  'DASAR TEKNIK JARINGAN KOMPUTER',
  'text-first',
  'Praktik pembongkaran, perakitan unit komputer (PC), pemasangan pasta pendingin, manajemen kabel, dan prosedur pengujian BIOS/POST.',
  E'## Deskripsi Praktikum\nPraktik langsung perakitan komputer meja (desktop PC) di laboratorium komputer dengan menerapkan standar Keselamatan dan Kesehatan Kerja Lingkungan Hidup (K3LH).\n\n## Komponen Utama\n- Motherboard Socket AM4 / LGA1151\n- Central Processing Unit (Processor)\n- Random Access Memory (RAM DDR4)\n- Storage SSD SATA / NVMe\n- Power Supply Unit (PSU) 80+\n- Casing PC & Kipas Pendingin\n\n## Langkah Prosedural\n1. Memakai gelang antistatis dan menyiapkan alas kerja yang aman.\n2. Memasang processor ke socket motherboard dengan memperhatikan tanda segitiga pin 1.\n3. Mengaplikasikan thermal paste secara merata dan memasang heatsink fan.\n4. Memasang modul RAM pada slot DIMM dual-channel.\n5. Memasang motherboard ke dalam casing dan menghubungkan kabel front panel.\n6. Pemasangan power supply dan perapian jalur kabel (cable management).\n\n## Hasil Verifikasi\nKomputer dinyalakan dan berhasil melalui proses Power-On Self-Test (POST) dengan indikator satu bunyi beep pendek serta menampilkan menu setup BIOS secara sempurna.',
  true,
  false,
  102
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  updated_at = now();

-- Instalasi Linux Debian (Kelas X)
INSERT INTO public.projects (
  title,
  slug,
  category,
  class_level,
  subject,
  layout,
  description,
  content,
  published,
  featured,
  sort_order
) VALUES (
  'Instalasi Sistem Operasi Linux Debian & Dual Boot',
  'instalasi-linux-debian-dual-boot',
  'school',
  'x',
  'DASAR TEKNIK JARINGAN KOMPUTER',
  'text-first',
  'Prosedur pembuatan flashdrive bootable, partisi storage manual, dan instalasi sistem operasi open-source Linux Debian.',
  E'## Ringkasan Kegiatan\nInstalasi sistem operasi Linux Debian sebagai fondasi pembelajaran administrasi server kejuruan TKJ.\n\n## Tahapan Instalasi\n1. Pembuatan installer USB bootable menggunakan utilitas Rufus / Ventoy.\n2. Pengaturan boot priority pada firmware UEFI/BIOS.\n3. Skema partisi storage manual:\n   * Partisi `/boot/efi` (512 MB, ESP)\n   * Partisi `swap` (2 GB)\n   * Partisi root `/` (Sisa kapasitas, format ext4)\n4. Konfigurasi hostname, domain name, akun root, dan user reguler.\n5. Instalasi software dasar dan bootloader GRUB.\n\n## Hasil Akhir\nSistem operasi berhasil boot ke lingkungan command line interface (CLI) dan siap dikonfigurasi untuk layanan jaringan tingkat lanjut.',
  true,
  false,
  103
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  updated_at = now();

-- Logika Algoritma & Flowchart (Kelas X)
INSERT INTO public.projects (
  title,
  slug,
  category,
  class_level,
  subject,
  layout,
  description,
  content,
  published,
  featured,
  sort_order
) VALUES (
  'Logika Algoritma & Diagram Alir (Flowchart)',
  'logika-algoritma-flowchart-pemrograman',
  'school',
  'x',
  'INFORMATIKA',
  'text-first',
  'Perancangan alur logika komputasi terstruktur dan diagram alir (flowchart) untuk pemecahan masalah otomasi sederhana.',
  E'## Tujuan Modul\nMelatih pemikiran komputasional (computational thinking) dalam menyusun langkah instruksi logis dan sistematis untuk memecahkan persoalan digital.\n\n## Simbol Flowchart Standar\n- **Terminator**: Titik awal dan akhir alur proses (Mulai / Selesai).\n- **Input / Output**: Pembacaan data masukan atau penampilan hasil.\n- **Process**: Operasi perhitungan dan penugasan variabel.\n- **Decision**: Percabangan kondisi (Ya / Tidak).\n\n## Kasus Studi Praktik\nMerancang diagram alir sistem pengecekan kelayakan alamat IP host dalam jaringan lokal dan algoritma konversi bilangan desimal ke biner.\n\n## Kesimpulan\nPemahaman logika algoritma mempermudah implementasi otomasi konfigurasi dan penulisan skrip terminal di kemudian hari.',
  true,
  false,
  104
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  updated_at = now();
