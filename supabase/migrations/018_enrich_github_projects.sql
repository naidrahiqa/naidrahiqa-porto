-- =============================================================
-- 018 - Enrich GitHub & Personal Projects
-- Jalankan di Supabase Dashboard > SQL Editor (setelah 017)
-- =============================================================

-- 1. Phrolova Kernel (Xiaomi Redmi 10)
UPDATE public.projects
SET title = 'Phrolova Kernel (Xiaomi Redmi 10 / Selene)',
    description = 'High-performance custom Linux kernel for Xiaomi Redmi 10 (selene / selenes / eos) with upstream patches, KCAL, and memory optimizations.',
    language = 'C',
    content = E'## Project Overview\nPhrolova Kernel is a custom Android Linux kernel engineered specifically for Xiaomi Redmi 10 (selene platform), focused on maximum stability, gaming performance, and extended battery efficiency.\n\n## Hardware Specifications\n- **SoC**: MediaTek MT6769V/CZ (Helio G88)\n- **Architecture**: ARM64 (ARMv8-A)\n- **Kernel Base**: Linux 4.19 LTS with vendor tree optimizations\n- **Target OS**: Android 11 (R), Android 12 (S), Android 13 (T), and Android 14 (U)\n\n## Key Architectural Features\n- **Compiler Toolchain**: Compiled using modern AOSP Clang 18 toolchain with ThinLTO and Polly loop optimizations.\n- **KCAL Color Driver**: Integrated KCAL driver allowing users to calibrate display contrast, saturation, and RGB balance on IPS panels.\n- **Governor Tuning**: Tuned Schedutil governor frequency ramp curves to prevent thermal throttling and frame drops during intense gaming sessions.\n- **ZRAM Optimizations**: Upgraded ZRAM backend to ZSTD compression algorithm, providing superior multitasking headroom on 4GB and 6GB RAM models.\n- **TCP BBR**: Backported Google TCP BBR congestion control algorithm for reduced latency and smoother network packet delivery.\n- **KernelSU Next Support**: Native support for KernelSU Next root manager without requiring boot partition patching.\n\n## Distribution\nPackaged with AnyKernel3 for universal compatibility across TWRP, OrangeFox, and KernelFlasher recoveries.\n\n[Lihat di GitHub](https://github.com/naidrahiqa/android_kernel_xiaomi_selene)',
    updated_at = now()
WHERE slug = 'phrolova-kernel-selene';

-- 2. Pollux Kernel (Xiaomi Redmi 12)
UPDATE public.projects
SET title = 'Pollux Kernel (Xiaomi Redmi 12 / Fire)',
    description = 'Custom Android kernel for Xiaomi Redmi 12 (fire T/U) running MIUI 14 and HyperOS with thermal mitigation and gaming stability.',
    language = 'C',
    content = E'## Project Overview\nPollux Kernel is a custom kernel designed for Xiaomi Redmi 12 (fire), optimized for smooth daily responsiveness, sustained framerates, and compatibility with Xiaomi HyperOS.\n\n## System Profile\n- **Device**: Xiaomi Redmi 12 (fire / fire_in)\n- **Platform**: MediaTek MT6769H (Helio G88)\n- **Compatibility**: MIUI 14 (Android 13) and HyperOS 1.0 (Android 14)\n\n## Core Improvements\n- **Thermal Mitigation**: Recalibrated thermal driver profiles to minimize sudden CPU throttling while keeping device surface temperatures safe.\n- **Fast Charging Control**: Enhanced USB Power Delivery (PD) and Quick Charge negotiated currents for faster charge cycles.\n- **In-Kernel WireGuard**: Direct kernel-level WireGuard cryptographic network tunnel for low-latency private VPN connections.\n- **I/O Subsystem**: Optimized dirty writeback cache and memory eviction algorithms for snappy app launches on eMMC storage.\n- **Touch Polling**: Reduced touch input latency for responsive gaming controls.\n\n[Lihat di GitHub](https://github.com/naidrahiqa/android_kernel_xiaomi_fire)',
    updated_at = now()
WHERE slug = 'pollux-kernel-fire';

-- 3. Xiaomi MT6768 Common Kernel (k4.19)
UPDATE public.projects
SET title = 'Xiaomi MT6768 Common Kernel (k4.19)',
    description = 'Unified 4.19 LTS Linux kernel source tree for MediaTek MT6768/MT6769 platforms across multiple Xiaomi and Redmi devices.',
    language = 'C',
    content = E'## Overview\nA clean, upstreamed common kernel source tree supporting multiple MediaTek MT6768/MT6769 devices in the Xiaomi ecosystem (Helio G80, G85, and G88).\n\n## Supported Devices\n- Redmi 9 (lancelot)\n- Redmi Note 9 (merlin)\n- Redmi 10 (selene)\n- Redmi 12 (fire)\n\n## Development Highlights\n- **Clean Tree**: Stripped vendor telemetry and redundant debug drivers to minimize kernel binary size.\n- **Unified Defconfig**: Modular configuration architecture allowing quick switching between device targets.\n- **Modern Clang Compatibility**: Resolved legacy compiler warnings and inline assembly issues to ensure smooth builds with modern LLVM versions.\n\n[Lihat di GitHub](https://github.com/naidrahiqa/android_kernel_xiaomi_mt6768-k419)',
    updated_at = now()
WHERE slug = 'android-kernel-xiaomi-mt6768-k419';

-- 4. Kernel CI Kit
UPDATE public.projects
SET title = 'Kernel CI Kit',
    description = 'Reusable GitHub Actions CI/CD toolkit for Android kernel compilation with ccache, AnyKernel3 packaging, and Telegram notifications.',
    language = 'Shell',
    content = E'## Overview\nKernel CI Kit is a production-ready, modular CI/CD pipeline template designed to automate Android kernel builds on GitHub Actions with zero local infrastructure requirements.\n\n## Key Pipeline Features\n- **Toolchain Caching**: Automatically downloads and caches modern Clang toolchains (AOSP Clang, Proton Clang, Azure Clang).\n- **Persistent ccache**: Integrated GitHub Actions cache action saving intermediate object files, cutting recompilation times from 45 minutes down to 8 minutes.\n- **Automated Packaging**: Clones AnyKernel3, injects the newly compiled Image.gz-dtb kernel binary, and produces flashable zip archives.\n- **GitHub Releases Integration**: Automatically creates release tags and uploads build artifacts upon git tag push.\n- **Telegram Bot Notifier**: Sends real-time notifications with build status, compile duration, commit author, and direct download links.\n\n[Lihat di GitHub](https://github.com/naidrahiqa/kernel-ci-kit)',
    updated_at = now()
WHERE slug = 'kernel-ci-kit';

-- 5. Selene Releases
UPDATE public.projects
SET title = 'Selene Kernel Releases (PawwwNunungggg)',
    description = 'Official release and update repository for PawwwNunungggg custom kernel builds for Redmi 10 (selene).',
    language = 'Shell',
    content = E'## Overview\nCentral distribution repository hosting verified flashable releases of the PawwwNunungggg custom kernel for Xiaomi Redmi 10 (selene).\n\n## Release Editions\n- **Standard Edition**: Balanced profile recommended for daily use and maximum battery life.\n- **Performance Edition**: Raised GPU frequency ceilings and aggressive governor ramp-up for competitive gaming.\n- **KernelSU Edition**: Bundled with native KernelSU support for clean root management.\n\n## Installation Guide\n1. Download the latest AnyKernel3 flashable zip from GitHub Releases.\n2. Reboot device into custom recovery (TWRP / OrangeFox) or use KernelFlasher.\n3. Flash zip file without wiping data.\n4. Reboot system.\n\n[Lihat di GitHub](https://github.com/naidrahiqa/selene-releases)',
    updated_at = now()
WHERE slug = 'selene-releases';

-- 6. Spoof Fierce
UPDATE public.projects
SET title = 'Spoof Fierce (Zygisk Module & WebUI)',
    description = 'Low-level Android Zygisk module for per-application device model spoofing and high FPS unlocking with interactive WebUI.',
    language = 'C++',
    content = E'## Overview\nSpoof Fierce is a native Zygisk module built for Magisk and KernelSU Next that intercepts Zygote process creation to spoof device build properties on a per-application basis.\n\n## Technical Implementation\n- **C++ Native Hooking**: Hooks system property calls (`__system_property_get`) in userspace memory without touching `/system` partitions.\n- **Frame Rate Unlocking**: Spoofs high-end flagship identifiers to unlock 90 FPS and 120 FPS modes in games like Mobile Legends, PUBG Mobile, and Genshin Impact.\n- **WebUI Configuration**: Includes an embedded web interface accessible directly inside KernelSU and Magisk manager app.\n- **Safety Profile**: Selective target filtering prevents tampering with Google Play Integrity API or mobile banking apps.\n\n[Lihat di GitHub](https://github.com/naidrahiqa/spoof-fierce)',
    updated_at = now()
WHERE slug = 'spoof-fierce';

-- 7. MTK Unbrick Tool
UPDATE public.projects
SET title = 'MTK Unbrick Tool (BROM Mode Flasher)',
    description = 'Automated Python toolkit for unbricking MediaTek devices via BootROM (BROM) hardware mode with SLA/DAA exploit bypass.',
    language = 'Python',
    content = E'## Overview\nA specialized emergency recovery toolkit designed to rescue hard-bricked MediaTek devices that can no longer enter Fastboot or Recovery mode.\n\n## How It Works\n- **Hardware Handshake**: Interacts directly with the MediaTek BootROM over USB serial protocol.\n- **Auth Bypass**: Utilizes known BootROM vulnerability exploits (kamakiri / amonet) to bypass SLA (Serial Link Authentication) and DAA (Download Agent Authentication).\n- **Direct Flashing**: Allows reading and writing directly to eMMC/UFS storage partitions (`boot`, `vbmeta`, `super`) to restore a working bootloader.\n\n## Requirements\n- Python 3.9+\n- libusb / pyusb driver on Linux or WinUSB via Zadig on Windows\n\n[Lihat di GitHub](https://github.com/naidrahiqa/mtk-unbrick)',
    updated_at = now()
WHERE slug = 'mtk-unbrick';

-- 8. RK R75 Wired Recovery
UPDATE public.projects
SET title = 'RK R75 Wired Keyboard Recovery Toolkit',
    description = 'Hardware recovery toolkit to unbrick Royal Kludge RK R75 mechanical keyboards using ST-Link v2 and Serial Wire Debug (SWD).',
    language = 'Python',
    content = E'## Background\nA common issue with firmware flashing on the Royal Kludge RK R75 keyboard is corrupted flash memory leading to an unresponsive device (blackout / disconnected USB HID).\n\n## Recovery Method\n- **Hardware Debugging**: Connects an ST-Link v2 programmer to the onboard SWD test pads (`SWDIO`, `SWCLK`, `GND`, `3V3`).\n- **OpenOCD Automation**: Python script interfacing with OpenOCD to unlock write protection on the microcontroller.\n- **Firmware Restoration**: Erases corrupted flash memory sectors and writes clean factory firmware images.\n\n## Tested Models\n- RK R75 Single Mode Wired (QMK/VIA compatible)\n\n[Lihat di GitHub](https://github.com/naidrahiqa/rk-r75-wired-recovery)',
    updated_at = now()
WHERE slug = 'rk-r75-wired-recovery';

-- 9. Gitload Dump
UPDATE public.projects
SET title = 'Gitload Dump (OTA Payload Extractor)',
    description = 'Cloud-based Android OTA payload.bin extractor powered by GitHub Actions for rapid partition inspection.',
    language = 'Python',
    content = E'## Problem Solved\nFull Android OTA update packages often exceed 4 GB in size. Downloading entire zip archives solely to inspect a 64 MB `boot.img` or `init_boot.img` is bandwidth inefficient.\n\n## Solution Architecture\n- **HTTP Range Requests**: Queries remote OTA zip headers without downloading the full archive.\n- **GitHub Actions Execution**: Runs the payload extraction in the cloud utilizing fast datacenter bandwidth.\n- **Artifact Export**: Compresses extracted partition images and uploads them directly to GitHub Releases for instant download.\n\n[Lihat di GitHub](https://github.com/naidrahiqa/gitload-dump)',
    updated_at = now()
WHERE slug = 'gitload-dump';

-- 10. FetchVid
UPDATE public.projects
SET title = 'FetchVid (Video Downloader Desktop App)',
    description = 'High-speed desktop video downloader for Instagram Reels, TikTok, and YouTube Shorts built with Go, Wails, and modern UI.',
    language = 'Go',
    content = E'## Overview\nFetchVid is a lightweight, cross-platform desktop application designed to download short-form video content without advertisements, watermarks, or tracking scripts.\n\n## Technology Stack\n- **Backend**: Go (Golang) for fast concurrent network downloads and stream decoding.\n- **Framework**: Wails v2 for native desktop windowing without heavy Chromium bloat.\n- **Frontend**: TypeScript, HTML5, and Tailwind CSS.\n\n## Features\n- Single executable binary (`.exe` on Windows, native binary on Linux).\n- Supports Instagram Reels, TikTok, and YouTube Shorts.\n- Automatic highest resolution selection (up to 1080p 60fps).\n- Concurrent download pipeline with retry mechanisms.\n\n[Lihat di GitHub](https://github.com/naidrahiqa/FetchVid)',
    updated_at = now()
WHERE slug = 'fetchvid';

-- 11. Catchido
UPDATE public.projects
SET title = 'Catchido (Idol Photo Scraper & Deduplicator)',
    description = 'Automated high-resolution media scraper and deduplicator for Asian pop idol photography collections with perceptual hashing.',
    language = 'Python',
    content = E'## Overview\nCatchido is an automated media archiver built in Python that crawls official photo galleries and social profiles, downloading master-quality images while eliminating duplicates.\n\n## Technical Architecture\n- **Asynchronous Scraping**: Powered by `asyncio` and `httpx` for high-throughput concurrent requests.\n- **Perceptual Hashing (pHash)**: Computes image visual fingerprints to detect identical pictures even if file sizes or compression levels differ.\n- **EXIF Organization**: Parses original photo metadata to organize downloads into structured folders (`Artist / Event / Date / photo.jpg`).\n\n[Lihat di GitHub](https://github.com/naidrahiqa/catchido)',
    updated_at = now()
WHERE slug = 'catchido';

-- 12. Aqua Safe Monitor (Web Dashboard)
UPDATE public.projects
SET title = 'Aqua Safe Monitor (IoT Web Dashboard)',
    description = 'Real-time IoT water quality telemetry dashboard for OPSI 2026 research measuring pH, TDS, and water turbidity.',
    language = 'TypeScript',
    content = E'## Research Context\nDeveloped for the Olimpiade Penelitian Siswa Indonesia (OPSI) 2026 competition. Aqua Safe Monitor provides continuous automated water quality telemetry for aquaculture and environmental monitoring.\n\n## System Architecture\n- **Hardware Node**: ESP32 microcontroller with analog pH electrode, TDS sensor, and nephelometric turbidity sensor.\n- **Telemetry Protocol**: MQTT over secure WebSockets delivering sub-second sensor readings.\n- **Web Platform**: Built with Next.js, TypeScript, and Tailwind CSS.\n\n## Key Features\n- Real-time dynamic charts for pH levels, Total Dissolved Solids (ppm), and NTU turbidity.\n- Configurable threshold alerts alerting operators when water safety boundaries are violated.\n- Historical data logging and CSV export for research analysis.\n\n[Lihat di GitHub](https://github.com/naidrahiqa/aqua-safe-monitor)',
    updated_at = now()
WHERE slug = 'aqua-safe-monitor';

-- 13. Aqua Safe Monitor Android
UPDATE public.projects
SET title = 'Aqua Safe Monitor (Android App)',
    description = 'Native Android mobile application for real-time water quality telemetry, local ESP32 Wi-Fi provisioning, and alert push notifications.',
    language = 'Kotlin',
    content = E'## Mobile App Overview\nThe mobile companion application for the Aqua Safe Monitor IoT ecosystem, enabling field operators to observe sensor metrics directly from their smartphones.\n\n## Tech Stack\n- **Language**: Kotlin\n- **UI Toolkit**: Jetpack Compose with Material 3 styling\n- **Architecture**: MVVM with Kotlin Coroutines and StateFlow\n- **Local Storage**: Room Database for offline measurement caching\n\n## Core Capabilities\n- Wi-Fi AP provisioning to connect new ESP32 sensor hardware to local networks.\n- Foreground service notification daemon for emergency water hazard alerts.\n- Offline data synchronization with cloud databases.\n\n[Lihat di GitHub](https://github.com/naidrahiqa/aqua-safe-monitor-android)',
    updated_at = now()
WHERE slug = 'aqua-safe-monitor-android';

-- 14. KTI Dashboard
UPDATE public.projects
SET title = 'KTI Dashboard (Attendance & Finance System)',
    description = 'Organization management platform for Karya Tulis Ilmiah (KTI) school club handling attendance, cash flow, and member activity scores.',
    language = 'TypeScript',
    content = E'## Purpose\nA specialized administrative web application built for the Karya Tulis Ilmiah (KTI) student research club at SMK Negeri 3 Jepara to streamline club operations.\n\n## Features\n- **QR Code Attendance**: Enables quick meeting check-ins via dynamic QR codes.\n- **Cash Flow Ledger**: Real-time transparency for membership dues and project expenditure.\n- **Activity Scoring**: Tracks member participation across research workshops and competitions.\n- **Google Sheets API**: Uses Google Sheets as a free, reliable cloud database backend without server hosting costs.\n\n## Stack\nNext.js, React, TypeScript, Tailwind CSS, Google Sheets API.\n\n[Lihat di GitHub](https://github.com/naidrahiqa/kti-dashboard)',
    updated_at = now()
WHERE slug = 'kti-dashboard';

-- 15. Dashboard Kelas
UPDATE public.projects
SET title = 'Dashboard Kelas SMK (Mobile Hub)',
    description = 'Interactive Android mobile hub for vocational classroom management: schedules, daily cleaning roster, task tracker, and announcements.',
    language = 'Kotlin',
    content = E'## Purpose\nA centralized mobile application designed for students of SMK Negeri 3 Jepara to organize daily vocational class routines and academic assignments.\n\n## Modules\n- **Class Schedule**: Dynamic timetable highlighting current and upcoming subject periods.\n- **Cleaning Duty (Piket)**: Automated daily duty reminders with push notifications.\n- **Task Tracker**: Due date tracking for lab reports, jobsheets, and group presentations.\n- **Class Announcement Board**: Direct notices from teachers and class captains.\n\n## Stack\nKotlin, Android SDK, Room SQLite, Material Design.\n\n[Lihat di GitHub](https://github.com/naidrahiqa/dashboard-kelas)',
    updated_at = now()
WHERE slug = 'dashboard-kelas';

-- 16. ScoreWave
UPDATE public.projects
SET title = 'ScoreWave (Interactive Quiz & Score Game)',
    description = 'Fast-paced interactive quiz and leaderboard platform built during #juaravibecoding hackathon with real-time scoring.',
    language = 'TypeScript',
    content = E'## Overview\nScoreWave is a dynamic web-based quiz game application crafted during the #juaravibecoding hackathon challenge, focused on micro-interactions and engaging user feedback.\n\n## Key Highlights\n- **Streak Multipliers**: Rapid answers build up combo streaks that increase point yields.\n- **Audio-Visual Feedback**: Rich micro-animations and sound effects on correct and incorrect selections.\n- **Local Persistence**: Saves high scores and quiz completion stats locally.\n- **Responsive Layout**: Designed for seamless play on smartphones, tablets, and desktop browsers.\n\n[Lihat di GitHub](https://github.com/naidrahiqa/ScoreWave)',
    updated_at = now()
WHERE slug = 'scorewave';

-- 17. Kasirin Aja
UPDATE public.projects
SET title = 'Kasirin Aja (POS & Inventory System)',
    description = 'Web-based Point of Sale (POS) and inventory management system built with Laravel and MySQL for small retail business operations.',
    language = 'Blade',
    content = E'## Overview\nKasirin Aja is a practical Point of Sale (POS) web system developed using the Laravel framework to help micro and small enterprises manage transactions and stock inventory.\n\n## Core Modules\n- **Cashier Register**: Fast product lookup, barcode integration, and cart total calculation.\n- **Inventory Control**: Real-time stock decrement upon checkout and low-stock warning badges.\n- **Receipt Printing**: Generates thermal receipt print previews formatted for POS receipt printers.\n- **Financial Reporting**: Daily and monthly sales analytics with profit margin summaries.\n\n## Stack\nPHP 8, Laravel Framework, MySQL, Blade templates, Tailwind CSS.\n\n[Lihat di GitHub](https://github.com/naidrahiqa/kasirin_aja)',
    updated_at = now()
WHERE slug = 'kasirin-aja';

-- 18. Reboisasi
UPDATE public.projects
SET title = 'Reboisasi (Tree Planting & Reforestation Tracker)',
    description = 'Environmental conservation web application for tracking reforestation campaigns, tree growth milestones, and community volunteer contributions.',
    language = 'JavaScript',
    content = E'## Project Purpose\nA community-focused environmental conservation web application designed to encourage tree planting initiatives and track the survival rate of planted saplings.\n\n## Key Features\n- **Geotagged Planting Map**: Pins exact GPS coordinates of planted trees with species metadata.\n- **Growth Progress Timeline**: Volunteers can upload periodic photo updates to document canopy growth.\n- **Carbon Offset Calculator**: Estimates aggregate carbon sequestration based on tree count and age.\n- **Community Leaderboard**: Rewards active volunteer contributors.\n\n[Lihat di GitHub](https://github.com/naidrahiqa/reboisasi)',
    updated_at = now()
WHERE slug = 'reboisasi';

-- 19. CachyOS Rice
UPDATE public.projects
SET title = 'CachyOS Rice (Hyprland + Material You Setup)',
    description = 'Highly customized Linux desktop environment for CachyOS featuring Hyprland Wayland compositor, Material You dynamic color generation, and SDDM sync.',
    language = 'QML',
    content = E'## Desktop Setup Overview\nA bespoke Linux desktop configuration (rice) built on top of CachyOS (Arch Linux optimized base), pairing modern Wayland ergonomics with dynamic Material You aesthetics.\n\n## Software Components\n- **Compositor**: Hyprland (Wayland) with custom bezier cubic animations and rounded window borders.\n- **Bar & Widgets**: Waybar with custom CSS styling and system telemetry widgets.\n- **Dynamic Color Engine**: Matugen integration automatically extracting harmonious Material You color palettes from desktop wallpapers.\n- **Terminal & Shell**: Foot terminal emulator paired with zsh, Starship prompt, and Neovim editor.\n- **Lockscreen & Display Manager**: Hyprlock and SDDM login screen styled in perfect harmony with active desktop themes.\n\n## Reproducibility\nDotfiles are structured for automated deployment using symbolic links.\n\n[Lihat di GitHub](https://github.com/naidrahiqa/cachyos-rice)',
    updated_at = now()
WHERE slug = 'cachyos-rice';

-- 20. LKS ITNSA 2026
UPDATE public.projects
SET title = 'LKS ITNSA 2026 (Network Administration Competition Setup)',
    description = 'Documentation, configuration scripts, and topology notes for Lomba Kompetensi Siswa (LKS) SMK Tingkat Kabupaten Jepara - IT Network System Administration.',
    language = 'Shell',
    content = E'## Competition Profile\nComprehensive documentation and deployment scripts prepared for the Lomba Kompetensi Siswa (LKS) SMK Ke-34 Kabupaten Jepara in the IT Network System Administration (ITNSA) trade.\n\n## Core Competency Areas\n- **Linux Server Administration**: Debian GNU/Linux system configuration including Bind9 DNS, Nginx reverse proxy, Postfix/Dovecot secure mail server, and Docker containerization.\n- **Network Routing & Switching**: Cisco IOS and MikroTik RouterOS configuration covering OSPF multi-area, BGP peering, 802.1Q VLANs, Spanning Tree Protocol (STP), and IPSec site-to-site VPN.\n- **Network Security & Hardening**: Stateful firewall implementation with iptables/nftables, Snort Intrusion Detection, and automated server audit scripts.\n\n## Automation\nIncludes bash deployment scripts to accelerate system provisioning under strict competition time constraints.\n\n[Lihat di GitHub](https://github.com/naidrahiqa/LKS-SMK-Ke-34-KAB.JEPARA-ITNSA.)',
    updated_at = now()
WHERE slug = 'lks-itnsa-2026';
