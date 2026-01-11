import fs from 'fs';
import { parse } from 'csv-parse/sync';

export interface AuctionItem {
  title: string;
  location: string;
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
    'data/auction-items.csv',
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
    startingBid: Number(row['Starting Bid']),
    shortDescription: row['Short Description'],
    longDescription: row['Long Description'],
    donorName: row['Donor Name'],
    donorWebsite: row['Donor Website'],
    fulfillmentName: row['Fulfillment Name'],
    fulfillmentEmail: row['Fulfillment Email'],
    imageUrls: row['Image URLs'], // Column V
  }));
}
