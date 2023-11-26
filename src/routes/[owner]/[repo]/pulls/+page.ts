import { env } from '$env/dynamic/public'

export async function _fetchPulls(title: string, page: number) {
    return fetch(`${env.PUBLIC_ENDPOINT}/pr?page=${page}&title=${title}`)
        .then(res => {
            console.log(res);
            if (res.status === 200) {
                console.log(res);
                return res.json();
            }
            return null;
        })
        .catch((err) => {
            console.error(err);
        });
}

export async function load({ params }) {
    return {
        pulls: await _fetchPulls("", 1)
    };
}