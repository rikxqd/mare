import postal from 'postal';
import React from 'react';
import {pages, redirect} from 'components/router';
import DefaultLayout from 'components/layouts/DefaultLayout';

postal.sub('document-title', (title) => {
    document.title = `LDB - ${title}`;
});

export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            page: null,
        };
    }

    componentDidMount() {
        this.unsub = postal.sub('location-changed', this.onLocationChange);
        this.load();
    }

    componentWillUnmount() {
        this.unsub();
    }

    onLocationChange = (url) => {
        this.setPage(url);
    }

    setPage = async (url) => {
        if (url === '/') {
            redirect('/overview');
            return;
        }

        const page = pages.find((p) => p.match(url));
        this.setState({page});
    }

    load() {
        this.setPage(location.pathname);
    }

    render() {
        const page = this.state.page;
        if (page === null) {
            return null;
        }

        const layoutProps = page.props || {};
        return (
            <DefaultLayout key={page.key} layoutProps={layoutProps}>
                <page.component />
            </DefaultLayout>
        );
    }

}
