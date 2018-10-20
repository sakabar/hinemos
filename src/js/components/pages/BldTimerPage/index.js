import React from 'react';
import { connect, Provider } from 'react-redux';
import { createStore } from 'redux';
import BldTimerTemplate from '../../templates/BldTimerTemplate';
import {
    connectCube,
    bldTimerReducer,
} from '../../../modules/bldTimer';

const mapStateToProps = ({
    cube,
}) => {
    return {
        cube,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        connectCube() {
            dispatch(connectCube());
        },
    };
};

const store = createStore(bldTimerReducer);

const Conn = connect(mapStateToProps, mapDispatchToProps)(BldTimerTemplate);

const BldTimerPage = (props) => (
    <Provider store={store}>
        <Conn />
    </Provider>
);

export default BldTimerPage;
