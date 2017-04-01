import * as Bluebird from 'bluebird';
import * as mkdirp from 'mkdirp';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as GitHubApi from 'github';
import * as path from 'path';

Bluebird.promisifyAll(childProcess);
Bluebird.promisifyAll(fs);
const mkdirpAsync: (string) => Promise<void> = Bluebird.promisify(mkdirp);

type BackupOptions = {
  username: string,
  authentication: GitHubApi.Auth,
  output: {
    type: 'directory',
    path: string,
  }
}

async function repoList(options, githubApi): Promise<[Repository]> {
  try {
    console.log('Using repo cache')
    return require(path.join(options.output.path, 'all-repos.json'));
  } catch (err) {}

  let repos = await githubApi.repos.getAll({
    per_page: 100,
  });
  let result = repos.data;
  while (githubApi.hasNextPage(repos)) {
    console.log('Getting next page');
    repos = await githubApi.getNextPage(repos);
    result = result.concat(repos.data);
  }
  return result;
}

async function issueList(repository, githubApi): Promise<[Issue]> {
  let issues = await githubApi.issues.getForRepo({
    per_page: 100,
    owner: repository.owner.login,
    repo: repository.name,
  });
  let result = issues.data;
  while (githubApi.hasNextPage(issues)) {
    console.log('Getting next page');
    issues = await githubApi.getNextPage(issues);
    result = result.concat(issues.data);
  }
  return result;
}

async function commentsList(repository, githubApi): Promise<[Comment]> {
  let comments = await githubApi.issues.getCommentsForRepo({
    per_page: 100,
    owner: repository.owner.login,
    repo: repository.name,
  });
  let result = comments.data;
  while (githubApi.hasNextPage(comments)) {
    console.log('Getting next page');
    comments = await githubApi.getNextPage(comments);
    result = result.concat(comments.data);
  }
  return result;
}


type Comment = {}
type Issue = {}

type Repository = {
  id: number, // 64382195,
  name: string,
  full_name: string,
  owner: {
    login: string, // 'adcpm',
    id: number, // 16245250,
    avatar_url: string, // 'https://avatars0.githubusercontent.com/u/16245250?v=3',
    gravatar_id: string, // '',
    url: string, // 'https://api.github.com/users/adcpm',
    html_url: string, // 'https://github.com/adcpm',
    followers_url: string, // 'https://api.github.com/users/adcpm/followers',
    following_url: string, // 'https://api.github.com/users/adcpm/following{/other_user}',
    gists_url: string, // 'https://api.github.com/users/adcpm/gists{/gist_id}',
    starred_url: string, // 'https://api.github.com/users/adcpm/starred{/owner}{/repo}',
    subscriptions_url: string, // 'https://api.github.com/users/adcpm/subscriptions',
    organizations_url: string, // 'https://api.github.com/users/adcpm/orgs',
    repos_url: string, // 'https://api.github.com/users/adcpm/repos',
    events_url: string, /// 'https://api.github.com/users/adcpm/events{/privacy}',
    received_events_url: string, // 'https://api.github.com/users/adcpm/received_events',
    type: string, // 'User',
    site_admin: boolean // false
  },
  private: boolean, // false,
  html_url: string, // 'https://github.com/adcpm/busy',
  description: string, // 'Decentralized social network based on Steem blockchain',
  fork: boolean, // false,
  url: string, // 'https://api.github.com/repos/adcpm/busy',
  forks_url: string, // 'https://api.github.com/repos/adcpm/busy/forks',
  keys_url: string, // 'https://api.github.com/repos/adcpm/busy/keys{/key_id}',
  collaborators_url: string, // 'https://api.github.com/repos/adcpm/busy/collaborators{/collaborator}',
  teams_url: string, // 'https://api.github.com/repos/adcpm/busy/teams',
  hooks_url: string, // 'https://api.github.com/repos/adcpm/busy/hooks',
  issue_events_url: string, // 'https://api.github.com/repos/adcpm/busy/issues/events{/number}',
  events_url: string, // 'https://api.github.com/repos/adcpm/busy/events',
  assignees_url: string, // 'https://api.github.com/repos/adcpm/busy/assignees{/user}',
  branches_url: string, // 'https://api.github.com/repos/adcpm/busy/branches{/branch}',
  tags_url: string, // 'https://api.github.com/repos/adcpm/busy/tags',
  blobs_url: string, // 'https://api.github.com/repos/adcpm/busy/git/blobs{/sha}',
  git_tags_url: string, // 'https://api.github.com/repos/adcpm/busy/git/tags{/sha}',
  git_refs_url: string, // 'https://api.github.com/repos/adcpm/busy/git/refs{/sha}',
  trees_url: string, // 'https://api.github.com/repos/adcpm/busy/git/trees{/sha}',
  statuses_url: string, // 'https://api.github.com/repos/adcpm/busy/statuses/{sha}',
  languages_url: string, // 'https://api.github.com/repos/adcpm/busy/languages',
  stargazers_url: string, // 'https://api.github.com/repos/adcpm/busy/stargazers',
  contributors_url: string, // 'https://api.github.com/repos/adcpm/busy/contributors',
  subscribers_url: string, // 'https://api.github.com/repos/adcpm/busy/subscribers',
  subscription_url: string, // 'https://api.github.com/repos/adcpm/busy/subscription',
  commits_url: string, // 'https://api.github.com/repos/adcpm/busy/commits{/sha}',
  git_commits_url: string, // 'https://api.github.com/repos/adcpm/busy/git/commits{/sha}',
  comments_url: string, // 'https://api.github.com/repos/adcpm/busy/comments{/number}',
  issue_comment_url: string, // 'https://api.github.com/repos/adcpm/busy/issues/comments{/number}',
  contents_url: string, // 'https://api.github.com/repos/adcpm/busy/contents/{+path}',
  compare_url: string, // 'https://api.github.com/repos/adcpm/busy/compare/{base}...{head}',
  merges_url: string, // 'https://api.github.com/repos/adcpm/busy/merges',
  archive_url: string, // 'https://api.github.com/repos/adcpm/busy/{archive_format}{/ref}',
  downloads_url: string, // 'https://api.github.com/repos/adcpm/busy/downloads',
  issues_url: string, // 'https://api.github.com/repos/adcpm/busy/issues{/number}',
  pulls_url: string, // 'https://api.github.com/repos/adcpm/busy/pulls{/number}',
  milestones_url: string, // 'https://api.github.com/repos/adcpm/busy/milestones{/number}',
  notifications_url: string, // 'https://api.github.com/repos/adcpm/busy/notifications{?since,all,participating}',
  labels_url: string, // 'https://api.github.com/repos/adcpm/busy/labels{/name}',
  releases_url: string, // 'https://api.github.com/repos/adcpm/busy/releases{/id}',
  deployments_url: string, // 'https://api.github.com/repos/adcpm/busy/deployments',
  created_at: string, // '2016-07-28T09:27:04Z',
  updated_at: string, // '2017-03-31T09:56:44Z',
  pushed_at: string, // '2017-04-01T07:32:05Z',
  git_url: string, // 'git://github.com/adcpm/busy.git',
  ssh_url: string, // 'git@github.com:adcpm/busy.git',
  clone_url: string, // 'https://github.com/adcpm/busy.git',
  svn_url: string, // 'https://github.com/adcpm/busy',
  homepage: string, // 'https://busy.org/',
  size: number, // 55615,
  stargazers_count: number, // 29,
  watchers_count: number, // 29,
  language: string, // 'JavaScript',
  has_issues: boolean, // true,
  has_projects: boolean, // true,
  has_downloads: boolean, // true,
  has_wiki: boolean, // true,
  has_pages: boolean, // false,
  forks_count: number, // 8,
  mirror_url: string|null,
  open_issues_count: number, // 36,
  forks: number, // 8,
  open_issues: number, // 36,
  watchers: number, // 29,
  default_branch: string, // 'dev',
  permissions: {
    admin: boolean, // false,
    push: boolean, // true,
    pull: boolean, // true,
  }
}

async function backupRepository(options: BackupOptions, repository: Repository) {
  if (repository.owner.login !== options.username) {
    console.log(`Skipping ${repository.full_name} - Not in the target namespace`);
    return null;
  }

  console.log('Backing-up', repository.full_name);
  const targetPath = path.join(options.output.path, repository.full_name);
  try {
    const stat = await (<any>fs).statAsync(targetPath);
    if (stat.isDirectory) {
      console.log(`Skipping ${repository.full_name} - Repository was cloned`);
      return null;
    }
  } catch (err) {}

  const cmd = `git clone ${repository.ssh_url} ${targetPath}`;
  console.log(cmd);
  return (<any>childProcess).execAsync(cmd);
}

async function backupRepositoryIssues(options: BackupOptions, repository: Repository, githubApi: GitHubApi) {
  if (repository.owner.login !== options.username) {
    console.log(`Skipping ${repository.full_name} - Not in the target namespace`);
    return null;
  }

  console.log('Backing-up', repository.full_name, 'issues');
  const targetPath = path.join(options.output.path, '.issues', repository.full_name + '.json');
  console.log(`(${repository.full_name}) Fetching issues...`);
  const issues = await issueList(repository, githubApi);
  console.log(`(${repository.full_name}) Writting issues...`);
  await mkdirpAsync(path.dirname(targetPath));
  await (<any>fs).writeFileAsync(targetPath, JSON.stringify(issues));
}

async function backupRepositoryComments(options: BackupOptions, repository: Repository, githubApi: GitHubApi) {
  if (repository.owner.login !== options.username) {
    console.log(`Skipping ${repository.full_name} - Not in the target namespace`);
    return null;
  }

  console.log('Backing-up', repository.full_name, 'comments');
  const targetPath = path.join(options.output.path, '.comments', repository.full_name + '.json');
  console.log(`(${repository.full_name}) Fetching comments...`);
  const comments = await commentsList(repository, githubApi);
  console.log(`(${repository.full_name}) Writting comments...`);
  await mkdirpAsync(path.dirname(targetPath));
  await (<any>fs).writeFileAsync(targetPath, JSON.stringify(comments));
}

export default async function runBackup(options: BackupOptions) {
  const githubApi = new GitHubApi({
    Promise: Bluebird,
  });
  await githubApi.authenticate(options.authentication);
  await mkdirpAsync(options.output.path);

  const repos = await repoList(options, githubApi);
  console.log('Wrote all-repos.json');
  await (<any>fs).writeFileAsync(path.join(options.output.path, 'all-repos.json'), JSON.stringify(repos, null, 2));
  console.log(`Backing-up ${repos.length} repositories`);
  await Bluebird.map(repos, async (repository) => {
    await Bluebird.all([
      backupRepository(options, repository),
      backupRepositoryIssues(options, repository, githubApi),
      backupRepositoryComments(options, repository, githubApi),
    ]);
  }, {
    concurrency: 20,
  });
}
