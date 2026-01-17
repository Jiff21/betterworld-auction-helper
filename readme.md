# Better World Auction Item Creator

## Description

To save time manually creating items from the PTA Donations spreadsheet, I automated the task using Playwright.

## Setup

### Install dependencies

Node.js is a prerequisite.

```sh
cd <this folder>
npm i
```
### Set account, spreadsheet name and auction details in an ENV file

Duplicate the example.env file, name it local.env, and fill it out with your auction URL, spreadsheet name, email, and password.

### Create categories in Betterworld (if necessary)

Before using the script, you need to manually add one new item, then use the "New Section" button in Better World to create all the categories from the spreadsheet if you are not using default categories.

### Spreadsheet Data

Export the Google Sheet as a CSV and put it in the data folder inside this project. Use examplesheet.xlsx as a guide. The import relies on columns H-V and column E for special notes.

If you need to import more items from the spreadsheet after the second run, make sure all previously entered items are marked Y in column G of the spreadsheet. Then export the CSV and replace the one in the data folder.

## Run

Use the command below from the project root. Make sure the environment variables in local.env are set correctly:

```sh
npx playwright test tests/add-auction-items.spec.ts
```

### Debugging

You can use --ui or --slowmo=2000. For example:

```sh
npx playwright test tests/add-auction-items.spec.ts --ui
```