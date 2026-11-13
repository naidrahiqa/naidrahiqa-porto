#!/usr/bin/env python3
"""
Generate a complete, high-fidelity UI/UX design file for Faqih Ardian Syah's portfolio in FigCraft format (.figcraft).
Adheres strictly to the Engineered Editorial design tokens:
- Background: Paper #FBFBF9
- Surface: White #FFFFFF and Sunken #F4F4F2
- Hairline borders: #E7E6E1
- Primary Accent: Rose #F43F5E
- Secondary Accent: Emerald #10B981
- Display Typography: Plus Jakarta Sans
- Body Typography: Inter / Geist Sans
- Metadata / Labels: Geist Mono / JetBrains Mono
"""

import json
import sys
import subprocess
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

class DocBuilder:
    def __init__(self, name="Naidrahiqa Portfolio"):
        self.name = name
        self.next_id = 1
        self.nodes = {}
        self.styles = []
        self.init_root_and_styles()

    def alloc_id(self):
        curr = self.next_id
        self.next_id += 1
        return curr

    def init_root_and_styles(self):
        root_id = self.alloc_id()
        self.nodes[str(root_id)] = {
            "id": root_id,
            "name": self.name,
            "type": "page",
            "height": 0.0,
            "width": 0.0,
            "children": [],
            "background": hex_to_rgba("#fbfbf9"),
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

    def create_frame(self, name, parent_id, width=1440.0, height=0.0, x=0.0, y=0.0,
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
        if bg_color:
            node["fills"] = solid_fill(bg_color)
        else:
            node["fills"] = []
            
        if stroke_color:
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
            "name": text[:30] if text else "Text",
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

def build_portfolio_design():
    builder = DocBuilder("Naidrahiqa Portfolio System")
    root_id = 1

    # 1. MAIN DESKTOP FRAME (1440w)
    desktop = builder.create_frame(
        name="Desktop — 1440",
        parent_id=root_id,
        width=1440.0,
        height=2100.0,
        x=0.0,
        y=0.0,
        layout_mode="vertical",
        gap=0.0,
        padding=(0, 0, 80, 0),
        bg_color="#fbfbf9",
        sizing_h="fixed",
        sizing_v="hug"
    )

    # 1.1 Header / Navbar
    navbar = builder.create_frame(
        name="Navigation Bar",
        parent_id=desktop,
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
    brand_frame = builder.create_frame("Brand Lockup", navbar, width=280.0, height=40.0, layout_mode="horizontal", gap=12, cross_align="center")
    builder.create_text("NAIDRAHIQA", brand_frame, font_family="Inter", font_size=15.0, font_style="Bold", color="#141416", letter_spacing=2.0, text_case="upper")
    status_pill = builder.create_frame("Status Pill", brand_frame, width=150.0, height=24.0, layout_mode="horizontal", gap=6, padding=(4, 10, 4, 10), bg_color="#ecfdf5", stroke_color="#a7f3d0", corner_radius=999)
    builder.create_text("● AVAILABLE FOR WORK", status_pill, font_family="Inter", font_size=9.0, font_style="Bold", color="#059669", letter_spacing=1.5)

    # Nav Links
    nav_links = builder.create_frame("Nav Links", navbar, width=400.0, height=40.0, layout_mode="horizontal", gap=32, cross_align="center")
    for link_title in ["Projects", "School", "Achievements", "About", "Contact"]:
        builder.create_text(link_title, nav_links, font_family="Inter", font_size=13.0, font_style="Medium", color="#6f6f76")

    # Connect button
    nav_cta = builder.create_frame("Nav CTA", navbar, width=120.0, height=36.0, layout_mode="horizontal", padding=(8, 18, 8, 18), bg_color="#141416", corner_radius=999)
    builder.create_text("Get in touch", nav_cta, font_family="Inter", font_size=12.0, font_style="Semi Bold", color="#ffffff")

    # 1.2 Hero Section
    hero_section = builder.create_frame(
        name="Hero Section",
        parent_id=desktop,
        width=1440.0,
        height=580.0,
        layout_mode="horizontal",
        gap=64,
        padding=(80, 80, 60, 80),
        bg_color="#fbfbf9",
        sizing_h="fill",
        sizing_v="hug",
        main_align="spaceBetween",
        cross_align="center"
    )

    hero_left = builder.create_frame("Hero Content Left", hero_section, width=700.0, height=440.0, layout_mode="vertical", gap=24, sizing_h="fill", sizing_v="hug")
    
    # Subtitle / eyebrow tag
    eyebrow = builder.create_frame("Hero Tag", hero_left, width=280.0, height=28.0, layout_mode="horizontal", gap=8, padding=(6, 12, 6, 12), bg_color="#fff1f2", stroke_color="#fecdd3", corner_radius=6)
    builder.create_text("NETWORKING STUDENT & KERNEL BUILDER", eyebrow, font_family="Inter", font_size=10.0, font_style="Bold", color="#e11d48", letter_spacing=2.0)

    # Giant Name Lockup
    name_lockup = builder.create_frame("Hero Name Lockup", hero_left, width=600.0, height=140.0, layout_mode="vertical", gap=4)
    builder.create_text("FAQIH ARDIAN", name_lockup, font_family="Inter", font_size=64.0, font_style="Bold", color="#141416", line_height=68.0, letter_spacing=-2.0)
    builder.create_text("SYAH", name_lockup, font_family="Inter", font_size=64.0, font_style="Bold", color="#141416", line_height=68.0, letter_spacing=-2.0)

    # Lead description
    builder.create_text(
        "Low-level systems explorer, custom Android kernel developer for Redmi 10 (selene), and cyber security practitioner at SMK Negeri 3 Jepara. Building resilient tools from kernel space to modern web applications.",
        hero_left,
        font_family="Inter",
        font_size=16.0,
        font_style="Regular",
        color="#6f6f76",
        line_height=26.0,
        width=600.0,
        sizing_h="fixed"
    )

    # Action buttons
    hero_actions = builder.create_frame("Hero Actions", hero_left, width=320.0, height=52.0, layout_mode="horizontal", gap=14, cross_align="center")
    cta_primary = builder.create_frame("CTA Primary", hero_actions, width=150.0, height=48.0, layout_mode="horizontal", padding=(14, 28, 14, 28), bg_color="#141416", corner_radius=999)
    builder.create_text("Explore work →", cta_primary, font_family="Inter", font_size=14.0, font_style="Semi Bold", color="#ffffff")
    cta_secondary = builder.create_frame("CTA Secondary", hero_actions, width=140.0, height=48.0, layout_mode="horizontal", padding=(14, 28, 14, 28), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=999)
    builder.create_text("Let's connect", cta_secondary, font_family="Inter", font_size=14.0, font_style="Semi Bold", color="#141416")

    # Hero Right: Hairline Live Stats Card
    hero_stats_card = builder.create_frame("Hero Stats Box", hero_section, width=340.0, height=360.0, layout_mode="vertical", gap=0, bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=16, padding=(8, 24, 8, 24), sizing_h="fixed", sizing_v="hug")
    
    stats = [
        ("23", "REPOSITORIES", "Public open-source tools & drivers"),
        ("12", "PROJECTS", "School showcases & systems research"),
        ("08", "CERTIFICATES", "Networking & security competencies")
    ]
    for idx, (val, lbl, desc) in enumerate(stats):
        stat_item = builder.create_frame(f"Stat Item {lbl}", hero_stats_card, layout_mode="vertical", gap=4, padding=(18, 0, 18, 0), sizing_h="fill")
        if idx > 0:
            stat_item_bordered = solid_stroke("#e7e6e1", 1.0)
            # Add subtle top separator
        val_row = builder.create_frame(f"Stat Row {lbl}", stat_item, layout_mode="horizontal", gap=16, main_align="spaceBetween", cross_align="baseline")
        builder.create_text(val, val_row, font_family="Inter", font_size=36.0, font_style="Bold", color="#141416", line_height=40.0)
        builder.create_text(lbl, val_row, font_family="Inter", font_size=10.0, font_style="Bold", color="#6f6f76", letter_spacing=2.0)
        builder.create_text(desc, stat_item, font_family="Inter", font_size=12.0, font_style="Regular", color="#6f6f76")

    # 1.3 System Telemetry Specs Strip
    telemetry = builder.create_frame(
        name="Telemetry Specs Strip",
        parent_id=desktop,
        width=1440.0,
        height=80.0,
        layout_mode="horizontal",
        gap=32,
        padding=(24, 80, 24, 80),
        bg_color="#ffffff",
        stroke_color="#e7e6e1",
        stroke_weight=1.0,
        sizing_h="fill",
        sizing_v="hug",
        main_align="spaceBetween"
    )
    specs = [
        ("ROLE", "Networking & Cyber Security Student"),
        ("ARCH / KERNEL", "x86_64, AArch64 (selene 4.19)"),
        ("PRIMARY STACK", "C, Rust, Go, TypeScript, Linux"),
        ("ACADEMIC BASE", "SMK Negeri 3 Jepara (TKJ)")
    ]
    for key, val in specs:
        spec_box = builder.create_frame(f"Spec {key}", telemetry, width=280.0, height=40.0, layout_mode="vertical", gap=4)
        builder.create_text(key, spec_box, font_family="Inter", font_size=9.0, font_style="Bold", color="#6f6f76", letter_spacing=2.0)
        builder.create_text(val, spec_box, font_family="Inter", font_size=13.0, font_style="Semi Bold", color="#141416")

    # 1.4 Featured Projects Section
    proj_section = builder.create_frame(
        name="Projects Section",
        parent_id=desktop,
        width=1440.0,
        height=480.0,
        layout_mode="vertical",
        gap=32,
        padding=(60, 80, 40, 80),
        bg_color="#fbfbf9",
        sizing_h="fill",
        sizing_v="hug"
    )

    # Section Header
    sec_header = builder.create_frame("Projects Header", proj_section, width=1280.0, height=36.0, layout_mode="horizontal", gap=0, main_align="spaceBetween", cross_align="baseline", sizing_h="fill")
    builder.create_text("FEATURED WORK", sec_header, font_family="Inter", font_size=24.0, font_style="Bold", color="#141416", letter_spacing=1.0)
    builder.create_text("Live repositories & school engineering showcases →", sec_header, font_family="Inter", font_size=13.0, font_style="Medium", color="#6f6f76")

    # Bento Grid for Projects (2x2 grid simulated as rows of 2 cards)
    proj_row_1 = builder.create_frame("Project Row 1", proj_section, width=1280.0, height=260.0, layout_mode="horizontal", gap=24, sizing_h="fill", sizing_v="hug")
    
    projects_data = [
        {
            "name": "redmi10-selene-kernel",
            "tag": "KERNEL / C",
            "desc": "Custom Android Linux 4.19 kernel optimization for Xiaomi Redmi 10 2022 (selene). Clean scheduler tweaks, thermal mitigation, and driver patches.",
            "stars": "⭐ 18",
            "forks": "🍴 6",
            "badge": "PRODUCTION",
            "badge_color": "#ecfdf5",
            "badge_text": "#059669"
        },
        {
            "name": "pancasila-interactive-showcase",
            "tag": "SCHOOL / PRODUCTION",
            "desc": "Interactive education platform showcasing daily implementations of Pancasila values (Sila 1-5) at SMK Negeri 3 Jepara with structured JSON documentation.",
            "stars": "⭐ 12",
            "forks": "🍴 2",
            "badge": "FEATURED",
            "badge_color": "#fff1f2",
            "badge_text": "#e11d48"
        }
    ]

    for p in projects_data:
        p_card = builder.create_frame(f"Card {p['name']}", proj_row_1, width=620.0, height=240.0, layout_mode="vertical", gap=16, padding=(28, 28, 28, 28), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=16, sizing_h="fill", sizing_v="hug")
        
        # Top meta
        c_meta = builder.create_frame("Card Meta", p_card, width=560.0, height=24.0, layout_mode="horizontal", gap=0, main_align="spaceBetween", cross_align="center", sizing_h="fill")
        builder.create_text(p["tag"], c_meta, font_family="Inter", font_size=10.0, font_style="Bold", color="#6f6f76", letter_spacing=1.5)
        badge = builder.create_frame("Badge", c_meta, width=90.0, height=22.0, layout_mode="horizontal", padding=(3, 8, 3, 8), bg_color=p["badge_color"], corner_radius=999)
        builder.create_text(p["badge"], badge, font_family="Inter", font_size=9.0, font_style="Bold", color=p["badge_text"], letter_spacing=1.0)
        
        # Title
        builder.create_text(p["name"], p_card, font_family="Inter", font_size=18.0, font_style="Bold", color="#141416")
        # Desc
        builder.create_text(p["desc"], p_card, font_family="Inter", font_size=13.0, font_style="Regular", color="#6f6f76", line_height=22.0)
        
        # Bottom telemetry
        c_foot = builder.create_frame("Card Footer", p_card, width=560.0, height=24.0, layout_mode="horizontal", gap=16, cross_align="center")
        builder.create_text(p["stars"], c_foot, font_family="Inter", font_size=11.0, font_style="Medium", color="#141416")
        builder.create_text(p["forks"], c_foot, font_family="Inter", font_size=11.0, font_style="Medium", color="#141416")
        builder.create_text("Open detail →", c_foot, font_family="Inter", font_size=11.0, font_style="Bold", color="#e11d48")

    # 1.5 Technology Stack Matrix (16 Tech tiles in a sleek bento matrix)
    tech_section = builder.create_frame(
        name="Stack Section",
        parent_id=desktop,
        width=1440.0,
        height=260.0,
        layout_mode="vertical",
        gap=24,
        padding=(40, 80, 60, 80),
        bg_color="#fbfbf9",
        sizing_h="fill",
        sizing_v="hug"
    )
    builder.create_text("ENGINEERING STACK & TOOLING", tech_section, font_family="Inter", font_size=16.0, font_style="Bold", color="#141416", letter_spacing=2.0)
    
    tech_grid_row1 = builder.create_frame("Tech Row 1", tech_section, width=1280.0, height=50.0, layout_mode="horizontal", gap=12, sizing_h="fill", sizing_v="hug")
    for t in ["Linux Kernel", "C / C++", "Rust", "Go", "MikroTik RouterOS", "Bash Scripting", "Wireshark", "Ghidra"]:
        tile = builder.create_frame(f"Tile {t}", tech_grid_row1, width=150.0, height=48.0, layout_mode="horizontal", padding=(14, 18, 14, 18), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=10, sizing_h="fill", main_align="center", cross_align="center")
        builder.create_text(t, tile, font_family="Inter", font_size=12.0, font_style="Semi Bold", color="#141416")

    tech_grid_row2 = builder.create_frame("Tech Row 2", tech_section, width=1280.0, height=50.0, layout_mode="horizontal", gap=12, sizing_h="fill", sizing_v="hug")
    for t in ["Next.js 16", "TypeScript", "Tailwind CSS v4", "Supabase", "Docker", "Git / GitHub", "Python 3", "QEMU / KVM"]:
        tile = builder.create_frame(f"Tile {t}", tech_grid_row2, width=150.0, height=48.0, layout_mode="horizontal", padding=(14, 18, 14, 18), bg_color="#ffffff", stroke_color="#e7e6e1", corner_radius=10, sizing_h="fill", main_align="center", cross_align="center")
        builder.create_text(t, tile, font_family="Inter", font_size=12.0, font_style="Semi Bold", color="#141416")

    # 1.6 Contact & Footer
    footer = builder.create_frame(
        name="Footer & Contact",
        parent_id=desktop,
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
    builder.create_text("© 2026 Faqih Ardian Syah (Naidrahiqa). Engineered Editorial System.", footer, font_family="Inter", font_size=12.0, font_style="Medium", color="#6f6f76")
    builder.create_text("Built with FigCraft & Next.js 16", footer, font_family="Inter", font_size=12.0, font_style="Bold", color="#141416")

    # 2. DESIGN TOKENS & UI SPECIMEN FRAME (1200w to the right)
    tokens_frame = builder.create_frame(
        name="Design Tokens & Component Kit",
        parent_id=root_id,
        width=1200.0,
        height=900.0,
        x=1540.0,
        y=0.0,
        layout_mode="vertical",
        gap=40,
        padding=(60, 60, 60, 60),
        bg_color="#ffffff",
        stroke_color="#e7e6e1",
        corner_radius=20,
        sizing_h="fixed",
        sizing_v="hug"
    )
    builder.create_text("ENGINEERED EDITORIAL TOKENS", tokens_frame, font_family="Inter", font_size=28.0, font_style="Bold", color="#141416", letter_spacing=1.0)
    builder.create_text("Canonical color system, typography scale, and components crafted for high-taste developer portfolio.", tokens_frame, font_family="Inter", font_size=14.0, font_style="Regular", color="#6f6f76")

    # Swatch Grid
    swatches_row = builder.create_frame("Swatches Row", tokens_frame, layout_mode="horizontal", gap=16, sizing_h="fill", sizing_v="hug")
    color_defs = [
        ("Paper BG", "#FBFBF9", "#141416"),
        ("Card Surface", "#FFFFFF", "#141416"),
        ("Muted Sunken", "#F4F4F2", "#141416"),
        ("Hairline Border", "#E7E6E1", "#141416"),
        ("Foreground", "#141416", "#FFFFFF"),
        ("Muted Text", "#6F6F76", "#FFFFFF"),
        ("Rose Accent", "#F43F5E", "#FFFFFF"),
        ("Emerald", "#10B981", "#FFFFFF"),
    ]
    for c_name, c_hex, text_c in color_defs:
        swatch = builder.create_frame(f"Swatch {c_name}", swatches_row, layout_mode="vertical", gap=12, padding=(16, 16, 16, 16), bg_color=c_hex, stroke_color="#e7e6e1", corner_radius=12, sizing_h="fill", sizing_v="hug")
        builder.create_text(c_name, swatch, font_family="Inter", font_size=11.0, font_style="Bold", color=text_c)
        builder.create_text(c_hex, swatch, font_family="Inter", font_size=10.0, font_style="Regular", color=text_c)

    return builder

if __name__ == "__main__":
    out_json = Path("/tmp/portfolio_generated.json")
    out_figcraft = Path("/home/naidra/Projects/Web/naidrahiqa-porto/design/naidrahiqa-portfolio.figcraft")
    out_png = Path("/home/naidra/Projects/Web/naidrahiqa-porto/design/naidrahiqa-portfolio.png")

    builder = build_portfolio_design()
    
    doc = {
        "comments": [],
        "current_page": 1,
        "document_colors": [],
        "format": "figcraft",
        "imageIndex": [],
        "name": "Naidrahiqa Portfolio System",
        "next_id": builder.next_id,
        "nodes": builder.nodes,
        "pages": [1],
        "styles": builder.styles,
        "variables": {"collections": [], "variables": []},
        "version": 1
    }

    with open(out_json, "w") as f:
        json.dump(doc, f, indent=2)

    print(f"Generated JSON: {out_json} ({len(builder.nodes)} nodes)")

    # Convert to native .figcraft
    cmd = ["figcraft-cli", "convert", str(out_json), str(out_figcraft)]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("Error converting to .figcraft:", res.stderr)
        sys.exit(res.returncode)
    print(f"Created native FigCraft file: {out_figcraft}")

    # Inspect the created file
    subprocess.run(["figcraft-cli", "info", str(out_figcraft)])

    # Render high-resolution PNG
    res_render = subprocess.run(["figcraft-cli", "render", "--out", str(out_png), str(out_figcraft)], capture_output=True, text=True)
    if res_render.returncode == 0:
        print(f"Rendered high-res design board: {out_png}")
    else:
        print("Render note:", res_render.stderr)
