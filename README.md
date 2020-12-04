# HyperKit

A  CLI for the hyper:// space network.

## Usage

Command overview:

```bash
Usage: hk <command> [opts...]

Commands:

  ls {url} - List the entries of the given hyper URL.
  cat {url} - Output the content of the given hyper URL.

  diff {path_or_url} {path_or_url} - Diff two locations against each other.
  mirror {path_or_url} {path_or_url} [-w|--watch] - Rewrite the right location to mirror the left location.

  http {url} [-p|--port {port}] [-o|--open] [-w|--watch] - Host a hyperdrive with a local HTTP server.

  Learn more at https://github.com/hypecore-protocol/hyperkit
```

