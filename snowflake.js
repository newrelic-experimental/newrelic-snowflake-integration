'use strict'

const snowflake = require('snowflake-sdk'),
    fs = require('fs'),
    path = require('path'),
    YAML = require('yaml'),
    {
        createLogger,
        format,
        transports,
    } = require('winston'),
    { parseArgs } = require('node:util'),
    parse = require('parse-duration')

const options = {
        logLevel:  {
            type: 'string',
            short: 'l',
            default: 'info',
        },
        nriConfig: {
            type: 'string',
            short: 'c',
            default: './config.yaml',
        },
        queryFile: {
            type: 'string',
            short: 'q',
        },
        interval:  {
            type: 'string',
            short: 'i',
            default: '30s',
        }
    },
    logFormat = format.combine(
        format.colorize(),
        format.align(),
        format.simple(),
    )

let logger

function usage() {
    console.log('usage: snowflake.js ', options)
    process.exit(2)
}

function isDate(date) {
    return (new Date(date).toString() !== "Invalid Date")
}

function setupLogging(parsedOptions) {
    logger = createLogger({
        format:     logFormat,
        level:      parsedOptions.logLevel,
        transports: [new transports.Console({stderrLevels: [
            'error',
            'warn',
            'info',
            'http',
            'verbose',
            'debug',
            'silly'
        ]})]
    })
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

function authenticatorCheck(config) {
    if (config.connection.authenticator != null) {
        if (
            config.connection.authenticator
                .toString()
                .toUpperCase() === 'EXTERNALBROWSER' ||
            config.connection.authenticator
                .toString()
                .toLowerCase()
                .includes('okta.com')) {
            logger.error(
                `authenticatorCheck: unsupported authenticator: ${config.connection.authenticator}`
            )
            process.exit(2)
        }
    }
}

function loadNriConfig(parsedOptions) {
    // Legacy behavior, not great as cli should override env :-(
    if (process.env.NEWRELIC_SNOWFLAKE_NRI_CONFIG != null) {
        parsedOptions.nriConfig = process.env.NEWRELIC_SNOWFLAKE_NRI_CONFIG
    }

    let file

    try {
        file = fs.readFileSync(
            path.resolve(process.cwd(), parsedOptions.nriConfig),
            'utf8',
        )
    } catch (e) {
        logger.error(
            `Error reading nriConfig ${parsedOptions.nriConfig}. cwd: ${process.cwd()}. Error: ${e}`
        )
        process.exit(2)
    }

    try {
        const config = YAML.parse(file)
        logger.debug('config: ', config)


        setLogLevel(config.logLevel)
        revealConfig()
        authenticatorCheck(config)

        logger.debug(`loadNriConfig: config: ${JSON.stringify(config)}`)

        return config
    } catch (e) {
        logger.error(`Error parsing nriConfig ${parsedOptions.nriConfig}. Error: ${e}`)
        process.exit(2)
    }
}

function parseOptions() {
    try {
        const { values: parsedOptions } = parseArgs(
            {
                options: options,
                strict: true,
                allowPositionals: false,
            }
        )

        // FIXME command line options should override config file options
        // TODO add interval to config file
        setupLogging(parsedOptions)

        parsedOptions.interval = parse(parsedOptions.interval)
        logger.debug(`parsedOptions: ${JSON.stringify(parsedOptions)}`)

        return parsedOptions
    } catch (e) {
        console.log('\n\n')
        usage()
    }

}

function execute() {
    const parsedOptions = parseOptions(), 
        config = loadNriConfig(parsedOptions)
    
    snowflake.configure({ logLevel: 'ERROR', additionalLogToConsole: false })
    const connection = snowflake.createConnection(config.connection)

    connection.connect((err, connection) => {
        if (err) {
            logger.error(`Unable to connect to snowflake: ${e}\n ${e.message}`)
            process.exit(2)
        }

        const queryFilePath = path.resolve(process.cwd(), parsedOptions.queryFile)

        logger.debug(`queryFilePath: ${queryFilePath}`)
        if (!fs.existsSync(queryFilePath)) {
            logger.error(`queryFile ${queryFilePath} not found`)
            process.exit(2)
        }

        const sqlQuery = fs.readFileSync(queryFilePath)
            .toString()
            .replaceAll('$interval', parsedOptions.interval)

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
    })
}

execute()
