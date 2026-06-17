# AiTarot

## Crop tarot images

The images in `assets/img/big` include an outer white border and a watermark outside the inner black frame. Use the crop script to trim only the outer area and keep the tarot artwork with its black border.

Install the dependency:

```powershell
python -m pip install -r requirements.txt
```

Write cropped copies into `assets/img/clean`:

```powershell
python scripts/crop_tarot_images.py
```

Overwrite the source images instead:

```powershell
python scripts/crop_tarot_images.py --in-place
```

You can tune the detection with `--background-threshold` and `--edge-trim` if a specific card needs a tighter or looser crop.