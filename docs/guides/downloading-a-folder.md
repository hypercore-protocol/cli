# Downloading a folder from a hyperdrive

```
hyp sync {source} [target]
```

- **source** The hyperdrive you want to download.
- **target** The path of the local folder you want to download to.

Example:

```
hyp sync hyper://1234..af ./target-folder --no-live
```

You can re-run the command to update the target folder. It will cause the target folder to match the hyperdrive *exactly* so watch out for data loss.

> If you don't include `--no-live` the sync command will continuously sync the source to the target.