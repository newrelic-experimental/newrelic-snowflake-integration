"use strict"

// https://jsdoc.app/

// Includes
const snowflake = require('snowflake-sdk');
const fs = require('fs');
const path = require('path');
const YAML = require('yaml')
const deobfuscate = require('./encoding')
const {
    createLogger,
    format,
    transports,
} = require('winston')
const {parseArgs} = require('node:util')
let parse = require('parse-duration')

// Globals
let logger

/**
 * @type {{}}
 * @property {string} [logLevel = "info"] - Winston logging level
 * @property {string} connection.account
 * @property {string} connection.username
 * @property {string} connection.role
 * @property {string} connection.warehouse
 * @property {string} connection.authenticator
 * @property {string} [connection.password]
 * @property {string} [connection.token]
 * @property {string} [connection.privateKey]
 * @property {string} [connection.privateKeyPath]
 * @property {string} [connection.privateKeyPass]
 */
let config = {}

/**
 * @type {{}}
 * @property {string} [logLevel = "info"] - Winston logging level
 * @property {string} [nriConfig = "./config.yaml"] - location of configuration file
 * @property {string} queryFile - Snowflake SQL file to execute
 * @property {string} [interval = "30s"] - the value to pass into the query as $interval
 */
let parsedOptions = {}

function configure() {
    // https://nodejs.org/api/util.html#utilparseargsconfig
    const options = {
        logLevel:  {
            type:    'string',
            short:   'l',
            default: 'info'
        },
        nriConfig: {
            type:    'string',
            short:   'c',
            default: './config.yaml'
        },
        queryFile: {
            type:  'string',
            short: 'q',
        },
        interval:  {
            type:    'string',
            short:   'i',
            default: '30s'
        }
    }

    try {
        ({
            values: parsedOptions
        } = parseArgs({
            options:          options,
            strict:           true,
            allowPositionals: false
        }))
    } catch (e) {
        console.log('\n\n')
        use()
    }
    // FIXME command line options should override config file options
    // TODO add interval to config file
    setupLogging()
    // https://github.com/jkroso/parse-duration
    parsedOptions.interval = parse(parsedOptions.interval)
    logger.debug(`parsedOptions: ${JSON.stringify(parsedOptions)}`)
    loadNriConfig()
}

function use() {
    console.log('useage: snowflake.js ', options)
    process.exit(2)
}

function setupLogging() {
    // https://github.com/winstonjs/winston
    const logFormat = format.combine(format.colorize(), format.align(), format.simple())
    logger = createLogger({
        format:     logFormat,
        level:      parsedOptions.logLevel,
        transports: [new transports.Console({stderrLevels: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']})]
    })
}

function isDate(date) {
    return (new Date(date).toString() !== "Invalid Date")
}

function setLogLevel(logLevel) {
    if (logLevel != null) {
        logger.level = logLevel
    }
}

function revealConfig() {
    // if (config.obfuscationEncodingKey != null && config.obfuscationEncodingKey.toString().length > 0) {
    //     for (const [key, value] of Object.entries(config.connection)) {
    //         if (value == null) {
    //             continue
    //         }
    //         config.connection[key] = deobfuscate(config.obfuscationEncodingKey, value)
    //     }
    // }
}

function authenticatorCheck() {
    if (config.connection.authenticator != null) {
        if (config.connection.authenticator.toString().toUpperCase() === 'EXTERNALBROWSER' || config.connection.authenticator.toString().toLowerCase().includes('okta.com')) {
            logger.error(`authenticatorCheck: unsupported authenticator: ${config.connection.authenticator}`)
            process.exit(2)
        }
    }
}

function loadNriConfig() {
    // Legacy behavior, not great as cli should override env :-(
    if (process.env.NEWRELIC_SNOWFLAKE_NRI_CONFIG != null) {
        parsedOptions.nriConfig = process.env.NEWRELIC_SNOWFLAKE_NRI_CONFIG
    }

    let file
    try {
        file = fs.readFileSync((path.resolve(__dirname, parsedOptions.nriConfig)), 'utf8')
    } catch (e) {
        logger.error(`Error reading nriConfig ${parsedOptions.nriConfig}. cwd: ${process.cwd()}. Error: ${e}`)
        process.exit(2)
    }
    try {
        config = YAML.parse(file)
        logger.debug('config: ', config)
    } catch (e) {
        logger.error(`Error parsing nriConfig ${parsedOptions.nriConfig}. Error: ${e}`)
        process.exit(0)
    }
    setLogLevel(config.logLevel)
    revealConfig()
    authenticatorCheck()
    logger.debug(`loadNriConfig: config: ${JSON.stringify(config)}`)
}

function execute() {
    const connection = snowflake.createConnection(config.connection)
    connection.connect(function (e) {
        if (e) {
            logger.error(`Unable to connect to snowflake: ${e}\n ${e.message}`)
            process.exit(2)
        }
    })

    const queryFilePath = path.resolve(__dirname, parsedOptions.queryFile)
    logger.debug(`queryFilePath: ${queryFilePath}`)
    if (!fs.existsSync(queryFilePath)) {
        logger.error(`queryFile ${queryFilePath} not found`)
        process.exit(2)
    }

    const sqlQuery = fs.readFileSync(queryFilePath).toString().replaceAll('$interval', parsedOptions.interval)

    connection.execute({
        sqlText:  `${sqlQuery}`,
        complete: function (err, stmt, rows) {
            if (err) {
                logger.error(`Failed to execute statement due to the following error: ${err.message}`)
            } else {
                rows.forEach((row) => {
                    for (let key in row) {
                        if (isDate(row[key])) {
                            rows[key] = row[key] + ""
                        } else {
                        }
                    }
                })
                // FIXME JSON.stringify has a max length limit
                // Output the data to the console
                console.log(JSON.stringify(rows))
            }
        }
    })
}

configure()
execute()