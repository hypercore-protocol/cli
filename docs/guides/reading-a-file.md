# Reading a file from a hyperdrive

```
hyp cat {url}
```

To read the file, simply run `cat` on the file's URL:

```
hyp cat hyper://1234..af/hello.txt
```

You can save the file using pipes:

```
hyp cat hyper://1234..af/hello.txt > ./hello.txt
```