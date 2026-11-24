import { describe, expect, it } from "vitest";
import {
  estimateReadingTimeMinutes,
  formatPklLanguageField,
  isPklProject,
  isPklSubjectSlug,
  parsePklMeta,
  parseWeekNumber,
  stripMarkdownToExcerpt,
} from "./pkl";

describe("pkl helpers", () => {
  it("recognizes PKL subject slugs and projects", () => {
    expect(isPklSubjectSlug("pkl")).toBe(true);
    expect(isPklSubjectSlug("PKL")).toBe(true);
    expect(isPklSubjectSlug("Praktik Kerja Lapangan")).toBe(true);
    expect(isPklSubjectSlug("matematika")).toBe(false);

    expect(isPklProject({ category: "school", subject: "PKL" })).toBe(true);
    expect(isPklProject({ category: "personal", subject: "PKL" })).toBe(false);
  });

  it("formats and parses week label + period metadata", () => {
    const encoded = formatPklLanguageField("Minggu 3", "20 - 25 Jan 2027");
    expect(encoded).toBe("Minggu 3 | 20 - 25 Jan 2027");

    const meta = parsePklMeta({
      title: "Konfigurasi VLAN & Trunking",
      language: encoded,
      description: "",
      content: "## Ringkasan\nHari ini saya melakukan setup VLAN di switch core.",
    });

    expect(meta.weekLabel).toBe("Minggu 3");
    expect(meta.weekNumber).toBe(3);
    expect(meta.period).toBe("20 - 25 Jan 2027");
    expect(meta.excerpt).toContain("Hari ini saya melakukan setup VLAN");
    expect(meta.readingTimeMinutes).toBe(1);
  });

  it("extracts week number from title when language field is empty", () => {
    expect(parseWeekNumber("Minggu ke-12: Evaluasi")).toBe(12);
    expect(parseWeekNumber("Week 4")).toBe(4);
    expect(parseWeekNumber("Orientasi")).toBeNull();

    const meta = parsePklMeta({
      title: "Minggu 2 - Crimping & Patch Panel",
      language: "",
      description: "Dokumentasi minggu kedua.",
      content: "",
    });
    expect(meta.weekLabel).toBe("Minggu 2");
    expect(meta.weekNumber).toBe(2);
    expect(meta.excerpt).toBe("Dokumentasi minggu kedua.");
  });

  it("strips markdown headings and code blocks when building excerpts", () => {
    const md = `## Kegiatan Utama\n\nSetup **MikroTik** dan [Winbox](https://mikrotik.com).\n\n\`\`\`bash\nip address print\n\`\`\``;
    expect(stripMarkdownToExcerpt(md)).toBe("Setup MikroTik dan Winbox.");
  });

  it("estimates reading time with minimum 1 minute", () => {
    expect(estimateReadingTimeMinutes("")).toBe(1);
    const longText = Array.from({ length: 400 }, () => "kata").join(" ");
    expect(estimateReadingTimeMinutes(longText)).toBe(3);
  });
});
