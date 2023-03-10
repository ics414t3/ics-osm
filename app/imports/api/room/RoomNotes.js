import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import BaseCollection from '../base/BaseCollection';
import { ROLE } from '../role/Role';

export const roomNotesPublications = {
  roomNotes: 'RoomNotes',
  roomNotesAdmin: 'RoomNotesAdmin',
};

class RoomNotesCollection extends BaseCollection {
  constructor() {
    super('RoomNotes', new SimpleSchema({
      note: String,
      roomId: String,
      owner: String,
      createdAt: Date,
    }));
  }

  /**
   * Defines a new Room item.
   * @param note the note for the room.
   * @param roomId the Id of the room
   * @param owner the owner of the room.
   * @param createdAt the date note was created.
   * @return {String} the docID of the new document.
   */
  define({ note, roomId, owner, createdAt }) {
    const docID = this._collection.insert({
      note,
      roomId,
      owner,
      createdAt,
    });
    return docID;
  }

  /**
   * A stricter form of remove that throws an error if the document or docID could not be found in this collection.
   * @param { String | Object } name A document or docID in this collection.
   * @returns true
   */
  removeIt(name) {
    const doc = this.findDoc(name);
    check(doc, Object);
    this._collection.remove(doc._id);
    return true;
  }

  /**
   * Default publication method for entities.
   * It publishes the entire collection for admin and just the room associated to an owner.
   */
  publish() {
    if (Meteor.isServer) {
      // get the RoomCollection instance.
      const instance = this;
      /** This subscription publishes only the documents associated with the logged in user */
      Meteor.publish(roomNotesPublications.roomNotes, function publish() {
        if (this.userId) {
          const username = Meteor.users.findOne(this.userId).username;
          return instance._collection.find({ owner: username });
        }
        return this.ready();
      });

      /** This subscription publishes all documents regardless of user, but only if the logged in user is the Admin. */
      Meteor.publish(roomNotesPublications.roomNotesAdmin, function publish() {
        if (this.userId && Roles.userIsInRole(this.userId, ROLE.ADMIN)) {
          return instance._collection.find();
        }
        return this.ready();
      });
    }
  }

  /**
   * Subscription method for room owned by the current user.
   */
  subscribeRoomNotes() {
    if (Meteor.isClient) {
      return Meteor.subscribe(roomNotesPublications.roomNotes);
    }
    return null;
  }

  /**
   * Subscription method for admin users.
   * It subscribes to the entire collection.
   */
  subscribeRoomNotesAdmin() {
    if (Meteor.isClient) {
      return Meteor.subscribe(roomNotesPublications.roomNotesAdmin);
    }
    return null;
  }

  /**
   * Default implementation of assertValidRoleForMethod. Asserts that userId is logged in as an Admin or User.
   * This is used in the define, update, and removeIt Meteor methods associated with each class.
   * @param userId The userId of the logged in user. Can be null or undefined
   * @throws { Meteor.Error } If there is no logged in user, or the user is not an Admin or User.
   */
  assertValidRoleForMethod(userId) {
    this.assertRole(userId, [ROLE.ADMIN, ROLE.USER]);
  }

  /**
   * Returns an object representing the definition of docID in a format appropriate to the restoreOne or define function.
   * @param docID
   * @return {{owner: (*|number), roomNumber: *, location: *, status: *, capacity: *}}
   */
  dumpOne(docID) {
    const doc = this.findDoc(docID);
    const note = doc.note;
    const roomId = doc.roomId;
    const owner = doc.owner;
    const createdAt = doc.createdAt;
    return { note, roomId, owner, createdAt };
  }
}

/**
 * Provides the singleton instance of this class to all other entities.
 */
export const RoomNotes = new RoomNotesCollection();
