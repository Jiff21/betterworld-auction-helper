import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { AuctionItem } from './readCsv';

const csvFileName = "Ortega's Own Count-Me-In Event Sign Up 2026 (Responses) - Form Responses 1.csv";

export function readBiddingItems(): AuctionItem[] {
  const filePath = 'data/' + csvFileName;
  
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
      // 1. Filter for rows with "Bidding" in "How would you like your spots offered?"
      const offeringType = row['How would you like your spots offered?'] || '';
      const hasBidding = offeringType.toLowerCase().includes('bidding');
      
      // 2. Filter out empty rows
      const hasTitle = row['Name of your event/party'] && row['Name of your event/party'].trim() !== "";
      
      // 3. Filter out already uploaded Items
      const status = row['BetterWorld Status'] ? row['BetterWorld Status'].trim() : "";
      const isExcluded = status === "U" || status === "Y";
      
      return hasBidding && hasTitle && !isExcluded;
    })
    .map((row: any) => {
      // Map CSV fields to AuctionItem interface
      const title = row['Name of your event/party'];
      const description = row['Description of event/party'] || '';
      const hostName = row['Name of Event host (Last, First)'] || '';
      const date = row['Proposed date for event (date should be after 3/21/26)'] || '';
      const time = row['Proposed time for event'] || '';
      const location = row['Location of event'] || '';
      const whoCanAttend = row['Who can attend?'] || '';
      const quantity = Number(row['How many spots are available for your event?']);
      const valuePerSpot = row['$ value for each spot'] || '0';
      const notes = row["Anything else you'd like to tell us about your party?"] || '';
      const imageUrls = row['(Optional) Provide image(s) as links, if applicable'] || '';
      const email = row['Email address'] || '';

      // Build long description similar to flat-rate format
      const longDescription = `
${description}


Hosted by: ${hostName}
Date: ${date} @ ${time}
Location: ${location}
For: ${whoCanAttend}
      `.trim();

      // Use value per spot as both estimated value and starting bid
      const numericValue = Number(valuePerSpot) || 0;

      // Create short description from title and key info
      const shortDescription = `${title} - ${whoCanAttend}`;

      return {
        title: title,
        location: location,
        descriptor: '', // this was added to the title, we don't need it here
        category: 'Count-Me-In Auctions',
        estimatedValue: numericValue,
        // startingBid: Math.round(numericValue * 0.33), // 33% of the value
        startingBid: Math.round(numericValue), // set to the value per item just in case people want lower
        shortDescription: shortDescription,
        longDescription: longDescription,
        donorName: hostName,
        donorWebsite: '',
        fulfillmentName: hostName,
        fulfillmentEmail: email,
        imageUrls: imageUrls,
        notes: notes,
        quantity,
      };
    });
}
