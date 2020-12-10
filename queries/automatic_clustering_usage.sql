-- https://docs.snowflake.com/en/sql-reference/account-usage/automatic_clustering_history.html
select table_name, database_name, schema_name, avg(credits_used) as "CREDITS_USED_AVERAGE", sum(credits_used) as "CREDITS__USED_SUM",
avg(num_bytes_reclustered) as "BYTES_RECLUSTERED_AVERAGE", sum(num_bytes_reclustered) as "BYTES_RECLUSTERED_SUM",
avg(num_rows_reclustered) as "ROWS_RECLUSTERED_AVERAGE", sum(num_rows_reclustered) as "ROWS_RECLUSTERED_SUM" 
from "SNOWFLAKE"."ACCOUNT_USAGE"."AUTOMATIC_CLUSTERING_HISTORY" where start_time >= date_trunc(day, current_date) group by 1, 2, 3;