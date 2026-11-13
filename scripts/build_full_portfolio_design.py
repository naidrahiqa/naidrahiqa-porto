#!/usr/bin/env python3
"""
Full Design System & Screen Suite Generator for Naidrahiqa Portfolio.
Builds the complete 10-screen suite in native FigCraft format:
1. 01 — Homepage
2. 02 — Projects & Repo Hub
3. 03 — Project Detail View
4. 04 — School Project Explorer (Struktur 4 Poin)
5. 05 — About & Systems Philosophy
6. 06 — Achievements & Credentials
7. 07 — Contact & Direct Channels
8. 08 — Admin Panel Dashboard
9. 09 — Design Tokens & UI Kit
10. 10 — Mobile Viewport Suite (390w)
"""

import json
import subprocess
import sys
from pathlib import Path

def hex_to_rgba(h, alpha=1.0):
    h = h.lstrip("#")
    r = int(h[0:2], 16) / 255.0
    g = int(h[2:4], 16) / 255.0
    b = int(h[4:6], 16) / 255.0
    return {"r": r, "g": g, "b": b, "a": float(alpha)}

def solid_fill(hex_color, opacity=1.0):
    return [{
        "blend": "normal",
        "color": hex_to_rgba(hex_color),
        "opacity": float(opacity),
        "type": "solid",
        "visible": True
    }]

def solid_stroke(hex_color, weight=1.0):
    return {
        "strokes": [{
            "blend": "normal",
            "color": hex_to_rgba(hex_color),
            "opacity": 1.0,
            "type": "solid",
            "visible": True
        }],
        "stroke": {
            "align": "inside",
            "cap_end": "none",
            "cap_start": "none",
            "dashes": [],
            "join": "miter",
            "miter_limit": 4.0,
            "sides": None,
            "weight": float(weight)
        }
    }

class MasterDocBuilder:
    def __init__(self, name="Naidrahiqa Portfolio — Master Suite"):
        self.name = name
        self.next_id = 1
        self.nodes = {}
        self.styles = []
        self.init_root()

    def alloc_id(self):
        curr = self.next_id
        self.next_id += 1
        return curr

    def init_root(self):
        root_id = self.alloc_id()
        self.nodes[str(root_id)] = {
            "id": root_id,
            "name": self.name,
            "type": "page",
            "height": 0.0,
            "width": 0.0,
            "children": [],
            "background": hex_to_rgba("#e5e5df"),
            "flows": [],
            "prototype": {
                "background": hex_to_rgba("#141416"),
                "device": "None",
                "rotation": "portrait"
            }
        }

    def add_child(self, parent_id, child_id):
        parent = self.nodes[str(parent_id)]
        if child_id not in parent["children"]:
            parent["children"].append(child_id)
        self.nodes[str(child_id)]["parent"] = parent_id

    def create_frame(self, name, parent_id, width=1440.0, height=100.0, x=0.0, y=0.0,
                     layout_mode="vertical", gap=0.0, padding=(0,0,0,0),
                     bg_color=None, stroke_color=None, stroke_weight=1.0,
                     corner_radius=0.0, sizing_h="fill", sizing_v="hug",
                     main_align="min", cross_align="min"):
        fid = self.alloc_id()
        p_top, p_right, p_bottom, p_left = padding
        
        node = {
            "id": fid,
            "name": name,
            "type": "frame",
            "width": float(width),
            "height": float(height),
            "clip": False,
            "children": [],
            "parent": parent_id,
            "transform": [1.0, 0.0, 0.0, 1.0, float(x), float(y)],
            "child_layout": {
                "absolute": False,
                "grid_column": None,
                "grid_column_span": 0,
                "grid_row": None,
                "grid_row_span": 0,
                "max_h": None,
                "max_w": None,
                "min_h": None,
                "min_w": None,
                "sizing_h": sizing_h,
                "sizing_v": sizing_v
            },
            "layout": {
                "mode": layout_mode,
                "gap": float(gap),
                "cross_gap": 0.0,
                "main_align": main_align,
                "cross_align": cross_align,
                "content_align": "auto",
                "padding": [float(p_top), float(p_right), float(p_bottom), float(p_left)],
                "reverse_z": False,
                "strokes_included": True,
                "wrap": False,
                "grid_columns": 1,
                "grid_rows": 1,
                "column_tracks": [],
                "row_tracks": []
            },
            "styles": {"effect": None, "fill": None, "grid": None, "stroke": None, "text": None}
        }
        if bg_color and bg_color != "none":
            node["fills"] = solid_fill(bg_color)
        else:
            node["fills"] = []
            
        if stroke_color and stroke_color != "none":
            st = solid_stroke(stroke_color, stroke_weight)
            node["strokes"] = st["strokes"]
            node["stroke"] = st["stroke"]
        else:
            node["strokes"] = []

        if corner_radius > 0:
            node["corner_radius"] = float(corner_radius)
            node["corner_smoothing"] = 0.6

        self.nodes[str(fid)] = node
        if parent_id:
            self.add_child(parent_id, fid)
        return fid

    def create_text(self, text, parent_id, font_family="Inter", font_size=14.0, font_style="Regular",
                    color="#141416", line_height=20.0, letter_spacing=0.0, text_case="original",
                    width=None, sizing_h="hug", sizing_v="hug"):
        tid = self.alloc_id()
        node = {
            "id": tid,
            "name": text[:25] if text else "Text",
            "type": "text",
            "characters": text,
            "parent": parent_id,
            "width": float(width) if width else 100.0,
            "height": float(line_height),
            "blend": "normal",
            "fills": solid_fill(color),
            "transform": [1.0, 0.0, 0.0, 1.0, 0.0, 0.0],
            "child_layout": {
                "absolute": False,
                "grid_column": None,
                "grid_column_span": 0,
                "grid_row": None,
                "grid_row_span": 0,
                "max_h": None,
                "max_w": None,
                "min_h": None,
                "min_w": None,
                "sizing_h": sizing_h,
                "sizing_v": sizing_v
            },
            "style": {
                "font_family": font_family,
                "font_size": float(font_size),
                "font_style": font_style,
                "line_height": {"unit": "pixels", "value": float(line_height)},
                "letter_spacing": {"unit": "percent", "value": float(letter_spacing)},
                "case": text_case,
                "decoration": "none",
                "fills": None,
                "link": None,
                "style_id": None
            },
            "styles": {"effect": None, "fill": None, "grid": None, "stroke": None, "text": None}
        }
        self.nodes[str(tid)] = node
        if parent_id:
            self.add_child(parent_id, tid)
        return tid

    def add_common_navbar(self, screen_id, active_item="Projects"):
        navbar = self.create_frame(
            name="Navigation Bar",
            parent_id=screen_id,
            width=1440.0,
            height=80.0,
            layout_mode="horizontal",
            gap=0.0,
            padding=(24, 80, 24, 80),
            bg_color="#ffffff",
            stroke_color="#e7e6e1",
            stroke_weight=1.0,
            sizing_h="fill",
            sizing_v="hug",
            main_align="spaceBetween",
            cross_align="center"
        )
        # Brand Lockup
        brand = self.create_frame("Brand Lockup", navbar, width=280.0, height=40.0, layout_mode="horizontal", gap=12, cross_align="center")
        self.create_text("NAIDRAHIQA", brand, font_family="Inter", font_size=15.0, font_style="Bold", color="#141416", letter_spacing=2.0, text_case="upper")
        status_pill = self.create_frame("Status Pill", brand, width=150.0, height=24.0, layout_mode="horizontal", gap=6, padding=(4, 10, 4, 10), bg_color="#ecfdf5", stroke_color="#a7f3d0", corner_radius=999)
        self.create_text("● AVAILABLE FOR WORK", status_pill, font_family="Inter", font_size=9.0, font_style="Bold", color="#059669", letter_spacing=1.5)

        # Nav Links
        nav_links = self.create_frame("Nav Links", navbar, width=440.0, height=40.0, layout_mode="horizontal", gap=32, cross_align="center")
        for link_title in ["Projects", "School", "Achievements", "About", "Contact"]:
            is_active = (link_title.lower() == active_item.lower())
            color = "#141416" if is_active else "#6f6f76"
            weight = "Bold" if is_active else "Medium"
            self.create_text(link_title, nav_links, font_family="Inter", font_size=13.0, font_style=weight, color=color)

        # CTA
        nav_cta = self.create_frame("Nav CTA", navbar, width=120.0, height=36.0, layout_mode="horizontal", padding=(8, 18, 8, 18), bg_color="#141416", corner_radius=999)
        self.create_text("Get in touch", nav_cta, font_family="Inter", font_size=12.0, font_style="Semi Bold", color="#ffffff")
        return navbar

    def add_common_footer(self, screen_id):
        footer = self.create_frame(
            name="Footer Bar",
            parent_id=screen_id,
            width=1440.0,
            height=80.0,
            layout_mode="horizontal",
            gap=0,
            padding=(30, 80, 30, 80),
            bg_color="#ffffff",
            stroke_color="#e7e6e1",
            stroke_weight=1.0,
            sizing_h="fill",
            sizing_v="hug",
            main_align="spaceBetween",
            cross_align="center"
        )
        self.create_text("© 2026 Faqih Ardian Syah (Naidrahiqa). Engineered Editorial System.", footer, font_family="Inter", font_size=12.0, font_style="Medium", color="#6f6f76")
        self.create_text("Built with FigCraft & Next.js 16", footer, font_family="Inter", font_size=12.0, font_style="Bold", color="#141416")
        return footer

def build_master_suite():
    b = MasterDocBuilder()
    root_id = 1

    # =========================================================================
    # SCREEN 1: 01 — HOMEPAGE (1440w x 2400h) at x=0, y=0
    # =========================================================================
    s1 = b.create_frame("01 — Homepage", root_id, width=1440.0, height=2400.0, x=0.0, y=0.0, bg_color="#fbfbf9", padding=(0,0,60,0))
    b.add_common_navbar(s1, active_item="")
    
    # Hero Section
    hero = b.create_frame("Hero Section", s1, width=1440.0, height=580.0, layout_mode="horizontal", gap=64, padding=(80,80,60,80), main_align="spaceBetween", cross_align="center")
    hero_left = b.create_frame("Hero Left", hero, width=700.0, height=440.0, gap=24)
    eyebrow = b.create_frame("Eyebrow", hero_left, width=280.0, height=28.0, layout_mode="horizontal", padding=(6,12,6,12), bg_color="#fff1f2", stroke_color="#fecdd3", corner_radius=6)
    b.create_text("NETWORKING STUDENT & KERNEL BUILDER", eyebrow, font_size=10.0, font_style="Bold", color="#e11d48", letter_spacing=2.0)
    name_l = b.create_frame("Name Lockup", hero_left, width=600.0, height=140.0, gap=4)
    b.create_text("FAQIH ARDIAN", name_l, font_size=64.0, font_style="Bold", color="#141416", line_height=68.0, letter_spacing=-2.0)
    b.create_text("SYAH", name_l, font_size=64.0, font_style="Bold", color="#141416", line_height=68.0, letter_spacing=-2.0)
    b.create_text("Low-level systems explorer, custom Android kernel developer for Redmi 10 (selene), and cyber security practitioner at SMK Negeri 3 Jepara.", hero_left, font_size=16.0, color="#6f6f76", line_height=26.0, width=600.0, sizing_h="fixed")
    
    hero_act = b.create_frame("Hero Actions", hero_left, width=320.0, height=50.0, layout_mode="horizontal", gap=14)
    b1 = b.create_frame("Btn Explore", hero_act, width=150.0, height=48.0, padding=(14,24,14,24), bg_color="#141416", corner_radius=999, main_align="center")
    b.create_text("Explore work →", b1, font_size=14.0, font_style="Semi Bold", color="#ffffff")
    b2 = b.create_frame("Btn Connect", hero_act, width=140.0, height=48.0, padding=(14,24,14,24), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=999, main_align="center")
    b.create_text("Let's connect", b2, font_size=14.0, font_style="Semi Bold", color="#141416")

    hero_stats = b.create_frame("Hero Stats Box", hero, width=340.0, height=360.0, bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=16, padding=(16,24,16,24))
    for val, lbl, sub in [("23", "REPOSITORIES", "Public open-source tools & drivers"), ("12", "PROJECTS", "School showcases & systems research"), ("08", "CERTIFICATES", "Networking & security competencies")]:
        row = b.create_frame(f"Stat {lbl}", hero_stats, width=290.0, height=80.0, gap=4, padding=(10,0,10,0))
        h_row = b.create_frame("H", row, layout_mode="horizontal", gap=16, main_align="spaceBetween", cross_align="baseline")
        b.create_text(val, h_row, font_size=36.0, font_style="Bold", color="#141416", line_height=40.0)
        b.create_text(lbl, h_row, font_size=10.0, font_style="Bold", color="#6f6f76", letter_spacing=2.0)
        b.create_text(sub, row, font_size=12.0, color="#6f6f76")

    # Telemetry Strip
    telemetry = b.create_frame("Telemetry Strip", s1, width=1440.0, height=80.0, layout_mode="horizontal", gap=32, padding=(24,80,24,80), bg_color="#ffffff", stroke_color="#e7e6e1", main_align="spaceBetween")
    for k, v in [("ROLE", "Networking & Security Student"), ("ARCH / KERNEL", "x86_64, AArch64 (selene 4.19)"), ("PRIMARY STACK", "C, Rust, Go, TypeScript, Linux"), ("ACADEMIC BASE", "SMK Negeri 3 Jepara (TKJ)")]:
        bx = b.create_frame(f"Spec {k}", telemetry, width=280.0, height=40.0, gap=4)
        b.create_text(k, bx, font_size=9.0, font_style="Bold", color="#6f6f76", letter_spacing=2.0)
        b.create_text(v, bx, font_size=13.0, font_style="Semi Bold", color="#141416")

    # Projects section snippet
    p_sec = b.create_frame("Featured Work Section", s1, width=1440.0, height=480.0, gap=28, padding=(60,80,40,80))
    p_hdr = b.create_frame("Hdr", p_sec, width=1280.0, height=36.0, layout_mode="horizontal", main_align="spaceBetween", cross_align="baseline")
    b.create_text("FEATURED WORK", p_hdr, font_size=24.0, font_style="Bold", color="#141416", letter_spacing=1.0)
    b.create_text("Live repositories & school engineering showcases →", p_hdr, font_size=13.0, font_style="Medium", color="#6f6f76")
    
    p_cards_row = b.create_frame("Cards Row", p_sec, width=1280.0, height=260.0, layout_mode="horizontal", gap=24)
    for p_name, p_tag, p_desc, p_badge in [("redmi10-selene-kernel", "KERNEL / C", "Custom Android Linux 4.19 kernel optimization for Xiaomi Redmi 10 2022 (selene).", "PRODUCTION"), ("pancasila-interactive-showcase", "SCHOOL / CIVICS", "Interactive education platform showcasing daily implementations of Pancasila values (Sila 1-5).", "FEATURED")]:
        cd = b.create_frame(f"Card {p_name}", p_cards_row, width=620.0, height=240.0, gap=14, padding=(24,24,24,24), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=16)
        top = b.create_frame("Top", cd, layout_mode="horizontal", main_align="spaceBetween", cross_align="center")
        b.create_text(p_tag, top, font_size=10.0, font_style="Bold", color="#6f6f76", letter_spacing=1.5)
        bdg = b.create_frame("Bdg", top, padding=(3,8,3,8), bg_color="#fff1f2", corner_radius=999)
        b.create_text(p_badge, bdg, font_size=9.0, font_style="Bold", color="#e11d48", letter_spacing=1.0)
        b.create_text(p_name, cd, font_size=18.0, font_style="Bold", color="#141416")
        b.create_text(p_desc, cd, font_size=13.0, color="#6f6f76", line_height=22.0)
        bot = b.create_frame("Bot", cd, layout_mode="horizontal", gap=16)
        b.create_text("⭐ 18", bot, font_size=11.0, color="#141416")
        b.create_text("🍴 6", bot, font_size=11.0, color="#141416")
        b.create_text("Open detail →", bot, font_size=11.0, font_style="Bold", color="#e11d48")

    # Stack Section
    stk_sec = b.create_frame("Stack Section", s1, width=1440.0, height=260.0, gap=20, padding=(40,80,40,80))
    b.create_text("ENGINEERING STACK & TOOLING", stk_sec, font_size=16.0, font_style="Bold", color="#141416", letter_spacing=2.0)
    for r_idx, tech_list in [(1, ["Linux Kernel", "C / C++", "Rust", "Go", "MikroTik RouterOS", "Bash Scripting", "Wireshark", "Ghidra"]), (2, ["Next.js 16", "TypeScript", "Tailwind CSS v4", "Supabase", "Docker", "Git / GitHub", "Python 3", "QEMU / KVM"])]:
        tr = b.create_frame(f"Tech Row {r_idx}", stk_sec, width=1280.0, height=48.0, layout_mode="horizontal", gap=12)
        for t in tech_list:
            tile = b.create_frame(f"Tile {t}", tr, width=150.0, height=46.0, padding=(12,16,12,16), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=8, main_align="center", cross_align="center")
            b.create_text(t, tile, font_size=12.0, font_style="Semi Bold", color="#141416")

    b.add_common_footer(s1)

    # =========================================================================
    # SCREEN 2: 02 — PROJECTS & REPO HUB (1440w x 2200h) at x=1540, y=0
    # =========================================================================
    s2 = b.create_frame("02 — Projects Hub", root_id, width=1440.0, height=2200.0, x=1540.0, y=0.0, bg_color="#fbfbf9", padding=(0,0,60,0))
    b.add_common_navbar(s2, active_item="Projects")
    
    # Hub Header
    p_header = b.create_frame("Hub Header", s2, width=1440.0, height=240.0, gap=16, padding=(60,80,40,80))
    b.create_text("PROJECTS & REPOSITORIES", p_header, font_size=40.0, font_style="Bold", color="#141416", letter_spacing=-1.0)
    b.create_text("Comprehensive archive of open-source tooling, Linux kernel experiments, and SMK Negeri 3 Jepara vocational projects.", p_header, font_size=16.0, color="#6f6f76", line_height=26.0, width=800.0, sizing_h="fixed")

    # Filter Bar
    f_bar = b.create_frame("Filter Bar", s2, width=1440.0, height=70.0, layout_mode="horizontal", gap=16, padding=(10,80,10,80), cross_align="center")
    tab_all = b.create_frame("Tab All", f_bar, padding=(8,16,8,16), bg_color="#141416", corner_radius=999)
    b.create_text("All Work (35)", tab_all, font_size=12.0, font_style="Bold", color="#ffffff")
    tab_personal = b.create_frame("Tab Personal", f_bar, padding=(8,16,8,16), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=999)
    b.create_text("Personal GitHub Repos (23)", tab_personal, font_size=12.0, font_style="Medium", color="#141416")
    tab_school = b.create_frame("Tab School", f_bar, padding=(8,16,8,16), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=999)
    b.create_text("School Showcases (12)", tab_school, font_size=12.0, font_style="Medium", color="#141416")

    # Language Tags Filter
    lang_bar = b.create_frame("Lang Bar", s2, width=1440.0, height=50.0, layout_mode="horizontal", gap=10, padding=(0,80,20,80), cross_align="center")
    for lang, count in [("C", "8"), ("TypeScript", "7"), ("Go", "4"), ("Rust", "3"), ("Python", "2"), ("Assembly", "1")]:
        l_pill = b.create_frame(f"Lang {lang}", lang_bar, padding=(6,12,6,12), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=6)
        b.create_text(f"{lang} ({count})", l_pill, font_size=11.0, color="#6f6f76")

    # 6 Repository Cards Grid (2 rows of 3)
    repo_grid = b.create_frame("Repo Grid", s2, width=1440.0, height=800.0, gap=20, padding=(10,80,40,80))
    for r_idx, repos in [(1, [
        ("kernel_driver_device", "C", "⭐ 24", "Linux character driver skeleton with ioctl support and sysfs entries.", ["linux-kernel", "c", "driver"]),
        ("redmi10-selene-kernel", "C", "⭐ 18", "Kernel 4.19 optimizations for MediaTek Helio G88 (selene).", ["android", "kernel", "selene"]),
        ("iot-security-probe", "Go", "⭐ 15", "Low-power headless network packet capture and rogue AP detection.", ["iot", "security", "packet-sniffer"])
    ]), (2, [
        ("naidrahiqa-porto", "TypeScript", "⭐ 11", "Personal portfolio & school project showcase built on Next.js 16.", ["nextjs16", "tailwind", "supabase"]),
        ("pancasila-interactive", "TypeScript", "⭐ 12", "Interactive moral values documentation at SMK Negeri 3 Jepara.", ["school", "smkn3-jepara"]),
        ("mikrotik-hotspot-auth", "RouterOS", "⭐ 9", "Automated RADIUS authentication script for vocational labs.", ["mikrotik", "tkj", "networking"])
    ])]:
        r_row = b.create_frame(f"Repo Row {r_idx}", repo_grid, width=1280.0, height=250.0, layout_mode="horizontal", gap=20)
        for name, lang, stars, desc, tags in repos:
            card = b.create_frame(f"Card {name}", r_row, width=410.0, height=240.0, gap=12, padding=(20,20,20,20), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=14)
            c_top = b.create_frame("Top", card, layout_mode="horizontal", main_align="spaceBetween", cross_align="center")
            b.create_text(lang, c_top, font_size=10.0, font_style="Bold", color="#e11d48", letter_spacing=1.0)
            b.create_text(stars, c_top, font_size=11.0, color="#141416")
            b.create_text(name, card, font_size=16.0, font_style="Bold", color="#141416")
            b.create_text(desc, card, font_size=12.0, color="#6f6f76", line_height=20.0)
            tag_row = b.create_frame("Tags", card, layout_mode="horizontal", gap=6)
            for t in tags[:2]:
                tp = b.create_frame(f"Tag {t}", tag_row, padding=(3,8,3,8), bg_color="#f4f4f2", corner_radius=4)
                b.create_text(f"#{t}", tp, font_size=9.0, color="#6f6f76")

    # School Class Hierarchy Explorer Cards
    b.create_text("VOCATIONAL SCHOOL CURRICULUM (TKJ)", s2, font_size=18.0, font_style="Bold", color="#141416", letter_spacing=1.0)
    sch_row = b.create_frame("School Class Row", s2, width=1440.0, height=240.0, layout_mode="horizontal", gap=24, padding=(10,80,40,80))
    for c_title, c_desc, c_subs in [
        ("Class X (Fase E)", "Dasar-dasar Teknik Jaringan Komputer dan Telekomunikasi", "K3LH, Perakitan, Jaringan Dasar"),
        ("Class XI (Fase F)", "Konsentrasi Keahlian Teknik Komputer dan Jaringan", "Routing Statis/Dinamis, Mikrotik, Server"),
        ("Class XII (Fase F Lanjut)", "Administrasi Sistem Jaringan & Keamanan Cyber", "Firewall, VPN, Pentesting, Kernel Dev")
    ]:
        c_box = b.create_frame(f"Class {c_title}", sch_row, width=410.0, height=200.0, gap=12, padding=(24,24,24,24), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=16)
        b.create_text(c_title, c_box, font_size=17.0, font_style="Bold", color="#141416")
        b.create_text(c_desc, c_box, font_size=13.0, color="#6f6f76", line_height=20.0)
        b.create_text(f"Subjects: {c_subs}", c_box, font_size=11.0, font_style="Medium", color="#e11d48")

    b.add_common_footer(s2)

    # =========================================================================
    # SCREEN 3: 03 — PROJECT DETAIL VIEW (1440w x 2200h) at x=3080, y=0
    # =========================================================================
    s3 = b.create_frame("03 — Project Detail", root_id, width=1440.0, height=2200.0, x=3080.0, y=0.0, bg_color="#fbfbf9", padding=(0,0,60,0))
    b.add_common_navbar(s3, active_item="Projects")
    
    # Breadcrumbs & Title
    d_top = b.create_frame("Detail Header", s3, width=1440.0, height=180.0, gap=12, padding=(40,80,20,80))
    b.create_text("Projects  /  Personal  /  redmi10-selene-kernel", d_top, font_size=12.0, font_style="Bold", color="#6f6f76")
    b.create_text("Redmi 10 (selene) Custom Kernel 4.19", d_top, font_size=36.0, font_style="Bold", color="#141416", letter_spacing=-1.0)
    b.create_text("Custom Android Linux kernel targeting thermal throttling reduction, aggressive battery life optimizations, and CPU governor tuning.", d_top, font_size=15.0, color="#6f6f76", line_height=24.0, width=900.0, sizing_h="fixed")

    # Main 2-column detail layout
    d_content = b.create_frame("Detail Content 2Col", s3, width=1440.0, height=1200.0, layout_mode="horizontal", gap=40, padding=(20,80,40,80))
    
    # Left Column: Story, Benchmarks, Media
    d_left = b.create_frame("Detail Left Story", d_content, width=820.0, height=1100.0, gap=28)
    
    # Video/Media Hero Mockup
    vid_box = b.create_frame("Video Hero Box", d_left, width=820.0, height=420.0, bg_color="#141416", stroke_color="#e7e6e1", corner_radius=16, main_align="center", cross_align="center")
    b.create_text("▶ PLAY VIDEO BENCHMARK DEMO", vid_box, font_size=14.0, font_style="Bold", color="#ffffff", letter_spacing=1.0)

    # Narrative Markdown Block
    b.create_text("OVERVIEW & ARCHITECTURE", d_left, font_size=18.0, font_style="Bold", color="#141416", letter_spacing=1.0)
    b.create_text("The MediaTek Helio G88 SoC in Redmi 10 (selene) notoriously throttles under prolonged computational workloads due to conservative thermal throttling tables in the stock vendor kernel. By analyzing thermal zones and governor profiles, this custom build patches the kernel scheduler to balance task placement across big and LITTLE cores without spiking CPU voltage.", d_left, font_size=14.0, color="#6f6f76", line_height=24.0)

    # Benchmark Cards Row
    bm_row = b.create_frame("Benchmark Row", d_left, width=820.0, height=120.0, layout_mode="horizontal", gap=16)
    for b_num, b_lbl, b_desc in [("-34%", "THERMAL THROTTLE", "Stable frequency under 30min stress"), ("+18%", "STANDBY RUNTIME", "Optimized deep-sleep power states"), ("0 KB", "WAKELOCK LEAKS", "Patched sensor wakelock loops")]:
        bm = b.create_frame(f"Bm {b_lbl}", bm_row, width=260.0, height=110.0, gap=6, padding=(16,16,16,16), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=12)
        b.create_text(b_num, bm, font_size=28.0, font_style="Bold", color="#e11d48")
        b.create_text(b_lbl, bm, font_size=10.0, font_style="Bold", color="#141416", letter_spacing=1.0)
        b.create_text(b_desc, bm, font_size=11.0, color="#6f6f76")

    # Right Column: Metadata Sidebar
    d_right = b.create_frame("Detail Right Sidebar", d_content, width=420.0, height=800.0, gap=24)
    
    meta_box = b.create_frame("Meta Specs Box", d_right, width=420.0, height=480.0, gap=20, padding=(24,24,24,24), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=16)
    b.create_text("REPOSITORY SPECS", meta_box, font_size=14.0, font_style="Bold", color="#141416", letter_spacing=1.0)
    for mk, mv in [
        ("GITHUB REPO", "github.com/naidrahiqa/redmi10-selene-kernel"),
        ("STARS / FORKS", "18 Stars · 6 Forks"),
        ("LANGUAGE", "C (98.4%) · Makefile (1.6%)"),
        ("TOOLCHAIN", "Proton Clang 13 · AArch64 Linux Android"),
        ("BRANCH", "android-4.19-selene (Stable)"),
        ("LICENSE", "GNU General Public License v2.0")
    ]:
        mrow = b.create_frame(f"M {mk}", meta_box, gap=4)
        b.create_text(mk, mrow, font_size=9.0, font_style="Bold", color="#6f6f76", letter_spacing=1.5)
        b.create_text(mv, mrow, font_size=12.0, font_style="Semi Bold", color="#141416")

    git_btn = b.create_frame("Git Btn", meta_box, width=370.0, height=44.0, padding=(12,18,12,18), bg_color="#141416", corner_radius=10, main_align="center")
    b.create_text("View Source on GitHub ↗", git_btn, font_size=13.0, font_style="Bold", color="#ffffff")

    b.add_common_footer(s3)

    # =========================================================================
    # SCREEN 4: 04 — SCHOOL PROJECT EXPLORER (1440w x 2000h) at x=4620, y=0
    # =========================================================================
    s4 = b.create_frame("04 — School Project Explorer", root_id, width=1440.0, height=2000.0, x=4620.0, y=0.0, bg_color="#fbfbf9", padding=(0,0,60,0))
    b.add_common_navbar(s4, active_item="School")
    
    # Subject Header
    sch_hdr = b.create_frame("School Header", s4, width=1440.0, height=220.0, gap=14, padding=(50,80,30,80))
    b.create_text("School  /  Class XII  /  Pendidikan Pancasila", sch_hdr, font_size=12.0, font_style="Bold", color="#6f6f76")
    b.create_text("Penerapan Sila Pancasila Pada Kehidupan Sehari-hari", sch_hdr, font_size=36.0, font_style="Bold", color="#141416", letter_spacing=-1.0)
    b.create_text("Dokumentasi aksi nyata pengamalan nilai Pancasila di lingkungan SMK Negeri 3 Jepara berdasarkan pedoman Struktur Universal 4 Poin.", sch_hdr, font_size=15.0, color="#6f6f76", line_height=24.0, width=900.0, sizing_h="fixed")

    # 4-Point Structured Showcase Cards
    points_container = b.create_frame("Points Container", s4, width=1440.0, height=1200.0, gap=24, padding=(10,80,40,80))
    
    points_data = [
        ("Sila 1: Ketuhanan Yang Maha Esa", "Simbol: Bintang Emas berlatar perisai hitam.", "Makna: Toleransi beragama dan ketakwaan kepada Tuhan.", "Aksi Nyata: Mendengarkan khutbah Jumat dengan khusyuk di mushola sekolah bersama siswa SMK Negeri 3 Jepara tanpa berbicara."),
        ("Sila 2: Kemanusiaan Yang Adil dan Beradab", "Simbol: Rantai emas persegi dan lingkaran.", "Makna: Solidaritas kemanusiaan, empati sesama teman.", "Aksi Nyata: Berbagi makanan dan perlengkapan praktek kepada rekan sekelas saat praktikum lab jaringan komputer."),
        ("Sila 3: Persatuan Indonesia", "Simbol: Pohon Beringin rimbun.", "Makna: Kebersamaan di tengah keberagaman suku dan latar belakang.", "Aksi Nyata: Gotong royong membersihkan laboratorium komputer dan merapikan instalasi kabel rack server bersama kelompok."),
        ("Sila 5: Keadilan Sosial Bagi Seluruh Rakyat Indonesia", "Simbol: Padi dan Kapas kemakmuran.", "Makna: Keadilan pembagian hak dan pemenuhan kebutuhan bersama.", "Aksi Nyata: Distribusi tertib dan merata pada Program Makan Bergizi Gratis (MBG) untuk seluruh siswa kelas XII.")
    ]

    for p_title, p_sim, p_mak, p_aks in points_data:
        p_card = b.create_frame(f"P {p_title}", points_container, width=1280.0, height=240.0, layout_mode="horizontal", gap=32, padding=(24,28,24,28), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=16)
        
        # Left media preview box
        media_prev = b.create_frame("Media Box", p_card, width=300.0, height=190.0, bg_color="#f4f4f2", stroke_color="#e7e6e1", corner_radius=12, main_align="center", cross_align="center")
        b.create_text("📷 DOKUMENTASI MEDIA", media_prev, font_size=11.0, font_style="Bold", color="#6f6f76", letter_spacing=1.0)
        
        # Right point narrative
        p_right = b.create_frame("Point Narrative", p_card, width=900.0, height=190.0, gap=10)
        b.create_text(p_title, p_right, font_size=18.0, font_style="Bold", color="#141416")
        b.create_text(p_sim, p_right, font_size=13.0, font_style="Semi Bold", color="#e11d48")
        b.create_text(p_mak, p_right, font_size=13.0, color="#6f6f76")
        b.create_text(p_aks, p_right, font_size=13.0, color="#141416", line_height=20.0)

    b.add_common_footer(s4)

    # =========================================================================
    # SCREEN 5: 05 — ABOUT PAGE (1440w x 1800h) at x=0, y=2600
    # =========================================================================
    s5 = b.create_frame("05 — About Page", root_id, width=1440.0, height=1800.0, x=0.0, y=2600.0, bg_color="#fbfbf9", padding=(0,0,60,0))
    b.add_common_navbar(s5, active_item="About")
    
    # About Header & Two Column
    ab_header = b.create_frame("About Header", s5, width=1440.0, height=180.0, gap=12, padding=(60,80,20,80))
    b.create_text("ABOUT ME & SYSTEMS PHILOSOPHY", ab_header, font_size=40.0, font_style="Bold", color="#141416", letter_spacing=-1.0)
    b.create_text("The mindset, technical convictions, and low-level development background behind Naidrahiqa.", ab_header, font_size=16.0, color="#6f6f76", width=800.0, sizing_h="fixed")

    ab_body = b.create_frame("About Body 2Col", s5, width=1440.0, height=1200.0, layout_mode="horizontal", gap=60, padding=(20,80,40,80))
    
    # Left Column: Big Philosophy
    ab_left = b.create_frame("About Quote Left", ab_body, width=440.0, height=600.0, gap=20)
    b.create_text("“Building systems, breaking them, and rigorously documenting the mechanics.”", ab_left, font_size=24.0, font_style="Bold", color="#141416", line_height=34.0, letter_spacing=-0.5)
    b.create_text("Faqih Ardian Syah (Naidrahiqa) — Student of SMK Negeri 3 Jepara, Computer & Network Engineering (TKJ).", ab_left, font_size=13.0, color="#6f6f76", line_height=22.0)

    # Right Column: Sections
    ab_right = b.create_frame("About Sections Right", ab_body, width=820.0, height=1100.0, gap=32)
    for ab_sec_title, ab_sec_content in [
        ("WHO I AM", "I am a high-school vocational student majoring in Teknik Komputer dan Jaringan (TKJ). My primary fascination lies beneath high-level abstractions: Linux kernel internals, device drivers, network protocols, and binary exploitation. Rather than consuming pre-packaged tools, I prefer compiling from source, reading dissassembly, and patching drivers."),
        ("CURRENT FOCUS", "Currently tuning Android 4.19 kernel trees for MT6769 (Redmi 10 selene), experimenting with custom memory management patches and CPU governor scheduler tweaks. On the networking side, exploring packet sniffing with Go, RouterOS scripting, and participating in CTF competitions."),
        ("WHAT'S NEXT", "Targeting embedded systems engineering and Linux kernel security research. Aiming to bridge low-level firmware security with scalable cloud infrastructure and high-taste frontend engineering."),
        ("HARDWARE & TESTBENCH SETUP", "Workstation: ThinkPad X13 running Arch Linux (CachyOS) with Hyprland Wayland. Mobile Testbench: Xiaomi Redmi 10 (selene) running unlocked custom kernel builds. Networking Lab: MikroTik hEX series router, managed gigabit switches.")
    ]:
        sec_box = b.create_frame(f"Sec {ab_sec_title}", ab_right, width=820.0, height=200.0, gap=10, padding=(20,24,20,24), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=14)
        b.create_text(ab_sec_title, sec_box, font_size=11.0, font_style="Bold", color="#e11d48", letter_spacing=1.5)
        b.create_text(ab_sec_content, sec_box, font_size=13.0, color="#141416", line_height=22.0)

    b.add_common_footer(s5)

    # =========================================================================
    # SCREEN 6: 06 — ACHIEVEMENTS & CREDENTIALS (1440w x 1800h) at x=1540, y=2600
    # =========================================================================
    s6 = b.create_frame("06 — Achievements", root_id, width=1440.0, height=1800.0, x=1540.0, y=2600.0, bg_color="#fbfbf9", padding=(0,0,60,0))
    b.add_common_navbar(s6, active_item="Achievements")
    
    ach_hdr = b.create_frame("Ach Header", s6, width=1440.0, height=200.0, gap=14, padding=(60,80,20,80))
    b.create_text("ACHIEVEMENTS & CREDENTIALS", ach_hdr, font_size=40.0, font_style="Bold", color="#141416", letter_spacing=-1.0)
    b.create_text("Competitions, vocational awards, network certifications, and verified credentials.", ach_hdr, font_size=16.0, color="#6f6f76", width=800.0, sizing_h="fixed")

    # Category filters
    ach_tabs = b.create_frame("Ach Filter", s6, width=1440.0, height=60.0, layout_mode="horizontal", gap=12, padding=(0,80,20,80))
    for t_name, is_sel in [("All (8)", True), ("Competitions (3)", False), ("Training & Bootcamps (3)", False), ("Seminars (2)", False)]:
        t_btn = b.create_frame(f"Tab {t_name}", ach_tabs, padding=(8,16,8,16), bg_color="#141416" if is_sel else "#ffffff", stroke_color=None if is_sel else "#e7e6e1", corner_radius=999)
        b.create_text(t_name, t_btn, font_size=12.0, font_style="Bold" if is_sel else "Medium", color="#ffffff" if is_sel else "#141416")

    # 4 Achievement Cards
    ach_grid = b.create_frame("Ach Grid", s6, width=1440.0, height=900.0, gap=20, padding=(10,80,40,80))
    for ach_title, ach_event, ach_cat, ach_year, ach_desc in [
        ("Juara 1 LKS Tingkat Kabupaten — IT Network Systems Administration", "LKS SMK 2026", "COMPETITION", "2026", "First place in vocational networking competition covering Debian servers, Cisco routing, and MikroTik firewall deployment."),
        ("MikroTik Certified Network Associate (MTCNA) — 92%", "MikroTik Academy", "CERTIFICATION", "2025", "Official international industrial certification for routing, bridging, wireless, network management, and firewall policy."),
        ("Finalis Capture The Flag (CTF) Cyber Security Challenge", "National Cyberfest", "COMPETITION", "2025", "Secured top-10 national finalist rank competing in forensics, binary exploitation, reverse engineering, and web security."),
        ("Cisco Certified Support Technician (CCST) Networking", "Cisco Networking Academy", "TRAINING", "2025", "Foundational networking proficiency verified in IP addressing, subnetting, switching, and routing protocols.")
    ]:
        a_card = b.create_frame(f"Card {ach_title}", ach_grid, width=1280.0, height=180.0, layout_mode="horizontal", gap=24, padding=(20,24,20,24), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=16)
        
        # Cert icon thumbnail
        cert_thumb = b.create_frame("Thumb", a_card, width=160.0, height=140.0, bg_color="#f4f4f2", stroke_color="#e7e6e1", corner_radius=10, main_align="center", cross_align="center")
        b.create_text("🏆 CERT", cert_thumb, font_size=12.0, font_style="Bold", color="#e11d48")

        # Content
        a_body = b.create_frame("Body", a_card, width=880.0, height=140.0, gap=8)
        top_m = b.create_frame("M", a_body, layout_mode="horizontal", gap=12, cross_align="center")
        b.create_text(ach_cat, top_m, font_size=10.0, font_style="Bold", color="#e11d48", letter_spacing=1.0)
        b.create_text(f"· {ach_year}", top_m, font_size=11.0, color="#6f6f76")
        b.create_text(f"· {ach_event}", top_m, font_size=11.0, font_style="Semi Bold", color="#141416")
        b.create_text(ach_title, a_body, font_size=16.0, font_style="Bold", color="#141416")
        b.create_text(ach_desc, a_body, font_size=13.0, color="#6f6f76", line_height=20.0)

        # Action preview button
        prev_btn = b.create_frame("PrevBtn", a_card, width=140.0, height=40.0, padding=(10,16,10,16), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=8, main_align="center", cross_align="center")
        b.create_text("View PDF ↗", prev_btn, font_size=12.0, font_style="Semi Bold", color="#141416")

    b.add_common_footer(s6)

    # =========================================================================
    # SCREEN 7: 07 — CONTACT PAGE (1440w x 1600h) at x=3080, y=2600
    # =========================================================================
    s7 = b.create_frame("07 — Contact Page", root_id, width=1440.0, height=1600.0, x=3080.0, y=2600.0, bg_color="#fbfbf9", padding=(0,0,60,0))
    b.add_common_navbar(s7, active_item="Contact")
    
    c_hdr = b.create_frame("Contact Header", s7, width=1440.0, height=180.0, gap=14, padding=(60,80,20,80))
    b.create_text("LET'S CONNECT", c_hdr, font_size=40.0, font_style="Bold", color="#141416", letter_spacing=-1.0)
    b.create_text("Have an interesting low-level challenge, kernel project, or security audit? Drop a line below.", c_hdr, font_size=16.0, color="#6f6f76", width=800.0, sizing_h="fixed")

    c_body = b.create_frame("Contact Body 2Col", s7, width=1440.0, height=900.0, layout_mode="horizontal", gap=60, padding=(20,80,40,80))
    
    # Left Column: Form
    form_box = b.create_frame("Direct Message Form", c_body, width=700.0, height=680.0, gap=20, padding=(32,32,32,32), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=16)
    b.create_text("SEND A DIRECT MESSAGE", form_box, font_size=16.0, font_style="Bold", color="#141416", letter_spacing=1.0)
    
    for f_label, f_ph in [("YOUR NAME", "Faqih Ardian Syah"), ("YOUR EMAIL", "faqihardiansyah89@gmail.com"), ("SUBJECT", "Project Inquiry / Networking Collaboration")]:
        field = b.create_frame(f"Field {f_label}", form_box, width=636.0, height=76.0, gap=8)
        b.create_text(f_label, field, font_size=10.0, font_style="Bold", color="#6f6f76", letter_spacing=1.5)
        inp = b.create_frame("Inp", field, width=636.0, height=48.0, padding=(12,16,12,16), bg_color="#fbfbf9", stroke_color="#e7e6e1", corner_radius=8, cross_align="center")
        b.create_text(f_ph, inp, font_size=13.0, color="#141416")

    msg_field = b.create_frame("Field Message", form_box, width=636.0, height=140.0, gap=8)
    b.create_text("MESSAGE BODY", msg_field, font_size=10.0, font_style="Bold", color="#6f6f76", letter_spacing=1.5)
    tx = b.create_frame("Textarea", msg_field, width=636.0, height=110.0, padding=(14,16,14,16), bg_color="#fbfbf9", stroke_color="#e7e6e1", corner_radius=8)
    b.create_text("Write details regarding your project or inquiry...", tx, font_size=13.0, color="#6f6f76")

    sub_btn = b.create_frame("Submit Btn", form_box, width=636.0, height=48.0, padding=(14,24,14,24), bg_color="#141416", corner_radius=999, main_align="center")
    b.create_text("Send Message via Resend API →", sub_btn, font_size=13.0, font_style="Bold", color="#ffffff")

    # Right Column: Verified Direct Channels
    c_right = b.create_frame("Channels Column", c_body, width=540.0, height=680.0, gap=20)
    b.create_text("VERIFIED DIRECT CHANNELS", c_right, font_size=16.0, font_style="Bold", color="#141416", letter_spacing=1.0)
    for ch_name, ch_handle, ch_link in [
        ("EMAIL", "faqihardiansyah89@gmail.com", "mailto:faqihardiansyah89@gmail.com"),
        ("GITHUB", "github.com/naidrahiqa", "https://github.com/naidrahiqa"),
        ("DISCORD", "discord.gg/@naidrahiqa", "Direct handle"),
        ("TELEGRAM", "t.me/naidrahiqa", "@naidrahiqa"),
        ("SECURITY PGP", "4A19 B892 F012 CD34 ...", "Key ID: 0x9B892F012")
    ]:
        ch_card = b.create_frame(f"Ch {ch_name}", c_right, width=540.0, height=90.0, layout_mode="horizontal", gap=20, padding=(18,20,18,20), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=12, main_align="spaceBetween", cross_align="center")
        ch_l = b.create_frame("L", ch_card, gap=4)
        b.create_text(ch_name, ch_l, font_size=10.0, font_style="Bold", color="#e11d48", letter_spacing=1.5)
        b.create_text(ch_handle, ch_l, font_size=14.0, font_style="Bold", color="#141416")
        b.create_text("Open ↗", ch_card, font_size=12.0, font_style="Semi Bold", color="#6f6f76")

    b.add_common_footer(s7)

    # =========================================================================
    # SCREEN 8: 08 — ADMIN PANEL DASHBOARD (1440w x 1600h) at x=4620, y=2600
    # =========================================================================
    s8 = b.create_frame("08 — Admin Panel", root_id, width=1440.0, height=1600.0, x=4620.0, y=2600.0, bg_color="#ffffff", padding=(0,0,0,0))
    
    # Admin Layout: Sidebar + Main Content
    admin_row = b.create_frame("Admin Layout Split", s8, width=1440.0, height=1600.0, layout_mode="horizontal", gap=0)
    
    # Left Sidebar
    adm_side = b.create_frame("Admin Sidebar", admin_row, width=280.0, height=1600.0, gap=24, padding=(32,24,32,24), bg_color="#fbfbf9", stroke_color="#e7e6e1")
    b.create_text("ADMIN CONTROL", adm_side, font_size=10.0, font_style="Bold", color="#6f6f76", letter_spacing=2.0)
    b.create_text("naidrahiqa@naidra.dev", adm_side, font_size=12.0, font_style="Semi Bold", color="#141416")
    
    # Sidebar Nav Menu
    s_menu = b.create_frame("Menu", adm_side, width=232.0, height=400.0, gap=8)
    for m_label, is_act in [("Dashboard", True), ("Projects CRUD", False), ("Achievements", False), ("About Sections", False), ("Contacts", False), ("Profile Editor", False), ("View Public Site ↗", False)]:
        m_item = b.create_frame(f"M {m_label}", s_menu, width=232.0, height=40.0, padding=(10,14,10,14), bg_color="#141416" if is_act else None, corner_radius=8, cross_align="center")
        b.create_text(m_label, m_item, font_size=13.0, font_style="Semi Bold" if is_act else "Medium", color="#ffffff" if is_act else "#6f6f76")

    # Right Content Area
    adm_main = b.create_frame("Admin Main Content", admin_row, width=1160.0, height=1600.0, gap=32, padding=(40,48,40,48), bg_color="#ffffff")
    
    # Header Toolbar
    adm_tb = b.create_frame("Adm Toolbar", adm_main, width=1064.0, height=60.0, layout_mode="horizontal", main_align="spaceBetween", cross_align="center")
    b.create_text("DASHBOARD STATS & ACTIONS", adm_tb, font_size=24.0, font_style="Bold", color="#141416")
    
    actions_r = b.create_frame("Act Row", adm_tb, layout_mode="horizontal", gap=12)
    sync_btn = b.create_frame("Sync GitHub", actions_r, padding=(10,18,10,18), bg_color="#ecfdf5", stroke_color="#a7f3d0", corner_radius=8)
    b.create_text("Sync GitHub API (23 Repos)", sync_btn, font_size=12.0, font_style="Bold", color="#059669")
    new_p_btn = b.create_frame("New Project", actions_r, padding=(10,18,10,18), bg_color="#141416", corner_radius=8)
    b.create_text("+ New Project", new_p_btn, font_size=12.0, font_style="Bold", color="#ffffff")

    # Quick Stat Cards (Row of 4)
    stat_r = b.create_frame("Stats Row", adm_main, width=1064.0, height=110.0, layout_mode="horizontal", gap=16)
    for st_val, st_lbl in [("12", "TOTAL PROJECTS"), ("23", "GITHUB REPOS"), ("08", "CERTIFICATES"), ("100%", "RLS SECURITY")]:
        st_card = b.create_frame(f"St {st_lbl}", stat_r, width=254.0, height=100.0, gap=6, padding=(16,20,16,20), bg_color="#fbfbf9", stroke_color="#e7e6e1", corner_radius=12)
        b.create_text(st_val, st_card, font_size=28.0, font_style="Bold", color="#141416")
        b.create_text(st_lbl, st_card, font_size=10.0, font_style="Bold", color="#6f6f76", letter_spacing=1.5)

    # Management Table Mockup
    b.create_text("PROJECTS MANAGEMENT (LIVE DATABASE)", adm_main, font_size=16.0, font_style="Bold", color="#141416", letter_spacing=1.0)
    tbl = b.create_frame("Table", adm_main, width=1064.0, height=600.0, gap=0, bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=12)
    
    # Table Header Row
    tbl_hdr = b.create_frame("Tbl Hdr", tbl, width=1064.0, height=48.0, layout_mode="horizontal", padding=(14,20,14,20), bg_color="#f4f4f2", stroke_color="#e7e6e1", main_align="spaceBetween")
    for th_title in ["TITLE / SLUG", "CATEGORY", "LAYOUT", "STATUS", "SORT", "ACTIONS"]:
        b.create_text(th_title, tbl_hdr, font_size=10.0, font_style="Bold", color="#6f6f76", letter_spacing=1.0)

    # 4 Table Rows
    for p_t, p_c, p_l, p_s in [
        ("redmi10-selene-kernel", "personal", "video-focus", "PUBLISHED"),
        ("pancasila-interactive-showcase", "school", "gallery-first", "PUBLISHED"),
        ("iot-security-probe", "personal", "text-first", "PUBLISHED"),
        ("mikrotik-hotspot-auth", "school", "cover-hero", "PUBLISHED")
    ]:
        t_row = b.create_frame(f"Row {p_t}", tbl, width=1064.0, height=56.0, layout_mode="horizontal", padding=(16,20,16,20), stroke_color="#e7e6e1", main_align="spaceBetween", cross_align="center")
        b.create_text(p_t, t_row, font_size=13.0, font_style="Bold", color="#141416")
        b.create_text(p_c, t_row, font_size=12.0, color="#6f6f76")
        b.create_text(p_l, t_row, font_size=12.0, color="#6f6f76")
        b.create_text(p_s, t_row, font_size=10.0, font_style="Bold", color="#059669")
        b.create_text("1", t_row, font_size=12.0, color="#6f6f76")
        act = b.create_frame("Act", t_row, layout_mode="horizontal", gap=12)
        b.create_text("Edit", act, font_size=12.0, font_style="Bold", color="#e11d48")
        b.create_text("Delete", act, font_size=12.0, font_style="Medium", color="#ef4444")

    # =========================================================================
    # SCREEN 9: 09 — DESIGN SYSTEM & TOKENS (1440w x 1400h) at x=0, y=4700
    # =========================================================================
    s9 = b.create_frame("09 — Design Tokens & UI Kit", root_id, width=1440.0, height=1400.0, x=0.0, y=4700.0, bg_color="#ffffff", padding=(60,80,60,80), corner_radius=20, stroke_color="#e7e6e1")
    b.create_text("DESIGN SYSTEM & ATOMIC COMPONENT LIBRARY", s9, font_size=32.0, font_style="Bold", color="#141416", letter_spacing=-0.5)
    b.create_text("Engineered Editorial UI specification for Naidrahiqa portfolio. Pure geometric consistency and anti-slop guidelines.", s9, font_size=15.0, color="#6f6f76")

    # Swatches Row
    sw_row = b.create_frame("Swatches Row", s9, width=1280.0, height=140.0, layout_mode="horizontal", gap=16)
    for c_n, c_h, t_c in [
        ("Paper BG", "#FBFBF9", "#141416"),
        ("Card Surface", "#FFFFFF", "#141416"),
        ("Muted Sunken", "#F4F4F2", "#141416"),
        ("Hairline Border", "#E7E6E1", "#141416"),
        ("Deep Foreground", "#141416", "#FFFFFF"),
        ("Muted Text", "#6F6F76", "#FFFFFF"),
        ("Primary Rose", "#F43F5E", "#FFFFFF"),
        ("Emerald Accent", "#10B981", "#FFFFFF")
    ]:
        sw = b.create_frame(f"Sw {c_n}", sw_row, width=145.0, height=110.0, gap=6, padding=(14,14,14,14), bg_color=c_h, stroke_color="#e7e6e1", corner_radius=10)
        b.create_text(c_n, sw, font_size=11.0, font_style="Bold", color=t_c)
        b.create_text(c_h, sw, font_size=10.0, color=t_c)

    # Component Primitives Specimen
    b.create_text("BUTTON & PILL PRIMITIVES", s9, font_size=16.0, font_style="Bold", color="#141416", letter_spacing=1.0)
    btn_spec_row = b.create_frame("Button Spec Row", s9, width=1280.0, height=60.0, layout_mode="horizontal", gap=16, cross_align="center")
    
    p1 = b.create_frame("P1", btn_spec_row, padding=(12,24,12,24), bg_color="#141416", corner_radius=999)
    b.create_text("Primary Solid Pill", p1, font_size=13.0, font_style="Bold", color="#ffffff")
    
    p2 = b.create_frame("P2", btn_spec_row, padding=(12,24,12,24), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=999)
    b.create_text("Secondary Outline Pill", p2, font_size=13.0, font_style="Bold", color="#141416")

    p3 = b.create_frame("P3", btn_spec_row, padding=(12,24,12,24), bg_color="#f43f5e", corner_radius=999)
    b.create_text("Accent Rose Pill", p3, font_size=13.0, font_style="Bold", color="#ffffff")

    p4 = b.create_frame("P4", btn_spec_row, padding=(6,12,6,12), bg_color="#ecfdf5", stroke_color="#a7f3d0", corner_radius=999)
    b.create_text("● Status Badge", p4, font_size=11.0, font_style="Bold", color="#059669")

    # Typography specimen
    b.create_text("TYPOGRAPHY HIERARCHY SPECIMEN", s9, font_size=16.0, font_style="Bold", color="#141416", letter_spacing=1.0)
    typo_box = b.create_frame("Typo Box", s9, width=1280.0, height=450.0, gap=16, padding=(24,24,24,24), bg_color="#fbfbf9", stroke_color="#e7e6e1", corner_radius=14)
    b.create_text("Hero Display / 64px Bold / Plus Jakarta Sans", typo_box, font_size=48.0, font_style="Bold", color="#141416")
    b.create_text("Section Heading / 32px Bold / Plus Jakarta Sans", typo_box, font_size=28.0, font_style="Bold", color="#141416")
    b.create_text("Card Title / 18px Semi Bold / Inter", typo_box, font_size=18.0, font_style="Bold", color="#141416")
    b.create_text("Body Copy / 14px Regular / Inter — The quick brown fox jumps over the lazy dog.", typo_box, font_size=14.0, color="#6f6f76")
    b.create_text("TELEMETRY LABEL / 10PX BOLD MONO / GEIST MONO", typo_box, font_size=10.0, font_style="Bold", color="#e11d48", letter_spacing=2.0)

    # =========================================================================
    # SCREEN 10: 10 — MOBILE VIEWPORT SUITE (390w x 2400h) at x=1540, y=4700
    # =========================================================================
    s10 = b.create_frame("10 — Mobile Viewport (390w)", root_id, width=390.0, height=2400.0, x=1540.0, y=4700.0, bg_color="#fbfbf9", padding=(0,0,40,0))
    
    # Mobile Header
    m_nav = b.create_frame("Mobile Nav", s10, width=390.0, height=64.0, layout_mode="horizontal", padding=(16,20,16,20), bg_color="#ffffff", stroke_color="#e7e6e1", main_align="spaceBetween", cross_align="center")
    b.create_text("NAIDRAHIQA", m_nav, font_size=13.0, font_style="Bold", color="#141416", letter_spacing=1.5)
    b.create_text("☰", m_nav, font_size=18.0, font_style="Bold", color="#141416")

    # Mobile Hero
    m_hero = b.create_frame("Mobile Hero", s10, width=390.0, height=440.0, gap=16, padding=(32,20,24,20))
    m_tag = b.create_frame("M Tag", m_hero, padding=(4,8,4,8), bg_color="#fff1f2", corner_radius=4)
    b.create_text("TKJ & KERNEL BUILDER", m_tag, font_size=9.0, font_style="Bold", color="#e11d48", letter_spacing=1.5)
    b.create_text("FAQIH ARDIAN\nSYAH", m_hero, font_size=36.0, font_style="Bold", color="#141416", line_height=40.0, letter_spacing=-1.0)
    b.create_text("Low-level systems explorer & Android kernel developer for Redmi 10 (selene) at SMK Negeri 3 Jepara.", m_hero, font_size=13.0, color="#6f6f76", line_height=20.0)
    
    m_actions = b.create_frame("M Actions", m_hero, width=350.0, height=90.0, gap=10)
    m_cta1 = b.create_frame("M Cta1", m_actions, width=350.0, height=42.0, padding=(10,16,10,16), bg_color="#141416", corner_radius=999, main_align="center")
    b.create_text("Explore work →", m_cta1, font_size=13.0, font_style="Bold", color="#ffffff")
    m_cta2 = b.create_frame("M Cta2", m_actions, width=350.0, height=42.0, padding=(10,16,10,16), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=999, main_align="center")
    b.create_text("Let's connect", m_cta2, font_size=13.0, font_style="Bold", color="#141416")

    # Mobile Stats
    m_stats = b.create_frame("M Stats", s10, width=350.0, height=180.0, gap=12, padding=(16,16,16,16), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=12)
    for ms_val, ms_lbl in [("23 Repositories", "Public open-source tools"), ("12 Projects", "School & personal"), ("08 Certificates", "Networking & security")]:
        ms_box = b.create_frame(f"MS {ms_lbl}", m_stats, gap=2)
        b.create_text(ms_val, ms_box, font_size=14.0, font_style="Bold", color="#141416")
        b.create_text(ms_lbl, ms_box, font_size=10.0, color="#6f6f76")

    # Mobile Cards
    m_cards = b.create_frame("M Cards", s10, width=390.0, height=600.0, gap=16, padding=(20,20,20,20))
    b.create_text("FEATURED WORK", m_cards, font_size=14.0, font_style="Bold", color="#141416", letter_spacing=1.0)
    for mc_t, mc_l, mc_d in [("redmi10-selene-kernel", "C", "Kernel 4.19 optimizations for Helio G88."), ("pancasila-interactive", "TS", "Daily moral values interactive showcase.")]:
        mcd = b.create_frame(f"MCard {mc_t}", m_cards, width=350.0, height=160.0, gap=8, padding=(16,16,16,16), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=12)
        b.create_text(mc_l, mcd, font_size=9.0, font_style="Bold", color="#e11d48", letter_spacing=1.0)
        b.create_text(mc_t, mcd, font_size=15.0, font_style="Bold", color="#141416")
        b.create_text(mc_d, mcd, font_size=12.0, color="#6f6f76", line_height=18.0)
        b.create_text("Open project →", mcd, font_size=11.0, font_style="Bold", color="#141416")

    return b

if __name__ == "__main__":
    out_json = Path("/tmp/master_portfolio.json")
    out_figcraft = Path("/home/naidra/Projects/Web/naidrahiqa-porto/design/naidrahiqa-portfolio.figcraft")
    out_png = Path("/home/naidra/Projects/Web/naidrahiqa-porto/design/naidrahiqa-portfolio.png")

    builder = build_master_suite()
    
    doc = {
        "comments": [],
        "current_page": 1,
        "document_colors": [],
        "format": "figcraft",
        "imageIndex": [],
        "name": "Naidrahiqa Portfolio — Master Suite",
        "next_id": builder.next_id,
        "nodes": builder.nodes,
        "pages": [1],
        "styles": builder.styles,
        "variables": {"collections": [], "variables": []},
        "version": 1
    }

    with open(out_json, "w") as f:
        json.dump(doc, f, indent=2)

    print(f"Generated Master JSON: {out_json} ({len(builder.nodes)} nodes across 10 screens)")

    # Convert to native .figcraft
    cmd = ["figcraft-cli", "convert", str(out_json), str(out_figcraft)]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("Error converting to .figcraft:", res.stderr)
        sys.exit(res.returncode)
    print(f"Created native FigCraft master file: {out_figcraft}")

    # Inspect
    subprocess.run(["figcraft-cli", "info", str(out_figcraft)])

    # Render high-resolution PNG
    res_render = subprocess.run(["figcraft-cli", "render", "--out", str(out_png), str(out_figcraft)], capture_output=True, text=True)
    if res_render.returncode == 0:
        print(f"Rendered master design board: {out_png}")
    else:
        print("Render note:", res_render.stderr)
