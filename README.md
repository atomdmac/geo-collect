# GeoCollect
Collect all of the Stuff in your area to win!

## Installation
Clone this repo to somewhere on your computer.  You know how to use Git, right?

### Install Dependencies
I use node/npm to manage dependencies for this project. Once you have them both installed, you can just run the following command from the project directory:
`npm install`

Next you'll want to install Browserify so you can build the project:

```npm install -g browserify```

Though it's completely optional, I would also suggest installing Watchify if you're going to be doing any development.  It's a neat companion to Browserify that will watch for changes in your code and automatically build the project for you when they occur:

```npm install -g watchify```

### Add Your MapBoxGL Token
Sorry, you can't use mine :P.  Luckily, developer keys are extremely easy to obtain:

1. Go to [MapBox's sign-up page](https://www.mapbox.com/studio/signup/) and get yourself a free account.
2. Once you've signed up and logged in, go to your [homepage](https://www.mapbox.com/studio/) and look for your "Access token" on the right-hand side of the page.  (Hint: It's a big 'ol ugly string of numbers and letters under a heading that says "Access Token".)
3. Hey, you have an access token now!

Now all that's left to do is insert your token into the app.  To do that:

1. Make a new file called `token.js` and place it in the project root.
2. Paste the following text into it:```
module.exports = {
    MAPBOX_TOKEN: 'REPLACE-THIS-TEXT-WITH-YOUR-ACCESS-TOKEN'
};```
3. Save the file.

### Building the Project

Finally, build the thing!  Use `build-browserify.bat` for plain ol' Browserify or `build-watchify` for the fancy, new-hotness Watchify option.

Aaaand you're done!