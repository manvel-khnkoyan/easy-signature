
/*!
 * accepts
 * Copyright(c) 2019 Manvel Khnkoyan
 * MIT Licensed
 */

const urlParser = require('url');
const queryString = require('querystring');
const crypto = require('crypto');

/**
 * Constructor of EasySignature
 * @param config - setting up configurations
 * @returns void
 */
function EasySignature(config) {
  this.config = config || {};
  this.config.secret = config.secret || '';
  this.config.prefix = config.prefix || 'es1_';
  this.config.method = config.method || 'sha256';
  this.config.expiredSeconds = config.expiredSeconds || 15 * 60;
  this.config.oversight = config.oversight || 3 * 60;
}

/**
 * Adding prefix given name
 * @param name
 * @returns string
 */
EasySignature.prototype.pfx = function fix(name) { return `${this.config.prefix}${name}`; };

/**
 * Generating signature by given params
 * @param params
 * @returns string
 */
EasySignature.prototype.generateSignature = function generateSignature(params) {
  const ordered = {};
  /* ordering query params
   * and excluding signature keyword
   */
  Object.keys(params.query).sort().forEach((key) => {
    if (key !== this.pfx('signature')) {
      ordered[key] = params.query[key];
    }
  });

  /*
   * building path that should be encoded
   */
  const path = `${encodeURIComponent(`${params.protocol}//${params.host}/${params.path}`)}&${encodeURIComponent(queryString.stringify(ordered))}`;

  /*
   * encoding using crypto module
   */
  try {
    return crypto.createHmac(params.query[this.pfx('method')], this.config.secret)
      .update(path)
      .digest('hex');
  } catch (e) {
    return '';
  }
};

/**
 * Converting url into parameters
 * @param url - standard http url
 * @returns string
 */
EasySignature.prototype.parseUrl = function parseUrl(url) {
  const params = urlParser.parse(url);
  const query = queryString.parse(params.query);
  return {
    protocol: params.protocol,
    host: params.host,
    path: params.pathname,
    signature: query.signature,
    query,
  };
};

/**
 * Making secure url
 * @param url - standard http url
 * @returns string
 */
EasySignature.prototype.encode = function encode(url) {
  const params = this.parseUrl(url);

  /*
  * creating new object based on params.query
  */
  const query = { ...params.query };

  /*
  * Adding main required marameters
  */
  query[this.pfx('nonce')] = `${Math.random().toString(36).substring(3)}`;
  query[this.pfx('timestamp')] = `${Math.floor(Date.now() / 1000)}`;
  query[this.pfx('method')] = `${this.config.method}`;

  /*
  * deleting signature from the query
  */
  if (query[this.pfx('signature')]) delete query[this.pfx('signature')];

  /*
   * generating signature
   */
  const signature = this.generateSignature({ ...params, query });

  /*
   * encoding signature into base64
   * adding signature into the query
   */
  query[this.pfx('signature')] = Buffer.from(signature).toString('base64');

  //
  return `${params.protocol}//${params.host}${params.path}?${queryString.stringify(query)}`;
};


/**
 * Validating given url
 * @param url - standard http url
 * @returns string
 */
EasySignature.prototype.validate = function validate(url) {
  const params = this.parseUrl(url);
  const { query } = params;

  /*
  * Checking existence of required parameters
  * */
  if (!query[this.pfx('signature')] || !query[this.pfx('timestamp')] || !query[this.pfx('method')] || !query[this.pfx('nonce')]) {
    return false;
  }

  /*
   * Check is signature type is string
   */
  if (typeof query[this.pfx('signature')] !== 'string') {
    return false;
  }


  const signature = Buffer.from(query[this.pfx('signature')], 'base64').toString('ascii');

  /*
   * Comparing given signature from query with generating new signature
   */

  if (this.generateSignature(params) !== signature) {
    return false;
  }

  //
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const signatureTimestamp = +query[this.pfx('timestamp')];
  const { expiredSeconds, oversight } = this.config;

  /*
   * Checking given signature expired time
   */
  if (signatureTimestamp + expiredSeconds < currentTimestamp) {
    return false;
  }

  /*
   * Checking given signature time oversights
   */
  if (signatureTimestamp < currentTimestamp - oversight) {
    return false;
  }

  return true;
};


module.exports = EasySignature;
