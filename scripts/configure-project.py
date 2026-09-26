#!/usr/bin/env python3
"""
HYPEX App Builder Project Configurator
Injects user configuration, refactors package structure, and generates Android assets.
"""

import sys
import os
import json
import base64
import re
import shutil
from urllib.parse import urlparse

def main():
    if len(sys.argv) < 2:
        print("Usage: configure-project.py <path_to_config.json>")
        sys.exit(1)

    config_path = sys.argv[1]
    with open(config_path, 'r', encoding='utf-8') as f:
        config = json.load(f)

    print("===> [HYPEX Configurator] Starting project configuration...")

    package_name = config.get("packageName", "tech.hypex.app").strip()
    app_name = config.get("appName", "HYPEX Web").strip()
    url = config.get("url", "https://hypex.tech").strip()
    version_name = config.get("versionName", "1.0.0").strip()
    version_code = int(config.get("versionCode", 1))
    orientation = config.get("orientation", "portrait").strip()
    status_bar_color = config.get("statusBarColor", "#06080F").strip()
    splash_bg_color = config.get("splashBgColor", "#06080F").strip()
    oauth_scheme = config.get("oauthScheme", "hypexapp").replace("://", "").replace("/", "").strip()

    # Android SDK & Version Range
    min_sdk = int(config.get("minSdk", 24))
    target_sdk = min(int(config.get("targetSdk", 34)), 34)
    compile_sdk = 34

    # Extract Web Host
    parsed_url = urlparse(url if url.startswith("http") else f"https://{url}")
    web_host = parsed_url.hostname or "hypex.tech"

    # Screen Orientation translation
    orientation_map = {
        "portrait": "portrait",
        "landscape": "landscape",
        "sensor": "unspecified"
    }
    screen_orientation = orientation_map.get(orientation, "portrait")

    print(f"[*] Package Name: {package_name}")
    print(f"[*] App Name: {app_name}")
    print(f"[*] Target URL: {url} (Host: {web_host})")
    print(f"[*] Version: {version_name} ({version_code})")
    print(f"[*] SDK Range: Min SDK {min_sdk} -> Target SDK {target_sdk} (Compile SDK: {compile_sdk})")

    template_dir = os.path.abspath("android-template")
    if not os.path.exists(template_dir):
        print(f"[!] Error: android-template directory not found at {template_dir}")
        sys.exit(1)

    # 1. Update app/build.gradle
    build_gradle_path = os.path.join(template_dir, "app", "build.gradle")
    with open(build_gradle_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace("__PACKAGE_NAME__", package_name)
    content = content.replace("__VERSION_NAME__", version_name)
    content = content.replace("__VERSION_CODE__", str(version_code))
    content = content.replace("__MIN_SDK__", str(min_sdk))
    content = content.replace("__TARGET_SDK__", str(target_sdk))
    content = content.replace("__COMPILE_SDK__", str(compile_sdk))
    with open(build_gradle_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[+] Updated app/build.gradle (minSdk: {min_sdk}, targetSdk: {target_sdk}, compileSdk: {compile_sdk})")

    # 2. Update AndroidManifest.xml
    manifest_path = os.path.join(template_dir, "app", "src", "main", "AndroidManifest.xml")
    with open(manifest_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace("__PACKAGE_NAME__", package_name)
    content = content.replace("__SCREEN_ORIENTATION__", screen_orientation)
    content = content.replace("__OAUTH_SCHEME_NAME__", oauth_scheme)
    content = content.replace("__WEB_HOST__", web_host)
    content = content.replace("__TARGET_SDK__", str(target_sdk))
    with open(manifest_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("[+] Updated AndroidManifest.xml")

    # 3. Update strings.xml
    strings_path = os.path.join(template_dir, "app", "src", "main", "res", "values", "strings.xml")
    with open(strings_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace("__APP_NAME__", app_name)
    with open(strings_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("[+] Updated strings.xml")

    # 4. Update colors.xml
    colors_path = os.path.join(template_dir, "app", "src", "main", "res", "values", "colors.xml")
    with open(colors_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace("__STATUS_BAR_COLOR__", status_bar_color)
    content = content.replace("__SPLASH_BG_COLOR__", splash_bg_color)
    with open(colors_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("[+] Updated colors.xml")

    # 5. Update file_paths.xml
    file_paths_path = os.path.join(template_dir, "app", "src", "main", "res", "xml", "file_paths.xml")
    if os.path.exists(file_paths_path):
        with open(file_paths_path, 'r', encoding='utf-8') as f:
            content = f.read()
        content = content.replace("__PACKAGE_NAME__", package_name)
        with open(file_paths_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("[+] Updated file_paths.xml")

    # 6. Save app_config.json into assets
    assets_dir = os.path.join(template_dir, "app", "src", "main", "assets")
    os.makedirs(assets_dir, exist_ok=True)
    asset_config_path = os.path.join(assets_dir, "app_config.json")
    with open(asset_config_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2)
    print("[+] Injected app_config.json into assets")

    # 7. Refactor Java directory structure to match target package name
    old_java_dir = os.path.join(template_dir, "app", "src", "main", "java", "com", "hypex", "app")
    package_parts = package_name.split(".")
    new_java_dir = os.path.join(template_dir, "app", "src", "main", "java", *package_parts)
    
    if os.path.exists(old_java_dir):
        os.makedirs(new_java_dir, exist_ok=True)
        for fname in os.listdir(old_java_dir):
            src_file = os.path.join(old_java_dir, fname)
            if os.path.isfile(src_file) and fname.endswith(".java"):
                dest_file = os.path.join(new_java_dir, fname)
                with open(src_file, 'r', encoding='utf-8') as jf:
                    jcontent = jf.read()
                # Replace package declaration
                jcontent = re.sub(r'package\s+com\.hypex\.app;', f'package {package_name};', jcontent)
                with open(dest_file, 'w', encoding='utf-8') as jf:
                    jf.write(jcontent)
        
        # Clean old directory if path changed
        if old_java_dir != new_java_dir:
            shutil.rmtree(os.path.join(template_dir, "app", "src", "main", "java", "com", "hypex"))
        print(f"[+] Refactored Java package directory to: {new_java_dir}")

    # 8. Process Icon Upload if base64 provided
    icon_b64 = config.get("iconBase64")
    if icon_b64:
        try:
            if "," in icon_b64:
                icon_b64 = icon_b64.split(",")[1]
            icon_bytes = base64.b64decode(icon_b64)
            
            # Save master icon
            res_dir = os.path.join(template_dir, "app", "src", "main", "res")
            for density in ["mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"]:
                density_dir = os.path.join(res_dir, f"mipmap-{density}")
                os.makedirs(density_dir, exist_ok=True)
                with open(os.path.join(density_dir, "ic_launcher.png"), "wb") as icon_f:
                    icon_f.write(icon_bytes)
                with open(os.path.join(density_dir, "ic_launcher_round.png"), "wb") as icon_f:
                    icon_f.write(icon_bytes)
            print("[+] Injected launcher icons across all mipmap densities")
        except Exception as e:
            print(f"[!] Warning: Failed to decode icon base64: {e}")

    # 9. Process Splash Video or Image if base64 provided
    splash_b64 = config.get("splashMediaBase64")
    splash_type = config.get("splashType", "video")
    if splash_b64:
        try:
            if "," in splash_b64:
                splash_b64 = splash_b64.split(",")[1]
            splash_bytes = base64.b64decode(splash_b64)
            
            if splash_type == "video":
                raw_dir = os.path.join(template_dir, "app", "src", "main", "res", "raw")
                os.makedirs(raw_dir, exist_ok=True)
                with open(os.path.join(raw_dir, "splash.mp4"), "wb") as sf:
                    sf.write(splash_bytes)
                print("[+] Injected MP4 video into res/raw/splash.mp4")
            else:
                drawable_dir = os.path.join(template_dir, "app", "src", "main", "res", "drawable")
                os.makedirs(drawable_dir, exist_ok=True)
                with open(os.path.join(drawable_dir, "splash_image.png"), "wb") as sf:
                    sf.write(splash_bytes)
                print("[+] Injected splash image into res/drawable/splash_image.png")
        except Exception as e:
            print(f"[!] Warning: Failed to decode splash media base64: {e}")

    print("===> [HYPEX Configurator] Configuration completed successfully!")

if __name__ == "__main__":
    main()
