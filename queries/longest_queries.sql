-- https://docs.snowflake.com/en/sql-reference/account-usage/query_history.html
-- TODO this query needs a limit as it can easily generate a result that will break JSON.stringify
select QUERY_ID, QUERY_TEXT, (EXECUTION_TIME / 60000) as EXEC_TIME, WAREHOUSE_NAME, USER_NAME, EXECUTION_STATUS
from "SNOWFLAKE"."ACCOUNT_USAGE"."QUERY_HISTORY"
where EXECUTION_STATUS = 'SUCCESS'
  and start_time > dateadd("ms", -$interval, current_timestamp())
order by EXECUTION_TIME desc;