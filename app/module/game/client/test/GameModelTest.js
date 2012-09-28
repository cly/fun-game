var sample = {"betray":{"user":{"account":{"id":"nMS9HxGV8pPoU157","first_name":"Charlie","last_name":"Yuan"},"wallet":{"real":{"balance":"0.00","currency":"GBP","economy":"real"},"sandbox":{"balance":"9986.25","currency":"GBP","economy":"sandbox"}}},"accessToken":"DQvbkvMfRxTNw84jqvjkjp31ET8","name":"pdBetray","gameId":"jdRH0nSS2l47-NmjXC1TI6"},"cooperate":{"user":{"account":{"id":"nMS9HxGV8pPoU157","first_name":"Charlie","last_name":"Yuan"},"wallet":{"real":{"balance":"0.00","currency":"GBP","economy":"real"},"sandbox":{"balance":"9986.25","currency":"GBP","economy":"sandbox"}}},"accessToken":"7GFnVaxDZ4XiDRvGLBhb05ylEkL","name":"pdCooperate","gameId":"PBa90YJmAGp1ZCLV24-Ndz"}};

var test = new app.Model.PDGame(sample);
var assert = chai.assert;

console.log('running basic tests');
// Check init values
assert.equal(test.getMyWinnings(), 0, 'Initial winnings 0');
assert.equal(test.getFriendWinnings(), 0, 'Initial friend winnings 0');
assert.equal(typeof test.getMyAction(), 'undefined', 'Initial action undefined');
assert.equal(typeof test.getFriendAction(), 'undefined', 'Initial action undefined');
console.log('finished basic tests');


test.on('change', function () {
    console.log('running bet tests');
    assert.equal((test.getMyWinnings() + test.getFriendWinnings()) > 0, true, 'If i cooperate, sum of winnigs must go up');
    assert.equal(parseFloat(test.getMyPayout()), test.getMyWinnings(), 'cumulative winnings and first payout is same');
    assert.equal(parseFloat(test.getFriendPayout()), test.getFriendWinnings(), 'cumulative winnings and first payout is same');
    console.log('finished bet tests');
});
test.cooperate();
