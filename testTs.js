var Family = /** @class */ (function () {
    function Family() {
    }
    return Family;
}());
var User = /** @class */ (function () {
    function User() {
    }
    return User;
}());
var hello = "Hello World!";
var TestTS = /** @class */ (function () {
    function TestTS() {
    }
    TestTS.prototype.printUserInfo = function (user) {
        console.log(user.username);
        console.log(user.age);
        console.log(user.families);
    };
    return TestTS;
}());
module.exports = { TestTS: TestTS, User: User };
