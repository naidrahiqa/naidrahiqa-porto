-- =============================================================
-- 020 — Update Project: Penerapan Sila Pancasila Pada Kehidupan Sehari-hari
-- Jalankan di Supabase Dashboard > SQL Editor
-- =============================================================

UPDATE public.projects
SET description = 'Dokumentasi aksi nyata pengamalan nilai-nilai luhur Pancasila (Sila ke-1 sampai ke-5) dalam kehidupan sehari-hari siswa di lingkungan SMK Negeri 3 Jepara, mulai dari mendengarkan khutbah Jumat, kepedulian berbagi makanan, mendukung produk lokal, musyawarah kelompok, hingga distribusi Program Makan Bergizi Gratis (MBG).',
    content = $json$
{
  "type": "school_project",
  "intro": "Pancasila bukan sekadar dasar falsafah negara yang dihafal bunyinya, melainkan pedoman moral dan etika bertindak yang harus diwujudkan dalam kehidupan nyata. Sebagai siswa kejuruan di SMK Negeri 3 Jepara, penerapan nilai-nilai Pancasila menjadi fondasi penting dalam membentuk karakter kedisiplinan, solidaritas, kepedulian sosial, serta integritas moral.\n\nMelalui tugas proyek mata pelajaran Pendidikan Pancasila ini, kami mendokumentasikan aksi konkret penerapan kelima sila Pancasila yang berlangsung di lingkungan sekolah dan ruang kelas kami sehari-hari.",
  "points": [
    {
      "id": "sila-1",
      "title": "Sila Pertama: Ketuhanan Yang Maha Esa",
      "text": "* **Simbol**: Bintang emas berlatar perisai hitam.\n* **Makna Nilai**: Mengakui keberadaan Tuhan Yang Maha Esa, menjunjung tinggi toleransi antarumat beragama, dan menjalankan perintah agama dengan ikhlas dan penuh kedisiplinan.\n* **Aksi Nyata di Sekolah**: Mendengarkan khutbah sholat Jumat dengan khusyuk, tenang, dan tertib di mushola sekolah bersama teman-teman, menjaga adab dengan tidak berbicara saat khatib menyampaikan khutbah sebagai wujud ketaatan beribadah kepada Tuhan Yang Maha Esa.",
      "images": [
        {
          "url": "https://lh3.googleusercontent.com/d/1BzzjvkPjHUi-abyuZTOSGV5bLsouRj5P=s0",
          "caption": "Simbol Sila ke-1: Bintang (Ketuhanan Yang Maha Esa)"
        },
        {
          "url": "https://lh3.googleusercontent.com/d/1_0GQozFV4Xs5FzfgyKYXJbl9427WOi0e=s0",
          "caption": "Penerapan Sila ke-1: Mendengarkan khutbah sholat Jumat dengan khusyuk di mushola sekolah"
        }
      ]
    },
    {
      "id": "sila-2",
      "title": "Sila Kedua: Kemanusiaan yang Adil dan Beradab",
      "text": "* **Simbol**: Rantai emas dengan gelang lingkaran dan persegi.\n* **Makna Nilai**: Menjunjung tinggi persamaan derajat, hak, dan kewajiban setiap manusia tanpa membeda-bedakan, serta menumbuhkan sikap empati, kasih sayang, dan saling tolong-menolong.\n* **Aksi Nyata di Sekolah**: Mempererat rasa persaudaraan dan kepedulian dengan saling berbagi makanan atau bekal kepada teman sekelas, serta memperlakukan sesama siswa dengan adab sopan santun.",
      "images": [
        {
          "url": "https://lh3.googleusercontent.com/d/18ZTkSHRKRB_HXGNUAr81KgT7_-YIWztN=s0",
          "caption": "Simbol Sila ke-2: Rantai (Kemanusiaan yang Adil dan Beradab)"
        },
        {
          "url": "https://lh3.googleusercontent.com/d/1yVOcV1uuGRBMOX3DBGpYsSn47noLvWyr=s0",
          "caption": "Penerapan Sila ke-2: Berbagi makanan dan kepedulian antarsesama teman di kelas"
        }
      ]
    },
    {
      "id": "sila-3",
      "title": "Sila Ketiga: Persatuan Indonesia",
      "text": "* **Simbol**: Pohon Beringin.\n* **Makna Nilai**: Menempatkan persatuan, kesatuan, serta keselamatan bangsa dan negara di atas kepentingan pribadi/golongan, diwujudkan lewat cinta tanah air dan bangga memakai serta mengonsumsi produk buatan Indonesia.\n* **Aksi Nyata di Sekolah**: Mendukung kemandirian ekonomi lingkungan sekolah dengan membiasakan berbelanja produk lokal di kantin atau koperasi sekolah secara tertib, serta menjaga kerukunan dan kekompakan tanpa memecah belah pertemanan.",
      "images": [
        {
          "url": "https://lh3.googleusercontent.com/d/1fwDxo5rz5efIyejXIoZcn_UNpndCGF8o=s0",
          "caption": "Simbol Sila ke-3: Pohon Beringin (Persatuan Indonesia)"
        },
        {
          "url": "https://lh3.googleusercontent.com/d/1SYtW89NFwM6hwgZhfGPGApH6acnUppPf=s0",
          "caption": "Penerapan Sila ke-3: Membeli dan mencintai produk lokal di kantin/koperasi sekolah"
        }
      ]
    },
    {
      "id": "sila-4",
      "title": "Sila Keempat: Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan",
      "text": "* **Simbol**: Kepala Banteng.\n* **Makna Nilai**: Mengutamakan musyawarah untuk mufakat dalam mengambil keputusan bersama, menghargai setiap pendapat, dan tidak memaksakan kehendak kepada orang lain.\n* **Aksi Nyata di Sekolah**: Berdiskusi secara aktif dan demokratis dalam kerja kelompok di kelas, saling mendengarkan argumen antarteman, dan bersama-sama merumuskan kesepakatan terbaik untuk menyelesaikan tugas sekolah.",
      "images": [
        {
          "url": "https://lh3.googleusercontent.com/d/1ASfipttavPp9SgactCdfWi-D-ca2KUAZ=s0",
          "caption": "Simbol Sila ke-4: Kepala Banteng (Permusyawaratan/Perwakilan)"
        },
        {
          "url": "https://lh3.googleusercontent.com/d/1lx2bW4Rc5bzxEe3kiK9Hs7YY7qvD_mes=s0",
          "caption": "Penerapan Sila ke-4: Musyawarah dan diskusi kerja kelompok di dalam kelas"
        }
      ]
    },
    {
      "id": "sila-5",
      "title": "Sila Kelima: Keadilan Sosial bagi Seluruh Rakyat Indonesia",
      "text": "* **Simbol**: Padi dan Kapas.\n* **Makna Nilai**: Mengembangkan sikap adil terhadap sesama, menjaga keseimbangan antara hak dan kewajiban, serta menghormati hak orang lain demi mewujudkan kesejahteraan dan keadilan sosial yang merata.\n* **Aksi Nyata di Sekolah**: Pembagian dan pendistribusian makanan Program Makan Bergizi Gratis (MBG) secara tertib dan merata kepada seluruh siswa di kelas menggunakan wadah omprengan stainless steel, memastikan setiap teman memperoleh hak porsi makanan sehat dan bergizi yang sama tanpa ada yang terlewatkan.",
      "images": [
        {
          "url": "https://lh3.googleusercontent.com/d/1E1W3W0SYs95oXRLTGrO4LTrruxDeJTQK=s0",
          "caption": "Simbol Sila ke-5: Padi dan Kapas (Keadilan Sosial)"
        },
        {
          "url": "https://lh3.googleusercontent.com/d/17BeH00qmGdqIDDoDR9991rKANoxHBV3I=s0",
          "caption": "Penerapan Sila ke-5: Pembagian makanan Program Makan Bergizi Gratis (MBG) secara adil dan merata di kelas"
        }
      ]
    }
  ],
  "conclusion": "Praktik pengamalan Pancasila tidak harus menunggu momen kenegaraan yang besar. Dari hal-hal sederhana di sekolah - mulai dari menyimak khutbah Jumat dengan khusyuk, kepedulian berbagi bekal, mendukung produk lokal di kantin, bermusyawarah di bangku kelas, hingga pembagian porsi Makan Bergizi Gratis (MBG) secara adil dan merata - nilai luhur Pancasila telah hidup dan terjaga dalam kebiasaan kita sehari-hari."
}
$json$,
    updated_at = now()
WHERE slug = 'penerapan-sila-pancasila-pada-kehidupan-sehari-hari';

-- Update caption di project_media agar konsisten saat dilihat di media viewer
UPDATE public.project_media
SET caption = 'Simbol Sila ke-1: Bintang (Ketuhanan Yang Maha Esa)'
WHERE url = 'https://lh3.googleusercontent.com/d/1BzzjvkPjHUi-abyuZTOSGV5bLsouRj5P=s0';

UPDATE public.project_media
SET caption = 'Penerapan Sila ke-1: Mendengarkan khutbah sholat Jumat dengan khusyuk di mushola sekolah'
WHERE url = 'https://lh3.googleusercontent.com/d/1_0GQozFV4Xs5FzfgyKYXJbl9427WOi0e=s0';

UPDATE public.project_media
SET caption = 'Simbol Sila ke-2: Rantai (Kemanusiaan yang Adil dan Beradab)'
WHERE url = 'https://lh3.googleusercontent.com/d/18ZTkSHRKRB_HXGNUAr81KgT7_-YIWztN=s0';

UPDATE public.project_media
SET caption = 'Penerapan Sila ke-2: Berbagi makanan dan kepedulian antarsesama teman di kelas'
WHERE url = 'https://lh3.googleusercontent.com/d/1yVOcV1uuGRBMOX3DBGpYsSn47noLvWyr=s0';

UPDATE public.project_media
SET caption = 'Simbol Sila ke-3: Pohon Beringin (Persatuan Indonesia)'
WHERE url = 'https://lh3.googleusercontent.com/d/1fwDxo5rz5efIyejXIoZcn_UNpndCGF8o=s0';

UPDATE public.project_media
SET caption = 'Penerapan Sila ke-3: Membeli dan mencintai produk lokal di kantin/koperasi sekolah'
WHERE url = 'https://lh3.googleusercontent.com/d/1SYtW89NFwM6hwgZhfGPGApH6acnUppPf=s0';

UPDATE public.project_media
SET caption = 'Simbol Sila ke-4: Kepala Banteng (Permusyawaratan/Perwakilan)'
WHERE url = 'https://lh3.googleusercontent.com/d/1ASfipttavPp9SgactCdfWi-D-ca2KUAZ=s0';

UPDATE public.project_media
SET caption = 'Penerapan Sila ke-4: Musyawarah dan diskusi kerja kelompok di dalam kelas'
WHERE url = 'https://lh3.googleusercontent.com/d/1lx2bW4Rc5bzxEe3kiK9Hs7YY7qvD_mes=s0';

UPDATE public.project_media
SET caption = 'Simbol Sila ke-5: Padi dan Kapas (Keadilan Sosial)'
WHERE url = 'https://lh3.googleusercontent.com/d/1E1W3W0SYs95oXRLTGrO4LTrruxDeJTQK=s0';

UPDATE public.project_media
SET caption = 'Penerapan Sila ke-5: Pembagian makanan Program Makan Bergizi Gratis (MBG) secara adil dan merata di kelas'
WHERE url = 'https://lh3.googleusercontent.com/d/17BeH00qmGdqIDDoDR9991rKANoxHBV3I=s0';
