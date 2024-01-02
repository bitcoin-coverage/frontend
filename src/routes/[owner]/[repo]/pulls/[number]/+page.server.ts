import { env } from '$env/dynamic/public'
import { _fetchReport } from '@/lib/shared/report';

export async function _fetchSonarCloudIssues(fetch, number, commit) {
    // https://sonarcloud.io/api/issues/search?metricKeys=sqale_index&projects=aureleoules_bitcoin&types=CODE_SMELL&branch=26415
    return fetch(`https://sonarcloud.io/api/issues/search?metricKeys=sqale_index&resolved=false&projects=aureleoules_bitcoin&types=CODE_SMELL&branch=${number}-${commit}`)
        .then(async res => {
            if (res.status === 200) {
                const data = await res.json();

                // https://sonarcloud.io/api/sources/issue_snippets?issueKey=AYsFGxvQ890w8U3JDlEV
                // fetch for each issue the source code, with Promise.all

                const promises = data.issues.map(issue => {
                    return fetch(`https://sonarcloud.io/api/sources/issue_snippets?issueKey=${issue.key}`)
                        .then(res => res.json())
                        .then(res => {
                            const key = Object.keys(res)[0];
                            return {
                                ...issue,
                                sources: res[key].sources
                            }
                        })
                        .catch(err => {
                            console.error(err);
                        });
                });

                return {
                    ...data,
                    issues: await Promise.all(promises)
                }
            }
            return null;
        })
        .catch((err) => {
            console.error(err);
        });
}

export async function _fetchPr(fetch, number) {
    return await fetch(`${env.PUBLIC_ENDPOINT}/pulls/${number}`)
        .then((res) => res.json())
        .catch((err) => {
            console.error(err);
        });
}

export async function load({ params, fetch }) {
    const [pr, report] = await Promise.all([
        _fetchPr(fetch, params.number),
        _fetchReport(fetch, env.PUBLIC_ENDPOINT, params.number),
    ]);
    const sonarcloud = await _fetchSonarCloudIssues(fetch, params.number, report.commit);

    return {
        pr,
        report,
        sonarcloud,
    }
}