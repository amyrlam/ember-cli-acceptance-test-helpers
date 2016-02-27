import { module } from 'qunit';
import { test } from 'ember-qunit';
import expectElement from '../helpers/201-created/raw/expect-element';

module('Unit - expectElement');

test('expectElement exists', function(assert) {
  assert.ok(expectElement, 'it exists');
});

function makeElement(elementType, options){
  var el = $(document.createElement(elementType));
  if (options.class) { el.addClass('class', options.class); }
  if (options.text)  { el.text(options.text); }

  return el.get(0);
}

function makeElements(elementType, options, count){
  var els = [];
  for (var i = 0; i < count; i++) {
    els.push(makeElement(elementType, options));
  }

  return $(els);
}

function makeApp(findFn){
  return {
    testHelpers: { find: findFn },
    $: $
  };
}

test('passes when the element is found by app.testHelpers.find', function(assert) {
  var find = function(){
    return [makeElement('div', {class:'the-div'})];
  };

  var app = makeApp(find);

  var result = expectElement(app, '.the-div');

  assert.ok(result.ok, 'passes');
  assert.equal(result.message, 'Found 1 of .the-div');
});

test('fails when the element is not found by app.testHelpers.find', function(assert) {
  var find = function(){
    return [];
  };

  var app = makeApp(find);

  var result = expectElement(app, '.the-div');

  assert.ok(!result.ok, 'fails');
  assert.equal(result.message, 'Found 0 of .the-div but expected 1');
});

test('calls app.testHelpers.find with the given selector', function(assert) {
  assert.expect(1);

  var find = function(selector){
    assert.equal(selector, '.the-div');
    return [];
  };

  var app = makeApp(find);

  expectElement(app, '.the-div');
});

test('can be passed a number', function(assert) {
  var find = function(){
    return makeElements('div', {class:'the-div'}, 2);
  };

  var app = makeApp(find);

  var result = expectElement(app, '.the-div', 2);

  assert.ok(result.ok, 'passes');
  assert.equal(result.message, 'Found 2 of .the-div', 'correct success message');

  // default: 1
  result = expectElement(app, '.the-div');

  assert.ok(!result.ok, 'fails');
  assert.equal(result.message, 'Found 2 of .the-div but expected 1',
        'correct failure message');

  result = expectElement(app, '.the-div', 3);

  assert.ok(!result.ok, 'fails');
  assert.equal(result.message, 'Found 2 of .the-div but expected 3',
        'correct failure message');
});

test('takes option `contains`', function(assert) {
  var find = function(){
    return makeElements('div', {class:'the-div', text: 'foo bar'}, 1);
  };

  var app = makeApp(find);

  var result = expectElement(app, '.the-div', {contains:'foo'});

  assert.ok(result.ok, 'passes');
  assert.equal(result.message, 'Found 1 of .the-div containing "foo"');

  result = expectElement(app, '.the-div', {contains:'not found'});

  assert.ok(!result.ok, 'fails');
  assert.equal(result.message, 'Found 1 of .the-div but 0/1 containing "not found"');
});

test('can be passed a number and option `contains`', function(assert) {
  var find = function(){
    return makeElements('div', {class:'the-div', text: 'foo bar'}, 3);
  };

  var app = makeApp(find);

  var result = expectElement(app, '.the-div', 3, {contains:'foo'});

  assert.ok(result.ok, 'passes');
  assert.equal(result.message, 'Found 3 of .the-div containing "foo"');

  result = expectElement(app, '.the-div', 3, {contains:'not found'});

  assert.ok(!result.ok, 'fails');
  assert.equal(result.message, 'Found 3 of .the-div but 0/3 containing "not found"');
});

test('option `contains` filters the elements', function(assert) {
  var find = function(){
    return $([
      makeElement('div', {class:'the-div'}),
      makeElement('div', {class:'the-div', text: 'foo bar'})
    ]);
  };

  var app = makeApp(find);

  var result = expectElement(app, '.the-div', {contains:'foo'});

  assert.ok(result.ok, 'passes');
  assert.equal(result.message, 'Found 1 of .the-div containing "foo"');

  result = expectElement(app, '.the-div', {contains:'not found'});

  assert.ok(!result.ok, 'fails');
  assert.equal(result.message, 'Found 2 of .the-div but 0/1 containing "not found"');
});

test('expectElement fails with a custom message', function(assert) {
  let app = makeApp(() => []);
  let message = 'custom message';

  // {message: message}
  let result = expectElement(app, '.not-present', {message, contains: 'whatever'});

  assert.ok(!result.ok, 'pre cond: fails');
  assert.equal(result.message, message);
});
