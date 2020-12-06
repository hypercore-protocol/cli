# Hyperspace CLI

A CLI for the hyper:// space network.

## Installation

```
npm install -g @hyperspace/cli
```

## Usage

Command overview:

```bash
Usage: hyp <command> [opts...]

Hyperdrive Commands:

  hyp drive create - Create a new hyperdrive.

  hyp drive ls {url} - List the entries of the given hyperdrive URL.
  hyp drive cat {url} - Output the content of the given hyperdrive URL.

  hyp drive diff {path_or_url} {path_or_url} - Diff two locations against each other.
  hyp drive mirror {path_or_url} {path_or_url} [-w|--watch] - Rewrite the right location to mirror the left location.

  hyp drive http {url} [-p|--port {port}] - Host a hyperdrive as a static site.

Hyperbee Commands:

  hyp bee create - Create a new hyperbee.

  hyp bee ls {url} - List the entries of the given hyperbee URL.
  hyp bee get {url} - Get the value of an entry of the given hyperbee URL.
  hyp bee put {url} [value] - Set the value of an entry of the given hyperbee URL.
  hyp bee del {url} - Delete an entry of the given hyperbee URL.

  Learn more at https://github.com/hypecore-protocol/cli
```

