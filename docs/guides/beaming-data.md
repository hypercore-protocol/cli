# Beaming data

```
hyp beam [passphrase]
```

Ever wish you had a fast way to send files or data to a device? For instance...

 - Send a `hyper://` URL to another device for syncing
 - Copy an individual file to a friend's device
 - Run a command and share the output with a team-mate to debug

That's what the "beam" command is for. It acts like a stream, so you can pipe data in and out of the command.

```
cat my-file.txt | hyp beam
```

It will generate a passphrase for you, like "manager-car-factory". You use that phrase on the receiving device and pipe out the data:

```
hyp beam "manager-car-factory" > ./their-file.txt
```
