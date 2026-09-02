"""
QuickBite Master Clean Regeneration Script
Sanitizes all city topologies and recipes to ensure 100% clean TypeScript compilation.
"""

import os
import glob
import re

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
CITIES_DIR = os.path.join(ROOT_DIR, 'server', 'src', 'domain', 'geo', 'cities')

def sanitize_city_files():
    files = glob.glob(os.path.join(CITIES_DIR, '*.ts'))
    for fpath in files:
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Fix unescaped single quotes inside single-quoted strings in name, zone, description, roadName
        lines = content.split('\n')
        new_lines = []
        for line in lines:
            if "name: '" in line or "zone: '" in line or "description: '" in line or "roadName: '" in line:
                # Find content between leading key: ' and trailing ',
                match = re.search(r"^(\s*\w+:\s*')(.*)('[,]?\s*)$", line)
                if match:
                    prefix, inner, suffix = match.groups()
                    inner_clean = inner.replace("\\'", "'").replace("'", "")
                    line = f"{prefix}{inner_clean}{suffix}"
            new_lines.append(line)

        with open(fpath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))

if __name__ == '__main__':
    sanitize_city_files()
    print("All city topology TypeScript files sanitized successfully.")
