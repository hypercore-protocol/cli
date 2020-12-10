# Writing an individual file to hyperdrive

```
hyp put {url} [value]
```

You'll first need to [create a hyperdrive](./creating-a-hyperdrive.md).

To write a file, run the `put` command on the URL and provide the content of the file:

```
hyp put hyper://1234..af/hello.txt "Hello, world!"
```

If you want to copy an existing file into the hyperdrive, use pipes instead of supplying the value in the arguments:

```
cat hello.txt | hyp put hyper://1234..af/hello.txt
```