select usage_date, avg(average_stage_bytes) from "SNOWFLAKE"."ACCOUNT_USAGE"."STAGE_STORAGE_USAGE_HISTORY"
where usage_date >= date_trunc(day, current_date);