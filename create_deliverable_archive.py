"""
Zavora Final Verified Deliverable Packager
Packages the complete, verified codebase INCLUDING .git directory
so git history, PR merges, and commits are preserved in the deliverable.
"""

import os
import shutil
import zipfile

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
ARCHIVE_PATH_PRIMARY = os.path.join(ROOT_DIR, 'Zavora-food-delivery-website.zip')
ARCHIVE_PATH_LEGACY = os.path.join(ROOT_DIR, 'quickbite-verified-deliverable.zip')
DESKTOP_DIR = os.path.abspath(os.path.join(ROOT_DIR, '..'))
DESKTOP_ARCHIVE_PATH = os.path.join(DESKTOP_DIR, 'Zavora-food-delivery-website.zip')

EXCLUDE_DIRS = {
    'node_modules',
    'dist',
    'build',
    'coverage',
    '.nyc_output',
    '.system_generated',
    '__pycache__',
    '.vite',
    '.cache',
    'scratch'
}

EXCLUDE_FILES = {
    'quickbite-verified-deliverable.zip',
    'Zavora-food-delivery-website.zip',
    'zavora-food-delivery-website.zip',
    '.DS_Store',
    'Thumbs.db'
}

def create_archive():
    print(f"Creating deliverable archive (including .git): {ARCHIVE_PATH_PRIMARY}")
    file_count = 0
    with zipfile.ZipFile(ARCHIVE_PATH_PRIMARY, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(ROOT_DIR):
            # Exclude unwanted directories but keep .git
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and (d == '.git' or not d.startswith('.'))]

            for file in files:
                if file in EXCLUDE_FILES or file.endswith('.zip') or file.endswith('.tar.gz') or file.endswith('.log'):
                    continue
                # Do not package any sensitive .env files
                if '.env' in file:
                    continue

                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, ROOT_DIR)
                zipf.write(full_path, rel_path)
                file_count += 1

    archive_size_mb = os.path.getsize(ARCHIVE_PATH_PRIMARY) / (1024 * 1024)
    print(f"Archive successfully created: {file_count} files ({archive_size_mb:.2f} MB).")

    # Replicate to Desktop and legacy fallback path
    try:
        shutil.copyfile(ARCHIVE_PATH_PRIMARY, DESKTOP_ARCHIVE_PATH)
        print(f"Copied to Desktop: {DESKTOP_ARCHIVE_PATH}")
    except Exception as e:
        print(f"Notice: Could not copy to desktop: {e}")

    try:
        shutil.copyfile(ARCHIVE_PATH_PRIMARY, ARCHIVE_PATH_LEGACY)
        print(f"Copied to fallback: {ARCHIVE_PATH_LEGACY}")
    except Exception as e:
        print(f"Notice: Could not copy to fallback: {e}")

if __name__ == '__main__':
    create_archive()
