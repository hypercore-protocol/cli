# HyperKit

A CLI for the hyper:// space network.

## Installation

```
npm install -g @hyperspace/hyperkit-cli
```

## Usage

Command overview:

```bash
Usage: hk <command> [opts...]

Hyperdrive Commands:

  hk drive create - Create a new hyperdrive.

  hk drive ls {url} - List the entries of the given hyperdrive URL.
  hk drive cat {url} - Output the content of the given hyperdrive URL.

  hk drive diff {path_or_url} {path_or_url} - Diff two locations against each other.
  hk drive mirror {path_or_url} {path_or_url} [-w|--watch] - Rewrite the right location to mirror the left location.

  hk drive http {url} [-p|--port {port}] - Host a hyperdrive as a static site.

Hyperbee Commands:

  hk bee create - Create a new hyperbee.

  hk bee ls {url} - List the entries of the given hyperbee URL.
  hk bee get {url} - Get the value of an entry of the given hyperbee URL.
  hk bee put {url} [value] - Set the value of an entry of the given hyperbee URL.
  hk bee del {url} - Delete an entry of the given hyperbee URL.

  Learn more at https://github.com/hypecore-protocol/hyperkit
```

