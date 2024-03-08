-- https://docs.snowflake.com/en/sql-reference/account-usage/warehouse_metering_history.html
select WAREHOUSE_NAME,
       avg(CREDITS_USED_COMPUTE)        as "CREDITS_USED_COMPUTE_AVERAGE",
       sum(CREDITS_USED_COMPUTE)        as "CREDITS_USED_COMPUTE_SUM",
       avg(CREDITS_USED_CLOUD_SERVICES) as "CREDITS_USED_CLOUD_SERVICES_AVERAGE",
       sum(CREDITS_USED_CLOUD_SERVICES) as "CREDITS_USED_CLOUD_SERVICES_SUM",
       avg(CREDITS_USED)                as "CREDITS_USED_AVERAGE",
       sum(CREDITS_USED)                as "CREDITS_USED_SUM"
from "SNOWFLAKE"."ACCOUNT_USAGE"."WAREHOUSE_METERING_HISTORY"
where start_time >= dateadd('ms', -$interval, current_timestamp())
group by 1;