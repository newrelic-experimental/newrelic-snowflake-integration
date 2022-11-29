-- https://docs.snowflake.com/en/sql-reference/account-usage/query_history.html
select 
           query_id, 
           query_text,
           (execution_time / 60000) as exec_time,
           warehouse_name,
           user_name,
           execution_status
from 
          snowflake.account_usage.query_history 
where 
           execution_status = 'SUCCESS' 
order by 
           execution_time desc;
