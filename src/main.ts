import * as core from '@actions/core';
import * as github from '@actions/github';

async function run() {
    try {
        const token = core.getInput('repo-token', {required: true});
        const linkRegex = core.getInput('link-regex');
        const errorMessage = core.getInput('error-message');

        const prNumber = getPrNumber();
        if (!prNumber) {
            console.log('Could not get pull request number from context, exiting');
            return;
        }

        const client = github.getOctokit(token);

        core.debug(`fetching details of pr #${prNumber}`);
        const prBody = await getPrBody(client, prNumber);

        core.debug(`searching for links`);
        const links: string[] = findLinks(prBody, linkRegex);
        for (const link of links) {
            core.debug('  ' + link);
        }

        if (!links || links.length === 0) {
            core.setFailed(errorMessage)
        }
    } catch (error) {
        core.error(error);
        core.setFailed(error.message);
    }
}

function getPrNumber(): number | undefined {
    const pullRequest = github.context.payload.pull_request;
    if (!pullRequest) {
        return undefined;
    }

    return pullRequest.number;
}

async function getPrBody(client, prNumber: number): Promise<string> {
    const res = await client.pulls.get({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        pull_number: prNumber,
    });

    const body: string = res.data.body || '';
    core.debug('found body: ' + body);
    return body;
}

function findLinks(s: string, linkRe: string): string[] {
    const links = s.match(new RegExp(linkRe, 'g')) || [];
    return links
}

run();
