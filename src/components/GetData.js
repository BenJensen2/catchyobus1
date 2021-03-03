import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Form, Input, Label, FormGroup, Col } from  'reactstrap';
import "../components/GetData.css";
import { navigate } from '@reach/router';

var cron = require('node-cron');


export default function GetRoutes () {
    let initialValue = " ";

    const [routes, setRoutes] = useState([]);
    const [routeName, setRouteName] = useState(); 
    const [direction, setDirection] = useState([]);
    const [destination, setDestination] = useState();
    const [stops, setStops] = useState();
    const [stopId, setStopId] = useState();
    const [phoneNumber, setPhoneNumber] = useState(initialValue);

    let prediction;

    let busTask;




    useEffect(() => {
        axios.get('https://api.actransit.org/transit/routes/?token=A6B7D2FAF537BF5AC5B44DEF8C215F7E')
            .then(res => {
                setRoutes(res.data);
            });
    }, []);

    const whatRoute = e => {
        e.preventDefault();
        setRouteName(e.target.value);
    };


    const whatDirection = e => {
        e.preventDefault();
        setDestination(e.target.value);
    };

    const whatStop = e => {
        e.preventDefault();
        setStopId(e.target.value);
    };

    const saveThis = e => {
        e.preventDefault();
        
        axios.get(`https://api.actransit.org/transit/route/${routeName}/destinations/?token=A6B7D2FAF537BF5AC5B44DEF8C215F7E`)
            .then(res => {
                setDirection(res.data);
            });
    };

    const saveThat = e => {
        e.preventDefault();
        
        axios.get(`https://api.actransit.org/transit/actrealtime/stop?rt=${routeName}&dir=${destination}&token=A6B7D2FAF537BF5AC5B44DEF8C215F7E`)
        .then(res => {
            var data = res.data["bustime-response"].stops;
            var loopData = ["<option>Pick Stop</option>"];
            var i = 0;
            while(i < data.length){
                loopData += `<option value="${data[i].stpid}">${data[i].stpnm}</option>`;
                i++;
            }
            setStops(loopData);
        });
    };


    const saveAlso = e => {
        e.preventDefault();
        
        busTask = cron.schedule('*/5 * * * *', () => {
        axios.get(`https://api.actransit.org/transit/actrealtime/prediction?&stpid=${stopId}&rt=${routeName}&top=1&tmres=m&token=A6B7D2FAF537BF5AC5B44DEF8C215F7E`)
            .then(res => {
                prediction = (res.data["bustime-response"].prd[0].prdctdn);
                    catchBus();
                });
            });

            navigate("/letsgo");
    };

    var message;

    function catchBus() {

            if(prediction < 10 && prediction >= 5) {
            
                message = `Your bus is ${prediction} minutes away. Get to the bus stop!`;
    
                axios.get(`/send-text?phoneNumber=${phoneNumber}&message=${message}`)
                    .then(() => console.log(message))
                    .catch(err => console.log(err));
                busTask.stop();
    
            } else if(prediction < 5) {
                message = `Your bus is ${prediction} minutes away. You might have to wait for the next one.`;

                axios.get(`/send-text?phoneNumber=${phoneNumber}&message=${message}`)
                    .then(() => console.log(message))
                    .catch(err => console.log(err));
            } else {
                message = `Chill out! There are ${prediction} minutes until your bus comes.`;
                console.log(message);
            }
        
    }


    return (
        <div>
            <div className="container">
                <Form onSubmit={saveThis}>
                    <Label className="purple">Pick and submit a route</Label>
                    <br />
                    <FormGroup row>
                    <Col sm={10}>
                    <Input type="select" className="form-select" onChange={whatRoute}>
                        <option>Pick route</option>
                        {routes.map((route, index) => {
                            return <option key={index}>
                                {route.Name}</option>
                        })};
                    </Input>
                    </Col>
                    <Button color="primary">Submit</Button>
                    </FormGroup>
                </Form>
                <Form onSubmit={saveThat}>
                    
                    <Label>Pick and submit a direction</Label>
                    <br />
                    <FormGroup row>
                    <Col sm={10}>
                    <Input type="select" onChange={whatDirection}>
                        <option>Pick Direction</option>
                        {direction.map((direction, index) => {
                            return <option key={index} >
                                {direction.Destination}</option>
                        })};
                    </Input>
                    </Col>
                    <Button color="primary">Submit</Button>
                    </FormGroup>
                </Form>
                <Form onSubmit={saveAlso}>
                    <Label>Pick your Stop, then...</Label>
                    <FormGroup row>
                    <Col sm={10}>
                    <Input type="select" dangerouslySetInnerHTML={{__html: stops}} onChange={whatStop}>
                    </Input>
                    </Col>
                    </FormGroup>
                    <Label>What's your number?</Label><br />
                    <FormGroup row>
                    <Col sm={10}>
                    <Input className="form-control" onChange={(e) => setPhoneNumber(e.target.value)} value={phoneNumber}></Input>
                    </Col>
                    <Input type='hidden' value={message}></Input>
                    <Button color="primary">Submit</Button>
                    </FormGroup>
                </Form>
            </div>
        </div>
    )
};