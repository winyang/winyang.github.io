# Clickhouse(更新和删除)

https://clickhouse.com/blog/updates-in-clickhouse-2-sql-style-updates?utm_source=newsletter&utm_medium=email&utm_campaign=alexey-monthly&ref=alexey-monthly


#### mutation
```
1.update：列级重写，只重写更新的列，未更新的列使用硬链接，顺序执行，默认异步执行

2.轻量级删除：自动添加_row_exists，转为更新操作_row_exists=0，只更新_row_exists对应列，在merge时清理对应记录

3.立即可见的更新：clickhouse将更新和删除语句存储在内存中，读取时将读取更新之前的数据并应用相关更新操作，后台进行依旧进行更新
```

#### patch parts
```
they patch source parts during merges, applying only the changed data

Fast inserts: ClickHouse handles inserts at high throughput (e.g., in one production setup, over ClickHouse ingests over 1 billion rows per second). We use this to model updates and deletes as lightweight inserts.

Background merges: MergeTree is already scanning and rewriting data. Applying updates or deleting rows during this process adds near-zero overhead.


patch part 只含有以下部分
1.改变的列值（Only the updated values are written + Unchanged columns are skipped entirely）
2.定位原数据中行对应位置的元数据
```

#### Clickhouse(PartialUpdate)

https://mp.weixin.qq.com/s/so5lpHGCbi3GB8qfNSUPrQ 

```
CoalescingMergeTree
```

#### ClickHouse fast
```
Inserts are fast. Merges are continuous. Parts are immutable and sorted.

And because inserts are so fast, we turned updates into inserts.
ClickHouse inserts compact patch parts behind the scenes and applies them efficiently during merges.

Merges are already happening, so we made them do more. Without really doing more.
Since the engine is already merging data parts in the background, it now applies updates with minimal overhead.

Patch parts slide in instantly with minimal impact on query performance.
Updates show up right away, with not-yet-merged patches applied in a way that preserves parallelism.
```

