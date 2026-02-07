import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { AuctionItem } from './readCsv';

const ownGoodCSVName = process.env.OWN_GOOD_CSV_NAME || "Ortega's Own Goods Sign Up 2026 (Responses) - Form Responses 1.csv";

export function readOwnGoodBiddingItems(): AuctionItem[] {
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
      // 1. Filter for rows with "Bidding" in "How would you like your items offered?"
      const offeringType = row['How would you like your items offered?'] || '';
      const hasBidding = offeringType.toLowerCase().includes('bidding');
      
      // 2. Filter out empty rows
      const hasTitle = row['What are you donating?'] && row['What are you donating?'].trim() !== "";
      
      // 3. Filter out already uploaded Items
      const status = row['BetterWorld Status'] ? row['BetterWorld Status'].trim() : "";
      const isExcluded = status === "U" || status === "Y";
      
      return hasBidding && hasTitle && !isExcluded;
    })
    .map((row: any) => {
      // Map CSV fields to AuctionItem interface
      const title = row['What are you donating?'];
      const description = row['Description of item (Please also mention any potential food allergies if edible)'] || '';
      const donorName = row['Name of Donor (Last, First)'] || '';
      const quantity = row['How many items are available for sale/auction?'] || '';
      const valuePerItem = row['$ value for each item'] || '0';
      const fulfillmentInfo = row['How should winners of your item(s) receive their goods?'] || '';
      const additionalNotes = row["Anything else you'd like to share?"] || '';
      const imageUrls = row['(Optional) Send image link(s), if applicable'] || '';
      const email = row['Email address'] || '';

      // Build long description
      const longDescription = description;

      // Use value per item as estimated value
      const numericValue = Number(valuePerItem.replace(/[^0-9.]/g, '')) || 0;

      // Create short description from title
      const shortDescription = title;

      // Combine fulfillment info and additional notes
      const notes = [fulfillmentInfo, additionalNotes].filter(Boolean).join('\n\n').trim();

      return {
        title: title,
        location: '', // Not in CSV for goods
        descriptor: '', // No descriptor needed
        category: 'Count-Me-In Auctions',
        estimatedValue: numericValue,
        startingBid: Math.round(numericValue * 0.33), // 33% of the value
        shortDescription: shortDescription,
        longDescription: longDescription,
        donorName: donorName,
        donorWebsite: '',
        fulfillmentName: donorName,
        fulfillmentEmail: email,
        imageUrls: imageUrls,
        notes: notes,
      };
    });
}
