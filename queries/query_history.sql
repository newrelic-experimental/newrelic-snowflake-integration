-- https://docs.snowflake.com/en/sql-reference/account-usage/query_history.html
select QUERY_TYPE,
       WAREHOUSE_NAME,
       DATABASE_NAME,
       SCHEMA_NAME,
       avg(EXECUTION_TIME)                  as "EXECUTION_TIME_AVERAGE",
       avg(COMPILATION_TIME)                as "COMPILATION_TIME_AVERAGE",
       avg(BYTES_SCANNED)                   as "BYTES_SCANNED_AVERAGE",
       avg(BYTES_WRITTEN)                   as "BYTES_WRITTEN_AVERAGE",
       avg(BYTES_DELETED)                   as "BYTES_DELETED_AVERAGE",
       avg(BYTES_SPILLED_TO_LOCAL_STORAGE)  as "BYTES_SPILLED_TO_LOCAL_STORAGE_AVERAGE",
       avg(BYTES_SPILLED_TO_REMOTE_STORAGE) as "BYTES_SPILLED_TO_REMOTE_STORAGE_AVERAGE"
from "SNOWFLAKE"."ACCOUNT_USAGE"."QUERY_HISTORY"
where start_time >= dateadd('ms', -$interval, current_timestamp)
group by 1, 2, 3, 4;