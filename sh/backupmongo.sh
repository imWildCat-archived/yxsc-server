#!/bin/bash
cd /home/bae/app/public/backups_mongo
rm -rf tYFnGNKnZUJmiEEBMCYX
rm -rf mdb.zip
/home/bae/mongodump -h mongo.duapp.com:8908 -d tYFnGNKnZUJmiEEBMCYX -o /home/bae/app/public/backups_mongo -u ORWQHCD61eZGTTFeFtC5Z0qt -p r9aehxln8daspZ7AclPori1BiYldGxwU
zip -q -r -m -P 5589166q /home/bae/app/public/backups_mongo/mdb.zip ./tYFnGNKnZUJmiEEBMCYX


# /home/bae/mongorestore -h mongo.duapp.com:8908 -d tYFnGNKnZUJmiEEBMCYX  -u ORWQHCD61eZGTTFeFtC5Z0qt -p r9aehxln8daspZ7AclPori1BiYldGxwU  --directoryperdb /tmp/tYFnGNKnZUJmiEEBMCYX