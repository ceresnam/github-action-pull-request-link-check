"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = core.getInput('repo-token', { required: true });
            const linkRegex = core.getInput('link-regex');
            const errorMessage = core.getInput('error-message');
            const prNumber = getPrNumber();
            if (!prNumber) {
                console.log('Could not get pull request number from context, exiting');
                return;
            }
            const client = github.getOctokit(token);
            core.debug(`fetching details of pr #${prNumber}`);
            const prBody = yield getPrBody(client, prNumber);
            core.debug(`searching for links`);
            const links = findLinks(prBody, linkRegex);
            for (const link of links) {
                core.debug('  ' + link);
            }
            if (!links || links.length === 0) {
                core.setFailed(errorMessage);
            }
        }
        catch (error) {
            core.error(error);
            core.setFailed(error.message);
        }
    });
}
function getPrNumber() {
    const pullRequest = github.context.payload.pull_request;
    if (!pullRequest) {
        return undefined;
    }
    return pullRequest.number;
}
function getPrBody(client, prNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield client.pulls.get({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            pull_number: prNumber,
        });
        const body = res.data.body || '';
        core.debug('found body: ' + body);
        return body;
    });
}
function findLinks(s, linkRe) {
    const links = s.match(new RegExp(linkRe, 'g')) || [];
    return links;
}
run();