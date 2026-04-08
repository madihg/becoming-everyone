# Vercel Blob Video Upload Instructions

## Videos to Upload

The following video files need to be uploaded to Vercel Blob:

1. `public/folders/1P1-service/7.mp4` (34MB)
2. `public/folders/3R1-breaking/Video Generator Freepik.mp4` (11MB)
3. `public/folders/7P3-lift/Persona Workout.mov` (230MB) ⚠️ LARGE
4. `public/folders/7P3-lift/Pikaso Workout Artist Apr 2026.mp4` (51MB)
5. `public/folders/11R2-arms/Pikaso Report Army Apr 2026.mp4` (29MB)
6. `public/folders/14R3-critic/0408.mov` (27MB)
7. `public/folders/14R3-critic/Report Critic.mov` (102MB) ⚠️ LARGE
8. `public/folders/16P6-arson/Pikaso Arson Artist Apr 8 2026.mp4` (30MB)
9. `public/folders/4W1-children/Pikaso Witness Children Apr 2026.mp4` (99MB) ⚠️ LARGE

**Total: ~695MB**

## Option 1: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/halims-projects/becoming-everyone/stores
2. Create or select the blob store "performance-videos"
3. Click "Upload" and drag/drop each video file
4. Copy each blob URL after upload
5. Update `config/folders.json` with the blob URLs

## Option 2: Via CLI (After Getting Token)

1. Get blob token from dashboard: Settings → Storage → performance-videos → "Create Token"
2. Add to environment: `export BLOB_READ_WRITE_TOKEN=<token>`
3. Upload via CLI:
   ```bash
   vercel blob put public/folders/1P1-service/7.mp4 --rw-token $BLOB_READ_WRITE_TOKEN
   ```

## Next Steps After Upload

Once videos are uploaded to Blob, update the paths in `config/folders.json`:

```json
{
  "id": "1p1-vid",
  "name": "7.mp4",
  "type": "video",
  "path": "https://[blob-url-from-vercel]"
}
```

Then commit and push the updated `config/folders.json`.
