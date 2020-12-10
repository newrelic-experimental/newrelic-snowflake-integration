-- https://docs.snowflake.com/en/sql-reference/account-usage/replication_usage_history.html
select database_name, avg(credits_used) as "CREDITS_USED_AVERAGE", sum(credits_used) as "CREDITS_USED_SUM",
avg(bytes_transferred) as "BYTES_TRANSFERRED_AVERAGE", sum(bytes_transferred) as "BYTES_TRANSFERRED_SUM" from "SNOWFLAKE"."ACCOUNT_USAGE"."REPLICATION_USAGE_HISTORY"
where start_time >= date_trunc(day, current_date) group by 1;