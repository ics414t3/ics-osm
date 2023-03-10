import React from 'react';
import PropTypes from 'prop-types';
import { ListGroup } from 'react-bootstrap';

// Renders a note. See pages/RoomDetails.jsx.
const RoomNote = ({ note }) => (
  <ListGroup.Item>
    <p className="fw-lighter">{note.createdAt.toLocaleDateString('en-US')}: {note.owner}</p>
    <p>{note.note}</p>
  </ListGroup.Item>
);

// Requires a document to be passed to this component.
RoomNote.propTypes = {
  note: PropTypes.shape({
    note: PropTypes.string,
    roomId: PropTypes.string,
    owner: PropTypes.string,
    createdAt: PropTypes.instanceOf(Date),
    _id: PropTypes.string,
  }).isRequired,
};

export default RoomNote;
