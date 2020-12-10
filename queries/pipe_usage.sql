-- https://docs.snowflake.com/en/sql-reference/account-usage/pipe_usage_history.html
select pipe_name, avg(credits_used) as "CREDITS_USED_AVERAGE", sum(credits_used) as "CREDITS_USED_SUM", avg(bytes_inserted) as "BYTES_INSERTED_SUM", sum(bytes_inserted) as "BYTES_INSERTED_SUM",
avg(files_inserted) as "FILES_INSERTED_AVERAGE", sum(files_inserted) as "FILES_INSERTED_SUM" from "SNOWFLAKE"."ACCOUNT_USAGE"."PIPE_USAGE_HISTORY"
where start_time >= date_trunc(day, current_date) group by 1;