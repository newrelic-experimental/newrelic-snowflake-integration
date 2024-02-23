-- https://docs.snowflake.com/en/sql-reference/account-usage/login_history
select EVENT_ID,
       EVENT_TIMESTAMP,
       EVENT_TYPE,
       REPORTED_CLIENT_TYPE,
       REPORTED_CLIENT_VERSION,
       FIRST_AUTHENTICATION_FACTOR,
       SECOND_AUTHENTICATION_FACTOR,
       IS_SUCCESS,
       ERROR_CODE,
       ERROR_MESSAGE
from "SNOWFLAKE"."ACCOUNT_USAGE"."LOGIN_HISTORY"
where is_success = 'NO'
  and event_timestamp > dateadd("ms", -$interval, current_timestamp())