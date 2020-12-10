# Hyperspace CLI

A CLI for the hyper:// space network ([Hypercore Protocol](https://hypercore-protocol.org)).

- [Installation](#installation)
- [Usage](#usage)
- [Overview](#overview)
- Guides
  - [Sharing a folder](./docs/guides/sharing-a-folder.md)
  - [Downloading a folder](./docs/guides/downloading-a-folder.md)
  - [Keeping hypers online (seeding)](./docs/guides/seeding.md)
  - [List your current seeds](./docs/guide/list-seeds.md)
  - [Creating a hyperdrive](./docs/guides/creating-a-hyperdrive.md)
  - [Reading a file from a hyperdrive](./docs/guides/reading-a-file.md)
  - [Writing a file to a hyperdrive](./docs/guides/writing-a-file.md)
  - [Diffing hyperdrives and local folders](./docs/guides/diffing-a-hyperdrive.md)
- [Glossary of terms](./docs/glossary.md)

## Installation

```
npm install -g @hyperspace/cli
```

## Usage

Command overview:

```bash
Usage: hyp <command> [opts...]

General Commands:

  hyp info [urls...] - Show information about one (or more) hypers.
  hyp seed {urls...} - Download and make hyper data available to the network.
  hyp unseed {urls...} - Stop making hyper data available to the network.
  hyp create {drive|bee} - Create a new hyperdrive or hyperbee.

Hyperdrive Commands:

  hyp drive ls {url} - List the entries of the given hyperdrive URL.
  hyp drive mkdir {url} - Create a new directory at the given hyperdrive URL.
  hyp drive rmdir {url} - Remove a directory at the given hyperdrive URL.

  hyp drive cat {url} - Output the content of the given hyperdrive URL.
  hyp drive put {url} [content] - Write a file at the given hyperdrive URL.
  hyp drive rm {url} - Remove a file or (if --recursive) a folder at the given hyperdrive URL.

  hyp drive diff {source_path_or_url} {target_path_or_url} - Compare two folders in your local filesystem or in hyperdrives. Can optionally "commit" the difference.
  hyp drive sync {source_path_or_url} [target_path_or_url] - Continuously sync changes between two folders in your local filesystem or in hyperdrives.

  hyp drive http {url} - Host a hyperdrive as using HTTP on the localhost.

Hyperbee Commands:

  hyp bee ls {url} - List the entries of the given hyperbee URL.
  hyp bee get {url} - Get the value of an entry of the given hyperbee URL.
  hyp bee put {url} [value] - Set the value of an entry of the given hyperbee URL.
  hyp bee del {url} - Delete an entry of the given hyperbee URL.

Daemon Commands:

  hyp daemon status - Check the status of the hyperspace daemon.
  hyp daemon stop - Stop the hyperspace and mirroring daemons if active.

Aliases:

  hyp sync -> hyp drive sync
  hyp diff -> hyp drive diff
  hyp ls -> hyp drive ls
  hyp cat -> hyp drive cat
  hyp put -> hyp drive put
```

## Overview

The [Hypercore Protocol](https://hypercore-protocol.org) is a peer-to-peer network for sharing files and data. This command-line provides a convenient set of tools for accessing the network.

There are two common kinds of "Hypercores":

- **Hyperdrive** A folder containing files.
- **Hyperbee** A key-value database (similar to leveldb).

All data has a URL which starts with `hyper://`. A URL will look like this:

```
hyper://515bbbc1db2139ef27b6c45dfa418c8be6a1dec16823ea7cb9e61af8d060049e/
```

You use these URLs to access the hyper data over the peer-to-peer network. For example:

```
hyp ls hyper://515bbbc1db2139ef27b6c45dfa418c8be6a1dec16823ea7cb9e61af8d060049e/
hyp cat hyper://515bbbc1db2139ef27b6c45dfa418c8be6a1dec16823ea7cb9e61af8d060049e/file.txt
cat diagram.png | hyp put 515bbbc1db2139ef27b6c45dfa418c8be6a1dec16823ea7cb9e61af8d060049e/diagram.png
```

You can create a new hyperdrive or hyperbee using the `create` commands:

```
hyp create drive
```

You can then seed the hyper (or seed a hyper created by somebody else) using the `seed` command:

```
hyp seed hyper://515bbbc1db2139ef27b6c45dfa418c8be6a1dec16823ea7cb9e61af8d060049e/
```

To see what hypers you are currently seeding, run `info`:

```
hyp info
```

Further guides:

- [Sharing a folder](./docs/guides/sharing-a-folder.md)
- [Downloading a folder](./docs/guides/downloading-a-folder.md)
- [Keeping hypers online (seeding)](./docs/guides/seeding.md)
- [List your current seeds](./docs/guide/list-seeds.md)
- [Reading a file from a hyperdrive](./docs/guides/reading-a-file.md)
- [Writing a file to a hyperdrive](./docs/guides/writing-a-file.md)
- [Diffing hyperdrives and local folders](./docs/guides/diffing-a-hyperdrive.md)