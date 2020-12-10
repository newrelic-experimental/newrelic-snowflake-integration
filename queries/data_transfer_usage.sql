-- https://docs.snowflake.com/en/sql-reference/account-usage/data_transfer_history.html
select source_cloud, source_region, target_cloud, target_region, transfer_type,
avg(bytes_transferred) as "BYTES_TRANSFERRED_AVERAGE", sum(bytes_transferred) as "BYTES_TRANSFERRED_SUM" from "SNOWFLAKE"."ACCOUNT_USAGE"."DATA_TRANSFER_HISTORY"
where start_time >= date_trunc(day, current_date) group by 1, 2, 3, 4, 5;