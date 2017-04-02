"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var Bluebird = require("bluebird");
var mkdirp = require("mkdirp");
var childProcess = require("child_process");
var fs = require("fs");
var GitHubApi = require("github");
var path = require("path");
Bluebird.promisifyAll(childProcess);
Bluebird.promisifyAll(fs);
var mkdirpAsync = Bluebird.promisify(mkdirp);
function repoList(options, githubApi) {
    return __awaiter(this, void 0, void 0, function () {
        var repos, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    try {
                        console.log('Using repo cache');
                        return [2 /*return*/, require(path.join(options.output.path, 'all-repos.json'))];
                    }
                    catch (err) { }
                    return [4 /*yield*/, githubApi.repos.getAll({
                            per_page: 100
                        })];
                case 1:
                    repos = _a.sent();
                    result = repos.data;
                    _a.label = 2;
                case 2:
                    if (!githubApi.hasNextPage(repos)) return [3 /*break*/, 4];
                    console.log('Getting next page');
                    return [4 /*yield*/, githubApi.getNextPage(repos)];
                case 3:
                    repos = _a.sent();
                    result = result.concat(repos.data);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, result];
            }
        });
    });
}
function issueList(repository, githubApi) {
    return __awaiter(this, void 0, void 0, function () {
        var issues, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, githubApi.issues.getForRepo({
                        per_page: 100,
                        owner: repository.owner.login,
                        repo: repository.name
                    })];
                case 1:
                    issues = _a.sent();
                    result = issues.data;
                    _a.label = 2;
                case 2:
                    if (!githubApi.hasNextPage(issues)) return [3 /*break*/, 4];
                    console.log('Getting next page');
                    return [4 /*yield*/, githubApi.getNextPage(issues)];
                case 3:
                    issues = _a.sent();
                    result = result.concat(issues.data);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, result];
            }
        });
    });
}
function commentsList(repository, githubApi) {
    return __awaiter(this, void 0, void 0, function () {
        var comments, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, githubApi.issues.getCommentsForRepo({
                        per_page: 100,
                        owner: repository.owner.login,
                        repo: repository.name
                    })];
                case 1:
                    comments = _a.sent();
                    result = comments.data;
                    _a.label = 2;
                case 2:
                    if (!githubApi.hasNextPage(comments)) return [3 /*break*/, 4];
                    console.log('Getting next page');
                    return [4 /*yield*/, githubApi.getNextPage(comments)];
                case 3:
                    comments = _a.sent();
                    result = result.concat(comments.data);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, result];
            }
        });
    });
}
function backupRepository(options, repository) {
    return __awaiter(this, void 0, void 0, function () {
        var targetPath, stat, err_1, cmd;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (repository.owner.login !== options.username) {
                        console.log("Skipping " + repository.full_name + " - Not in the target namespace");
                        return [2 /*return*/, null];
                    }
                    console.log('Backing-up', repository.full_name);
                    targetPath = path.join(options.output.path, repository.full_name);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.statAsync(targetPath)];
                case 2:
                    stat = _a.sent();
                    if (stat.isDirectory) {
                        console.log("Skipping " + repository.full_name + " - Repository was cloned");
                        return [2 /*return*/, null];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    return [3 /*break*/, 4];
                case 4:
                    cmd = "git clone " + repository.ssh_url + " " + targetPath;
                    console.log(cmd);
                    return [2 /*return*/, childProcess.execAsync(cmd)];
            }
        });
    });
}
function backupRepositoryIssues(options, repository, githubApi) {
    return __awaiter(this, void 0, void 0, function () {
        var targetPath, issues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (repository.owner.login !== options.username) {
                        console.log("Skipping " + repository.full_name + " - Not in the target namespace");
                        return [2 /*return*/, null];
                    }
                    console.log('Backing-up', repository.full_name, 'issues');
                    targetPath = path.join(options.output.path, '.issues', repository.full_name + '.json');
                    console.log("(" + repository.full_name + ") Fetching issues...");
                    return [4 /*yield*/, issueList(repository, githubApi)];
                case 1:
                    issues = _a.sent();
                    console.log("(" + repository.full_name + ") Writting issues...");
                    return [4 /*yield*/, mkdirpAsync(path.dirname(targetPath))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, fs.writeFileAsync(targetPath, JSON.stringify(issues))];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function backupRepositoryComments(options, repository, githubApi) {
    return __awaiter(this, void 0, void 0, function () {
        var targetPath, comments;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (repository.owner.login !== options.username) {
                        console.log("Skipping " + repository.full_name + " - Not in the target namespace");
                        return [2 /*return*/, null];
                    }
                    console.log('Backing-up', repository.full_name, 'comments');
                    targetPath = path.join(options.output.path, '.comments', repository.full_name + '.json');
                    console.log("(" + repository.full_name + ") Fetching comments...");
                    return [4 /*yield*/, commentsList(repository, githubApi)];
                case 1:
                    comments = _a.sent();
                    console.log("(" + repository.full_name + ") Writting comments...");
                    return [4 /*yield*/, mkdirpAsync(path.dirname(targetPath))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, fs.writeFileAsync(targetPath, JSON.stringify(comments))];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function runBackup(options) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        var githubApi, repos;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    githubApi = new GitHubApi({
                        Promise: Bluebird
                    });
                    return [4 /*yield*/, githubApi.authenticate(options.authentication)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, mkdirpAsync(options.output.path)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, repoList(options, githubApi)];
                case 3:
                    repos = _a.sent();
                    console.log('Wrote all-repos.json');
                    return [4 /*yield*/, fs.writeFileAsync(path.join(options.output.path, 'all-repos.json'), JSON.stringify(repos, null, 2))];
                case 4:
                    _a.sent();
                    console.log("Backing-up " + repos.length + " repositories");
                    return [4 /*yield*/, Bluebird.map(repos, function (repository) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, Bluebird.all([
                                            backupRepository(options, repository),
                                            backupRepositoryIssues(options, repository, githubApi),
                                            backupRepositoryComments(options, repository, githubApi),
                                        ])];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }, {
                            concurrency: 20
                        })];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports["default"] = runBackup;
