"""
QuickBite Final Verified Deliverable Packager
Packages the complete, verified codebase (excluding node_modules and dist caches)
into a clean, standalone deliverable archive.
"""

import os
import zipfile

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
ARCHIVE_PATH = os.path.join(ROOT_DIR, 'quickbite-verified-deliverable.zip')

EXCLUDE_DIRS = {'node_modules', '.git', 'dist', '.system_generated', '__pycache__'}

def create_archive():
    print(f"Creating deliverable archive: {ARCHIVE_PATH}")
    file_count = 0
    with zipfile.ZipFile(ARCHIVE_PATH, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(ROOT_DIR):
            # Prune excluded directories
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith('.')]

            for file in files:
                if file.endswith('.zip') or file.endswith('.tar.gz') or file.endswith('.log'):
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, ROOT_DIR)
                zipf.write(full_path, rel_path)
                file_count += 1

    archive_size_mb = os.path.getsize(ARCHIVE_PATH) / (1024 * 1024)
    print(f"Archive successfully created: {file_count} files ({archive_size_mb:.2f} MB).")

if __name__ == '__main__':
    create_archive()
