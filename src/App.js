import React, { Component } from 'react';
import axios from 'axios';
import { Input, FormGroup, Label, Modal, ModalHeader, ModalBody, ModalFooter, Table, Button } from 'reactstrap';

const organization_id = '' // Insert your Organization ID
const url_api = 'https://www.eventbriteapi.com/v3/'
const authorization = '' // Insert "Bearer YourPrivatetoken"  Find it here: https://www.eventbrite.com/account-settings/apps

const headers = {
  'Content-Type': 'application/json',
  'Authorization': authorization
}


class App extends Component {
  
  state = {
    events:[],

    newEventData:{
      name: {
          html: ""
      },
      summary: '',
      capacity: 100,
      online_event: false,
      start: {
          timezone: '',
          utc: ''
      },
      end: {
          timezone: '',
          utc: ''
      },
      currency: "USD"
    },

    editEventData:{
      id: '',
      name: {
        html: ''
      },
      summary: '',
      capacity: 100,
      online_event: false,
      start: {
        timezone: '',
        utc: ''
      },
      end: {
        timezone: '',
        utc: ''
      },
      currency: ''
    },

    newEventModal: false,
    editEventModal: false
  }

  componentWillMount() {
    this._refreshEvents();
  }

  toggleNewEventModal() {
    this.setState({
      newEventModal: !this.state.newEventModal
    });
  }

  toggleEditEventModal() {
    this.setState({
      editEventModal: !this.state.editEventModal
    });
  }

  addEvent() {
    let {start, end } = this.state.newEventData;

    start.utc = start.utc + ':00Z';
    end.utc = end.utc + ':00Z';

    start.timezone = 'Europe/Rome';
    end.timezone = 'Europe/Rome';

    axios.post(url_api + 'organizations/' + organization_id + '/events/', {
      event: this.state.newEventData
    }, {
      headers: headers
    }).then((response) => {
      let { events } = this.state;

      events.push(response.data);

      this.setState({ 
        events, 
        newEventModal: false, 
        newEventData: {
          name: {
            html: ''
          },
          summary: '',
          capacity: 100,
          online_event: false,
          start: {
            timezone: '',
            utc: ''
          },
          end: {
            timezone: '',
            utc: ''
          },
          currency: ''
        }
      });
    });
  }

  updateEvent() {
    let { name } = this.state.editEventData;

    axios.post(url_api + 'events/' + this.state.editEventData.id + '/', {
      event: {name}

    }, {
      headers: headers
    }).then((response) => {
      this._refreshEvents();

      this.setState({
        editEventModal: false 
      })
    });
  }

  editEvent(eevent) {

    let { editEventData } = this.state;
    editEventData.id = eevent.id;
    editEventData.name.html = eevent.name.html;
    editEventData.summary = eevent.summary;
    editEventData.capacity = eevent.capacity;
    editEventData.online_event = eevent.online_event;
    editEventData.end.timezone = eevent.end.timezone;
    editEventData.end.utc = eevent.end.utc;
    editEventData.start.timezone = eevent.start.timezone;
    editEventData.start.utc = eevent.start.utc;
    editEventData.currency = eevent.currency;
    
    this.setState({
      editEventData, 
      editEventModal: !this.state.editEventModal
    });
  }

  deleteEvent(id) {
    axios.delete(url_api + 'events/' + id + '/',{
      headers: headers
    }).then((response) => {
      this._refreshEvents();
    });
  }

  _refreshEvents() {
    axios.get(url_api + 'organizations/' + organization_id + '/events/', {
      headers: headers   
    }).then((response) => {
      this.setState({
        events: response.data.events
      })
    });
  }

  render() {
    let events = this.state.events.map((event) => {

      let start_x = event.start.utc.split("T")
      let start_date = start_x[0]
      let start_hour = start_x[1].slice(0, -4)

      let end_x = event.end.utc.split("T")
      let end_date = end_x[0]
      let end_hour = end_x[1].slice(0, -4)

      return (
        <tr key={event.id}>
          <td>{event.id}</td>
          <td>{event.name.html}</td>
          <td>{start_date + ' (' + start_hour + ')'}</td>
          <td>{end_date + ' (' + end_hour + ')'}</td>
          <td>{event.online_event === true ? 'Yes' : 'No'}</td>
          <td>
            <Button color="success" size="sm" className="mr-2" onClick={this.editEvent.bind(this, event)}>Edit</Button>
            <Button color="danger" size="sm" onClick={this.deleteEvent.bind(this, event.id)}>Delete</Button>
          </td>
        </tr>
      )
    });
    return (
      <div className="App container">
        <h1>Event App - CRUD</h1>

        <Button className="my-3" color="primary" onClick={this.toggleNewEventModal.bind(this)}>Add Event</Button>

        <Modal className="modal-lg" isOpen={this.state.newEventModal} toggle={this.toggleNewEventModal.bind(this)}>
        <ModalHeader toggle={this.toggleNewEventModal.bind(this)}>Add a new event</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="name">Name</Label>
            <Input id="name" value={this.state.newEventData.name.html || ''} onChange={(e) => {
              let { newEventData } = this.state;
              newEventData.name.html = e.target.value;
              this.setState({ newEventData });
              }} />
            <div className = "row">
              <div className="col">
                <Label for="start_date">Start Date</Label>
                <Input id="start_date" type="datetime-local" value={this.state.newEventData.start.utc || ''} onChange={(e) => {
                  let { newEventData } = this.state;
                  let date_hour = e.target.value;
                  newEventData.start.utc = date_hour;
                  this.setState({ newEventData });
                  }} />
              </div> 

              <div className="col">
                <Label for="end_date">End Date</Label>
                <Input id="end_date" type="datetime-local" value={this.state.newEventData.end.utc || ''} onChange={(e) => {
                  let { newEventData } = this.state;
                  let date_hour = e.target.value;
                  newEventData.end.utc = date_hour;
                  this.setState({ newEventData });
                  }} />
              </div> 
            </div>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.addEvent.bind(this)}>Add Event</Button>{' '}
          <Button color="secondary" onClick={this.toggleNewEventModal.bind(this)}>Cancel</Button>
        </ModalFooter>
      </Modal>

        <Modal isOpen={this.state.editEventModal} toggle={this.toggleEditEventModal.bind(this)}>
        <ModalHeader toggle={this.toggleEditEventModal.bind(this)}>Edit a new event</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="name">Name</Label>
            <Input id="name" value={this.state.editEventData.name.html || ''} onChange={(e) => {
              let { editEventData } = this.state;
              editEventData.name.html = e.target.value;
              this.setState({ editEventData });
            }} />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.updateEvent.bind(this)}>Update Event</Button>{' '}
          <Button color="secondary" onClick={this.toggleEditEventModal.bind(this)}>Cancel</Button>
        </ModalFooter>
      </Modal>

        <Table>
          <thead>
            <tr>
              <th>Event Id</th>
              <th>Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Online Event</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {events}
          </tbody>
        </Table>
      </div>
    );
  }
}

export default App;
