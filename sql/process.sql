truncate table processes;
alter table processes change createTimeGMT createTime datetime;
alter table processes change modifiedTimeGMT modifiedTime datetime;
alter table processes drop column overallprocessflow;
alter table process_review change process_id processInstanceId VARCHAR(100);
alter table processes add column originatorName VARCHAR(20);
alter table processes add column originatorId VARCHAR(50);