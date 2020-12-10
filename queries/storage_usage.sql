-- https://docs.snowflake.com/en/sql-reference/account-usage/storage_usage.html
SELECT STORAGE_BYTES, STAGE_BYTES, FAILSAFE_BYTES from "SNOWFLAKE"."ACCOUNT_USAGE"."STORAGE_USAGE"
ORDER BY USAGE_DATE DESC LIMIT 1;