-- https://docs.snowflake.com/en/sql-reference/account-usage/warehouse_metering_history.html
select 
          warehouse_name, 
          sum(credits_used) as total_credits_used 
from 
         snowflake.account_usage.warehouse_metering_history 
group by 
         1 
order by 
         2 desc;
