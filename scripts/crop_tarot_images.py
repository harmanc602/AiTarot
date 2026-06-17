from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageOps


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
SCRIPT_ROOT = Path(__file__).resolve().parents[1]


def detect_bounds(
    image: Image.Image,
    white_threshold: float = 0.88,
    min_white_run: int = 3,
) -> tuple[int, int, int, int]:
    width, height = image.size
    get_pixels = getattr(image, "get_flattened_data", image.getdata)
    pixels = list(get_pixels())

    def line_white_ratio(index: int, axis: str) -> float:
        white_pixels = 0
        if axis == "x":
            for y in range(height):
                if min(pixels[y * width + index]) >= 235:
                    white_pixels += 1
            return white_pixels / height

        for x in range(width):
            if min(pixels[index * width + x]) >= 235:
                white_pixels += 1
        return white_pixels / width

    def scan_white_run(length: int, axis: str, from_start: bool) -> int:
        run = 0
        indices = range(length) if from_start else range(length - 1, -1, -1)
        for index in indices:
            if line_white_ratio(index, axis) >= white_threshold:
                run += 1
            else:
                break
        return run if run >= min_white_run else 0

    left = scan_white_run(width, "x", True)
    right_run = scan_white_run(width, "x", False)
    right = width - right_run

    top = scan_white_run(height, "y", True)
    bottom_run = scan_white_run(height, "y", False)
    bottom = height - bottom_run

    if right <= left or bottom <= top:
        return 0, 0, width, height

    return left, top, right, bottom


def save_image(image: Image.Image, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    suffix = destination.suffix.lower()

    if suffix in {".jpg", ".jpeg"}:
        image.save(destination, quality=95, optimize=True)
    else:
        image.save(destination)


def process_image(source: Path, destination: Path, args: argparse.Namespace) -> tuple[Path, tuple[int, int, int, int], tuple[int, int]]:
    image = Image.open(source)
    image = ImageOps.exif_transpose(image).convert("RGB")
    bounds = detect_bounds(
        image,
        white_threshold=args.white_threshold,
        min_white_run=args.min_white_run,
    )
    cropped = image.crop(bounds)
    save_image(cropped, destination)
    return source, bounds, cropped.size


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Crop tarot card images to the black frame and remove the outer white border.",
    )
    parser.add_argument(
        "--input",
        default=r"assets/img/big",
        help="Source folder containing the tarot images.",
    )
    parser.add_argument(
        "--output",
        default=r"assets/img/clean",
        help="Destination folder for cropped images.",
    )
    parser.add_argument(
        "--in-place",
        action="store_true",
        help="Overwrite the input files instead of writing to an output folder.",
    )
    parser.add_argument(
        "--white-threshold",
        type=float,
        default=0.88,
        help="Minimum fraction of white pixels required for an edge line to count as border.",
    )
    parser.add_argument(
        "--min-white-run",
        type=int,
        default=3,
        help="Minimum consecutive white edge lines required before cropping that side.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    input_dir = Path(args.input)
    if not input_dir.is_absolute():
        input_dir = SCRIPT_ROOT / input_dir

    output_dir = Path(args.output)
    if not output_dir.is_absolute():
        output_dir = SCRIPT_ROOT / output_dir

    if not input_dir.exists():
        raise SystemExit(f"Input folder does not exist: {input_dir}")

    images = sorted(
        path for path in input_dir.iterdir() if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
    )
    if not images:
        raise SystemExit(f"No supported images found in: {input_dir}")

    for source in images:
        destination = source if args.in_place else output_dir / source.name
        source_path, bounds, cropped_size = process_image(source, destination, args)
        print(f"{source_path.name}: crop={bounds} -> {cropped_size}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())