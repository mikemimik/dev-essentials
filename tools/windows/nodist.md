# nodist

### Description
nodist is a version manager for windows that manages node.js and io.js versions. It's similar and inspired by [n](https://github.com/tj/n).

### Incurred Issue
I needed a way to easily upgrade node.js from one version to another. I had installed 0.12.4 on my machine awhile back and needed to update to 0.12.7. I thought I just downloading the msi file again, but I wasn't sure if it would overwrite the correct files or not and was generally unsure of the consiquences of just installing one version over another version.

### Usage Rational
Originally I was using the package manager [scoop]() to do the job but because of windows character limit on path lengths, it proved to be not the best solution for me. Instead I am using nodist to manage _specifically_ the version of **node.js** I am using. I have another tool for managing the version of **npm** which is being using on the system.