[![Community Project header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/Community_Project.png)](https://opensource.newrelic.com/oss-category/#community-project)

# [New Relic Snowflake Integration] [build badges go here when available]

A New Relic integration with Snowflake to monitor query performance, logins, potential security incidents, optimise warehouse and cloud credit costs, capture any data stored in Snowflake for real-time alerting and reporting. 

## Installation

1. [Install the New Relic infrastructure agent](https://docs.newrelic.com/docs/infrastructure/install-infrastructure-agent) for your platform
2. Download the relevant binary for your platform from `releases` and place it somewhere on the host running New Relic infra agent
3. Clone the repository to your machine `git clone https://github.com/newrelic/newrelic-snowflake-integration.git`
4. Copy the `queries` directory and put it in the same folder as the executable binary
5. Set the environment variables as documented in the [Required Environment Variables](#required-environment-variables) section.
6. If running the New Relic infrastructure agent as a systemd service, follow these [additional steps](#when-the-agent-is-running-as-a-systemd-service)
7. Copy `flex-snowflake.yml` to the agent's `integrations.d` folder. 
    - for Linux, it is found at `/etc/newrelic-infra/integrations.d/`
    - for Windows, it is found at `C:\Program Files\New Relic\newrelic-infra\integrations.d\`.

### Required Environment Variables

- `NEWRELIC_SNOWFLAKE_HOME` - the directory where you installed this integration i.e. `/home/user/newrelic-snowflake-integration`
- `SNOWSQL_ACCOUNT` - your snowflake account name
  - for example for Azure snowflake instance ab123.west-europe.azure
- `SNOWSQL_USER` - your snowflake username (used for logging into the account)
- `SNOWSQL_PWD` - your snowflake password
- `SNOWSQL_ROLE` - snowflake role that should be used when querying (must have access to account_usage and information_schema)
- `SNOWSQL_WAREHOUSE` - the snowflake warehouse you want to connect to

For example on Mac OS/Linux do `export SNOWSQL_ACCOUNT=ab123.west-europe.azure`
On Windows do `set SNOWSQL_ACCOUNT=abc123.west-europe.azure`

## Getting Started
This integration requires the New Relic Infrastructure Agent. Follow the installation instructions above.

### When the agent is running as a systemd service

The integration relies on reading environment variables to connect to Snowflake. When the infrastructure agent runs as a systemd service, it doesn't have access to the environment variables of the user. To pass the environment variables correctly, you need to create a `.env` file.

1. Copy the `snowflake.env` file to a location on your server.
2. Replace the values in `snowflake.env`
3. Edit the `newrelic-infra.service` service definition - `sudo nano /etc/systemd/system/newrelic-infra.service`
4. Add a line `EnvironmentFile=/path/to/env/file` in the `[Service]` section

The `.service` file should look similar to below

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
TBD

## Support

New Relic hosts and moderates an online forum where customers can interact with New Relic employees as well as other customers to get help and share best practices. Like all official New Relic open source projects, there's a related Community topic in the New Relic Explorers Hub. You can find this project's topic/threads here:

>Add the url for the support thread here: discuss.newrelic.com

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
