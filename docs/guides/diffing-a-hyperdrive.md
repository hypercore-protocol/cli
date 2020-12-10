# Diffing hyperdrives and local folders

```
hyp diff {source} {target}
```

 - **source** A local folder path or hyperdrive URL.
 - **target** A local folder path or hyperdrive URL.

The command will output a list of all files that differ and explain how they differ.

You can sync the target so that it matches the source by adding the `--commit` switch:

```
hyp diff {source} {target} --commit
```

This will give you a chance to review the changes about to occur, then y/n the sync.