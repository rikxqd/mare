import postal from 'postal';
import DebugPage from 'components/pages/DebugPage';
import ConfigPage from 'components/pages/ConfigPage';
import ErrorPage from 'components/pages/ErrorPage';
import OverviewPage from 'components/pages/OverviewPage';
import SessionIndexPage from 'components/pages/SessionIndexPage';

const pages = [
    {
        key: 'debug',
        component: DebugPage,
        props: {title: '调试页'},
        match: (url) => {
            return url === '/debug';
        },
    },
    {
        key: 'overview',
        props: {title: '运行状态'},
        component: OverviewPage,
        match: (url) => {
            return url === '/overview';
        },
    },
    {
        key: 'config',
        component: ConfigPage,
        props: {title: '查看服务配置'},
        match: (url) => {
            return url === '/config';
        },
    },
    {
        key: 'sessionIndex',
        props: {title: '会话列表'},
        component: SessionIndexPage,
        match: (url) => {
            return url === '/session/';
        },
    },
    {
        key: 'error',
        props: {title: '错误'},
        component: ErrorPage,
        match: (url) => {
            return url === '/error';
        },
    },
    {
        key: 'error404',
        props: {title: '错误'},
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
