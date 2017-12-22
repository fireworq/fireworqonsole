Fireworqonsole
==============

A console to manage [Fireworq][] daemons on a Web UI.

> ![Screenshot](https://github.com/fireworq/fireworqonsole/raw/master/doc/images/console.png)

## <a name="start">Getting Started</a>

A release build is available on [the releases page][releases].  You
will get `./fireworqonsole` by the following commands.

```
$ curl -L  $(curl -sL  https://api.github.com/repos/fireworq/fireworqonsole/releases/latest | jq -r '.assets[].browser_download_url' | grep '_linux_amd64.zip') > fireworqonsole_linux_amd64.zip
$ unzip fireworqonsole_linux_amd64.zip fireworqonsole
```

Run `fireworqonsole` by the following command.

```
$ ./fireworqonsole
```

Then access to http://localhost:8888/ from your browser and follow the
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
[Docker]: https://www.docker.com/
