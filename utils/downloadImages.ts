import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

export async function downloadImage(url: string, filename: string): Promise<string> {
  // 1. Transform Google Drive URL
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      url = `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
  }

  const imagesDir = path.resolve('images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  const filePath = path.join(imagesDir, filename);

  // 2. Fetch the data (Node 18+ fetch handles redirects automatically)
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  // 3. Stream the response body to a file
  const fileStream = fs.createWriteStream(filePath);
  
  // Convert the web stream to a Node.js readable stream
  const body = Readable.fromWeb(response.body as any);
  
  await finished(body.pipe(fileStream));

  return filePath;
}