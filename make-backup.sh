#!/bin/bash -e
output="./backups/$1-`date +%s`"
mkdir -p $output
echo "Running backup of $1 onto $output... (logs in $output/backup.log)"
./bin/github-backup --token $GITHUB_API_TOKEN --username $1 --output-dir $output > $output/backup.log 2>&1
echo "Creating archive of the backup..."
tar cfz ./backups/$output.tar.gz $output
echo "Removing backup source..."
