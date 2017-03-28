# Stop Scrolling Facebook
A chrome extension prevent you from distraction of Facebook's newsfeed

[![Code Climate](https://codeclimate.com/github/tobernguyen/stop-scrolling-facebook/badges/gpa.svg)](https://codeclimate.com/github/tobernguyen/stop-scrolling-facebook)
[![Issue Count](https://codeclimate.com/github/tobernguyen/stop-scrolling-facebook/badges/issue_count.svg)](https://codeclimate.com/github/tobernguyen/stop-scrolling-facebook)
[![GitHub tag](https://img.shields.io/github/tag/strongloop/express.svg)](https://github.com/tobernguyen/stop-scrolling-facebook)
![Open Source Love](https://badges.frapsoft.com/os/mit/mit.svg?v=102)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

[Install from Chrome Web Store](https://chrome.google.com/webstore/detail/stop-scrolling-facebook/iceobahpfmegcflceepjpplhhbhdlakk)

![Stop Scrolling Facebook screenshot](http://i.imgur.com/wA3LSZz.png)

# Development
To get started, clone the repository and then run:
```
npm install
npm run dev
```

Any changes in `/src` will be built by webpack to folder `/dist/unpacked/`, which can be loaded to chrome via **Load unpacked extension** (on **Setting -> More Tools -> Extensions**)

# Deployment
To build an optimized version to publish to Chrome Store:
```
npm run build
```

You will get a zip file in `dist/build/StopScrollingFacebook_Latest.zip`.
