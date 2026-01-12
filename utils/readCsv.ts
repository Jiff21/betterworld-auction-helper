import fs from 'fs';
import { parse } from 'csv-parse/sync';

const csvName = 'auction-items.csv'

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
}

export function readAuctionItems(): AuctionItem[] {
  const csv = fs.readFileSync(
    'data/' + csvName,
    'utf8'
  );

  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
  });

  return records.map((row: any) => ({
    title: row['Title'],
    location: row['Location'],
    estimatedValue: Number(row['Estimated Value']),
    descriptor: row['Descriptor Added to Title'],
    category: row['Display Section (Category)'],
    startingBid: Number(row['Starting Bid']),
    shortDescription: row['Short Description (~ 10 words)'],
    longDescription: row['Long Description'],
    donorName: row['Donor Name'],
    donorWebsite: row['Donor Website'],
    fulfillmentName: row['Fulfillment Name'],
    fulfillmentEmail: row['Fulfillment Email'],
    imageUrls: row['Image URLs'], // Column V
  }));
}
