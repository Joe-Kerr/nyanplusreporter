# Nyan Cat Reporter Plus for Mocha

Make unit testing fun. Plays the (in-)famous Nyan cat song while running through your tests. But you need to feed Nyan cat tests. Otherwise it is going to fly off.


## Features

- Play the actual Nyan cat song!
- Delay console outputs because they make Nyan cat sad.
- Fix rainbowification (e.g. on Windows <10).


## Install

npm install nyanPlusReporter --save-dev


## Use

Append, or add to your mocha.opts either

--reporter nyanPlusReporter

or

--reporter path/to/file.without js extension and relative to project root (e.g. "node_modeles/nyanPlusReporter/src/nyanPlus")

depending on whether you have installed Mocha locally or globally (see e.g. https://stackoverflow.com/questions/21367820/how-to-create-a-custom-reporter-with-mocha).


## Notes

- You need to have a couple of tests in order to hear anything. That is a feature motivating you to add more tests.

- The package uses "node-wav-player" because it is cross-platform out of the box.

- The unit tests use the default reporter in order to avoid audio playback interference.

- Tested on Win7, Win10, Mac OSX (vm), Debian (vm), Fedora (vm)


## Bugs, limitations, caveats, etc

- Possibly jelous co-workers who do not have as much fun as you do.

- Possibly annoyed co-workers if you, or they, are in lack of ear phones.

- There is a ~5MB .wav file.

- When the song repeats after 26sec there is a noticable interruption. 

- Feature or not, on my Win7 (i5, 8GB) test system, the wav-player needs some time to spin up. The very first run may take some seconds. Consecutive runs may take up to 2 seconds. The wav-player module is only a middle man calling native audio players. So, I am not sure it can be sped up. It gets way better on an i7 with 16GB though.


## Versions

### 0.10.1
- Added: Ctrl-c flushes console buffer

### 0.9.1 
- Fixed: Broke the reference instead of emptying it in console flush (for whatever reason I forgot the actual assertion in the underlying unit test :s ). 

### 0.9.0 
- Public release.


## Copyright

MIT (c) Joe Kerr 2018

The Nyan Cat song is free for non-commercial use (https://aidn.jp/about/ | accessed 25-Sep-2018).

The license of this package does not include the Nyan Cat song.