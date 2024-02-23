-- https://docs.snowflake.com/en/sql-reference/account-usage/database_storage_usage_history.html
SELECT DATABASE_NAME, AVERAGE_DATABASE_BYTES, AVERAGE_FAILSAFE_BYTES
from "SNOWFLAKE"."ACCOUNT_USAGE"."DATABASE_STORAGE_USAGE_HISTORY"
where USAGE_DATE >= DATEADD('ms', -$interval, current_timestamp())
ORDER BY USAGE_DATE DESC
LIMIT 1;