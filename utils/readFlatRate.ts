import fs from 'fs';
import { parse } from 'csv-parse/sync';

const flatRateItemsCSVName = process.env.COUNT_ME_IN_CSV_NAME || 'flat-rate-items.csv';

export interface CampaignItem {
  title: string;
  description: string;
  amount: string;
  quantity: string;
  notes: string;
  imageUrls?: string;
}

export function readFlatRate(): CampaignItem[] {
  const filePath = 'data/' + flatRateItemsCSVName;
  
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
      // 1. Check Flat rate type 
      const offeringType = row['How would you like your items offered?'] || '';
      const hasSignUp = offeringType.toLowerCase().includes('sign-up');

      // 2. Check not empty row
      const titleValue = row['Name of your event/party'];
      const hasTitle = titleValue && titleValue.trim() !== "";
      
      // 3. Check if already added
      const status = row['BetterWorld Status'] ? row['BetterWorld Status'].trim() : "";
      const isExcluded = status === "U" || status === "Y";
      
      return hasSignUp && hasTitle && !isExcluded;
    })
    .map((row: any) => ({
      // Access the actual row data using row['Column Name']
      title: row['Name of your event/party'],
      description: `
${row['Description of event/party'] || ''}


Hosted by: ${row['Name of Event host (Last, First)'] || ''}
Date: ${row['Proposed date for event (date should be after 3/21/26)'] || ''} @ ${row['Proposed time for event'] || ''}
Location: ${row['Location of event'] || ''}
For: ${row['Who can attend?'] || ''}
      `.trim(),
      amount: row['$ value for each spot'],
      quantity: row['How many spots are available for your event?'],
      notes: row["Anything else you'd like to tell us about your party?"],
      imageUrls: row['(Optional) Provide image(s) as links, if applicable']
    }));
}