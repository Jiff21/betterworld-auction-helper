# SETUP 

```
npm i
```

Set ENV Varaiables for login to betterworld.

```
export BW_EMAIL=''
export BW_PASSWORD=''
```


# Run 

Before using the script you may need to manually add 1 new item, then use the "New Section" button to create the categories from the spreadsheet. 

Run slowly for debugging purposes

```
npx playwright test tests/add-auction-items.spec.ts
```



Make these dynamic 
const auctionUrl= 'https://dashboard.betterworld.org/auctions/56215/items'
const csvName = ''

