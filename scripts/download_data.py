from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import tempfile
import urllib.request
import zipfile
from pathlib import Path
from urllib.error import URLError

DATASET_URL = "https://data.nasa.gov/docs/legacy/CMAPSSData.zip"
MIRROR_BASE_URL = (
    "https://raw.githubusercontent.com/aun151214/predictive-maintenance-cmapss/main/data/raw"
)
FD001_FILES = ("train_FD001.txt", "test_FD001.txt", "RUL_FD001.txt")
FD001_SHA256 = {
    "train_FD001.txt": "963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8",
    "test_FD001.txt": "3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851",
    "RUL_FD001.txt": "a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca",
}
PROJECT_ROOT = Path(__file__).resolve().parents[1]
RAW_DIRECTORY = PROJECT_ROOT / "data" / "raw"
EXPECTED_FILE = RAW_DIRECTORY / "train_FD001.txt"


def download_dataset(force: bool = False) -> Path:
    if EXPECTED_FILE.exists() and not force:
        _verify_fd001_files()
        _write_source_manifest("Existing verified files")
        return RAW_DIRECTORY

    RAW_DIRECTORY.mkdir(parents=True, exist_ok=True)
    source = "NASA Open Data"
    try:
        with tempfile.TemporaryDirectory(prefix="aeropulse-") as temporary_directory:
            archive_path = Path(temporary_directory) / "CMAPSSData.zip"
            _download_file(DATASET_URL, archive_path, timeout=20)
            _extract_archive(archive_path, RAW_DIRECTORY)
    except (TimeoutError, URLError):
        source = "GitHub mirror of NASA C-MAPSS"
        _download_fd001_mirror()

    if not EXPECTED_FILE.exists():
        raise RuntimeError("NASA archive was downloaded but FD001 was not found")
    _verify_fd001_files()
    _write_source_manifest(source)
    return RAW_DIRECTORY


def _write_source_manifest(source: str) -> None:
    (RAW_DIRECTORY / "SOURCE.json").write_text(
        json.dumps(
            {
                "source_used": source,
                "source_of_record": DATASET_URL,
                "mirror": MIRROR_BASE_URL,
                "verification": "SHA-256 plus row and column counts",
                "sha256": FD001_SHA256,
            },
            indent=2,
        ),
        encoding="utf-8",
    )


def _download_file(url: str, destination: Path, timeout: int) -> None:
    request = urllib.request.Request(url, headers={"User-Agent": "AeroPulse/0.1"})
    with (
        urllib.request.urlopen(request, timeout=timeout) as response,
        destination.open("wb") as output,
    ):
        shutil.copyfileobj(response, output)


def _download_fd001_mirror() -> None:
    for filename in FD001_FILES:
        _download_file(f"{MIRROR_BASE_URL}/{filename}", RAW_DIRECTORY / filename, timeout=60)


def _verify_fd001_files() -> None:
    expected_shapes = {
        "train_FD001.txt": (20_631, 26),
        "test_FD001.txt": (13_096, 26),
        "RUL_FD001.txt": (100, 1),
    }
    for filename, (expected_rows, expected_columns) in expected_shapes.items():
        path = RAW_DIRECTORY / filename
        if not path.exists():
            raise RuntimeError(f"Required FD001 file is missing: {filename}")
        rows = 0
        observed_columns: set[int] = set()
        with path.open(encoding="utf-8") as source_file:
            for line in source_file:
                if line.strip():
                    rows += 1
                    observed_columns.add(len(line.split()))
        if rows != expected_rows or observed_columns != {expected_columns}:
            raise RuntimeError(
                f"Unexpected shape for {filename}: rows={rows}, columns={observed_columns}"
            )
        observed_hash = hashlib.sha256(path.read_bytes()).hexdigest()
        if observed_hash != FD001_SHA256[filename]:
            raise RuntimeError(f"Checksum mismatch for {filename}")


def _extract_archive(archive_path: Path, destination: Path) -> None:
    resolved_destination = destination.resolve()
    with zipfile.ZipFile(archive_path) as archive:
        for member in archive.infolist():
            target = (destination / member.filename).resolve()
            if not target.is_relative_to(resolved_destination):
                raise RuntimeError(f"Unsafe path in dataset archive: {member.filename}")
        archive.extractall(destination)


def main() -> None:
    parser = argparse.ArgumentParser(description="Download NASA C-MAPSS data")
    parser.add_argument("--force", action="store_true", help="Replace existing raw data")
    args = parser.parse_args()

    if args.force and RAW_DIRECTORY.exists():
        shutil.rmtree(RAW_DIRECTORY)
    destination = download_dataset(force=args.force)
    print(f"C-MAPSS data ready at {destination}")


if __name__ == "__main__":
    main()
