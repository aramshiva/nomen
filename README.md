![image](https://github.com/user-attachments/assets/c873576d-5d4f-4b81-b525-3c97b93a783c)
# ✍️ Nomen
### A web viewer and parser for US citizen names.
##### A web viewer and parser for every name listed on a social security card between 1880-2024.

[Nomen](https://nomen.sh) is a website that allows people to explore and visualize name data from the US Social Security Adminstration (SSA). You can search through names, compare them, see charts and use actuary data to see how many people with a given name are alive.

The dataset is sourced from the [US Social Security Administration's Baby Names from Social Security Card Applications Dataset](https://catalog.data.gov/dataset/baby-names-from-social-security-card-applications-national-data) and the [US Social Security Adminstration's Actuarial Tables Dataset](https://www.ssa.gov/oact/STATS/table4c6.html)

---

### Important Notes About the Data:

- The database contains approximately 2.1 million records spanning from 1880 to 2024
- Names with 5 or fewer occurrences within a specific sex and year are defaulted to 5 by the SSA to protect privacy
- The sex field is recorded as a single character: "M" (Male) or "F" (Female)
- The year represents the birth year, not the registration year
- Raw data is organized in annual files (yobYYYY.txt) with the format "name,sex,number"
- Names are sorted by sex and then by occurrences in descending order
- Ties in occurrences are resolved alphabetically

## API

For detailed API documentation, see the [API README](/app/api/README.md).

## Producing Locally
Nomen is made with [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), mySQL, [Drizzle ORM](https://orm.drizzle.team/) and [Motion (formerly Framer Motion)](https://motion.dev/)

For detailed API documentation, see the [API README](/app/api/README.md).

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

> [!NOTE]  
> This does **not** include any social security numbers. The only data stored is the name, frequency, sex, year born
> This **is** public data given by the Social Security Administration. No PII is stored
###### (Tabulated based on Social Security records as of March 23, 2025), any person who registered for social security between 1880 and 2024 are on the dataset.
