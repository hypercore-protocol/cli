# Writing an individual file to hyperdrive

The command we'll be using is `put`:

```
hyp drive put {url} [value]
```

You'll first need to [create a hyperdrive](./creating-a-hyperdrive.md).

To write a file, run the `put` command on the URL and provide the content of the file:

```
hyp drive put hyper://1234..af/hello.txt "Hello, world!"
```

If you want to copy an existing file into the hyperdrive, use pipes instead of supplying the value in the arguments:

```
cat hello.txt | hyp drive put hyper://1234..af/hello.txt
```