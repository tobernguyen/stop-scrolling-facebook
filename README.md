# Stop Scrolling Facebook
A chrome extension prevent you from distraction of Facebook's newsfeed

[Install from Chrome Web Store](https://chrome.google.com/webstore/detail/stop-scrolling-facebook/iceobahpfmegcflceepjpplhhbhdlakk)

![Stop Scrolling Facebook screenshot](http://i.imgur.com/MMojlK8.png?1)

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
