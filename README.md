![image](https://github.com/user-attachments/assets/c873576d-5d4f-4b81-b525-3c97b93a783c)
# ✍️ Nomen
### A web viewer and parser for US citizen names.
##### A web viewer and parser for every name listed on a social security card between 1880-2024.

[Nomen](https://nomen.sh) is a website that allows people to explore and visualize name data from the US Social Security Adminstration (SSA). You can search through names, compare them, see charts and use actuary data to see how many people with a given name are alive.

The dataset is sourced from the [US Social Security Administration's Baby Names from Social Security Card Applications Dataset](https://catalog.data.gov/dataset/baby-names-from-social-security-card-applications-national-data) and the [US Social Security Adminstration's Actuarial Tables Dataset](https://www.ssa.gov/oact/STATS/table4c6.html).

### Development
Nomen runs on [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/). The database is powered by mySQL and [Drizzle ORM](https://orm.drizzle.team/). The database scripts are made in python.

#### Running locally

##### Creating a database
To run nomen locally, first you need to spin up a database with name data populated inside. You'll first want to spin up a mySQL database. Then you will want to go to the `db` folder and populate the `.env` file with your mySQL creds (example creds can be found on the `.env.example` file).

Once you've done that, run the `main.py` file, this will go through the data and populate the database's names tables.

> [!NOTE]  
>
>Main names table schema:
>
>```
>name VARCHAR(255),
>sex CHAR(1),
>amount INT,
>year INT
>```

Once that's done, it will create the uniquenames and unique_names (confusing names I know lol) databases (this is done automatically, just leave the script running)!

Then go to the actuary folder in there and run the `main.py` folder in there, this will spin up the actuary tables for death/age prediction.

##### Spinning up the site locally
Once you have the database working locally, it's really easy to setup up the website. First install [`bun`](https://bun.com/), and then run `bun i` (this will install the packages onto the repository on your computer). Now just run `bun dev` and then go to `localhost:3000`, there you will see nomen running locally!

#### API

For detailed API documentation, see the [API README](/app/api/README.md).

---

### Important Notes About the Data:

- The database contains approximately 2.1 million records spanning from 1880 to 2024
- Names with 5 or fewer occurrences within a specific sex and year are defaulted to 5 by the SSA to protect privacy
- The sex field is recorded as a single character: "M" (Male) or "F" (Female), (there may be other sex field's due to errors/unknowns when logged by the SSA, these are not shown).
- The year represents the birth year, not the registration year
- Raw data is organized in annual files (yobYYYY.txt) with the format "name,sex,number" in the `sql/names` folder.
- Names are sorted by sex and then by occurrences in descending order
- Ties in occurrences are resolved alphabetically

> [!NOTE]  
> This does **not** include any social security numbers. The only data stored is the name, frequency, sex, year born
> This **is** public data given by the Social Security Administration. No PII is stored
###### (Tabulated based on Social Security records as of May 5th, 2025), any person who registered for social security between 1880 and 2024 are on the dataset.
