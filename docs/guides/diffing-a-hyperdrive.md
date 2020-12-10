# Diffing hyperdrives and local folders

The command we'll be using is `diff`:

```
hyp drive diff {source} {target}
```

The "source" and the "target" can be either a local folder or a hyperdrive. The command will output a handy listing of all files that differ and explain how they differ.

If you want to sync the difference so that the "target" matches the "source", you can add the `--commit` switch:

```
hyp drive diff {source} {target} --commit
```

This will give you a chance to review the changes about to occur, then y/n the sync.