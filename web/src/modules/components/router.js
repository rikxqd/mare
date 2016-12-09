import postal from 'postal';
import DebugPage from 'components/pages/DebugPage';
import ErrorPage from 'components/pages/ErrorPage';
import SessionIndexPage from 'components/pages/SessionIndexPage';

const pages = [
    {
        key: 'debug',
        component: DebugPage,
        match: (url) => {
            return url === '/debug';
        },
    },
    {
        key: 'sessionIndex',
        component: SessionIndexPage,
        match: (url) => {
            return url === '/session/';
        },
    },
    {
        key: 'error',
        component: ErrorPage,
        match: (url) => {
            return url === '/error';
        },
    },
    {
        key: 'error404',
        component: ErrorPage,
        match: () => {
            return true;
        },
    },
];

const redirect = (url) => {
    history.replaceState(null, '', url);
    postal.pub('location-changed', url);
};

const href = (url) => (event) => {
    event.preventDefault();
    redirect(url);
};

window.addEventListener('popstate', () => {
    postal.pub('location-changed', location.pathname);
}, false);

export {
    pages,
    redirect,
    href,
};
