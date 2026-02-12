-- Add fail_reason column to store Kling's task_status_msg on failure
alter table videos add column if not exists fail_reason text;
