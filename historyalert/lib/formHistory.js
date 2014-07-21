const {Cc, Ci, Cu} = require("chrome");
const {DBUtils} = require("DBUtils");

Cu.import("resource://gre/modules/commonjs/sdk/core/promise.js");

exports.get_form_history = function() {
  let deferred = Promise.defer();
  let formHistory = [];

  DBUtils.getFormHistory(item => {
    formHistory.push(item);
  }).then(() => { deferred.resolve(formHistory); });
  return deferred.promise;
}