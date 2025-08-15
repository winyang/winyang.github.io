# Clickhouse 数据写入

### spark写Clickhouse

```
整体思路
1.将Dataframe按照排序键分区+分区内排序 
2.写入前将数据映射为RowBinary或者Arrow格式
3.调用client-v2进行流式写入

chatGPT
1.动态自适应 batchSize：根据写入延迟自动增减每批大小。
2.自适应限流：根据延迟动态调整并发批次数 maxAsyncBatches，结合信号量控制。
3.异步非阻塞 + 内存保护：批量写入、限流、Semaphore 控制并发。
4.通用 Spark SQL 类型映射 + 嵌套结构支持。
5.批量重试 + 异常记录，生产可用。

待测试
case1：clickhouse-jdbc-v2
case2：clickhouse-spark-connect
case3：clickhouse-client-v2
```