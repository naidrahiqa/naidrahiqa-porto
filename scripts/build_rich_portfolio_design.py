#!/usr/bin/env python3
"""
Master Dark-Tech UI/UX Design System Generator for FigCraft
Generates high-fidelity, high-contrast, viewport-calibrated design artboards
for Faqih Ardian Syah (Naidrahiqa) Portfolio.
"""

import json
import subprocess
import sys
from pathlib import Path

def hex_to_rgba(h, alpha=1.0):
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join([c*2 for c in h])
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
            "sides": None,
            "weight": float(weight)
        }
    }

class FigCraftDoc:
    def __init__(self, name="Naidrahiqa Portfolio - Dark Tech"):
        self.next_id = 2
        self.nodes = {}
        self.name = name
        
        # Root page node 1
        self.nodes["1"] = {
            "id": 1,
            "type": "page",
            "name": name,
            "children": [],
            "flows": [],
            "width": 0.0,
            "height": 0.0,
            "background": hex_to_rgba("#08080A"),
            "prototype": {
                "background": hex_to_rgba("#08080A"),
                "device": "None",
                "rotation": "portrait"
            }
        }

    def alloc_id(self):
        nid = self.next_id
        self.next_id += 1
        return nid

    def add_child(self, parent_id, child_id):
        pid_str = str(parent_id)
        if pid_str in self.nodes:
            if "children" not in self.nodes[pid_str] or self.nodes[pid_str]["children"] is None:
                self.nodes[pid_str]["children"] = []
            if child_id not in self.nodes[pid_str]["children"]:
                self.nodes[pid_str]["children"].append(child_id)

    def create_frame(self, name, parent_id=1, width=1440.0, height=900.0,
                     pos=(0.0, 0.0), bg_color="#0B0B0C", stroke_color="#27272A",
                     stroke_weight=1.0, corner_radius=0.0, layout_mode=None,
                     padding=(0, 0, 0, 0), gap=16.0, main_align="min",
                     cross_align="min", sizing_h="fixed", sizing_v="fixed", clip=True):
        fid = self.alloc_id()
        x, y = pos
        
        layout_obj = None
        if layout_mode in ("horizontal", "vertical"):
            layout_obj = {
                "mode": layout_mode,
                "gap": float(gap),
                "padding": [float(p) for p in padding],
                "main_align": main_align,
                "cross_align": cross_align,
                "content_align": "auto",
                "cross_gap": 0.0,
                "reverse_z": False,
                "strokes_included": True,
                "wrap": False,
                "grid_columns": 1,
                "grid_rows": 1,
                "column_tracks": [],
                "row_tracks": []
            }

        node = {
            "id": fid,
            "type": "frame",
            "name": name,
            "parent": parent_id,
            "width": float(width),
            "height": float(height),
            "blend": "normal",
            "clip": clip,
            "transform": [1.0, 0.0, 0.0, 1.0, float(x), float(y)],
            "layout": layout_obj,
            "child_layout": {
                "absolute": False,
                "sizing_h": sizing_h,
                "sizing_v": sizing_v,
                "grid_column": None,
                "grid_column_span": 0,
                "grid_row": None,
                "grid_row_span": 0,
                "max_h": None,
                "max_w": None,
                "min_h": None,
                "min_w": None
            },
            "children": [],
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

    def create_text(self, text, parent_id, font_size=14.0, font_weight="Regular",
                    color="#FAFAFA", width=120.0, height=20.0, pos=(0.0, 0.0),
                    font_family="Inter", line_height_pct=140.0, letter_spacing=0.0):
        tid = self.alloc_id()
        x, y = pos
        node = {
            "id": tid,
            "type": "text",
            "name": text[:35],
            "characters": text,
            "parent": parent_id,
            "width": float(width),
            "height": float(height),
            "blend": "normal",
            "transform": [1.0, 0.0, 0.0, 1.0, float(x), float(y)],
            "fills": solid_fill(color),
            "style": {
                "case": "original",
                "decoration": "none",
                "fills": None,
                "font_family": font_family,
                "font_size": float(font_size),
                "font_style": font_weight,
                "letter_spacing": {"unit": "percent", "value": float(letter_spacing)},
                "line_height": {"unit": "percent", "value": float(line_height_pct)},
                "link": None
            },
            "child_layout": {
                "absolute": False,
                "sizing_h": "hug",
                "sizing_v": "hug",
                "grid_column": None,
                "grid_column_span": 0,
                "grid_row": None,
                "grid_row_span": 0,
                "max_h": None,
                "max_w": None,
                "min_h": None,
                "min_w": None
            }
        }
        self.nodes[str(tid)] = node
        if parent_id:
            self.add_child(parent_id, tid)
        return tid

    def to_json(self):
        return {
            "comments": [],
            "current_page": 1,
            "document_colors": [],
            "format": "figcraft",
            "imageIndex": [],
            "name": self.name,
            "next_id": self.next_id,
            "nodes": self.nodes,
            "pages": [1],
            "version": 1
        }

def build_suite():
    doc = FigCraftDoc("Naidrahiqa Portfolio - Dark Tech Engineering")
    
    # -------------------------------------------------------------------------
    # ARTBOARD 1: 01 - Desktop Homepage (Dark Mode) - 1440 x 1024
    # -------------------------------------------------------------------------
    f1 = doc.create_frame("01 - Desktop Homepage", parent_id=1, width=1440.0, height=1024.0,
                          pos=(0.0, 0.0), bg_color="#0B0B0C", stroke_color="#27272A",
                          layout_mode="vertical", padding=(0, 0, 0, 0), gap=0.0)
    
    # Navbar
    nav = doc.create_frame("Navbar Header", f1, width=1440.0, height=72.0,
                           bg_color="#101014", stroke_color="#222226", stroke_weight=1.0,
                           layout_mode="horizontal", padding=(16, 56, 16, 56), gap=24.0,
                           cross_align="center", main_align="spaceBetween", sizing_h="fill")
    
    # Left brand lockup
    b_lock = doc.create_frame("Brand Lockup", nav, width=280.0, height=40.0,
                              bg_color="none", stroke_color="none", layout_mode="horizontal",
                              gap=14.0, cross_align="center")
    doc.create_text("NAIDRAHIQA", b_lock, font_size=15.0, font_weight="Bold", color="#FAFAFA", width=110.0)
    
    pill_avail = doc.create_frame("Status Pill", b_lock, width=140.0, height=24.0,
                                 bg_color="#064E3B", stroke_color="#059669", corner_radius=12.0,
                                 layout_mode="horizontal", padding=(3, 10, 3, 10), cross_align="center")
    doc.create_text("● AVAILABLE FOR WORK", pill_avail, font_size=9.0, font_weight="Bold", color="#34D399", width=120.0)

    # Nav links
    links_row = doc.create_frame("Nav Links", nav, width=420.0, height=36.0,
                                bg_color="none", stroke_color="none", layout_mode="horizontal",
                                gap=24.0, cross_align="center")
    for link_name in ["Projects", "School Tasks", "Achievements", "About", "Contact"]:
        doc.create_text(link_name, links_row, font_size=13.0, font_weight="Medium", color="#A1A1AA", width=65.0)

    # Right CTA
    cta_btn = doc.create_frame("CTA Button", nav, width=130.0, height=38.0,
                              bg_color="#FB7185", stroke_color="none", corner_radius=8.0,
                              layout_mode="horizontal", padding=(8, 16, 8, 16), cross_align="center", main_align="center")
    doc.create_text("Get in touch", cta_btn, font_size=13.0, font_weight="SemiBold", color="#0B0B0C", width=80.0)

    # Hero & Above the Fold Container
    hero_wrap = doc.create_frame("Hero Container", f1, width=1440.0, height=540.0,
                                 bg_color="#0B0B0C", stroke_color="none",
                                 layout_mode="horizontal", padding=(56, 56, 40, 56), gap=48.0,
                                 sizing_h="fill", cross_align="center")

    # Left Hero Text Column
    hero_left = doc.create_frame("Hero Text Column", hero_wrap, width=740.0, height=440.0,
                                 bg_color="none", stroke_color="none",
                                 layout_mode="vertical", gap=20.0, sizing_h="fill")
    
    # Eyebrow
    doc.create_text("NETWORKING • KERNEL DEV • SYSTEMS ARCHITECTURE", hero_left,
                    font_size=11.0, font_weight="Bold", color="#FB7185", width=380.0, letter_spacing=2.0)
    
    # Two-line Name Lockup
    name_box = doc.create_frame("Name Lockup", hero_left, width=700.0, height=130.0,
                                bg_color="none", stroke_color="none", layout_mode="vertical", gap=4.0)
    doc.create_text("FAQIH ARDIAN", name_box, font_size=54.0, font_weight="Bold", color="#FAFAFA", width=500.0, height=60.0)
    doc.create_text("SYAH", name_box, font_size=54.0, font_weight="Bold", color="#A1A1AA", width=240.0, height=60.0)

    # Subtitle Bio
    doc.create_text(
        "Networking Student (TKJ) & low-level systems developer building custom Linux kernels, network tooling, and high-performance web applications.",
        hero_left, font_size=15.0, font_weight="Regular", color="#A1A1AA", width=680.0, height=44.0, line_height_pct=150.0
    )

    # Twin CTAs
    hero_actions = doc.create_frame("Hero Actions", hero_left, width=380.0, height=44.0,
                                   bg_color="none", stroke_color="none", layout_mode="horizontal", gap=16.0)
    btn_p1 = doc.create_frame("Primary CTA", hero_actions, width=170.0, height=44.0,
                              bg_color="#FB7185", stroke_color="none", corner_radius=8.0,
                              layout_mode="horizontal", padding=(12, 20, 12, 20), cross_align="center", main_align="center")
    doc.create_text("Explore Projects", btn_p1, font_size=13.0, font_weight="SemiBold", color="#0B0B0C", width=110.0)

    btn_p2 = doc.create_frame("Secondary CTA", hero_actions, width=150.0, height=44.0,
                              bg_color="#18181B", stroke_color="#2E2E33", stroke_weight=1.0, corner_radius=8.0,
                              layout_mode="horizontal", padding=(12, 20, 12, 20), cross_align="center", main_align="center")
    doc.create_text("Download CV", btn_p2, font_size=13.0, font_weight="Medium", color="#FAFAFA", width=95.0)

    # Telemetry Spec Strip
    telemetry = doc.create_frame("Telemetry Strip", hero_left, width=720.0, height=60.0,
                                 bg_color="#121215", stroke_color="#242428", stroke_weight=1.0, corner_radius=10.0,
                                 layout_mode="horizontal", padding=(12, 20, 12, 20), gap=32.0, cross_align="center")
    for label, val in [("Kernel Arch", "arm64 / aarch64"), ("Primary Stack", "C, Rust, Next16"), ("Base", "Malang, Indonesia")]:
        spec_box = doc.create_frame(f"Spec {label}", telemetry, width=180.0, height=36.0,
                                   bg_color="none", stroke_color="none", layout_mode="vertical", gap=2.0)
        doc.create_text(label.upper(), spec_box, font_size=9.0, font_weight="Bold", color="#71717A", width=120.0)
        doc.create_text(val, spec_box, font_size=12.0, font_weight="SemiBold", color="#FAFAFA", width=160.0)

    # Right Column: Interactive Terminal Rice Window
    term_win = doc.create_frame("Terminal Rice Window", hero_wrap, width=540.0, height=440.0,
                                bg_color="#0E0E12", stroke_color="#27272A", stroke_weight=1.0, corner_radius=12.0,
                                layout_mode="vertical", padding=(0, 0, 0, 0), gap=0.0)
    
    # Terminal Titlebar
    term_bar = doc.create_frame("Terminal Titlebar", term_win, width=540.0, height=36.0,
                                bg_color="#16161B", stroke_color="#242428", stroke_weight=1.0,
                                layout_mode="horizontal", padding=(8, 16, 8, 16), gap=8.0, cross_align="center")
    for dot_col in ["#EF4444", "#F59E0B", "#10B981"]:
        d_dot = doc.create_frame(f"Dot {dot_col}", term_bar, width=10.0, height=10.0,
                                 bg_color=dot_col, stroke_color="none", corner_radius=5.0)
    doc.create_text("naidra@cachyos:~ (zsh) - neofetch", term_bar, font_size=11.0, font_weight="Medium", color="#71717A", width=260.0)

    # Terminal Body Output
    term_body = doc.create_frame("Terminal Body", term_win, width=540.0, height=404.0,
                                 bg_color="#0E0E12", stroke_color="none",
                                 layout_mode="vertical", padding=(20, 24, 20, 24), gap=8.0)
    term_lines = [
        ("naidra@cachyos", "#FB7185", 13.0, "Bold"),
        ("-------------------", "#3F3F46", 11.0, "Regular"),
        ("OS: CachyOS Linux x86_64", "#34D399", 12.0, "Medium"),
        ("Host: Selene Rig Dev (arch: arm64)", "#FAFAFA", 12.0, "Regular"),
        ("Kernel: 4.19.191-selene-perf+", "#38BDF8", 12.0, "Medium"),
        ("Uptime: 18 days, 4 hours", "#A1A1AA", 12.0, "Regular"),
        ("Shell: zsh 5.9 with Starship prompt", "#A1A1AA", 12.0, "Regular"),
        ("WM: Hyprland (Wayland session)", "#A1A1AA", 12.0, "Regular"),
        ("Repositories: 23 Synced (github.com/naidrahiqa)", "#FBBF24", 12.0, "SemiBold"),
        ("Certificates: 8 Credentials (BNSP, Dicoding, Cisco)", "#34D399", 12.0, "SemiBold"),
        ("Memory: 3.8 GiB / 16.0 GiB (23%)", "#A1A1AA", 12.0, "Regular"),
        ("", "#A1A1AA", 8.0, "Regular"),
        ("naidra@cachyos:~$ git branch", "#FB7185", 12.0, "Bold"),
        ("* selene-4.19 (tracking origin/main)", "#34D399", 12.0, "Regular")
    ]
    for t_text, t_col, t_sz, t_wt in term_lines:
        doc.create_text(t_text, term_body, font_size=t_sz, font_weight=t_wt, color=t_col, width=480.0, font_family="Inter")

    # Bottom Bento Strip: 2 Featured Cards
    bento_strip = doc.create_frame("Bento Section", f1, width=1440.0, height=412.0,
                                   bg_color="#0E0E11", stroke_color="#1E1E22", stroke_weight=1.0,
                                   layout_mode="vertical", padding=(32, 56, 32, 56), gap=20.0, sizing_h="fill")
    
    b_head = doc.create_frame("Bento Header", bento_strip, width=1328.0, height=32.0,
                              bg_color="none", stroke_color="none", layout_mode="horizontal",
                              main_align="spaceBetween", cross_align="center", sizing_h="fill")
    doc.create_text("FEATURED ENGINEERING REPOSITORIES", b_head, font_size=12.0, font_weight="Bold", color="#A1A1AA", width=340.0, letter_spacing=1.5)
    doc.create_text("View all 23 repositories ->", b_head, font_size=12.0, font_weight="SemiBold", color="#FB7185", width=180.0)

    # 2 Bento Cards Row
    cards_row = doc.create_frame("Cards Row", bento_strip, width=1328.0, height=310.0,
                                 bg_color="none", stroke_color="none", layout_mode="horizontal",
                                 gap=24.0, sizing_h="fill")
    
    # Card 1: redmi10-selene-kernel
    c1 = doc.create_frame("Card Selene Kernel", cards_row, width=652.0, height=300.0,
                          bg_color="#141418", stroke_color="#27272D", stroke_weight=1.0, corner_radius=12.0,
                          layout_mode="vertical", padding=(24, 24, 24, 24), gap=14.0, sizing_h="fill")
    
    c1_tag_row = doc.create_frame("Tag Row", c1, width=600.0, height=24.0,
                                  bg_color="none", stroke_color="none", layout_mode="horizontal", gap=10.0, cross_align="center")
    c1_tag = doc.create_frame("Tag Pill", c1_tag_row, width=150.0, height=22.0,
                              bg_color="#0C2A44", stroke_color="#0284C7", corner_radius=4.0,
                              layout_mode="horizontal", padding=(2, 8, 2, 8), cross_align="center")
    doc.create_text("LINUX KERNEL 4.19 • C", c1_tag, font_size=10.0, font_weight="Bold", color="#38BDF8", width=140.0)
    doc.create_text("selene-perf", c1_tag_row, font_size=11.0, font_weight="Medium", color="#71717A", width=100.0)

    doc.create_text("redmi10-selene-kernel", c1, font_size=20.0, font_weight="Bold", color="#FAFAFA", width=500.0)
    doc.create_text("Production Android kernel tree for Xiaomi Redmi 10 (selene). Features thermal mitigation, custom CPU governors (schedutil tuning), and memory reclaim pipeline optimizations.",
                    c1, font_size=13.0, font_weight="Regular", color="#A1A1AA", width=590.0, height=40.0, line_height_pct=150.0)
    
    c1_meta = doc.create_frame("Meta Row", c1, width=600.0, height=32.0,
                               bg_color="none", stroke_color="none", layout_mode="horizontal", gap=20.0, cross_align="center")
    doc.create_text("● C (98.4%)", c1_meta, font_size=12.0, font_weight="Medium", color="#38BDF8", width=85.0)
    doc.create_text("★ 42 stars", c1_meta, font_size=12.0, font_weight="Medium", color="#FBBF24", width=75.0)
    doc.create_text("⑂ 18 forks", c1_meta, font_size=12.0, font_weight="Medium", color="#A1A1AA", width=75.0)
    doc.create_text("Branch: android-4.19", c1_meta, font_size=12.0, font_weight="Medium", color="#34D399", width=140.0)

    # Card 2: pancasila-interactive-showcase
    c2 = doc.create_frame("Card Pancasila Showcase", cards_row, width=652.0, height=300.0,
                          bg_color="#141418", stroke_color="#27272D", stroke_weight=1.0, corner_radius=12.0,
                          layout_mode="vertical", padding=(24, 24, 24, 24), gap=14.0, sizing_h="fill")
    
    c2_tag_row = doc.create_frame("Tag Row 2", c2, width=600.0, height=24.0,
                                  bg_color="none", stroke_color="none", layout_mode="horizontal", gap=10.0, cross_align="center")
    c2_tag = doc.create_frame("Tag Pill 2", c2_tag_row, width=170.0, height=22.0,
                              bg_color="#4C0519", stroke_color="#E11D48", corner_radius=4.0,
                              layout_mode="horizontal", padding=(2, 8, 2, 8), cross_align="center")
    doc.create_text("SCHOOL SHOWCASE • 4-POINT", c2_tag, font_size=10.0, font_weight="Bold", color="#FB7185", width=160.0)
    doc.create_text("Next.js 16 + TS", c2_tag_row, font_size=11.0, font_weight="Medium", color="#71717A", width=100.0)

    doc.create_text("pancasila-interactive-showcase", c2, font_size=20.0, font_weight="Bold", color="#FAFAFA", width=500.0)
    doc.create_text("Interactive educational platform built for SMKN 1 Malang. Fully implements the universal 4-point project structure, reactive JSON media pipeline, and SSR blog documentation.",
                    c2, font_size=13.0, font_weight="Regular", color="#A1A1AA", width=590.0, height=40.0, line_height_pct=150.0)
    
    c2_meta = doc.create_frame("Meta Row 2", c2, width=600.0, height=32.0,
                               bg_color="none", stroke_color="none", layout_mode="horizontal", gap=20.0, cross_align="center")
    doc.create_text("● TypeScript", c2_meta, font_size=12.0, font_weight="Medium", color="#38BDF8", width=95.0)
    doc.create_text("★ 14 stars", c2_meta, font_size=12.0, font_weight="Medium", color="#FBBF24", width=75.0)
    doc.create_text("Grade: 98/100 A+", c2_meta, font_size=12.0, font_weight="Medium", color="#34D399", width=120.0)
    doc.create_text("Live Vercel Build", c2_meta, font_size=12.0, font_weight="Medium", color="#FB7185", width=130.0)


    # -------------------------------------------------------------------------
    # ARTBOARD 2: 02 - Desktop Projects & Repo Hub - 1440 x 1024
    # -------------------------------------------------------------------------
    f2 = doc.create_frame("02 - Desktop Projects Hub", parent_id=1, width=1440.0, height=1024.0,
                          pos=(1540.0, 0.0), bg_color="#0B0B0C", stroke_color="#27272A",
                          layout_mode="vertical", padding=(0, 0, 0, 0), gap=0.0)
    
    # Header bar
    hub_nav = doc.create_frame("Hub Navbar", f2, width=1440.0, height=72.0,
                               bg_color="#101014", stroke_color="#222226", stroke_weight=1.0,
                               layout_mode="horizontal", padding=(16, 56, 16, 56), cross_align="center",
                               main_align="spaceBetween", sizing_h="fill")
    doc.create_text("NAIDRAHIQA / PROJECTS & REPOSITORIES", hub_nav, font_size=15.0, font_weight="Bold", color="#FAFAFA", width=340.0)
    doc.create_text("Synced with github.com/naidrahiqa (23 Repositories)", hub_nav, font_size=12.0, font_weight="Medium", color="#34D399", width=350.0)

    # Sub-bar: Filter pills
    sub_bar = doc.create_frame("Filter Strip", f2, width=1440.0, height=64.0,
                               bg_color="#0E0E12", stroke_color="#1F1F24", stroke_weight=1.0,
                               layout_mode="horizontal", padding=(12, 56, 12, 56), gap=12.0, cross_align="center")
    filter_tabs = [("All Repositories (23)", True), ("Kernel & Systems (6)", False), ("Fullstack Web (9)", False), ("School Tasks TKJ (8)", False)]
    for f_name, is_act in filter_tabs:
        f_pill = doc.create_frame(f"Tab {f_name}", sub_bar, width=170.0, height=36.0,
                                  bg_color="#FB7185" if is_act else "#18181D",
                                  stroke_color="#FB7185" if is_act else "#2A2A30",
                                  corner_radius=6.0, layout_mode="horizontal", padding=(6, 14, 6, 14),
                                  cross_align="center", main_align="center")
        doc.create_text(f_name, f_pill, font_size=12.0, font_weight="SemiBold" if is_act else "Medium",
                        color="#0B0B0C" if is_act else "#A1A1AA", width=145.0)

    # 6-Card Repository Grid
    repo_grid = doc.create_frame("Repo Grid", f2, width=1440.0, height=888.0,
                                 bg_color="#0B0B0C", stroke_color="none",
                                 layout_mode="vertical", padding=(32, 56, 32, 56), gap=20.0, sizing_h="fill")

    repos_data = [
        ("redmi10-selene-kernel", "C", "42", "18", "Kernel tree for Xiaomi Redmi 10 (selene). Thermal mitigations and scheduler governor tuning.", ["kernel", "android", "selene", "arm64"]),
        ("packet-sniffer", "C", "28", "7", "High-performance raw socket packet capture engine for Ethernet frame analysis and telemetry.", ["networking", "raw-sockets", "security", "c"]),
        ("naidrahiqa-porto", "TypeScript", "19", "3", "Personal portfolio & school showcase. Next.js 16.3 + Tailwind v4 + Supabase + Turbopack.", ["nextjs16", "tailwind", "portfolio", "typescript"]),
        ("dotfiles", "Shell / Lua", "35", "12", "Hyprland Wayland rice with customized Neovim, Waybar, Starship, and Zsh environment.", ["hyprland", "dotfiles", "wayland", "linux"]),
        ("pancasila-interactive-showcase", "TypeScript", "14", "2", "Interactive educational ethics showcase with universal 4-point structure for SMKN 1 Malang.", ["school-task", "pancasila", "nextjs"]),
        ("iot-esp32-sensor-hub", "C++", "16", "5", "FreeRTOS MQTT telemetry client on ESP32 microcontroller with industrial sensor integration.", ["iot", "esp32", "freertos", "mqtt"])
    ]

    for row_idx in range(2):
        row_frame = doc.create_frame(f"Repo Row {row_idx+1}", repo_grid, width=1328.0, height=240.0,
                                     bg_color="none", stroke_color="none", layout_mode="horizontal",
                                     gap=20.0, sizing_h="fill")
        for col_idx in range(3):
            repo_idx = row_idx * 3 + col_idx
            r_name, r_lang, r_stars, r_forks, r_desc, r_topics = repos_data[repo_idx]
            
            rc = doc.create_frame(f"RepoCard {r_name}", row_frame, width=429.0, height=230.0,
                                  bg_color="#121216", stroke_color="#24242A", stroke_weight=1.0, corner_radius=10.0,
                                  layout_mode="vertical", padding=(18, 18, 18, 18), gap=10.0, sizing_h="fill")
            
            r_top = doc.create_frame("Top Row", rc, width=390.0, height=24.0,
                                     bg_color="none", stroke_color="none", layout_mode="horizontal",
                                     main_align="spaceBetween", cross_align="center", sizing_h="fill")
            doc.create_text(r_name, r_top, font_size=15.0, font_weight="Bold", color="#FAFAFA", width=260.0)
            doc.create_text(f"★ {r_stars}", r_top, font_size=12.0, font_weight="SemiBold", color="#FBBF24", width=55.0)

            doc.create_text(r_desc, rc, font_size=12.0, font_weight="Regular", color="#A1A1AA", width=380.0, height=48.0, line_height_pct=140.0)

            # Topics
            t_box = doc.create_frame("Topics", rc, width=390.0, height=24.0,
                                     bg_color="none", stroke_color="none", layout_mode="horizontal", gap=6.0)
            for top_w in r_topics[:3]:
                tp = doc.create_frame(f"Pill {top_w}", t_box, width=80.0, height=20.0,
                                      bg_color="#1A1A22", stroke_color="#2A2A34", corner_radius=4.0,
                                      layout_mode="horizontal", padding=(1, 6, 1, 6), cross_align="center")
                doc.create_text(top_w, tp, font_size=10.0, font_weight="Medium", color="#71717A", width=70.0)

            # Bottom lang
            r_bot = doc.create_frame("Lang Row", rc, width=390.0, height=22.0,
                                     bg_color="none", stroke_color="none", layout_mode="horizontal", gap=16.0, cross_align="center")
            doc.create_text(f"● {r_lang}", r_bot, font_size=11.0, font_weight="Medium", color="#38BDF8", width=120.0)
            doc.create_text(f"⑂ {r_forks} forks", r_bot, font_size=11.0, font_weight="Regular", color="#71717A", width=90.0)


    # -------------------------------------------------------------------------
    # ARTBOARD 3: 03 - School Project Detail (Universal 4-Point) - 1440 x 1024
    # -------------------------------------------------------------------------
    f3 = doc.create_frame("03 - Desktop School Detail", parent_id=1, width=1440.0, height=1024.0,
                          pos=(3080.0, 0.0), bg_color="#0B0B0C", stroke_color="#27272A",
                          layout_mode="vertical", padding=(0, 0, 0, 0), gap=0.0)
    
    # Detail Navbar
    det_nav = doc.create_frame("Detail Navbar", f3, width=1440.0, height=72.0,
                               bg_color="#101014", stroke_color="#222226", stroke_weight=1.0,
                               layout_mode="horizontal", padding=(16, 56, 16, 56), cross_align="center",
                               main_align="spaceBetween", sizing_h="fill")
    doc.create_text("PROJECTS / SCHOOL / XII TKJ / ADMINISTRASI SISTEM JARINGAN", det_nav,
                    font_size=13.0, font_weight="Bold", color="#FB7185", width=550.0, letter_spacing=1.0)
    doc.create_text("Universal 4-Point Assignment Structure", det_nav, font_size=12.0, font_weight="SemiBold", color="#34D399", width=260.0)

    # Content layout: 2 Columns
    det_body = doc.create_frame("Detail Body", f3, width=1440.0, height=952.0,
                                bg_color="#0B0B0C", stroke_color="none",
                                layout_mode="horizontal", padding=(32, 56, 32, 56), gap=32.0, sizing_h="fill")

    # Left Column (880w): Terminal simulation + 4-Point Cards
    det_left = doc.create_frame("Detail Left Column", det_body, width=860.0, height=888.0,
                                bg_color="none", stroke_color="none",
                                layout_mode="vertical", gap=16.0, sizing_h="fill")

    # 16:9 Terminal Demonstration Box
    term_box = doc.create_frame("Terminal Output Demo", det_left, width=860.0, height=240.0,
                                bg_color="#0E0E12", stroke_color="#27272E", stroke_weight=1.0, corner_radius=10.0,
                                layout_mode="vertical", padding=(14, 18, 14, 18), gap=8.0)
    doc.create_text("root@debian-server:~# named-checkconf -z /etc/bind/named.conf.local", term_box, font_size=12.0, font_weight="Bold", color="#34D399", width=600.0)
    doc.create_text("zone smkn1malang.sch.id/IN: loaded serial 2026111301", term_box, font_size=11.0, font_weight="Regular", color="#FAFAFA", width=500.0)
    doc.create_text("zone 10.168.192.in-addr.arpa/IN: loaded serial 2026111301", term_box, font_size=11.0, font_weight="Regular", color="#FAFAFA", width=500.0)
    doc.create_text("OK - all zone files syntax verified without errors.", term_box, font_size=12.0, font_weight="Bold", color="#34D399", width=400.0)
    doc.create_text("root@debian-server:~# dig @127.0.0.1 ns1.smkn1malang.sch.id +short", term_box, font_size=12.0, font_weight="Bold", color="#FB7185", width=550.0)
    doc.create_text("192.168.10.1", term_box, font_size=12.0, font_weight="Bold", color="#FBBF24", width=200.0)

    # 4-Point Structure Cards
    four_points = [
        ("1. IDENTITAS & TUJUAN TUGAS", "Praktikum DNS Master-Slave & DHCP Relay Server pada Debian 12 untuk jaringan LAN SMKN 1 Malang (192.168.10.0/24)."),
        ("2. DASAR TEORI & TOPOLOGI", "Arsitektur Client-Server, protokol RFC 1035 Domain Name System, integrasi ISC-DHCP relay, dan pemetaan forward/reverse zone."),
        ("3. LANGKAH KERJA & KONFIGURASI", "Setup named.conf.options, bind9 forwarders ke 8.8.8.8, db.local forward records, reverse lookup zone, serta restart service daemon."),
        ("4. PENGUJIAN & KESIMPULAN", "Pengujian nslookup & dig dari workstation klien, verifikasi dynamic lease DHCP, analisis query latency 1.2ms, kesimpulan operasional.")
    ]
    for pt_title, pt_desc in four_points:
        pt_card = doc.create_frame(f"Card {pt_title[:10]}", det_left, width=860.0, height=135.0,
                                   bg_color="#121216", stroke_color="#24242A", stroke_weight=1.0, corner_radius=8.0,
                                   layout_mode="vertical", padding=(14, 18, 14, 18), gap=6.0, sizing_h="fill")
        doc.create_text(pt_title, pt_card, font_size=11.0, font_weight="Bold", color="#FB7185", width=360.0, letter_spacing=1.0)
        doc.create_text(pt_desc, pt_card, font_size=13.0, font_weight="Regular", color="#A1A1AA", width=820.0, line_height_pct=140.0)

    # Right Column (400w): Evaluation & Sidebar Metadata
    det_right = doc.create_frame("Detail Sidebar", det_body, width=420.0, height=888.0,
                                 bg_color="none", stroke_color="none",
                                 layout_mode="vertical", gap=20.0)

    # Evaluator Card
    eval_card = doc.create_frame("Evaluator Card", det_right, width=420.0, height=200.0,
                                 bg_color="#141418", stroke_color="#26262C", stroke_weight=1.0, corner_radius=10.0,
                                 layout_mode="vertical", padding=(20, 20, 20, 20), gap=12.0)
    doc.create_text("EVALUATION & VERIFICATION", eval_card, font_size=11.0, font_weight="Bold", color="#34D399", width=240.0)
    doc.create_text("Grade: 98 / 100 (A+)", eval_card, font_size=24.0, font_weight="Bold", color="#FAFAFA", width=280.0)
    doc.create_text("Verified by Guru Pengampu Produktif TKJ SMKN 1 Malang. Konfigurasi memenuhi standar kurikulum industri.", eval_card,
                    font_size=12.0, font_weight="Regular", color="#A1A1AA", width=380.0, line_height_pct=140.0)

    # Topology preview card
    topo_card = doc.create_frame("Topology Card", det_right, width=420.0, height=240.0,
                                 bg_color="#101014", stroke_color="#202026", stroke_weight=1.0, corner_radius=10.0,
                                 layout_mode="vertical", padding=(18, 18, 18, 18), gap=10.0)
    doc.create_text("NETWORK TOPOLOGY SCHEME", topo_card, font_size=11.0, font_weight="Bold", color="#38BDF8", width=240.0)
    doc.create_text("[Router Mikrotik RB750Gr3] -> [Debian 12 DNS/DHCP] -> [Switch Cisco 2960] -> [Client PC 1..24]",
                    topo_card, font_size=12.0, font_weight="Medium", color="#FAFAFA", width=380.0, line_height_pct=150.0)

    # Action buttons
    btn_dl = doc.create_frame("Download PDF Button", det_right, width=420.0, height=44.0,
                              bg_color="#FB7185", stroke_color="none", corner_radius=8.0,
                              layout_mode="horizontal", padding=(12, 16, 12, 16), cross_align="center", main_align="center")
    doc.create_text("Download Official Lab Report (PDF)", btn_dl, font_size=13.0, font_weight="SemiBold", color="#0B0B0C", width=260.0)


    # -------------------------------------------------------------------------
    # ARTBOARD 4: 04 - Desktop Admin Panel Dashboard - 1440 x 960
    # -------------------------------------------------------------------------
    f4 = doc.create_frame("04 - Admin Dashboard", parent_id=1, width=1440.0, height=960.0,
                          pos=(0.0, 1124.0), bg_color="#0B0B0C", stroke_color="#27272A",
                          layout_mode="horizontal", padding=(0, 0, 0, 0), gap=0.0)
    
    # Left Sidebar (250w)
    adm_side = doc.create_frame("Admin Sidebar", f4, width=250.0, height=960.0,
                                bg_color="#0E0E12", stroke_color="#1E1E24", stroke_weight=1.0,
                                layout_mode="vertical", padding=(24, 16, 24, 16), gap=24.0)
    
    doc.create_text("NAIDRA ADMIN", adm_side, font_size=16.0, font_weight="Bold", color="#FAFAFA", width=180.0)

    # Menu items
    menu_col = doc.create_frame("Menu Items", adm_side, width=218.0, height=400.0,
                                bg_color="none", stroke_color="none", layout_mode="vertical", gap=6.0)
    menu_list = [
        ("Dashboard", True),
        ("Projects Manager", False),
        ("Achievements", False),
        ("About Sections", False),
        ("Contacts / Inquiries", False),
        ("GitHub Sync Tool", False)
    ]
    for m_label, is_act in menu_list:
        m_item = doc.create_frame(f"Menu {m_label}", menu_col, width=218.0, height=40.0,
                                  bg_color="#FB7185" if is_act else "none",
                                  stroke_color="none", corner_radius=6.0,
                                  layout_mode="horizontal", padding=(10, 14, 10, 14), cross_align="center")
        doc.create_text(m_label, m_item, font_size=13.0, font_weight="SemiBold" if is_act else "Medium",
                        color="#0B0B0C" if is_act else "#A1A1AA", width=180.0)

    # Admin User footer
    adm_user = doc.create_frame("Admin User", adm_side, width=218.0, height=60.0,
                                bg_color="#141418", stroke_color="#222228", stroke_weight=1.0, corner_radius=8.0,
                                layout_mode="vertical", padding=(10, 12, 10, 12), gap=2.0)
    doc.create_text("naidrahiqa@naidra.dev", adm_user, font_size=11.0, font_weight="Medium", color="#FAFAFA", width=190.0)
    doc.create_text("RLS Admin Authenticated", adm_user, font_size=9.0, font_weight="Bold", color="#34D399", width=180.0)

    # Main Admin Area (1190w)
    adm_main = doc.create_frame("Admin Main Area", f4, width=1190.0, height=960.0,
                                bg_color="#0B0B0C", stroke_color="none",
                                layout_mode="vertical", padding=(28, 40, 28, 40), gap=24.0, sizing_h="fill")
    
    # Admin Top bar
    adm_top = doc.create_frame("Admin Topbar", adm_main, width=1110.0, height=44.0,
                               bg_color="none", stroke_color="none", layout_mode="horizontal",
                               main_align="spaceBetween", cross_align="center", sizing_h="fill")
    doc.create_text("System Overview & Live Repositories", adm_top, font_size=18.0, font_weight="Bold", color="#FAFAFA", width=350.0)

    sync_btn = doc.create_frame("Sync Button", adm_top, width=170.0, height=40.0,
                                bg_color="#10B981", stroke_color="none", corner_radius=6.0,
                                layout_mode="horizontal", padding=(10, 16, 10, 16), cross_align="center", main_align="center")
    doc.create_text("Sync GitHub Now", sync_btn, font_size=13.0, font_weight="SemiBold", color="#0B0B0C", width=130.0)

    # 4 KPI Stat Cards
    kpi_row = doc.create_frame("KPI Row", adm_main, width=1110.0, height=110.0,
                               bg_color="none", stroke_color="none", layout_mode="horizontal", gap=20.0, sizing_h="fill")
    kpis = [
        ("GITHUB REPOS", "23 Synced", "+2 this week", "#34D399"),
        ("PUBLISHED PROJECTS", "12 Active", "8 School • 4 Systems", "#38BDF8"),
        ("ACCREDITATIONS", "8 Certified", "100% Verified BNSP", "#FBBF24"),
        ("CONTACT INQUIRIES", "4 Messages", "Resend API 100% OK", "#FB7185")
    ]
    for k_title, k_val, k_sub, k_col in kpis:
        kc = doc.create_frame(f"KPI {k_title}", kpi_row, width=262.0, height=110.0,
                              bg_color="#121216", stroke_color="#24242A", stroke_weight=1.0, corner_radius=10.0,
                              layout_mode="vertical", padding=(16, 18, 16, 18), gap=4.0, sizing_h="fill")
        doc.create_text(k_title, kc, font_size=10.0, font_weight="Bold", color="#71717A", width=220.0, letter_spacing=1.0)
        doc.create_text(k_val, kc, font_size=22.0, font_weight="Bold", color="#FAFAFA", width=220.0)
        doc.create_text(k_sub, kc, font_size=11.0, font_weight="Medium", color=k_col, width=220.0)

    # Section Form Editor Preview (Collapsible 3-Section Form)
    form_preview = doc.create_frame("Collapsible Editor Box", adm_main, width=1110.0, height=720.0,
                                    bg_color="#101014", stroke_color="#202026", stroke_weight=1.0, corner_radius=10.0,
                                    layout_mode="vertical", padding=(20, 24, 20, 24), gap=16.0, sizing_h="fill")
    
    # Form Header with live sticky pill nav
    form_pills = doc.create_frame("Sticky Pill Bar", form_preview, width=1062.0, height=44.0,
                                  bg_color="#16161C", stroke_color="#26262E", stroke_weight=1.0, corner_radius=8.0,
                                  layout_mode="horizontal", padding=(6, 12, 6, 12), gap=12.0, cross_align="center",
                                  main_align="spaceBetween", sizing_h="fill")
    p_left = doc.create_frame("Pills Left", form_pills, width=600.0, height=32.0,
                              bg_color="none", stroke_color="none", layout_mode="horizontal", gap=8.0, cross_align="center")
    for p_name, p_act in [("● Section 1: Story & Content", True), ("Section 2: Details & Layout", False), ("Section 3: Media & Gallery", False)]:
        pill_box = doc.create_frame(f"Pill {p_name}", p_left, width=180.0, height=30.0,
                                    bg_color="#FB7185" if p_act else "#1E1E24",
                                    stroke_color="none", corner_radius=4.0,
                                    layout_mode="horizontal", padding=(4, 10, 4, 10), cross_align="center", main_align="center")
        doc.create_text(p_name, pill_box, font_size=11.0, font_weight="SemiBold",
                        color="#0B0B0C" if p_act else "#A1A1AA", width=165.0)

    doc.create_text("Ctrl + S Saves Automatically", form_pills, font_size=11.0, font_weight="Medium", color="#34D399", width=170.0)

    # Field previews
    doc.create_text("EDITING PROJECT: redmi10-selene-kernel (C / arm64)", form_preview, font_size=14.0, font_weight="Bold", color="#FAFAFA", width=500.0)
    
    field1 = doc.create_frame("Field 1", form_preview, width=1062.0, height=60.0,
                              bg_color="#141418", stroke_color="#26262C", stroke_weight=1.0, corner_radius=6.0,
                              layout_mode="vertical", padding=(8, 14, 8, 14), gap=4.0, sizing_h="fill")
    doc.create_text("Project Title", field1, font_size=10.0, font_weight="Bold", color="#71717A", width=200.0)
    doc.create_text("redmi10-selene-kernel - Production Android 4.19 Kernel", field1, font_size=13.0, font_weight="Medium", color="#FAFAFA", width=600.0)

    field2 = doc.create_frame("Field 2", form_preview, width=1062.0, height=180.0,
                              bg_color="#141418", stroke_color="#26262C", stroke_weight=1.0, corner_radius=6.0,
                              layout_mode="vertical", padding=(12, 14, 12, 14), gap=6.0, sizing_h="fill")
    doc.create_text("Markdown Content (Universal 4-Point Structure)", field2, font_size=10.0, font_weight="Bold", color="#71717A", width=350.0)
    doc.create_text("## 1. Identitas & Tujuan\nImplementasi governor schedutil dan memory mitigation pada kernel Xiaomi Redmi 10 (selene).\n\n## 2. Arsitektur & Thermal Driver\nKonfigurasi thermal throttle engine berbasis sysfs governor parameters.",
                    field2, font_size=12.0, font_weight="Regular", color="#A1A1AA", width=950.0, line_height_pct=150.0)


    # -------------------------------------------------------------------------
    # ARTBOARD 5: 05 - Design Tokens & Atomic UI Kit - 1440 x 960
    # -------------------------------------------------------------------------
    f5 = doc.create_frame("05 - Design Tokens & UI Kit", parent_id=1, width=1440.0, height=960.0,
                          pos=(1540.0, 1124.0), bg_color="#0B0B0C", stroke_color="#27272A",
                          layout_mode="vertical", padding=(36, 56, 36, 56), gap=28.0, sizing_h="fill")
    
    doc.create_text("NAIDRAHIQA DESIGN SYSTEM - TOKENS & ATOMIC PRIMITIVES", f5,
                    font_size=18.0, font_weight="Bold", color="#FAFAFA", width=600.0, letter_spacing=1.5)

    # Color Tokens Row
    c_sec = doc.create_frame("Color Swatches Section", f5, width=1328.0, height=170.0,
                             bg_color="none", stroke_color="none", layout_mode="vertical", gap=12.0, sizing_h="fill")
    doc.create_text("CORE PALETTE (DARK & LIGHT THEMES)", c_sec, font_size=11.0, font_weight="Bold", color="#A1A1AA", width=300.0)

    swatch_row = doc.create_frame("Swatches Row", c_sec, width=1328.0, height=130.0,
                                  bg_color="none", stroke_color="none", layout_mode="horizontal", gap=16.0, sizing_h="fill")
    swatches = [
        ("Background", "#0B0B0C", "#FAFAFA"),
        ("Surface", "#141416", "#FAFAFA"),
        ("Surface-2", "#1C1C20", "#FAFAFA"),
        ("Border Hairline", "#27272A", "#FAFAFA"),
        ("Accent Rose", "#FB7185", "#0B0B0C"),
        ("Accent Emerald", "#34D399", "#0B0B0C"),
        ("Accent Sky", "#38BDF8", "#0B0B0C"),
        ("Accent Amber", "#FBBF24", "#0B0B0C")
    ]
    for s_label, s_hex, s_fg in swatches:
        sc = doc.create_frame(f"Swatch {s_label}", swatch_row, width=150.0, height=125.0,
                              bg_color=s_hex, stroke_color="#33333A", stroke_weight=1.0, corner_radius=8.0,
                              layout_mode="vertical", padding=(12, 12, 12, 12), gap=6.0, main_align="max")
        doc.create_text(s_label, sc, font_size=11.0, font_weight="Bold", color=s_fg, width=130.0)
        doc.create_text(s_hex, sc, font_size=10.0, font_weight="Regular", color=s_fg, width=130.0)

    # Typography & Components Columns (2 Columns)
    proto_row = doc.create_frame("Primitives Row", f5, width=1328.0, height=640.0,
                                 bg_color="none", stroke_color="none", layout_mode="horizontal", gap=32.0, sizing_h="fill")

    # Typography Column
    type_col = doc.create_frame("Typography Column", proto_row, width=648.0, height=620.0,
                                bg_color="#101014", stroke_color="#202026", stroke_weight=1.0, corner_radius=10.0,
                                layout_mode="vertical", padding=(20, 24, 20, 24), gap=14.0, sizing_h="fill")
    doc.create_text("TYPOGRAPHIC HIERARCHY", type_col, font_size=11.0, font_weight="Bold", color="#FB7185", width=250.0)
    doc.create_text("Display 54 Bold — FAQIH ARDIAN", type_col, font_size=28.0, font_weight="Bold", color="#FAFAFA", width=500.0)
    doc.create_text("Heading 1 32 Bold — Project Showcase", type_col, font_size=22.0, font_weight="Bold", color="#FAFAFA", width=500.0)
    doc.create_text("Heading 2 20 SemiBold — Architectural Challenges", type_col, font_size=18.0, font_weight="SemiBold", color="#A1A1AA", width=500.0)
    doc.create_text("Body 14 Regular — High performance low-level systems engineering and networking documentation.", type_col, font_size=14.0, font_weight="Regular", color="#A1A1AA", width=580.0)
    doc.create_text("Mono 12 Regular — void *selene_thermal_governor_init(void)", type_col, font_size=12.0, font_weight="Regular", color="#34D399", width=500.0)

    # Component Primitives Column
    comp_col = doc.create_frame("Component Primitives", proto_row, width=648.0, height=620.0,
                                bg_color="#101014", stroke_color="#202026", stroke_weight=1.0, corner_radius=10.0,
                                layout_mode="vertical", padding=(20, 24, 20, 24), gap=16.0, sizing_h="fill")
    doc.create_text("UI BUTTONS & STATUS PRIMITIVES", comp_col, font_size=11.0, font_weight="Bold", color="#34D399", width=250.0)

    # Button variants
    b_vars = doc.create_frame("Button Variants", comp_col, width=600.0, height=44.0,
                              bg_color="none", stroke_color="none", layout_mode="horizontal", gap=12.0, cross_align="center")
    
    b_rose = doc.create_frame("Btn Rose", b_vars, width=130.0, height=40.0, bg_color="#FB7185", corner_radius=6.0,
                              layout_mode="horizontal", padding=(8, 14, 8, 14), cross_align="center", main_align="center")
    doc.create_text("Primary Rose", b_rose, font_size=12.0, font_weight="SemiBold", color="#0B0B0C", width=90.0)

    b_dark = doc.create_frame("Btn Dark", b_vars, width=130.0, height=40.0, bg_color="#18181D", stroke_color="#2E2E36", stroke_weight=1.0, corner_radius=6.0,
                              layout_mode="horizontal", padding=(8, 14, 8, 14), cross_align="center", main_align="center")
    doc.create_text("Secondary Dark", b_dark, font_size=12.0, font_weight="Medium", color="#FAFAFA", width=100.0)

    b_ghost = doc.create_frame("Btn Ghost", b_vars, width=110.0, height=40.0, bg_color="none", stroke_color="#3F3F46", stroke_weight=1.0, corner_radius=6.0,
                               layout_mode="horizontal", padding=(8, 14, 8, 14), cross_align="center", main_align="center")
    doc.create_text("Hairline Ghost", b_ghost, font_size=12.0, font_weight="Medium", color="#A1A1AA", width=90.0)


    # -------------------------------------------------------------------------
    # ARTBOARD 6: 06 - Mobile Viewport Suite (393 x 852 - iPhone 15/16)
    # -------------------------------------------------------------------------
    f6 = doc.create_frame("06 - Mobile Homepage", parent_id=1, width=393.0, height=852.0,
                          pos=(3080.0, 1124.0), bg_color="#0B0B0C", stroke_color="#27272A",
                          layout_mode="vertical", padding=(0, 0, 0, 0), gap=0.0)
    
    # Mobile Header
    m_nav = doc.create_frame("Mobile Nav", f6, width=393.0, height=60.0,
                             bg_color="#101014", stroke_color="#222228", stroke_weight=1.0,
                             layout_mode="horizontal", padding=(12, 20, 12, 20), main_align="spaceBetween", cross_align="center")
    doc.create_text("NAIDRAHIQA", m_nav, font_size=15.0, font_weight="Bold", color="#FAFAFA", width=110.0)
    
    m_menu = doc.create_frame("Menu Icon", m_nav, width=36.0, height=36.0,
                              bg_color="#18181F", stroke_color="#2A2A32", corner_radius=6.0,
                              layout_mode="horizontal", padding=(6, 8, 6, 8), cross_align="center", main_align="center")
    doc.create_text("☰", m_menu, font_size=14.0, font_weight="Bold", color="#FAFAFA", width=20.0)

    # Mobile Hero
    m_hero = doc.create_frame("Mobile Hero", f6, width=393.0, height=360.0,
                              bg_color="#0B0B0C", stroke_color="none",
                              layout_mode="vertical", padding=(28, 20, 20, 20), gap=14.0)
    doc.create_text("NETWORKING • KERNEL DEV", m_hero, font_size=10.0, font_weight="Bold", color="#FB7185", width=200.0)
    doc.create_text("FAQIH ARDIAN\nSYAH", m_hero, font_size=34.0, font_weight="Bold", color="#FAFAFA", width=340.0, line_height_pct=115.0)
    doc.create_text("TKJ Student & systems developer building custom Linux kernels & high-performance web.",
                    m_hero, font_size=13.0, font_weight="Regular", color="#A1A1AA", width=340.0, line_height_pct=140.0)
    
    # Mobile Action Buttons
    m_btns = doc.create_frame("Mobile Buttons", m_hero, width=353.0, height=44.0,
                              bg_color="none", stroke_color="none", layout_mode="horizontal", gap=12.0)
    m_b1 = doc.create_frame("M Btn 1", m_btns, width=170.0, height=44.0, bg_color="#FB7185", corner_radius=8.0,
                            layout_mode="horizontal", padding=(10, 14, 10, 14), cross_align="center", main_align="center")
    doc.create_text("Explore Projects", m_b1, font_size=12.0, font_weight="SemiBold", color="#0B0B0C", width=110.0)

    m_b2 = doc.create_frame("M Btn 2", m_btns, width=170.0, height=44.0, bg_color="#18181E", stroke_color="#2E2E38", corner_radius=8.0,
                            layout_mode="horizontal", padding=(10, 14, 10, 14), cross_align="center", main_align="center")
    doc.create_text("Download CV", m_b2, font_size=12.0, font_weight="Medium", color="#FAFAFA", width=95.0)

    # Mobile Featured Project Card
    m_card = doc.create_frame("Mobile Project Card", f6, width=353.0, height=220.0,
                              pos=(20.0, 440.0), bg_color="#141418", stroke_color="#27272E", stroke_weight=1.0, corner_radius=10.0,
                              layout_mode="vertical", padding=(16, 16, 16, 16), gap=8.0)
    doc.create_text("LINUX KERNEL 4.19", m_card, font_size=9.0, font_weight="Bold", color="#38BDF8", width=140.0)
    doc.create_text("redmi10-selene-kernel", m_card, font_size=16.0, font_weight="Bold", color="#FAFAFA", width=300.0)
    doc.create_text("Thermal mitigation, governor tuning and scheduler optimizations.", m_card,
                    font_size=12.0, font_weight="Regular", color="#A1A1AA", width=310.0, line_height_pct=135.0)
    doc.create_text("● C • ★ 42 stars • ⑂ 18 forks", m_card, font_size=11.0, font_weight="Medium", color="#FBBF24", width=250.0)

    # Mobile Bottom Tab Bar
    m_tab = doc.create_frame("Mobile Tab Bar", f6, width=393.0, height=64.0,
                             pos=(0.0, 788.0), bg_color="#101014", stroke_color="#222228", stroke_weight=1.0,
                             layout_mode="horizontal", padding=(8, 24, 8, 24), main_align="spaceBetween", cross_align="center")
    for tab_lbl in ["Home", "Projects", "School", "About"]:
        doc.create_text(tab_lbl, m_tab, font_size=11.0, font_weight="Medium", color="#A1A1AA", width=50.0)


    # -------------------------------------------------------------------------
    # ARTBOARD 7: 07 - Mobile Projects Hub (393 x 852)
    # -------------------------------------------------------------------------
    f7 = doc.create_frame("07 - Mobile Projects Hub", parent_id=1, width=393.0, height=852.0,
                          pos=(3520.0, 1124.0), bg_color="#0B0B0C", stroke_color="#27272A",
                          layout_mode="vertical", padding=(0, 0, 0, 0), gap=0.0)
    
    m7_nav = doc.create_frame("M7 Nav", f7, width=393.0, height=60.0,
                              bg_color="#101014", stroke_color="#222228", stroke_weight=1.0,
                              layout_mode="horizontal", padding=(12, 20, 12, 20), main_align="spaceBetween", cross_align="center")
    doc.create_text("REPOSITORIES (23)", m7_nav, font_size=14.0, font_weight="Bold", color="#FAFAFA", width=180.0)
    doc.create_text("Filter", m7_nav, font_size=12.0, font_weight="Medium", color="#FB7185", width=50.0)

    # 3 Mobile Repo Cards
    m7_body = doc.create_frame("M7 Body", f7, width=393.0, height=720.0,
                               bg_color="#0B0B0C", stroke_color="none",
                               layout_mode="vertical", padding=(16, 20, 16, 20), gap=12.0)
    
    m_repos = [
        ("redmi10-selene-kernel", "C", "★ 42", "Custom kernel tree for Xiaomi Redmi 10."),
        ("packet-sniffer", "C", "★ 28", "Raw socket packet sniffer and analysis tool."),
        ("naidrahiqa-porto", "TypeScript", "★ 19", "Modern personal portfolio with Next.js 16."),
        ("pancasila-interactive", "TypeScript", "★ 14", "SMKN 1 Malang 4-point assignment project.")
    ]
    for mr_n, mr_l, mr_s, mr_d in m_repos:
        mc = doc.create_frame(f"MC {mr_n}", m7_body, width=353.0, height=135.0,
                              bg_color="#141418", stroke_color="#24242A", stroke_weight=1.0, corner_radius=8.0,
                              layout_mode="vertical", padding=(12, 14, 12, 14), gap=6.0)
        doc.create_text(mr_n, mc, font_size=14.0, font_weight="Bold", color="#FAFAFA", width=300.0)
        doc.create_text(mr_d, mc, font_size=12.0, font_weight="Regular", color="#A1A1AA", width=320.0)
        
        m_row = doc.create_frame("M Meta", mc, width=320.0, height=20.0,
                                 bg_color="none", stroke_color="none", layout_mode="horizontal", gap=14.0)
        doc.create_text(f"● {mr_l}", m_row, font_size=11.0, font_weight="Medium", color="#38BDF8", width=90.0)
        doc.create_text(mr_s, m_row, font_size=11.0, font_weight="SemiBold", color="#FBBF24", width=60.0)

    return doc

if __name__ == "__main__":
    builder = build_suite()
    doc_json = builder.to_json()
    
    json_path = "/tmp/rich_portfolio.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(doc_json, f, indent=2)
    print(f"Generated Rich Dark JSON: {json_path} ({len(doc_json['nodes'])} nodes across 7 artboards)")
    
    figcraft_path = "/home/naidra/Projects/Web/naidrahiqa-porto/design/naidrahiqa-portfolio.figcraft"
    conv_cmd = ["figcraft-cli", "convert", json_path, figcraft_path]
    res = subprocess.run(conv_cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Conversion error: {res.stderr}")
        sys.exit(1)
        
    print(f"Created native FigCraft dark file: {figcraft_path}")
    
    # CLI Info
    subprocess.run(["figcraft-cli", "info", figcraft_path])
    
    # High-res render
    png_path = "/home/naidra/Projects/Web/naidrahiqa-porto/design/naidrahiqa-portfolio.png"
    subprocess.run(["figcraft-cli", "render", "--out", png_path, figcraft_path])
    print(f"Rendered master dark design board: {png_path}")
