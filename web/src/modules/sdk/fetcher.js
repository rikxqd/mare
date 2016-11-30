import {Fetcher} from 'externals/fetcher';

const fetcher = new Fetcher({
    postType: 'json',
    predicates: {
        http: (resp) => resp.status === 200,
        service: () => true,
    },
    urlPrefix: '/api',
});

export default fetcher;
