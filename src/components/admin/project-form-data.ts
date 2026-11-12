export const standardSubjectCatalog = [
  { name: "ADMINISTRASI SISTEM JARINGAN", group: "produktif", hint: "ASJ" },
  { name: "ADMINISTRASI INFRASTRUKTUR JARINGAN", group: "produktif", hint: "AIJ" },
  { name: "TEKNOLOGI LAYANAN JARINGAN", group: "produktif", hint: "TLJ" },
  { name: "TEKNOLOGI JARINGAN KABEL & NIRKABEL", group: "produktif", hint: "TJKN" },
  { name: "KEAMANAN JARINGAN", group: "produktif", hint: "Security" },
  { name: "KOMPUTER & JARINGAN DASAR", group: "produktif", hint: "KJD" },
  { name: "SISTEM KOMPUTER", group: "produktif", hint: "SisKom" },
  { name: "PEMROGRAMAN DASAR", group: "produktif", hint: "PemDas" },
  { name: "PRODUK KREATIF & KEWIRAUSAHAAN", group: "produktif", hint: "PKK" },
  { name: "INFORMATIKA", group: "produktif", hint: "Informatika" },
  { name: "DESAIN GRAFIS", group: "produktif", hint: "Multimedia" },
  { name: "DASAR PROGRAM KEAHLIAN TJKT", group: "produktif", hint: "DPK TJKT" },
  { name: "CLOUD COMPUTING", group: "produktif", hint: "Cloud" },
  { name: "IOT & SISTEM TERTANAM", group: "produktif", hint: "IoT" },
  { name: "ENGLISH", group: "umum", hint: "Bahasa Inggris" },
  { name: "BAHASA INDONESIA", group: "umum", hint: "B. Indo" },
  { name: "MATEMATIKA", group: "umum", hint: "MTK" },
  { name: "SEJARAH INDONESIA", group: "umum", hint: "Sejarah" },
  { name: "PENDIDIKAN PANCASILA", group: "umum", hint: "PPKn" },
  { name: "PENDIDIKAN AGAMA ISLAM", group: "umum", hint: "PAI" },
  { name: "PROJEK IPAS", group: "umum", hint: "IPAS" },
  { name: "PJOK", group: "umum", hint: "Olahraga" },
  { name: "BAHASA JEPANG", group: "umum", hint: "Nihongo" },
  { name: "BAHASA JAWA", group: "umum", hint: "B. Jawa" },
  { name: "SENI BUDAYA", group: "umum", hint: "Seni" },
  { name: "BIMBINGAN KONSELING", group: "umum", hint: "BK" },
] as const;

export const languageSuggestions = [
  "C",
  "C++",
  "Python",
  "Shell",
  "TypeScript",
  "Go",
  "Kotlin",
  "Blade",
  "QML",
];

export type StoryTemplate = {
  id: string;
  name: string;
  description: string;
  template: string;
};

export const storyTemplates: StoryTemplate[] = [
  {
    id: "case-study",
    name: "Case Study (Default)",
    description: "Standard narrative: Overview, Highlights, Tech Stack, Challenges, and Results",
    template: `## Overview
A brief introduction to the project, its motivations, and what problem it solves.

## Key Highlights
- **Feature One**: Description of functionality.
- **Feature Two**: Description of functionality.
- **Feature Three**: Description of functionality.

## Architecture & Tech Stack
Explain the technical architecture, libraries used, and how everything connects.

\`\`\`bash
# Example build or setup command
\`\`\`

## Engineering Challenges & Solutions
What were the hardest bugs or constraints you ran into, and how did you resolve them?

## Outcomes & Future Work
What did you achieve, performance metrics, and what's next for this project.`,
  },
  {
    id: "kernel-devlog",
    name: "Kernel / Low-Level Devlog",
    description: "Hardware specs, kernel features, build commands, and flashing guide",
    template: `## Device Specifications
- **Target Device**: 
- **Chipset / SoC**: 
- **Android Version**: 
- **Kernel Version**: 
- **Toolchain**: Clang / GCC

## Modifications & Optimizations
- **CPU / GPU Governors**: Optimized frequencies and energy model.
- **Memory Management**: ZRAM and swap tuning.
- **Drivers & Patches**: Upstream backports and stability fixes.

## Building from Source
\`\`\`bash
# Clone the repository
git clone <repo_url> -b <branch> kernel
cd kernel

# Run build script
bash build.sh
\`\`\`

## Flashing Instructions
1. Boot into custom recovery (TWRP/OrangeFox).
2. Flash the AnyKernel3 zip.
3. Wipe cache and reboot to system.`,
  },
  {
    id: "iot-hardware",
    name: "Hardware & IoT Build Log",
    description: "Bill of materials, wiring pinout, firmware logic, and telemetry",
    template: `## Bill of Materials (BOM)
- **Microcontroller**: ESP32 / Arduino / RP2040
- **Sensors & Modules**: 
- **Power Supply**: 

## Wiring & Schematic
Explain the connections, GPIO pin assignments, and communication buses (I2C, SPI, UART).

## Firmware Implementation
Core sensor polling, power-saving sleep modes, and error recovery.

\`\`\`cpp
// Snippet of core logic
void setup() {
  // initialization
}
\`\`\`

## Telemetry & Cloud Integration
Data pipeline (MQTT, WebSockets, Supabase, Dashboard).`,
  },
  {
    id: "school-report",
    name: "School Lab Report (SMK)",
    description: "Tujuan praktikum, alat & bahan, langkah konfigurasi, hasil, dan kesimpulan",
    template: `## Tujuan Praktikum
Memahami konsep dasar dan implementasi teknis pada materi ini.

## Alat & Bahan
- Laptop / PC
- Software: Packet Tracer / VirtualBox / Terminal Linux

## Langkah Kerja
1. Buka software dan siapkan topologi.
2. Lakukan konfigurasi IP address dan interface.
3. Terapkan konfigurasi routing atau layanan.

## Hasil & Pengujian
Dokumentasi hasil verifikasi dan pengujian:

\`\`\`bash
ping -c 4 192.168.1.1
\`\`\`

## Kesimpulan
Rangkuman dari apa yang dipelajari dan hasil praktikum.`,
  },
];
