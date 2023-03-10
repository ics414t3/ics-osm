import { Meteor } from 'meteor/meteor';
import { ROLE } from '../../api/role/Role';
import { AdminProfiles } from '../../api/user/AdminProfileCollection';
import { UserProfiles } from '../../api/user/UserProfileCollection';
import { OfficeProfiles } from '../../api/user/OfficeProfileCollection';
import { StudentProfiles } from '../../api/user/StudentProfileCollection';
import { TechProfiles } from '../../api/user/TechProfileCollection';

/* eslint-disable no-console */

function createUser(email, role, firstName, lastName, password, isClubPresident, clubPosition) {
  if (role === ROLE.ADMIN) AdminProfiles.define({ email, firstName, lastName, password });
  if (role === ROLE.FACULTY) UserProfiles.define({ email, firstName, lastName, password });
  if (role === ROLE.OFFICE) OfficeProfiles.define({ email, firstName, lastName, password });
  if (role === ROLE.STUDENT) StudentProfiles.define({ email, firstName, lastName, password, isClubPresident, clubPosition });
  if (role === ROLE.TECH) TechProfiles.define({ email, firstName, lastName, password });
  if (role === ROLE.USER) UserProfiles.define({ email, firstName, lastName, password });
}

// When running app for first time, pass a settings file to set up a default user account.
if (Meteor.users.find().count() === 0) {
  if (Meteor.settings.defaultAccounts) {
    console.log('Creating the default user(s)');
    Meteor.settings.defaultAccounts.map(({ email, password, role, firstName, lastName, isClubPresident, clubPosition }) => (
      createUser(email, role, firstName, lastName, password, isClubPresident, clubPosition)
    ));
  } else {
    console.log('Cannot initialize the database!  Please invoke meteor with a settings file.');
  }
}
