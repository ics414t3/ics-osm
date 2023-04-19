import React, { useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { useParams } from 'react-router';
import { Meteor } from 'meteor/meteor';
import { Link } from 'react-router-dom';
import { Col, Row, Container, ListGroup, Image, Table } from 'react-bootstrap';
import { PAGE_IDS } from '../utilities/PageIDs';
import { Rooms } from '../../api/room/RoomCollection';
import { RoomNotes } from '../../api/room/RoomNotes';
import { RoomJacks } from '../../api/room/RoomJacks';
import { RoomEquipments } from '../../api/room/RoomEquipments';
import { FacultyProfiles } from '../../api/user/FacultyProfileCollection';
import { StaffProfiles } from '../../api/user/StaffProfileCollection';
import { OccupantRoom } from '../../api/user/OccupantRoomCollection';
import RoomNote from '../components/Roomthings/RoomNote';
import AddNote from '../components/Addpages/AddNote';
import RoomJack from '../components/Roomthings/RoomJack';
import AddJack from '../components/Addpages/AddJack';
import RoomEquipment from '../components/Roomthings/RoomEquipment';
import AddEquipment from '../components/Addpages/AddEquipment';
import LoadingSpinner from '../components/LoadingSpinner';
import { getRoomData } from '../../api/utilities/getRoomData';
import AddOccupant from '../components/Addpages/AddOccupant';

/* The RoomDetails page with equipment, jacks, and notes. */

// TODO: edit and remove occupants

const RoomDetails = () => {
  // Get the documentID from the URL field.
  const { _id } = useParams();
  // useTracker connects Meteor data to React components. https://guide.meteor.com/react.html#using-withTracke
  // constants for the page
  const {
    doc,
    doc: { roomKey, roomNumber, capacity, picture, status, roomSqFoot, roomClassification },
    docNotes,
    docJacks,
    docEquipment,
    ready,
    loggedInOwner,
  } = useTracker(() => {
    // subscriptions (Admin) to Rooms, RoomNotes, RoomJacks, RoomEquipments, FacultyProfiles, OccupantRoom collections

    const subRoom = Rooms.subscribeRoomAdmin();
    const subNotes = RoomNotes.subscribeRoomNotesAdmin();
    const subJacks = RoomJacks.subscribeRoomJacksAdmin();
    const subEquipment = RoomEquipments.subscribeRoomEquipmentAdmin();
    const subFaculty = FacultyProfiles.subscribeFacultyProfileAdmin();
    const subStaff = StaffProfiles.subscribeStaffProfileAdmin();
    const subOccupant = OccupantRoom.subscribeOccupantRoomAdmin();
    const owner = Meteor.user().username;
    const rdy = subRoom.ready() && subNotes.ready() && subJacks.ready() && subEquipment.ready() && subFaculty.ready() && subStaff.ready() && subOccupant.ready();
    const document = Rooms.findDoc({ _id: _id });
    const documentNotes = RoomNotes.find({ roomId: _id }).fetch();
    const documentJacks = RoomJacks.find({ roomId: _id }).fetch();
    const documentEquipment = RoomEquipments.find({ roomId: _id }).fetch();

    // ready when subscriptions are completed
    return {
      doc: document,
      docNotes: documentNotes,
      docJacks: documentJacks,
      docEquipment: documentEquipment,
      loggedInOwner: owner,
      ready: rdy,
    };
  });
  const roomOccupants = getRoomData(doc._id);
  useEffect(() => {
    if (ready) {
      document.title = `Room - ${roomNumber}`;
    }
  }, [ready]);
  return ready ? (
    <Container id={PAGE_IDS.ROOM_DETAILS} className="py-3" doc={doc}>
      <h3>Room {roomNumber} Details</h3>
      <AddOccupant roomKey={doc.roomKey} />
      <Link className={PAGE_IDS.EDIT_ROOM} to={`/editroom/${doc._id}`}>Edit room</Link>
      <Row>
        <Col>
          <h4>Occupants</h4>
          {roomOccupants.occupants.map((o) => <div key={o._id}>{o.firstName} {o.lastName}</div>)}
        </Col>
      </Row>
      <Row>
        <Col>
          <p><strong>Room Status:</strong> {status}</p>
          <p><strong>Capacity:</strong> {capacity}</p>
          <p><strong>Room Sq Ft:</strong> {roomSqFoot}</p>
          <p><strong>Room Classification:</strong> {roomClassification}</p>
        </Col>
        <Col>
          <Image src={picture} alt={`${roomNumber} picture`} width={100} />
        </Col>
      </Row>
      <Row>
        <Col>
          <h4>Room Equipment</h4>
          <AddEquipment roomKey={roomKey} />
          <Table>
            <thead>
              <tr>
                <th>Quantity</th>
                <th>Description</th>
                <th>Serial Number</th>
                <th>Asset Tag</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {docEquipment.map((equipment) => <RoomEquipment key={equipment._id} equipment={equipment} />) }
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row>
        <Col>
          <h4>Room Data Jacks</h4>
          <AddJack roomKey={roomKey} />
          <Table>
            <thead>
              <tr>
                <th>Jack Number</th>
                <th>Wall Location</th>
                <th>Description</th>
                <th>IDF Room</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {docJacks.map((jack) => <RoomJack key={jack._id} jack={jack} />)}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row>
        <Col>
          <h2>Room Notes</h2>
          <AddNote roomId={_id} owner={loggedInOwner} />
          <ListGroup variant="flush">
            {docNotes.map((note) => <RoomNote key={note._id} note={note} />)}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  ) : <LoadingSpinner message="Loading room details" />;
};

export default RoomDetails;
