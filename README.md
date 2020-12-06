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
  hyp drive mkdir {url} - Create a new directory at the given hyperdrive URL.
  hyp drive rmdir {url} - Remove a directory at the given hyperdrive URL.

  hyp drive cat {url} - Output the content of the given hyperdrive URL.
  hyp drive put {url} [content] - Write a file at the given hyperdrive URL.
  hyp drive rm {url} - Remove a file or (if --recursive) a folder at the given hyperdrive URL.

  hyp drive http {url} - Host a hyperdrive as using HTTP on the localhost.

Hyperbee Commands:

  hyp bee create - Create a new hyperbee.

  hyp bee ls {url} - List the entries of the given hyperbee URL.
  hyp bee get {url} - Get the value of an entry of the given hyperbee URL.
  hyp bee put {url} [value] - Set the value of an entry of the given hyperbee URL.
  hyp bee del {url} - Delete an entry of the given hyperbee URL.

  Learn more at https://github.com/hypecore-protocol/cli
```

