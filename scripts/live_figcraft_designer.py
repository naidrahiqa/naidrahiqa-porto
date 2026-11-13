#!/usr/bin/env python3
"""
Drive FigCraft live through the control socket (127.0.0.1:7979).
This updates the document inside the user's running GUI window in real time!
"""

import socket
import json
import time

def send_cmd(s, method, params):
    req = {"id": int(time.time() * 1000) % 1000000, "method": method, "params": params}
    s.sendall(json.dumps(req).encode("utf-8") + b"\n")
    buf = b""
    while b"\n" not in buf:
        chunk = s.recv(8192)
        if not chunk:
            break
        buf += chunk
    res = json.loads(buf.decode("utf-8"))
    return res

def exec_engine(s, command, params):
    return send_cmd(s, "engine.execute", {"command": command, "params": params})

def main():
    print("Connecting to FigCraft live control server at 127.0.0.1:7979...")
    s = socket.create_connection(("127.0.0.1", 7979), timeout=10)
    print("Connected! Inspecting document...")

    doc_info = send_cmd(s, "document.inspect", {})
    if not doc_info.get("ok"):
        print("Failed to inspect:", doc_info)
        return

    pages = doc_info["result"]["pages"]
    current_page = doc_info["result"]["currentPage"]
    print(f"Current document: {doc_info['result']['name']}, page: {current_page}")

    # 1. Create Dark Mode Desktop Frame (x=0, y=2250, w=1440, h=1800)
    print("Creating Dark Mode Desktop frame live...")
    r1 = exec_engine(s, "frame.create", {
        "name": "Desktop — Dark Mode (1440)",
        "x": 0.0,
        "y": 2250.0,
        "width": 1440.0,
        "height": 1800.0,
        "props": {
            "fill": "#0B0B0C",
            "stroke": "rgba(255,255,255,0.08)",
            "layout": "vertical",
            "padding": [0, 80, 80, 80],
            "gap": 48.0
        }
    })
    dark_desktop_id = r1.get("result", {}).get("id")
    print(f" -> Dark Desktop frame created (ID: {dark_desktop_id})")

    if dark_desktop_id:
        # Dark Navbar
        r_nav = exec_engine(s, "node.create", {
            "type": "frame",
            "parent": dark_desktop_id,
            "name": "Dark Navbar",
            "width": 1440.0,
            "height": 80.0,
            "props": {
                "fill": "#141416",
                "stroke": "rgba(255,255,255,0.08)",
                "layout": "horizontal",
                "padding": [24, 80, 24, 80],
                "mainAlign": "spaceBetween",
                "crossAlign": "center"
            }
        })
        dark_nav_id = r_nav.get("result", {}).get("id")
        if dark_nav_id:
            exec_engine(s, "node.create", {
                "type": "text",
                "parent": dark_nav_id,
                "text": "NAIDRAHIQA",
                "props": {"fontSize": 15.0, "fontStyle": "Bold", "fill": "#FAFAFA", "letterSpacing": "2%"}
            })
            exec_engine(s, "node.create", {
                "type": "text",
                "parent": dark_nav_id,
                "text": "● KERNEL & SECURITY LAB",
                "props": {"fontSize": 10.0, "fontStyle": "Bold", "fill": "#34D399", "letterSpacing": "1.5%"}
            })

        # Dark Hero
        r_hero = exec_engine(s, "node.create", {
            "type": "frame",
            "parent": dark_desktop_id,
            "name": "Dark Hero",
            "width": 1440.0,
            "height": 450.0,
            "props": {
                "fill": "none",
                "layout": "vertical",
                "padding": [60, 0, 40, 0],
                "gap": 24.0
            }
        })
        dark_hero_id = r_hero.get("result", {}).get("id")
        if dark_hero_id:
            exec_engine(s, "node.create", {
                "type": "text",
                "parent": dark_hero_id,
                "text": "FAQIH ARDIAN\nSYAH",
                "props": {"fontSize": 64.0, "fontStyle": "Bold", "lineHeight": 68.0, "letterSpacing": "-3%", "fill": "#FAFAFA"}
            })
            exec_engine(s, "node.create", {
                "type": "text",
                "parent": dark_hero_id,
                "text": "Low-level Linux kernel developer & security researcher. Designing engineered, anti-slop user interfaces.",
                "props": {"fontSize": 16.0, "lineHeight": 26.0, "fill": "#A1A1AA"}
            })
            # Dark Action Pills
            r_act = exec_engine(s, "node.create", {
                "type": "frame",
                "parent": dark_hero_id,
                "name": "Actions",
                "width": 340.0,
                "height": 50.0,
                "props": {"layout": "horizontal", "gap": 16.0, "crossAlign": "center"}
            })
            act_id = r_act.get("result", {}).get("id")
            if act_id:
                exec_engine(s, "node.create", {
                    "type": "frame",
                    "parent": act_id,
                    "name": "Primary Action",
                    "width": 160.0,
                    "height": 48.0,
                    "props": {"fill": "#FB7185", "cornerRadius": 999.0, "layout": "horizontal", "mainAlign": "center", "crossAlign": "center"}
                })
                exec_engine(s, "node.create", {
                    "type": "frame",
                    "parent": act_id,
                    "name": "Secondary Action",
                    "width": 140.0,
                    "height": 48.0,
                    "props": {"fill": "#141416", "stroke": "rgba(255,255,255,0.15)", "cornerRadius": 999.0, "layout": "horizontal", "mainAlign": "center", "crossAlign": "center"}
                })

        # Dark Bento Projects
        r_bento = exec_engine(s, "node.create", {
            "type": "frame",
            "parent": dark_desktop_id,
            "name": "Dark Bento Projects",
            "width": 1280.0,
            "height": 320.0,
            "props": {
                "fill": "none",
                "layout": "horizontal",
                "gap": 24.0
            }
        })
        bento_id = r_bento.get("result", {}).get("id")
        if bento_id:
            for p_title, p_tag, p_desc in [
                ("redmi10-selene-kernel", "ANDROID KERNEL 4.19", "Thermal mitigation, governor tuning and scheduler optimizations."),
                ("pancasila-interactive-showcase", "EDUCATIONAL PLATFORM", "Structured ethical documentation with reactive JSON media pipeline.")
            ]:
                card = exec_engine(s, "node.create", {
                    "type": "frame",
                    "parent": bento_id,
                    "name": f"Card {p_title}",
                    "width": 620.0,
                    "height": 280.0,
                    "props": {
                        "fill": "#141416",
                        "stroke": "rgba(255,255,255,0.08)",
                        "cornerRadius": 16.0,
                        "layout": "vertical",
                        "padding": [28, 28, 28, 28],
                        "gap": 16.0
                    }
                })
                c_id = card.get("result", {}).get("id")
                if c_id:
                    exec_engine(s, "node.create", {
                        "type": "text",
                        "parent": c_id,
                        "text": p_tag,
                        "props": {"fontSize": 10.0, "fontStyle": "Bold", "fill": "#FB7185", "letterSpacing": "1.5%"}
                    })
                    exec_engine(s, "node.create", {
                        "type": "text",
                        "parent": c_id,
                        "text": p_title,
                        "props": {"fontSize": 18.0, "fontStyle": "Bold", "fill": "#FAFAFA"}
                    })
                    exec_engine(s, "node.create", {
                        "type": "text",
                        "parent": c_id,
                        "text": p_desc,
                        "props": {"fontSize": 13.0, "fill": "#A1A1AA", "lineHeight": 22.0}
                    })

    # Save the file back to disk
    print("Saving modified document in FigCraft...")
    exec_engine(s, "file.save", {"overwrite": True})

    # Zoom to fit selection
    exec_engine(s, "view.zoomToFit", {})

    s.close()
    print("Done! All design updates pushed live to the running FigCraft GUI.")

if __name__ == "__main__":
    main()

