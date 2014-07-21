/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 2 -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const {Cc,Ci,Cm,Cr,Cu,components} = require("chrome");

Cu.import("resource://gre/modules/commonjs/sdk/core/promise.js");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "PlacesUtils", "resource://gre/modules/PlacesUtils.jsm");

/**
 * Store the SQL statements used for this file together for easy reference
 */
const SQL = {
  getBookmarks:
    "SELECT b.title title, " +
           "p.url url " +
    "FROM moz_bookmarks as b " +
    "LEFT JOIN moz_places as p " +
    "ON b.fk = p.id " +
    "WHERE p.url <> \"\"",

  getTileURLS:
    "SELECT title, url " +
    "FROM moz_places " +
    "ORDER BY frecency DESC LIMIT 100"
};

let DBUtils = {
  //////////////////////////////////////////////////////////////////////////////
  //// DBUtils

  /**
   * Fetch all bookmarks
   */
  getBookmarks: function(handleBookmark) {
    return this._execute(SQL.getBookmarks, this._placesDB, {
      columns: ["title", "url"],
      onRow: handleBookmark,
    });
  },

  getTileURLS: function(handleURLS) {
    return this._execute(SQL.getTileURLS, this._placesDB, {
      columns: ["title", "url"],
      onRow: handleURLS,
    });
  },

  /**
   * returnes a stopped status
   *
   */
  isStopped: function() {
    return (this._stop == true);
  },

  //////////////////////////////////////////////////////////////////////////////
  //// DBUtils Helpers

  /**
   * Execute a SQL statement with various options
   *
   * @param   sql
   *          The SQL statement to execute
   * @param   [optional] optional {see below}
   *          columns: Array of column strings to read for array format result
   *          onRow: Function callback given the columns for each row
   *          params: Object of keys matching SQL :param to bind values
   * @returns Promise for when the statement completes with value dependant on
   *          the optional values passed in.
   */
  _execute: function PIS__execute(sql, db, optional={}) {
    let {columns, onRow, params} = optional;

    // Check for stop flag
    if (this._stop) return null;

    // Initialize the statement cache and the callback to clean it up
    if (this._cachedStatements == null) {
      this._cachedStatements = {};
    }

    // Use a cached version of the statement if handy; otherwise create it
    if (this._cachedStatements[sql] == null) {
      this._cachedStatements[sql] = {statement: null, pending: null};
    }
    let statement = this._cachedStatements[sql].statement;
    if (statement == null) {
      statement = db.createAsyncStatement(sql);
      this._cachedStatements[sql].statement = statement;
    }

    // Bind params if we have any
    if (params != null) {
      Object.keys(params).forEach(param => {
        statement.bindByName(param, params[param]);
      });
    }

    // Determine the type of result as nothing, a keyed object or array of columns
    let results;
    if (onRow != null) {}
    else if (columns != null) {
      results = [];
    }

    // Execute the statement and update the promise accordingly
    let deferred = Promise.defer();
    this._cachedStatements[sql].pending = statement.executeAsync({
      handleCompletion: reason => {
        // make sure cache exists before nullifing pending
        if (this._cachedStatements[sql] &&
            this._cachedStatements[sql].pending) {
          this._cachedStatements[sql].pending = null;
        }
        if (this._stop) {
          deferred.resolve(null);
        }
        else {
          deferred.resolve(results);
        }
      },

      handleError: error => {
        // make sure cache exists before nullifing pending
        if (this._cachedStatements[sql] &&
            this._cachedStatements[sql].pending) {
          this._cachedStatements[sql].pending = null;
        }
        deferred.reject(new Error(error.message));
      },

      handleResult: resultSet => {
        let row;
        while (row = resultSet.getNextRow()) {
          // Read out the desired columns from the row into an object
          let result;
          if (columns != null) {
            // For just a single column, make the result that column
            if (columns.length == 1) {
              result = row.getResultByName(columns[0]);
            }
            // For multiple columns, put as valyes on an object
            else {
              result = {};
              columns.forEach(column => {
                result[column] = row.getResultByName(column);
              });
            }
          }

          // Give the packaged result to the handler
          if (onRow != null) {
            onRow(result);
          }
          // Append the result in order
          else if (columns != null) {
            results.push(result);
          }
        }
      }
    });

    return deferred.promise;
  },
}

XPCOMUtils.defineLazyGetter(DBUtils, "_placesDB", function() {
  return PlacesUtils.history.QueryInterface(Ci.nsPIPlacesDatabase).DBConnection;
});

exports.DBUtils = DBUtils;
