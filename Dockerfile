FROM ubuntu:20.04

ENV NRIA_IS_CONTAINERIZED true
ENV NRIA_OVERRIDE_HOST_ROOT /host

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl tini wget tar gzip ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Download newrelic-infra
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN curl -s https://api.github.com/repos/newrelic/infrastructure-agent/releases/latest \
  | grep browser_download_url \
  | grep linux \
  | grep amd64.tar.gz \
  | cut -d '"' -f 4 \
  | xargs curl -sL \
  | tar -zxf -

ARG agent_bin=newrelic-infra/usr/bin/newrelic-infra
RUN cp $agent_bin /usr/bin/newrelic-infra \
  && cp ${agent_bin}-ctl /usr/bin/newrelic-infra-ctl \
  && cp ${agent_bin}-service /usr/bin/newrelic-infra-service \
  && rm -rf newrelic-infra

# Install nri-flex
RUN mkdir -p /var/db/newrelic-infra/newrelic-integrations/bin/ \
  && curl -s https://api.github.com/repos/newrelic/nri-flex/releases/latest \
  | grep browser_download_url \
  | grep linux \
  | grep amd64.tar.gz \
  | cut -d '"' -f 4 \
  | xargs curl -sL \
  | tar -zxf - nri-flex \
  && mv nri-flex /var/db/newrelic-infra/newrelic-integrations/bin/

COPY queries /usr/local/bin/queries/
COPY config.yaml /usr/local/bin/
COPY flexConfigs/flex-snowflake-linux.yml /etc/newrelic-infra/integrations.d/

# Copy newrelic-snowflake-integration
RUN NR_SF_VERSION=$(curl -s https://api.github.com/repos/newrelic/newrelic-snowflake-integration/releases/latest | grep tag_name | cut -d '"' -f 4) \
  && curl -sLO https://github.com/newrelic/newrelic-snowflake-integration/releases/download/"$NR_SF_VERSION"/snowflakeintegration-linux \
  && chmod +x snowflakeintegration-linux \
  && mv snowflakeintegration-linux /usr/local/bin/

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["/usr/bin/newrelic-infra-service"]
