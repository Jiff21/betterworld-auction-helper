import fs from 'fs';
import { parse } from 'csv-parse/sync';

const ownGoodCSVName = process.env.OWN_GOOD_CSV_NAME || 'campaign-items.csv';

export interface CampaignItem {
  title: string;
  description: string;
  amount: string;
  quantity: string;
  notes: string;
  imageUrls?: string;
}

export function readCampaignItems(): CampaignItem[] {
  const filePath = 'data/' + ownGoodCSVName;
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found, you need to add a CSV to the data folder.\npath: ${filePath}`);
  }

  const csv = fs.readFileSync(filePath, 'utf8');

  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  

  return records
    .filter((row: any) => {
      // 1. Filter out empty rows
      const hasTitle = row['What are you donating?'] && row['What are you donating?'].trim() !== "";
      // 1. Filter out already uploaded Items
      const columnSValue = row['BetterWorld Status'] ? row['BetterWorld Status'].trim() : "";
      const isExcluded = columnSValue === "U" || columnSValue === "Y";
      
      // Only keep the row if both Title and not already added to Better World
      return hasTitle && !isExcluded;
    })

    // 2. Map the unentered rows
    .map((row: any) => ({
      title: row['What are you donating?'],
      description: row['Description of item (Please also mention any potential food allergies if edible)'],
      amount: Number(row['$ value for each item']) || 0,
      quantity: Number(row['How many items are available for sale/auction?']),
      descriptor: Number(row['How many items are available for sale/auction?']),
      notes: row['How should winners of your item(s) receive their goods?'],
      imageUrls: row['(Optional) Send image link(s), if applicable'],
    }));
}