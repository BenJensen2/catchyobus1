import React from 'react';
import GetRoutes from '../components/GetData';
import { Router } from '@reach/router';
import GetStops from '../components/Confirmed';


export default function Main() {


    return (
        <div>
            <div>
                <p>Hola, this is a page</p>
            </div>
            <GetRoutes />
            <Router>
                <GetStops path="/letsgo" />
            </Router>
        </div>
    )
}