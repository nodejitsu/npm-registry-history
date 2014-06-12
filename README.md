# npm-registry-history

A simple little process that listens on a changes feed and compiles an index of
all the documents it sees by its sequence ID. This allows us to detect any
non-deterministic behavior in any of the change events based on the documents it
gives us. Its fairly difficult to check this after the fact in couchdb as it
fixes itself.

```sh
$ npm i -g npm-registry-history
```

```sh
$ npm-registry-history --db path/to/seq.db --seq path/to/registry.seq
```
