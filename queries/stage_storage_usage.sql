-- https://docs.snowflake.com/en/sql-reference/account-usage/stage_storage_usage_history
select usage_date, avg(AVERAGE_STAGE_BYTES)
from "SNOWFLAKE"."ACCOUNT_USAGE"."STAGE_STORAGE_USAGE_HISTORY"
where usage_date >= dateadd('ms', -$interval, current_timestamp())
group by usage_date;