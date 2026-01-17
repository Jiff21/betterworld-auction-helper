# Better World Auction Item Creator

## Description

To save the time of manually creating items from PTA Donations spreadsheet I automated the task using playwright.

## Setup

### Install dependencies

Node install is a prequesite

```bash
cd <this folder>
npm i
```

Duplicate the file `example.env` file and name it `local.env`, fill out with your auction url, spreadsheet name, email and password. 

Before using the script you need to manually add 1 new item, then use the "New Section" button in Bettwe World to create all the categories from the spreadsheet, if you are not using default categories.

### Spreadsheet Data

Export the Google Sheet as a csv and put it in the data folder inside this project. Use `examplesheet.xlsx` as a guide and the import is reliant on columns H-V and column E for special notes.

## Run 

Use the command below from project root, filling in the ENV variables with correct information to run the script.

```
npx playwright test tests/add-auction-items.spec.ts
```

### Debugging

Use `--ui` or ` --slowmo=2000`. e.g.

```
npx playwright test tests/add-auction-items.spec.ts. --ui
```

