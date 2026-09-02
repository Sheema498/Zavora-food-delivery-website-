"""
QuickBite Final Verified Deliverable Packager
Packages the complete, verified codebase INCLUDING .git directory
so git history, PR merges, and commits are preserved in the deliverable.
"""

import os
import zipfile

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
ARCHIVE_PATH = os.path.join(ROOT_DIR, 'quickbite-verified-deliverable.zip')

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
    '.DS_Store',
    'Thumbs.db'
}

def create_archive():
    print(f"Creating deliverable archive (including .git): {ARCHIVE_PATH}")
    file_count = 0
    with zipfile.ZipFile(ARCHIVE_PATH, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(ROOT_DIR):
            # Exclude unwanted directories but keep .git
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and (d == '.git' or not d.startswith('.'))]

            for file in files:
                if file in EXCLUDE_FILES or file.endswith('.zip') or file.endswith('.tar.gz') or file.endswith('.log'):
                    continue
                # Do not package any sensitive .env files
                if file == '.env' or file.startswith('.env.'):
                    continue

                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, ROOT_DIR)
                zipf.write(full_path, rel_path)
                file_count += 1

    archive_size_mb = os.path.getsize(ARCHIVE_PATH) / (1024 * 1024)
    print(f"Archive successfully created: {file_count} files ({archive_size_mb:.2f} MB).")

if __name__ == '__main__':
    create_archive()
