const snowflake = require('snowflake-sdk');
const fs = require('fs');
const YAML = require('yaml')

const deobfuscate = require('./encoding');

const sqlFileName = process.argv[2];
// const config = require('process');

// Read the config file
let file = null;
let config = null;
try {
  file = fs.readFileSync('./config.yaml', 'utf8')
} catch (error) {
  console.error('Error reading config.yml file ', error);
  process.exit(0);
}
try {
  config = YAML.parse(file);
  console.log(config);
} catch (error) {
  console.error('Error parsing config.yaml file, make sure its a valid yaml file', error);
  process.exit(0);
}

let account = '';
let user = '';
let password = '';
let role = '';

if(config.authentication.obfuscation.enabled === false && config.credentials != null) {
  // if the user has elected to use regular credentials in the config file
  account = config.credentials.account
  user = config.credentials.user;
  password = config.credentials.password;
  role = config.credentials.role;
} else if(config.authentication.obfuscation.enabled === true && config.credentials != null) {
  // if the user has elected to use obfuscated credentials in the config file
  const key = config.authentication.obfuscation.key;
  account = deobfuscate(config.credentials.account, key);
  user = deobfuscate(config.credentials.user, key);
  password = deobfuscate(config.credentials.password, key);
  role = deobfuscate(config.credentials.role, key);
}

const isDate = (date) => {
  return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}

const connection = snowflake.createConnection({
  account: account,
  username: user,
  password: password,
  role: role
});

connection.connect(
  function (err) {
    if (err) {
      console.error(`Unable to connect: ${err.message}`);
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