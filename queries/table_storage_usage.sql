-- https://docs.snowflake.com/en/sql-reference/account-usage/table_storage_metrics
select table_name,
       table_schema,
       avg(ACTIVE_BYTES)             as "ACTIVE_BYTES_AVERAGE",
       avg(TIME_TRAVEL_BYTES)        as "TIME_TRAVEL_BYTES_AVERAGE",
       avg(FAILSAFE_BYTES)           as "FAILSAFE_BYTES_AVERAGE",
       avg(RETAINED_FOR_CLONE_BYTES) as "RETAINED_FOR_CLONE_BYTES_AVERAGE"
from "SNOWFLAKE"."ACCOUNT_USAGE"."TABLE_STORAGE_METRICS"
-- What to do for a where clause here
group by 1, 2;