const snowflake = require('snowflake-sdk');
const fs = require('fs');
const path = require('path');
const YAML = require('yaml')

const deobfuscate = require('./encoding');

let configFilePath = process.argv[2];
const sqlFileName = process.argv[3];

// Read the config file
let file = null;
let config = null;

// allow overrride of config file
if(process.env.NEWRELIC_SNOWFLAKE_CONFIG_FILE != null) {
  configFilePath = process.env.NEWRELIC_SNOWFLAKE_CONFIG_FILE;
}
try {
  file = fs.readFileSync(configFilePath, 'utf8')
} catch (error) {
  console.error('Error reading config.yaml file ', error);
  process.exit(0);
}
try {
  config = YAML.parse(file);
} catch (error) {
  console.error('Error parsing config.yaml file, make sure its a valid yaml file', error);
  process.exit(0);
}

let account = '';
let user = '';
let password = '';
let role = '';
let warehouse = '';
let useKeyPairAuth = false;
let privateKeyPath = '';

if (config.authentication != null) {

  if(config.authentication.obfuscation != null) {
    if (config.authentication.obfuscation.key != null && config.credentials != null) {
      // the user has elected to use obfuscated credentials in the config file
      const key = config.authentication.obfuscation.key;
      account = deobfuscate(config.credentials.account, key);
      user = deobfuscate(config.credentials.user, key);
      password = deobfuscate(config.credentials.password, key);
      role = deobfuscate(config.credentials.role, key);
      warehouse = deobfuscate(config.credentials.warehouse, key);
      useKeyPairAuth = config.credentials.useKeyPairAuth;
      privateKeyPath = deobfuscate(config.credentials.privateKeyPath, key);
    }
  }

} else if (config.credentials != null) {
  // if the user has elected to use regular credentials in the config file
  account = config.credentials.account
  user = config.credentials.user;
  password = config.credentials.password;
  role = config.credentials.role;
  warehouse = config.credentials.warehouse;
  useKeyPairAuth = config.credentials.useKeyPairAuth;
  privateKeyPath = config.credentials.privateKeyPath;
} else {
  console.error('Invalid YAML file, please check format and try again');
  process.exit(0);
}

const isDate = (date) => {
  return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}

// Use Key Pair authentication or regular ol' user/pass to connect to Snowflake
let connection = null;
if (useKeyPairAuth) {
  connection = snowflake.createConnection({
    authenticator: "snowflake_jwt",
    account: account,
    username: user,
    privateKeyPath: privateKeyPath,
    role: role,
    warehouse: warehouse
  });
  // implement key pair auth
} else {
  connection = snowflake.createConnection({
    authenticator: "snowflake",
    account: account,
    username: user,
    password: password,
    role: role,
    warehouse: warehouse
  });
}

connection.connect(
  function (err) {
    if (err) {
      console.error(`Unable to connect to snowflake: ${err.message}`);
    }
  }
);

const sqlQuery = fs.readFileSync(sqlFileName);

connection.execute({
  sqlText: `${sqlQuery}`,
  complete: function (err, stmt, rows) {
    if (err) {
      console.error(`Failed to execute statement due to the following error: ${err.message}`);
    } else {
      rows.forEach((row) => {
        for (let key in row) {
          if (isDate(row[key])) {
            rows[key] = row[key] + "";
          }
        }
      });
      //out the data to the console
      console.log(JSON.stringify(rows));
    }
  }
});