readme.md

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


Run slowly for debugging purposes

```
npx playwright test tests/add-auction-items.spec.ts --headed --slow-mo=500
```