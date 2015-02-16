cordova-lighting-alljoyn
========================

A sample app using the Cordova plugin for AllJoyn.  

This application implements simple lighting control.

To Run
------
```sh
$ git clone https://github.com/AllJoyn-Cordova/cordova-lighting-alljoyn.git
$ cd cordova-lighting-alljoyn
$ cordova plugin add org.allseen.alljoyn
$ cordova platform add <ios | windows | android>
$ cordova run <ios | windows | android>
```

Building and Running on Windows
-------------------------------
For Windows compilation, a pre-release copy of Cordova libraries is required until the 4.2.1 Cordova release. 

This is related to the following bug, for which a fix is already tested and coming very soon.
https://issues.apache.org/jira/browse/CB-8123

This is how you install Cordova from source, using npm:

```sh
// Clone the right version of cordova-lib and cordova-cli
$ git clone https://github.com/MSOpenTech/cordova-lib.git && git -C cordova-lib checkout CB-8123-final
$ git clone https://github.com/apache/cordova-cli.git && git -C cordova-cli checkout 4.2.0
$ cd cordova-lib/cordova-lib
$ npm install -g && npm link
$ cd ../../cordova-cli && npm link cordova-lib && npm install -g
```

Next, you can build and run this app using Cordova.

```sh
// To run on Windows Phone 8.1 emulator
$ cordova run windows --emulator --archs="x86" -- -phone
// Running on Windows Phone 8.1 device
$ cordova run windows --device --archs="arm" -- -phone
// To run on desktop (current default is Windows 8.1 build)
$ cordova run windows --device --archs="x64" -- -win
```

Prerequisites
-------------

For the app to work, you need to have an AllJoyn router running in the same network.  Windows 10 preview includes a windows service you can enable to act as an AllJoyn router.  Another option is to download https://allseenalliance.org/releases/alljoyn/14.06.00/alljoyn-14.06.00a-win7x64vs2012-sdk.zip
and run the binary from alljoyn-14.06.00a-win7x64vs2012-sdk-dbg/cpp/bin/samples/chat.exe on the network
