import fs from 'fs';
import { parse } from 'csv-parse/sync';

const csvName = process.env.CSV_NAME || 'auction-items.csv';

export interface AuctionItem {
  title: string;
  location: string;
  descriptor: string;
  category: string;
  estimatedValue: number;
  startingBid: number;
  shortDescription: string;
  longDescription: string;
  donorName: string;
  donorWebsite: string;
  fulfillmentName: string;
  fulfillmentEmail: string;
  imageUrls?: string;
  notes: string;
}

export function readAuctionItems(): AuctionItem[] {
  const filePath = 'data/' + csvName;
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found, you need to add a CSV to the data folder.\npath: ${filePath}`);
  }

  const csv = fs.readFileSync(filePath, 'utf8');

  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true, // Automatically removes whitespace from cell values
  });

  return records
    
    .filter((row: any) => {
      // 1. Filter out empty rows
      const hasTitle = row['Title'] && row['Title'].trim() !== "";
      // 1. Filter out already uploaded Items
      const columnGValue = row['BetterWorld Status'] ? row['BetterWorld Status'].trim() : "";
      const isExcluded = columnGValue === "U" || columnGValue === "Y";
      
      // Only keep the row if both Title and not already added to Better World
      return hasTitle && !isExcluded;
    })
    // 2. Map the valid rows to your interface
    .map((row: any) => ({
      title: row['Title'],
      location: row['Location'],
      estimatedValue: Number(row['Estimated Value']) || 0,
      descriptor: row['Descriptor Added to Title'],
      category: row['Display Section (Category)'],
      startingBid: Number(row['Starting Bid']) || 0,
      shortDescription: row['Short Description (~ 10 words)'],
      notes: row['Special Instructions'],
      longDescription: row['Long Description'],
      donorName: row['Donor Name'],
      donorWebsite: row['Donor Website'],
      fulfillmentName: row['Fulfillment Name'],
      fulfillmentEmail: row['Fulfillment Email'],
      imageUrls: row['Image URLs'],
    }));
}