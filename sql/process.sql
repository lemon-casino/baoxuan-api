truncate table processes;
alter table processes change createTimeGMT createTime datetime;
alter table processes change modifiedTimeGMT modifiedTime datetime;
alter table processes drop column overallprocessflow;