<a href="https://opensource.newrelic.com/oss-category/#new-relic-experimental"><picture><source media="(prefers-color-scheme: dark)" srcset="https://github.com/newrelic/opensource-website/raw/main/src/images/categories/dark/Experimental.png"><source media="(prefers-color-scheme: light)" srcset="https://github.com/newrelic/opensource-website/raw/main/src/images/categories/Experimental.png"><img alt="New Relic Open Source experimental project banner." src="https://github.com/newrelic/opensource-website/raw/main/src/images/categories/Experimental.png"></picture></a>

# New Relic Snowflake Integration

A New Relic integration with Snowflake to monitor query performance, logins, potential security incidents, optimise warehouse and cloud credit costs, capture any data stored in Snowflake for real-time alerting and reporting.

## Breaking changes!

Version 1.0 introduces a number of breaking changes over previous versions.

- [Configuration](#Configuration) (`config.yaml`) is completely changed to directly utilize Snowflake connection parameters
- Obfuscation of connection parameters is no longer supported
- The [command line](#command-line-parameters) (`run: `) now uses flagged parameters rather than positional parameters

## Configuration

Configuration is driven by the `config.yaml` in the root directory of the integration.

```yaml
# loglevel: Optional. error | warn | info | verbose | debug .Default value is 'info'.
logLevel:
# connection: Snowflake connection values. See https://docs.snowflake.com/en/developer-guide/node-js/nodejs-driver-options
connection:
  # account: Snowflake Organization-Account. Use SELECT DISTINCT ORGANIZATION_NAME,ACCOUNT_NAME FROM SNOWFLAKE.ORGANIZATION_USAGE.RATE_SHEET_DAILY; for help
  account: <organization-account>
  # username: Snowflake username
  username: <username>
  # role: Snowflake Role
  role: <role>
  # warehouse: Snowflake warehouse
  warehouse: <warehouse>
  # authenticator: SNOWFLAKE (userid/passord) | OAUTH | SNOWFLAKE_JWT (key-pair)
  authenticator: <Snowflake_Authenticator>

  # password: Required for SNOWFLAKE authenticator
  password: <password>

  # token: Required for OAUTH. See https://yaml-multiline.info/ for help with yaml multiline strings
  token: <token>

  # Params for SNOWFLAKE_JWT (key-pair) authentication. See important note below.
  privateKey: |
    -----BEGIN PRIVATE KEY-----
    ...
    -----END PRIVATE KEY-----
  privateKeyPath: <path_to_private_key>
  # privateKeyPass: See important note below!
  privateKeyPass: <private_key_password>
  ```

### Key-Pair authentication

1. Either `privateKey` or `privateKeyPath` is REQUIRED
2. DO NOT GENERATE A KEY-PAIR WITH AN EMPTY PASSWORD! Either use a password or `-nocrypt`, an empty password WILL NOT WORK.

## Installation

1. [Install the New Relic Infrastructure agent](https://docs.newrelic.com/docs/infrastructure/install-infrastructure-agent) for your platform
2. Clone the repository to your machine `git clone https://github.com/newrelic/newrelic-snowflake-integration.git`
3. Download the [relevant binary for your platform](https://github.com/newrelic/newrelic-snowflake-integration/releases) from `releases` and place it in the cloned repo from step 2.
4. Make sure the binary is executable `chmod +x snowflakeintegration-linux`
5. Open `config.yaml` file and fill it appropriately
6. If running the New Relic infrastructure agent as a systemd service, follow these [steps to set the environment variable](#when-the-agent-is-running-as-a-systemd-service)
    1. To determine if you are on a system using `systemd` as the init service, run
       ``[[ `\systemctl` =~ -\.mount ]] && echo yes || echo no``
7. Set the `NEWRELIC_SNOWFLAKE_HOME` environment variable as documented in the [Setting NEWRELIC_SNOWFLAKE_HOME](#Setting-NEWRELIC_SNOWFLAKE_HOME) section. (Skip this step if you are running the New Relic infrastructure agent as a systemd
   service and followed the alternative steps for this).
8. Copy the relevant flex config for your platform from [flexConfigs](https://github.com/newrelic/newrelic-snowflake-integration/tree/main/flexConfigs) to the agent's `integrations.d` folder.
    - for Linux, it is found at `/etc/newrelic-infra/integrations.d/`
    - for Windows, it is found at `C:\Program Files\New Relic\newrelic-infra\integrations.d\`.

### Setting NEWRELIC_SNOWFLAKE_HOME

- `NEWRELIC_SNOWFLAKE_HOME` - *REQUIRED* the directory where you installed this integration i.e. `/home/user/newrelic-snowflake-integration`
- `NEWRELIC_SNOWFLAKE_CONFIG_PATH` - *OPTIONAL* the fully qualified path to the config file i.e. `/home/user/config.yaml` or `C:\User\config.yaml`

For example on Mac OS/Linux do `export NEWRELIC_SNOWFLAKE_HOME=/home/myuser/newrelic-snowflake-integration`
On Windows, set System Environment variables via the Control Panel or from an Administrator command prompt (`setx /m NEWRELIC_SNOWFLAKE_HOME C:\newrelic-snowflake-integration\`). If you are running on a Linux system that uses Systemd, see
below.

#### When the agent is running as a systemd service

The integration relies on `NEWRELIC_SNOWFLAKE_HOME` environment variable to connect to Snowflake. When the infrastructure agent runs as a systemd service, it doesn't have access to the environment variables of the user. To pass the
environment variables correctly, you need to create a `.env` file.

1. Copy the `snowflake.env` file to a location on your server.
2. Replace the values in `snowflake.env`
3. Edit the `newrelic-infra.service` service definition - `sudo nano /etc/systemd/system/newrelic-infra.service`
4. Add a line `EnvironmentFile=/path/to/env/file` in the `[Service]` section
5. Edit the `newrelic-infra.yml` - `sudo nano /etc/newrelic-infra.yml`
6. Add these lines in `newrelic-infra.yml`

```
passthrough_environment:
  - NEWRELIC_SNOWFLAKE_HOME
  - SNOWSQL_ACCOUNT
```

7. Perform a daemon-reload and restart the newrelic-infra service - `sudo systemctl daemon-reload && sudo systemctl restart newrelic-infra`

The `newrelic-infra.service` file should look similar to below

```
...

[Service]
RuntimeDirectory=newrelic-infra
Type=simple
EnvironmentFile=/home/ec2-user/snowflake.env
ExecStart=/usr/bin/newrelic-infra-service
MemoryLimit=1G
# MemoryMax is only supported in systemd > 230 and replaces MemoryLimit. Some cloud dists do not have that version
# MemoryMax=1G
Restart=always
RestartSec=20
StartLimitInterval=0
StartLimitBurst=5
PIDFile=/var/run/newrelic-infra/newrelic-infra.pid

...
```

## Usage

This integration comes out of the box with queries to capture a good range of performance related data from the ACCOUNT_USAGE schema. If you want to extend the integration to run custom queries, see the instructions below

### Command line parameters

| Long flag  | Short flag | Values                                    | Default       |
|:-----------|:----------:|-------------------------------------------|---------------|
| -logLevel  |     -l     | error \| warn \| info \| verbose \| debug | info          |
| -nriConfig |     -c     |                                           | ./config.yaml |
| -queryFile |     -q     |                                           |               |
| -interval  |     -i     | See [Interval](#Interval) below           | 30s           |

### Queries

First off, and most importantly, the provided queries are _SAMPLES_. The provided queries have broad applicability but may not satisfy everyone. That's why the code allows for [custom queries](#adding-custom-queries).

Secondly, the pre version 1.0 queries queried by day rather than the last run of this application. This created an issue with duplicate data in NR1 which lead to the values being generally too large. The modified queries now use an
interval which if set properly should alleviate this issue. There is one notable exception, [the table storage usage view](./queries/table_storage_usage.sql) has no date component and cannot be fixed.

Lastly, be aware of how much data your query returns. It is easy for a query like [longest queries](./queries/longest_queries.sql) to return enough data to break `JSON.stringify` and then the application. `JSON.stringify` has a maximum
string length that varies depending on

1. The underlying version of Node.js
2. The flags with which V8 is compiled

Test your queries in the Snowflake UI!

#### Interval

Queries now use a `WHERE START_TIME >= DATEADD('ms', -$interval, CURRENT_TIMESTAMP())` logic, any custom queries should use this same pattern.

The `interval` is set on the `run: ` line and defaults to the default Flex interval of `30s`. IF YOU CHANGE THE FLEX INTERVAL BE CERTAIN TO SET THE COMMAND LINE INTERVAL TO THE *SAME* VALUE.

Parsed intervals are normalized to `ms` and this is what `DATEADD` should use. `$interval` in a query is replaced with the normalized interval value.

#### Adding custom queries

To add your own custom query, you need to follow a few steps

1. When creating your query, use the existing query files for guidance. The `FROM` clause needs to be fully qualified, for example you need to specify the Database, Schema and Table. For example, `"DATABASE"."SCHEMA"."TABLE/VIEW"`
2. Add your custom query SQL file to the `queries` subdirectory
3. Add a new section to the `flex-snowflake.yml` file to execute the query, for example

```yaml
- name: someSnowflakeCustomQuery
  entity: snowflake
  event_type: SnowflakeAccount
  custom_attributes:
    metric_type: snowflake.my_custom_query
  commands:
    - run: $$NEWRELIC_SNOWFLAKE_HOME/snowflakeintegration-<platform> -c $$NEWRELIC_SNOWFLAKE_HOME/config.yaml -q $$NEWRELIC_SNOWFLAKE_HOME/queries/<your_custom_query>.sql -i 60s
```

## Support

New Relic hosts and moderates an online forum where customers can interact with New Relic employees as well as other customers to get help and share best practices. Like all official New Relic open source projects, there's a related
Community topic in the New Relic Explorers Hub. You can find this project's topic/threads here:

## Contribute

We encourage your contributions to improve New Relic Snowflake Integration! Keep in mind that when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. You only have to sign the CLA one time
per project.

If you have any questions, or to execute our corporate CLA (which is required if your contribution is on behalf of a company), drop us an email at opensource@newrelic.com.

**A note about vulnerabilities**

As noted in our [security policy](../../security/policy), New Relic is committed to the privacy and security of our customers and their data. We believe that providing coordinated disclosure by security researchers and engaging with the
security community are important means to achieve our security goals.

If you believe you have found a security vulnerability in this project or any of New Relic's products or websites, we welcome and greatly appreciate you reporting it to New Relic through [HackerOne](https://hackerone.com/newrelic).

If you would like to contribute to this project, review [these guidelines](./CONTRIBUTING.md).

<!-- To all contributors, we thank you!  Without your contribution, this project would not be what it is today. We also host a community project page dedicated to [Project Name](<LINK TO ... PAGE>). -->

## License

New Relic Snowflake Integration is licensed under the [Apache 2.0](http://apache.org/licenses/LICENSE-2.0.txt) License.