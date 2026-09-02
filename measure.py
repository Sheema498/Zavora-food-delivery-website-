#!/usr/bin/env python3
"""
QuickBite Production Line of Code (LOC) Measurement Script.

Accurately measures production lines of code while strictly excluding:
- node_modules
- tests and test suites (*.test.*, *.spec.*, /tests/, /__tests__/)
- build / dist / out directories
- coverage reports
- package-lock.json and lockfiles
- cache and temporary directories
- automatically generated artifacts (.prisma/client, etc.)
- git files
"""

import os
import sys
from pathlib import Path

# Directories to exclude completely
EXCLUDED_DIRS = {
    'node_modules',
    '.git',
    '.github',
    'dist',
    'build',
    'out',
    'coverage',
    '.nyc_output',
    'test',
    'tests',
    '__tests__',
    '.vite',
    '.cache',
    '.vscode',
    '.idea',
    '.gemini',
    'scratch',
    'temp',
    'logs'
}

# Files to exclude completely
EXCLUDED_FILES = {
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'measure.py',
    'tsconfig.tsbuildinfo',
    'quickbite-verified-deliverable.zip'
}

# Supported production source file extensions
VALID_EXTENSIONS = {
    '.ts': 'TypeScript',
    '.tsx': 'React TypeScript',
    '.js': 'JavaScript',
    '.jsx': 'React JavaScript',
    '.css': 'CSS Stylesheet',
    '.prisma': 'Prisma Schema',
    '.json': 'JSON Config',
    '.html': 'HTML Document',
    '.sql': 'SQL Migration'
}

def is_test_file(filename: str) -> bool:
    lower = filename.lower()
    return (
        lower.endswith('.test.ts') or
        lower.endswith('.test.tsx') or
        lower.endswith('.test.js') or
        lower.endswith('.test.jsx') or
        lower.endswith('.spec.ts') or
        lower.endswith('.spec.tsx') or
        lower.endswith('.spec.js') or
        lower.endswith('.spec.jsx')
    )

def count_file_lines(filepath: Path) -> tuple:
    """Returns (total_lines, code_lines, comment_or_blank_lines)."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
            total = len(lines)
            code = 0
            blank_or_comment = 0
            for line in lines:
                stripped = line.strip()
                if not stripped or stripped.startswith('//') or stripped.startswith('#') or stripped.startswith('/*') or stripped.startswith('*'):
                    blank_or_comment += 1
                else:
                    code += 1
            return total, code, blank_or_comment
    except Exception:
        return 0, 0, 0

def measure_loc(root_dir: Path):
    stats_by_ext = {}
    stats_by_dir = {'server': 0, 'client': 0, 'root': 0}
    file_count = 0
    total_prod_lines = 0
    total_code_lines = 0

    for root, dirs, files in os.walk(root_dir):
        # Modify dirs in-place to skip excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS and not d.startswith('.')]
        
        current_path = Path(root)
        rel_path = current_path.relative_to(root_dir)
        
        # Check if any part of the path is in EXCLUDED_DIRS
        if any(part in EXCLUDED_DIRS for part in rel_path.parts):
            continue

        for file in files:
            if file in EXCLUDED_FILES or is_test_file(file):
                continue
            
            filepath = current_path / file
            ext = filepath.suffix.lower()
            
            if ext in VALID_EXTENSIONS:
                total, code, _ = count_file_lines(filepath)
                if total == 0:
                    continue
                
                file_count += 1
                total_prod_lines += total
                total_code_lines += code
                
                lang = VALID_EXTENSIONS[ext]
                if lang not in stats_by_ext:
                    stats_by_ext[lang] = {'files': 0, 'lines': 0, 'code': 0}
                stats_by_ext[lang]['files'] += 1
                stats_by_ext[lang]['lines'] += total
                stats_by_ext[lang]['code'] += code
                
                # Top-level directory classification
                top_dir = rel_path.parts[0] if rel_path.parts else 'root'
                if top_dir in stats_by_dir:
                    stats_by_dir[top_dir] += total
                else:
                    stats_by_dir[top_dir] = total

    return file_count, total_prod_lines, total_code_lines, stats_by_ext, stats_by_dir

def main():
    root = Path(__file__).resolve().parent
    print("=" * 70)
    print("   QUICKBITE -- PRODUCTION LINE OF CODE (LOC) MEASUREMENT")
    print("=" * 70)
    print(f"Scanning root directory: {root}\n")

    files, total_lines, code_lines, by_ext, by_dir = measure_loc(root)

    print("-" * 70)
    print(f"{'Language / Type':<25} {'Files':<10} {'Total LOC':<15} {'Code Lines':<15}")
    print("-" * 70)
    for lang, data in sorted(by_ext.items(), key=lambda x: x[1]['lines'], reverse=True):
        print(f"{lang:<25} {data['files']:<10} {data['lines']:<15} {data['code']:<15}")
    print("-" * 70)
    
    print("\nBreakdown by Module/Directory:")
    for d, lines in sorted(by_dir.items(), key=lambda x: x[1], reverse=True):
        print(f"  * {d:<20}: {lines:,} lines")

    print("\n" + "=" * 70)
    print(f"TOTAL PRODUCTION FILES: {files:,}")
    print(f"TOTAL PRODUCTION LOC:   {total_lines:,}")
    print(f"TOTAL EXECUTABLE CODE:  {code_lines:,}")
    print("=" * 70)

    if total_lines >= 100000:
        print("\n>>> STATUS: SUCCESS! Target 100,000+ Production LOC achieved. <<<\n")
    else:
        print(f"\n>>> STATUS: In Progress ({total_lines:,} / 100,000 LOC target). <<<\n")

if __name__ == '__main__':
    main()
