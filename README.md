# ✍️ Nomen

> [!NOTE]  
> This does **not** include any social security numbers. The only data stored is the name, frequency, sex, year born
> This **is** public data given by the Social Security Administration. No PII is stored

### A web viewer and parser for every name listed on a social security card between 1880-2023.

_(Tabulated based on Social Security records as of March 15, 2025)_

## About

Nomen is a web application that allows users to explore and analyze name data from the US Social Security Administration. The application provides interactive visualizations and searchable data for names registered on social security cards from 1880 through 2023.

## Dataset Information

This data is sourced from the [US Social Security Administration's Baby Names from Social Security Card Applications - National Dataset](https://catalog.data.gov/dataset/baby-names-from-social-security-card-applications-national-data).

### Important Notes About the Data:

- The database contains approximately 2.1 million records spanning from 1880 to 2023
- Names with 5 or fewer occurrences within a specific sex and year are defaulted to 5 by the SSA to protect privacy
- The sex field is recorded as a single character: "M" (Male) or "F" (Female)
- The year represents the birth year, not the registration year
- Raw data is organized in annual files (yobYYYY.txt) with the format "name,sex,number"
- Names are sorted by sex and then by occurrences in descending order
- Ties in occurrences are resolved alphabetically

## Features

- Name Search Look up historical data for any name and gender combination
- **Trend Visualization**: Interactive charts showing name popularity over time
- **Popular Names**: Browse the most popular names by year or across all time
- **Data Table**: View detailed frequency data for each name by year

## Tech Stack

Nomen is built with modern web technologies:

- **Frontend**: [Next.js](https://nextjs.org/) ([React](https://react.dev) framework)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
- **Database**: MySQL database with [Drizzle ORM](https://orm.drizzle.team/)
- **Animations**: [Motion (formerly Framer Motion)](https://motion.dev/) for smooth UI transitions
- **API**: RESTful API endpoints built with Next.js API routes

## API

For detailed API documentation, see the [API README](/api/README.md).

## Data Schema

Main names table schema:

```
name VARCHAR(255),
sex CHAR(1),
amount INT,
year INT
```

Additional state-specific data:

```
name VARCHAR(255),
sex CHAR(1),
amount INT,
year INT,
state CHAR(2)
```
