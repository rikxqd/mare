import React from 'react';
import sdk from 'sdk';

class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            output: '',
        };
    }

    componentDidMount() {
        this.load();
    }

    load = async () => {
        const result = await sdk.getEcho({x: 1, y: 2});
        const output = JSON.stringify(result, null, 4);
        this.setState({output});
    }

    render() {
        return <pre>{this.state.output}</pre>;
    }

}

export default App;
