/**
 * Created by Oskar Jönefors on 2/22/17.
 */

/**
 * Public representation of the personal user.
 */

module.exports = function(user) {
    return {
        username: user.username,
        email: user.email
    }
};