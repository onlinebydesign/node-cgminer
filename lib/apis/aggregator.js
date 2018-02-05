var Promise = require('bluebird');
var request = require('request');
var _ = require('lodash');
var semver = require('semver');
var util = require('util');
var parser = require('./parser');

/**
 * Return list of compatible cgminer tags that we want to build APIs for.
 */
function getCgminerTags () {
  var startVersion = '2.11.4';
  var url = 'https://api.github.com/repos/ckolivas/cgminer/git/refs/tags';

  return new Promise(function (resolve, reject) {
    request({ url: url, json: true }, function (error, response, body) {
      if (error) return reject(error);

      var tags = _.map(JSON.parse(body), function (tag) {
        return tag.ref.split('/')[2];
      });
      var compatibleVersions = _.filter(tags, function (tag) {
        return semver.gte(tag, startVersion);
      });

      resolve(compatibleVersions);
    });
  });
}

function sanitizeVersion (version) {
  var tokens = version.split('.');
  const verArr = _.take(tokens, 3);
  if (verArr && _.isArray(verArr)) {
    if (verArr.length === 1) {
      verArr.push('0');
    }
    if (verArr.length === 2) {
      verArr.push('0');
    }
    return semver.clean(verArr.join('.').split('_')[0]);
  }
  return 'master';
}

function getCgminerReadme (version) {
  var url = util.format(
    'https://raw.githubusercontent.com/hashware/cgminer/%s/API-README', 'v' +
    sanitizeVersion(version)
  );

  return new Promise(function (resolve, reject) {
    request(url, function (error, response, body) {
      if (error) return reject(error);
      resolve(body);
    });
  });

}

exports.getCgminerReadme = getCgminerReadme;
