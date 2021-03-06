/**
 * Created by Oskar Jönefors on 3/6/17.
 */

var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var User = require('../models/internal/user');

var Errors = require('../errors');
var Helpers = require('./test-helpers');
var Status = require('http-status-codes');

var UsersMW = require('../middleware/users');
var Tokens = require('../middleware/tokens');

describe("Post and read lists", function() {

    const USERS_URL = "http://localhost:3000/users/";
    const URL = "http://localhost:3000/lists";

    const validUser = {
        username: "The Valid User",
        email: "valid@user.com",
        password: "hunter2"
    };

    const validUser2 = {
        username: "Equally valid User",
        email: "valid2@user.com",
        password: "hunter2"
    };

    const validList = {
        title: "My favs",
        description: "A list of my 3 favorite movies.",
        movies: [123, 9693, 115]
    };

    const validListUpdate = {
        title: "My favs and a doozer",
        description: "A list of my 2 favorite movies.",
        movies: [123, 115]
    };


    var userToken;
    var user2Token;

    before(Helpers.connectTestingDb);
    before(Helpers.clearMovies);
    before(Helpers.clearUsers);
    before(Helpers.clearLists);
    before(function (done) {
        UsersMW.register(validUser)
            .then(function (registeredUser) {
                userToken = Tokens.signSessionToken(registeredUser);
                done();
            })
    });

    before(function (done) {
        UsersMW.register(validUser2)
            .then(function (registeredUser2) {
                user2Token = Tokens.signSessionToken(registeredUser2);
                done();
            })
    });

    after(Helpers.disconnectDb);

    it('Should be able to post review', function(done) {
        this.timeout(5000);

        request(URL)
            .post('/')
            .set('authorization', userToken)
            .send(validList)
            .expect(Status.CREATED)
            .end(function(err, res) {
                if (err) { throw err }
                should.exist(res.body);
                should.exist(res.body.listId);
                validList.id = res.body.listId;
                done();
            })
    });

    it('Should be able to get all lists', function(done) {
        request(URL)
            .get('/')
            .send()
            .expect(Status.OK)
            .end(function(err, res) {
                if (err) { throw err }
                should.exist(res.body);
                done();
            })
    });

    it('Should be able to get specific list', function(done) {
        request(URL)
            .get('/' + validList.id)
            .send()
            .expect(Status.OK)
            .end(function(err, res) {
                if (err) { throw err }
                should.exist(res.body);

                done();
            })
    });

    it('Should be able to update list', function(done) {
        request(URL)
            .put('/' + validList.id)
            .set('authorization', userToken)
            .send(validListUpdate)
            .expect(Status.OK)
            .end(function(err, res) {
                if (err) { throw err }
                done();
            })
    });

    it('Should be able to get specific list', function(done) {
        request(URL)
            .get('/' + validList.id)
            .send()
            .expect(Status.OK)
            .end(function(err, res) {
                if (err) { throw err }
                should.exist(res.body);

                done();
            })
    });

    it('Should be able to get all lists by a user', function(done) {
       request(USERS_URL)
           .get('/' + validUser.username + '/lists')
           .send()
           .expect(Status.OK)
           .end(function(err, res) {
               if (err) { throw err }
               should.exist(res.body);
               done();
           })
    });

    it('Should not be able to remove list you do not own', function(done) {
        request(URL)
            .delete('/' + validList.id)
            .set('authorization', user2Token)
            .send()
            .expect(Status.FORBIDDEN)
            .end(function(err, res) {
                if (err) { throw err }
                done();
            })
    });

    it('Should be able to remove list', function(done) {
        request(URL)
            .delete('/' + validList.id)
            .set('authorization', userToken)
            .send()
            .expect(Status.OK)
            .end(function(err, res) {
                if (err) { throw err }
                done();
            })
    });

    it('List should be deleted', function(done) {
        request(URL)
            .get('/' + validList.id)
            .send()
            .expect(Errors.NOT_FOUND)
            .end(function(err, res) {
                if (err) { throw err }
                done();
            })
    });

});