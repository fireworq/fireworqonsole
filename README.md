Fireworqonsole
==============

A console to manage [Fireworq][] daemons on a Web UI.

> ![Screenshot](https://github.com/fireworq/fireworqonsole/raw/master/doc/images/console.png)

## <a name="start">Getting Started</a>

You can choose from two options to launch [Fireworqonsole][] as follows.

### Use Docker

Run the following commands and you will get the whole system working
all at once.  Make sure you have [Docker][] installed before running
these commands.

```
$ docker run --rm -p 8888:8888 fireworq/fireworqonsole
```

### Use binary

A release build is available on [the releases page][releases].

For example, the following commands download and extract the
Fireworqonsole binary for Linux AMD64 (x86-64) platform.

```
$ OS=linux
$ ARCH=amd64
$ curl -L  $(curl -sL  https://api.github.com/repos/fireworq/fireworqonsole/releases/latest | jq -r '.assets[].browser_download_url' | grep "_${OS}_${ARCH}.zip") > fireworqonsole_${OS}_${ARCH}.zip
$ unzip fireworqonsole_${OS}_${ARCH}.zip fireworqonsole
```

Run `fireworqonsole` by the following command.

```
$ ./fireworqonsole
```

### After launched

Access http://localhost:8888/ from your browser and follow the
instruction to add Fireworq nodes to manage.  You can also use
`--node` argument of the command to specify nodes if you prefer.  To
start a console with a different port, specify `--bind` argument of
the command.

## <a name="license">License</a>

- Copyright (c) 2017 The [Fireworqonsole Authors][authors]. All rights reserved.
- Fireworq is licensed under the Apache License, Version 2.0. See
  [LICENSE][license] for the full license text.

[license]: ./LICENSE
[authors]: ./AUTHORS.md

[releases]: https://github.com/fireworq/fireworqonsole/releases

[Fireworq]: https://github.com/fireworq/fireworq
[Fireworqonsole]: https://github.com/fireworq/fireworqonsole
[Docker]: https://www.docker.com/
