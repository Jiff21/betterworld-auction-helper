import fs from 'fs';
import { parse } from 'csv-parse/sync';

const ownGoodCSVName = process.env.OWN_GOOD_CSV_NAME || "Ortega's Own Goods Sign Up 2026 (Responses) - Form Responses 1.csv";

export interface CampaignItem {
  title: string;
  description: string;
  amount: string;
  quantity: string;
  notes: string;
  imageUrls?: string;
}

export function readOwnGoodFlatRate(): CampaignItem[] {
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
      // 1. Filter for rows with "Sign-up" in "How would you like your items offered?"
      const offeringType = row['How would you like your items offered?'] || '';
      const hasSignUp = offeringType.toLowerCase().includes('sign-up');
      
      // 2. Filter out empty rows
      const hasTitle = row['What are you donating?'] && row['What are you donating?'].trim() !== "";
      
      // 3. Filter out already uploaded Items
      const status = row['BetterWorld Status'] ? row['BetterWorld Status'].trim() : "";
      const method = row['How would you like your items offered?'] ? row['How would you like your items offered?'].toLowerCase() : "";
      const isExcluded = columnSValue === "U" || columnSValue === "Y" || method.includes('bidding');
      
      return hasSignUp && hasTitle && !isExcluded;
    })
    .map((row: any) => {
      const fulfillmentInfo = row['How should winners of your item(s) receive their goods?'] || '';
      const additionalNotes = row["Anything else you'd like to share?"] || '';
      const notes = [fulfillmentInfo, additionalNotes].filter(Boolean).join('\n\n').trim();

      return {
        title: row['What are you donating?'],
        description: row['Description of item (Please also mention any potential food allergies if edible)'] || '',
        amount: row['$ value for each item'] || '0',
        quantity: row['How many items are available for sale/auction?'] || '1',
        notes: notes,
        imageUrls: row['(Optional) Send image link(s), if applicable'] || ''
      };
    });
}
