# DND AI
 
Fun little application to have an AI be a DM for you and your friends. Create characters, send messages, then trigger your AI to respond.

![](CurrentUI.png)

Uses web sockets to sync messages between clients.

## Run server
1. Change the endpoint for the OpenAI API in `./web-server/api/setupWebSockets.js` if necessary, default is localhost.
2. Change the `./web-server/context.txt` file to your liking to affect the story.
2. Navigate to the react-app folder and run the commands `npm install` and `npm run build` to generate the build folder.
3. Navigate to the web-server folder and run the commands `npm install` and `node server.js`. The server should be running now.

## How to Use the UI
On load of the page you should get a modal asking for a character name and description. This will be provided as context to the LLM.

Once you set a character name and description you can type in a message in the text box at the bottom of the screen. Hitting send sends this message to all players on the page. Pressing "Trigger DM" calls the AI endpoint with all of the current messages and context.

You are able to change your current character by pressing the change character button on the top right of the screen.

Obviously the quality of the responses will vary significantly depending on the model you are using, and there's not guarantee you get something coherent.

## Valid API Endpoints
This web page was designed specifically to call the oobabooga webui `/v1/chat/completions` [api](https://github.com/oobabooga/text-generation-webui/wiki/12-%E2%80%90-OpenAI-API) on localhost, but it should theoretically work for any [openai api](https://platform.openai.com/docs/api-reference/chat/create). I have only tested with oobabooga though.

## TTS
The current implementation of TTS is super scrappy, in the future I'd like to integrate piper tts directly into the server or allow for a separate tts endpoint. Current implementation expects 1 audio file with the name `DND_{someid}.wav` to be placed in `./web-server/audioFiles/pending` prior to getting a valid return from the AI (where someid is some uuid). It then fetches the id from the file format and attaches it to the most recent message.