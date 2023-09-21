[![Community Project header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/Community_Project.png)](https://opensource.newrelic.com/oss-category/#community-project)

# New Relic Snowflake Integration

A New Relic integration with Snowflake to monitor query performance, logins, potential security incidents, optimise warehouse and cloud credit costs, capture any data stored in Snowflake for real-time alerting and reporting.

## Configuration options
Configuration is driven by the `config.yaml` in the root directory of the integration.

### Authentication

`obfuscation` : Takes two properties, `enabled`: `true` or `false` and `key`: the string you used as the key
when obfuscating using the New Relic CLI. [Read the docs](https://github.com/newrelic/newrelic-cli/blob/main/docs/cli/newrelic_agent_config_obfuscate.md) on how to use the obfuscation feature.

### Credentials

Credential values must be supplied for `account` (your Snowflake account identifier in the format `<account_locator>.<region_id>` or `<account_locator>.<region_id>.<cloud>` e.g. `xy12345.us-east-2`), `user`, `password` & `role` as plain-text strings,
unless obfuscation is enabled in which case supply the obfuscated string values for each property. `privateKey` must be supplied but can be kept as an empty string if useKeyPairAuth equals false, otherwise, `user` and `password` will be ignored and the private key used instead on connection handshake.


```
# optional
# authentication:
#  obfuscation:
#    key: key # the key you used to obfuscate using newrelic CLI
credentials: # required
  useKeyPairAuth: false
  account: replaceme
  user: replaceme
  password: replaceme
  role: replaceme
  warehouse: replaceme
  privateKey: replaceme
```

#### Key Pair Authentication
In order to setup key pair authentication, two environment variables have to be included in your `yml` configuration file. `useKeyPairAuth` and `privateKeyPath`.

See the example below

```
credentials:
  useKeyPairAuth: true
  privateKeyPath: replaceme
  account: replaceme
  username: replaceme
  role: replaceme
  warehouse: replaceme
```

## Installation

1. [Install the New Relic Infrastructure agent](https://docs.newrelic.com/docs/infrastructure/install-infrastructure-agent) for your platform
2. Clone the repository to your machine `git clone https://github.com/newrelic/newrelic-snowflake-integration.git`
3. Download the [relevant binary for your platform](https://github.com/newrelic/newrelic-snowflake-integration/releases) from `releases` and place it in the cloned repo from step 2.
4. Make sure the binary is executable `chmod +x snowflakeintegration-linux`
5. Open `config.yaml` file and fill it appropriately
6. If running the New Relic infrastructure agent as a systemd service, follow these [steps to set the environment variable](#when-the-agent-is-running-as-a-systemd-service)
   1. To determine if you are on a system using `systemd` as the init service, run
   ``[[ `\systemctl` =~ -\.mount ]] && echo yes || echo no``
7. Set the `NEWRELIC_SNOWFLAKE_HOME` environment variable as documented in the [Setting NEWRELIC_SNOWFLAKE_HOME](#required-environment-variables) section. (Skip this step if you are running the New Relic infrastructure agent as a systemd service and followed the alternative steps for this).
8. Copy the relevant flex config for your platform from [flexConfigs](https://github.com/newrelic/newrelic-snowflake-integration/tree/main/flexConfigs) to the agent's `integrations.d` folder.
    - for Linux, it is found at `/etc/newrelic-infra/integrations.d/`
    - for Windows, it is found at `C:\Program Files\New Relic\newrelic-infra\integrations.d\`.

### Setting NEWRELIC_SNOWFLAKE_HOME

- `NEWRELIC_SNOWFLAKE_HOME` - *REQUIRED* the directory where you installed this integration i.e. `/home/user/newrelic-snowflake-integration`
- `NEWRELIC_SNOWFLAKE_CONFIG_PATH` - *OPTIONAL* the fully qualified path to the config file i.e. `/home/user/config.yaml` or `C:\User\config.yaml`

For example on Mac OS/Linux do `export NEWRELIC_SNOWFLAKE_HOME=/home/myuser/newrelic-snowflake-integration`
On Windows, set System Environment variables via the Control Panel or from an Administrator command prompt (`setx /m NEWRELIC_SNOWFLAKE_HOME C:\newrelic-snowflake-integration\`). If you are running on a Linux system that uses Systemd, see below.

### When the agent is running as a systemd service

The integration relies on `NEWRELIC_SNOWFLAKE_HOME` environment variable to connect to Snowflake. When the infrastructure agent runs as a systemd service, it doesn't have access to the environment variables of the user. To pass the environment variables correctly, you need to create a `.env` file.

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

### Adding custom queries

To add your own custom query, you need to follow a few steps

1. When creating your query, use the existing query files for guidance. The `FROM` clause needs to be fully qualified, for example you need to specify the Database, Schema and Table. For example, `"DATABASE"."SCHEMA"."TABLE/VIEW"`
2. Add your `custom-query.sql` query file to the queries directory
3. Add a new section for the `flex-snowflake.yml` file, like so

```
---
- name: snowflakeMyCustomQuery
 event_type: SnowflakeAccount
 custom_attributes:
   metric_type: snowflake.my_custom_query
 commands:
   - run: SNOWSQL_ACCOUNT="$$SNOWSQL_ACCOUNT" SNOWSQL_USER="$$SNOWSQL_USER" SNOWSQL_PWD="$$SNOWSQL_PWD" SNOWSQL_ROLE="$$SNOWSQL_ROLE" $$NEWRELIC_SNOWFLAKE_HOME/snowflakeintegration-<platform> $$NEWRELIC_SNOWFLAKE_HOME/queries/custom_query.sql
```

## Support

If you're running into a problem, please raise an issue on this repository and we will try to help you ASAP. Please bear in mind this is an open source project and hence it isn't directly supported by New Relic.

## Contribute

We encourage your contributions to improve [project name]! Keep in mind that when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. You only have to sign the CLA one time per project.

If you have any questions, or to execute our corporate CLA (which is required if your contribution is on behalf of a company), drop us an email at opensource@newrelic.com.

**A note about vulnerabilities**

As noted in our [security policy](../../security/policy), New Relic is committed to the privacy and security of our customers and their data. We believe that providing coordinated disclosure by security researchers and engaging with the security community are important means to achieve our security goals.

If you believe you have found a security vulnerability in this project or any of New Relic's products or websites, we welcome and greatly appreciate you reporting it to New Relic through [HackerOne](https://hackerone.com/newrelic).

If you would like to contribute to this project, review [these guidelines](./CONTRIBUTING.md).

To all contributors, we thank you!  Without your contribution, this project would not be what it is today.  We also host a community project page dedicated to [Project Name](<LINK TO https://opensource.newrelic.com/projects/... PAGE>).

## License
New Relic Snowflake Integration is licensed under the [Apache 2.0](http://apache.org/licenses/LICENSE-2.0.txt) License.
