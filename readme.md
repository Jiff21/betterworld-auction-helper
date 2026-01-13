# SETUP 

```
npm i
```

Set ENV Varaiables for login to betterworld.

```
export BW_EMAIL=''
export BW_PASSWORD=''
```

## MV Data

In google sheets go to the "2026 Accepted donations" filter out uploaded content and move it to the `data/` folder in this project.

# Run 

Before using the script you may need to manually add 1 new item, then use the "New Section" button to create the categories from the spreadsheet. 

Run slowly for debugging purposes

```
npx playwright test tests/add-auction-items.spec.ts
```


```
CSV_NAME='2026 Auction Donations Outreach Spreadsheet - 2026 Accepted donations.csv' npx playwright test tests/add-auction-items.spec.ts. --ui
```

CSV_NAME='2026 Auction Donations Outreach Spreadsheet - 2026 Accepted donations.csv' DEBUG=pw:api npx playwright test tests/add-auction-items.spec.ts --ui



Make these dynamic 
const auctionUrl= 'https://dashboard.betterworld.org/auctions/56215/items'
const csvName = ''

