-- https://docs.snowflake.com/en/sql-reference/account-usage/warehouse_load_history.html
select WAREHOUSE_NAME, AVG(AVG_RUNNING) as "RUNNING_AVERAGE", AVG(AVG_QUEUED_LOAD) as "QUEUED_LOAD_AVERAGE", AVG(AVG_QUEUED_PROVISIONING) as "QUEUED_PROVISIONING_AVERAGE",
AVG(AVG_BLOCKED) as "BLOCKED_AVERAGE" from "SNOWFLAKE"."ACCOUNT_USAGE"."WAREHOUSE_LOAD_HISTORY"
where start_time >= date_trunc(day, current_date) group by 1;