/* eslint-disable no-magic-numbers */
/* eslint-env mocha */

const assert = require("assert");
const redis = require("../../index.js");

describe("Redis Promise : Integration", ()=>{
  before(()=>{
    redis.initdb(null, "127.0.0.1");
    return redis.eraseEntireDb();
  });

  after(()=>{
    redis.close();
  });

  describe("Timed key", ()=>{
    it("sets and confirms a key", ()=>{
      return redis.touchKey("test-key")
      .then(()=>redis.peekKey("test-key"))
      .then(assert);
    });

    it("removes a key after number of millis", ()=>{
      return redis.touchKey("test-key-1", {expiryMillis: 2000})
      .then(()=>redis.peekKey("test-key-1"))
      .then(assert)
      .then(()=>{return new Promise(res=>setTimeout(res, 2500));}) // eslint-disable-line no-magic-numbers
      .then(()=>redis.peekKey("test-key-1"))
      .then(exists=>assert(!exists));
    });

    it("removes a key after number of seconds", ()=>{
      return redis.touchKey("test-key-2", {expirySeconds: 2})
      .then(()=>redis.peekKey("test-key-2"))
      .then(assert)
      .then(()=>{return new Promise(res=>setTimeout(res, 2500));}) // eslint-disable-line no-magic-numbers
      .then(()=>redis.peekKey("test-key-2"))
      .then(exists=>assert(!exists));
    });
  });

  describe("Lists", ()=>{
    it("Pushes a list of values", ()=>{
      return redis.pushLeft("list-1", ["1", "2", "3"])
      .then(()=>redis.getListRange("list-1", 0, 100))
      .then(list=>assert.deepEqual(list, ["1", "2", "3"]));
    });

    it("Trims a list of values to a maximum", ()=>{
      return redis.pushLeft("list-2", ["1", "2", "3"])
      .then(()=>redis.trimLeft("list-2", 0, 1))
      .then(()=>redis.getListRange("list-2", 0, 100))
      .then(list=>assert.deepEqual(list, ["1", "2"]));
    });
  });

});
