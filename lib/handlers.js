/*
 * Request handlers file
 *
 */

 // Dependencies
let _data = require('./data');
let helpers = require('./helpers');

 // Define the handlers
 let handlers = {};

 //Users data handlers
 handlers.users = (data, callback) => {
   let acceptableMethods = ['post','get','put','delete'];

   if (acceptableMethods.indexOf(data.method) > -1){
     handlers._users[data.method](data,callback);
   }else {
     callback(405);
   }
 }

 // Container for the user submethods
 handlers._users = {};

 // Users - post
 // Required data: firstName, lastName, phone, password, tosAgreement
 handlers._users.post = (data,callback) => {
   // Validate request
   // Check all required fields are filled out

   let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
   let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
   let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 11 ? data.payload.phone.trim() : false;
   let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 6 ? data.payload.password.trim() : false;
   let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? data.payload.tosAgreement : false;


   if (firstName && lastName && phone && password && tosAgreement) {
     // make sure that the user doesn't exist
     _data.read('users', phone, (err,data) => {
        // console.log(_data.read('users', phone));
       if(err){
         // Hash user password
         let hashedPassword = helpers.hash(password);

         if (hashedPassword) {
           // Create the user object
           let userObject = {
             'firstName' : firstName,
             'lastName' : lastName,
             'phone' : phone,
             'hashedPassword' : hashedPassword,
             'tosAgreement' : tosAgreement
           };

           // Store the user data
           _data.create('users',phone,userObject, (err) => {
             if(!err){
               callback(200);
             }else {
               console.log(err);
               callback(500, {'Error' : 'Could not create the new user'});
             }
           });
         }else {
           callback(500, {'Error' : 'Could not hash the user\'s password.'});
         }
       }else {
         // User already exists
         callback(400, {'Error' : 'A user with that phone number already exists'}, err);
       }
     })
   }else {
     callback(400, {'Error' : 'Missing required fields.'});
   }
 }

 // User - get
 // Required data : phone
 // Optional data : none
 // @TODO only let an authenticated access their own object, they can't access anyone else object
 handlers._users.get = (data, callback) => {
   // Check that the provided phone is Validate
   let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 11 ? data.queryStringObject.phone.trim() : false;
   if (phone) {
     // Lookup the user
     _data.read('users', phone, (err, data) => {
       // console.log( );
       if (!err && data) {
         // Remove the hashed password from the user object before returning it to the request
         delete data.hashedPassword
         callback(200, data);
       }else {
         callback(404);
       }
     });
   }else {
     callback(400, {'Error ' : 'Missing required fiels'});
   }
 }
 // User - put
 // Requied field - phone
 // Optional data : fristName, lastName, password (at least one must be specified)
 // @TODO only let an authenticated update their own object, they can't access anyone else object
 handlers._users.put = (data, callback) => {
   // Check that the profided phone is Validate
   let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 11 ? data.queryStringObject.phone.trim() : false;

   // Check for the optional field
   let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
   let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
   let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 6 ? data.payload.password.trim() : false;

  // Error if the phone is invalid
  if (phone) {
    if (firstName || lastName || password) {
       _data.read('users', phone, (err, userData) => {
         if (!err && userData) {
           // Update the necessary field
           if (firstName) {
             userData.firstName = firstName;
           }
           if (lastName) {
             userData.lastName = lastName;
           }
           if (password) {
             userData.hashedPassword = helpers.hash(password);
           }

           // Store the new Update
           _data.update('users', phone, userData, (err) => {
             if (!err) {
               callback(200);
             }else {
               console.log(err);
               callback(500, {'Error' : 'Could not update the user data'});
             }
           })
         }else {
           callback(400, {'Error' : 'The specified user does not exist'});
         }
       })
    }else {
      callback(400, {'Error' : 'Missing field to update'});
    }
  }else {
    callback(400, {'Error' : 'Missing required field'});
  }
 }

 // User - delete
 // Required field - phone
 // @TODO Only let an authenticated delete their own object, they can't delet anyone else object
 // @TODO Closeup (delete) any other data files associated with this user
 handlers._users.delete =  (data, callback) => {
   // Check if phone is invalid
 let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 11 ? data.queryStringObject.phone.trim() : false;

   if (phone) {
     // find the user file
     _data.read('users', phone, (err, userData) => {
       if (!err && userData) {
         _data.delete('users', phone, (err) => {
           if(!err){
             callback(200);
           }else {
             console.log(err);
             callback(500, {'Error' : 'Could not delete user data'});
           }
         });
       }else {
         callback(400, {'Error' : 'The specified user does not exist'});
       }
     })
   }else {
     callback(400, {'Error' : 'Missing Requied field'});
   }
 }


 // Not found handler
 handlers.notFound = (data, callback) => {
   callback(404);
 };

module.exports = handlers;
