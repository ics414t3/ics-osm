import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Table } from 'react-bootstrap';
import LoadingSpinner from './LoadingSpinner';
import AdminPageReservationComponent from './AdminPage/AdminPageReservationComponent';
import { Rooms } from '../../api/room/RoomCollection';
import { Events302 } from '../../api/events/Events302Collection';
import { FacultyProfiles } from '../../api/user/FacultyProfileCollection';

/* Renders a table containing all of the Faculty documents. Use <Admin> to render each row in each tabs. */
const ReservationsTable = () => {
  // useTracker connects Meteor data to React components. https://guide.meteor.com/react.html#using-withTracker
  const { events, ready } = useTracker(() => {
    // Get access to Faculty documents.
    const subscription1 = FacultyProfiles.subscribeFacultyProfileAdmin();
    const subscription2 = Rooms.subscribeRoomAdmin();
    const subscription3 = Events302.subscribeEvents302Admin();
    // Determine if the subscription is ready
    const rdy = subscription1.ready() && subscription2.ready() && subscription3.ready();
    // Get the Faculty documents
    const items1 = FacultyProfiles.find({}).fetch();
    const items2 = Rooms.find({}).fetch();
    const items3 = Events302.find({}).fetch();
    return {
      faculties: items1,
      rooms: items2,
      events: items3,
      ready: rdy,
    };
  }, []);
  return (ready ? (
    <div className="scroll" style={{ width: '80rem', height: '37rem' }}>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>start</th>
            <th>end</th>
            <th>who</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => <AdminPageReservationComponent key={event._id} event={event} Events302={event} />)}
        </tbody>
      </Table>
    </div>
  ) : <LoadingSpinner />);
};

export default ReservationsTable;