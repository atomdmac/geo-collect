# GeoCollect
Collect all of the Stuff in your area to win!

## Installation
Clone this repo to somewhere on your computer.  You know how to use Git, right?

## Install Dependencies
I use node/npm to manage dependencies for this project. Once you have them both installed, you can just run the following command from the project directory:
`npm install`

## Add Your MapBoxGL Token
Sorry, you can't use mine :P.  Luckily, developer keys are extremely easy to obtain:

1. Go to [MapBox's sign-up page](https://www.mapbox.com/studio/signup/) and get yourself a free account.
2. Once you've signed up and logged in, go to your [homepage](https://www.mapbox.com/studio/) and look for your "Access token" on the right-hand side of the page.  (Hint: It's a big 'ol ugly string of numbers and letters under a heading that says "Access Token".)
3. Hey, you have an access token now!

Now all that's left to do is insert your token into the app.  To do that:

1. Make a new file called `token.js` and place it in the project root.
2. Paste the following text into it:
```
define({
    MAPBOX_TOKEN: 'REPLACE-THIS-TEXT-WITH-YOUR-ACCESS-TOKEN'
});
```
3. Save the file.
4. Aaaand you're done!
