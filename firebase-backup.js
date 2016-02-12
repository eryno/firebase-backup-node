#!/usr/bin/env node

// config settings. don't add a trailing backslash for any of file locations
var backupLocation = '/home/you/firebase-backups'; // where all backup files will be saved
var firebaseURL = 'https://yoururl.firebaseio.com/';
var firebaseSecret = '';

// no need to edit below this line

console.log('Starting backup...');

// since this file will be run by cron, it doesn't get executed in a shell environment
// and won't know where the relative paths are pointing to. so we use absolute file locations
var fs = require('file-system');
var Firebase = require('firebase');
var FirebaseTokenGenerator = require('firebase-token-generator');

var tokenGen = new FirebaseTokenGenerator(firebaseSecret);
var token = tokenGen.createToken({}, {admin: true});

var rootRef = new Firebase(firebaseURL);

rootRef.authWithCustomToken(token, function(error, authData) {
	if (error) {
		console.log(error);
	} else {
		console.log('Authentication successful.');
		rootRef.once('value', function(snapshot) {
		        // construct a filename based on today's date and the H:MM 24-hour time
		        var now = new Date();
		        var filename = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + '_' + now.getHours() + '-' + now.getMinutes() + '.json';
		
		        fs.writeFile(backupLocation + '/' + filename, JSON.stringify(snapshot.exportVal()), function(err) {
		                if(err) {
		                        console.log(err);
		                } else {
		                        console.log('The backup was saved! ' + backupLocation + '/' + filename);
		                }
				
				// all done, quit node.js
				process.exit();
		        });

			rootRef.unauth();
		});
	}
});
