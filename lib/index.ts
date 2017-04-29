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
  id: number,
  name: string,
  full_name: string,
  owner: {
    login: string,
    id: number,
    avatar_url: string,
    gravatar_id: string,
    url: string,
    html_url: string,
    followers_url: string,
    following_url: string,
    gists_url: string,
    starred_url: string,
    subscriptions_url: string,
    organizations_url: string,
    repos_url: string,
    events_url: string,
    received_events_url: string,
    type: string,
    site_admin: boolean
  },
  private: boolean,
  html_url: string,
  description: string,
  fork: boolean,
  url: string,
  forks_url: string,
  keys_url: string,
  collaborators_url: string,
  teams_url: string,
  hooks_url: string,
  issue_events_url: string,
  events_url: string,
  assignees_url: string,
  branches_url: string,
  tags_url: string,
  blobs_url: string,
  git_tags_url: string,
  git_refs_url: string,
  trees_url: string,
  statuses_url: string,
  languages_url: string,
  stargazers_url: string,
  contributors_url: string,
  subscribers_url: string,
  subscription_url: string,
  commits_url: string,
  git_commits_url: string,
  comments_url: string,
  issue_comment_url: string,
  contents_url: string,
  compare_url: string,
  merges_url: string,
  archive_url: string,
  downloads_url: string,
  issues_url: string,
  pulls_url: string,
  milestones_url: string,
  notifications_url: string,
  labels_url: string,
  releases_url: string,
  deployments_url: string,
  created_at: string,
  updated_at: string,
  pushed_at: string,
  git_url: string,
  ssh_url: string,
  clone_url: string,
  svn_url: string,
  homepage: string,
  size: number,
  stargazers_count: number,
  watchers_count: number,
  language: string,
  has_issues: boolean,
  has_projects: boolean,
  has_downloads: boolean,
  has_wiki: boolean,
  has_pages: boolean,
  forks_count: number,
  mirror_url: string|null,
  open_issues_count: number,
  forks: number,
  open_issues: number,
  watchers: number,
  default_branch: string,
  permissions: {
    admin: boolean,
    push: boolean,
    pull: boolean,
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
