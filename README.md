# github-backup
**`github-backup`** is a very simple backup utility for GitHub. It currently
supports cloning all repositories under a namespace as well as their issues and
comments.

This is what seems like the most important data, though adding more data to the
backup should be very easy (milestones, pull-requests, wiki, stars, forks and
contributors).

## Usage

```
Options:
  --token       GitHub API Token                                      [required]
  --username    GitHub User/Organization                              [required]
  --output-dir  Where to output the results                           [required]
```

## Contributing
**`github-backup`** is written in _TypeScript_. You can run a watch server with
`./node_modules/.bin/tsc --watch` and compile assets with
`./node_modules/.bin/tsc`. Commit the compiled assets after building.
