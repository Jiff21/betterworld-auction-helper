import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

export async function downloadImage(
  url: string,
  filename: string
): Promise<string> {
  const imagesDir = path.resolve('images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  const filePath = path.join(imagesDir, filename);
  const protocol = url.startsWith('https') ? https : http;

  return new Promise((resolve, reject) => {
    const request = protocol.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}`));
        return;
      }

      const file = fs.createWriteStream(filePath);
      response.pipe(file);

      file.on('finish', () => {
        file.close(() => resolve(filePath));
      });
    });

    request.on('error', err => {
      fs.unlink(filePath, () => reject(err));
    });
  });
}
