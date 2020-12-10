# Downloading a folder from a hyperdrive

The command we'll be using is `sync`:

```
hyp drive sync {source} [target]
```

In this case, the "source" is a hyperdrive and the "target" is your local folder.

Run the following command with the correct hyperdrive URL and target folder path:

```
hyp drive sync hyper://1234..af ./target-folder --no-live
```

The target folder now contains the hyperdrive's files. You can re-run the command to update the target folder (it will cause the target folder to match the hyperdrive *exactly* so watch out for data loss).

If you want to *continuously* sync the hyperdrive to the target folder so that updates automatically get written, leave out the `--no-live` switch.