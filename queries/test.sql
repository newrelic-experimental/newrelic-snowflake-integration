-- use role accountadmin; use schema snowflake.account_usage; 
-- select usage_date, average_stage_bytes from stage_storage_usage_history where usage_date >= date_trunc(day, current_date);
select * from "SNOWFLAKE"."ACCOUNT_USAGE"."LOGIN_HISTORY" WHERE event_timestamp > dateadd(minute, -121, getdate()) AND event_timestamp < dateadd(minute, -120, getdate());
