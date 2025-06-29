const express = require('express');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');

if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR);
}

app.get('/download', async (req, res) => {
    const url = req.query.url;
    const format = req.query.format || 'mp3';

    if (!url) return res.status(400).send("Missing 'url' query param");

    const id = uuidv4();
    const outputPath = path.join(DOWNLOAD_DIR, `${id}.${format}`);
    const outputRelative = `/files/${id}.${format}`;

    const command = format === 'mp3'
        ? `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${url}"`
        : `yt-dlp -f bestvideo+bestaudio --merge-output-format mp4 -o "${outputPath}" "${url}"`;

    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.error(stderr);
            return res.status(500).send("Download error");
        }
        return res.json({ download_url: outputRelative });
    });
});

app.use('/files', express.static(DOWNLOAD_DIR));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
