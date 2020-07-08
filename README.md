# Insta-bot-node

This is a simple insta-bot (with a lot of things to solve or ToDo), i will upload more functions when i have time, it's run perfectly on Raspbian (i personally use the raspberry pi 4).
There isn't any GUI so you can build by your own or just use cURL.

## Getting Started

First you need to clone this branch

```git clone https://github.com/redBaron23/insta-bot-node```

### Prerequisites

You will need node and npm (or whatever node package manager that you use)

### Installing

First of all (in case of NPM)
```
npm i
```

```
node app.js
```

And that's it the project it's running


### Examples

If you want to get easily some followers/like just after run the app make a post request to localhost:1111/farmFamous

For example with curl it will be...


```
curl -d 'username=yourUsername&password=yourPassword' -H "Content-Type: application/x-www-form-urlencoded" http://localhost:1111/farmFamous
```
Change "yourUsername" and "yourPassword" by your current credentials


For unfollow all people that don't follow you

```
curl -d 'username=yourUsername&password=yourPassword' -H "Content-Type: application/x-www-form-urlencoded" http://localhost:1111/unfollowGarcas
```

### Important

There's some functions implemented, it's just read some of the app.js and /api/instaJs.js and /api/accountHelper

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details


Have fun
