# Reading a file from a hyperdrive

The command we'll be using is `cat`:

```
hyp drive cat {url}
```

To read the file, simply run `cat` on the file's URL:

```
hyp drive cat hyper://1234..af/hello.txt
```

You can save the file using pipes:

```
hyp drive cat hyper://1234..af/hello.txt > ./hello.txt
```