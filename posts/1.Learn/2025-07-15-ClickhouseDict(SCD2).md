# ClickhouseDict(SCD2)


https://clickhouse.com/docs/sql-reference/dictionaries

```
--Example: The table contains discounts for each advertiser in the format:
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘


CREATE DICTIONARY discounts_dict (
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Date,
    amount Float64
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(TABLE 'discounts'))
LIFETIME(MIN 1 MAX 1000)
LAYOUT(RANGE_HASHED(range_lookup_strategy 'max'))
RANGE(MIN discount_start_date MAX discount_end_date)

--Query example: This function returns the value for the specified ids and the date range that includes the passed date.
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);

--key word
range_hashed
refreshing-dictionary-data-using-lifetime
```
