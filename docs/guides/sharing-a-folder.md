# Sharing a folder in a hyperdrive

The command we'll be using is `sync`:

```
hyp drive sync {source} [target]
```

If no "target" is supplied, `hyp` will create a new hyperdrive for you.

Run the following command on your target folder:

```
hyp drive sync ./target-folder --no-live
```

`hyp` will create a new hyperdrive and tell you the URL. The hyperdrive now contains your folder's files. Share the URL to share the hyperdrive data!

To update the hyperdrive again, run:

```
hyp drive sync ./target-folder hyper://1234..af --no-live
```

You should write your hyperdrive's URL where `hyper://1234..af` is. This will cause the hyperdrive to exactly mirror your folder's content.

If you want to *continuously* sync the folder and the target drive so that updates automatically get written, leave out the `--no-live` switch.