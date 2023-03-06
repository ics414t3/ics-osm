import React, { useRef, useState } from 'react';
import { Button, Image, Modal } from 'react-bootstrap';
import { AutoForm, ErrorsField, SubmitField, TextField, LongTextField } from 'uniforms-bootstrap5';
import swal from 'sweetalert';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { COMPONENT_IDS } from '../utilities/ComponentIDs';
import { defineMethod } from '../../api/base/BaseCollection.methods';
import { Clubs } from '../../api/club/Club';
import { uploadImgUrl } from '../../startup/client/uploadImg';

// form schema based on the Club collection
const bridge = new SimpleSchema2Bridge(Clubs._schema);

/* Renders the AddClub component for adding a new club. */
const AddClub = () => {
  // eslint-disable-next-line react/prop-types
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const imageSubmit = useRef(null);

  const [selectedImage, setSelectedImage] = useState('https://res.cloudinary.com/dmbrfkjk3/image/upload/v1678099354/No-Image-Found-400x264_kyy6b4.png');
  // data added to Club collection. If there are errors, an error message will appear. If the data is submitted successfully, a success message will appear. Upon success, the form will reset for the user to add additional clubs.
  const submit = async (data, formRef) => {
    const imageUrl = await uploadImgUrl(imageSubmit.current);
    const { clubKey, clubName, description, joinLink, meetingDay, meetingTime, meetingLocation, officers, advisor } = data;
    const collectionName = Clubs.getCollectionName();
    const definitionData = { clubKey, clubName, image: imageUrl, description, joinLink, meetingDay, meetingTime, meetingLocation, officers, advisor };

    defineMethod.callPromise({ collectionName, definitionData })
      .catch(error => swal('Error', error.message, 'error'))
      .then(() => {
        swal('Success', 'Club added successfully', 'success');
        formRef.reset();
      });
  };
  let fRef = null;

  const handleImageClick = () => {
    document.getElementById('imageUpload').click();
  };
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    imageSubmit.current = file;
    setSelectedImage(URL.createObjectURL(file));
  };

  return (
    <>
      <Button id={COMPONENT_IDS.ADD_CLUB} variant="primary" onClick={handleShow}>
        Add Club
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Club</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ display: 'grid', justifyContent: 'center', gridAutoFlow: 'column' }}>
            <Button style={{ background: 'white', borderColor: 'white' }} onClick={handleImageClick}>
              <input id="imageUpload" type="file" onChange={handleImageUpload} style={{ display: 'none' }} />
              <Image style={{ width: '100%', height: '13rem' }} src={selectedImage} />
            </Button>
          </div>
          <AutoForm ref={ref => { fRef = ref; }} schema={bridge} onSubmit={data => submit(data, fRef)}>
            <TextField name="clubKey" placeholder="club(Name:ABBR)" />
            <TextField name="clubName" />
            <LongTextField name="description" />
            <TextField name="joinLink" />
            <TextField name="meetingDay" />
            <TextField name="meetingTime" />
            <TextField name="meetingLocation" />
            <TextField name="officers" />
            <TextField name="advisor" />
            <SubmitField value="Submit" />
            <ErrorsField />
          </AutoForm>
        </Modal.Body>
      </Modal>
    </>
  );
};
export default AddClub;
